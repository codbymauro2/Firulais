import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY = Deno.env.get("SERVICE_ROLE_KEY")!;
const FCM_SERVER_KEY = Deno.env.get("FCM_SERVER_KEY")!; // Firebase → Project Settings → Cloud Messaging → Server key

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

// Envía una notificación FCM a uno o más tokens
async function sendFCM(tokens: string[], title: string, body: string, data?: Record<string, string>) {
  if (tokens.length === 0) return;

  const payload = {
    registration_ids: tokens,
    notification: { title, body, icon: "/pwa-192x192.png", click_action: "FLUTTER_NOTIFICATION_CLICK" },
    data: data ?? {},
    priority: "high",
  };

  const res = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `key=${FCM_SERVER_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[send-notification] FCM error:", err);
  }

  return res;
}

// Obtiene los tokens FCM del usuario destino
async function getTokens(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("user_tokens")
    .select("token")
    .eq("user_id", userId);

  if (error) {
    console.error("[send-notification] Error obteniendo tokens:", error.message);
    return [];
  }

  return (data ?? []).map((r: { token: string }) => r.token);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // Verifica que la llamada viene de Supabase (webhook interno) usando el service role secret
  const authHeader = req.headers.get("Authorization") ?? "";
  const isInternal = authHeader === `Bearer ${SUPABASE_KEY}`;
  if (!isInternal) return json({ error: "No autorizado" }, 401);

  let body: {
    type: "new_message" | "pet_found" | "custom";
    recipient_id: string;
    // Para new_message:
    sender_name?: string;
    message_preview?: string;
    conversation_id?: string;
    // Para pet_found:
    pet_name?: string;
    // Para custom:
    title?: string;
    body?: string;
    data?: Record<string, string>;
  };

  try {
    body = await req.json();
  } catch {
    return json({ error: "Body inválido" }, 400);
  }

  const { type, recipient_id } = body;
  if (!recipient_id) return json({ error: "recipient_id requerido" }, 400);

  const tokens = await getTokens(recipient_id);
  if (tokens.length === 0) return json({ ok: true, sent: 0, reason: "sin tokens" });

  let title = "";
  let notifBody = "";
  let data: Record<string, string> = {};

  switch (type) {
    case "new_message":
      title = "Nuevo mensaje 🐾";
      notifBody = body.sender_name
        ? `${body.sender_name}: ${body.message_preview ?? ""}`
        : body.message_preview ?? "Tenés un nuevo mensaje";
      data = { type: "message", conversation_id: body.conversation_id ?? "" };
      break;

    case "pet_found":
      title = "¡Buenas noticias! 🎉";
      notifBody = body.pet_name
        ? `${body.pet_name} fue marcada como encontrada`
        : "Tu mascota fue marcada como encontrada";
      data = { type: "pet_found" };
      break;

    case "custom":
      title = body.title ?? "Firulais";
      notifBody = body.body ?? "";
      data = body.data ?? {};
      break;

    default:
      return json({ error: "Tipo de notificación inválido" }, 400);
  }

  await sendFCM(tokens, title, notifBody, data);

  return json({ ok: true, sent: tokens.length });
});
