import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL    = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY    = Deno.env.get("SERVICE_ROLE_KEY")!;
const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

function ok(msg = "ok") {
  return new Response(JSON.stringify({ msg }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

async function activatePremium(userId: string, premiumUntil: Date) {
  const { error } = await supabase
    .from("profiles")
    .update({
      is_premium: true,
      premium_until: premiumUntil.toISOString(),
    })
    .eq("id", userId);

  if (error) {
    console.error("[mp-webhook] Error actualizando premium:", error);
    throw error;
  }
  console.log(`[mp-webhook] ✅ Premium activado para ${userId} hasta ${premiumUntil.toISOString()}`);
}

serve(async (req: Request) => {
  // MercadoPago envía GET para validar el endpoint también
  if (req.method === "GET") return ok();

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return ok("no body");
  }

  const type   = body.type as string;
  const action = body.action as string;

  console.log("[mp-webhook] Notificación:", type, action, body.data);

  // Solo procesamos pagos aprobados
  if (type !== "payment") return ok("not a payment");

  const paymentId = (body.data as { id?: string })?.id;
  if (!paymentId) return ok("no payment id");

  // Consultar el pago a la API de MP
  const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { "Authorization": `Bearer ${MP_ACCESS_TOKEN}` },
  });

  if (!mpRes.ok) {
    console.error("[mp-webhook] No se pudo obtener el pago:", paymentId);
    return ok("mp fetch error");
  }

  const payment = await mpRes.json();

  console.log(`[mp-webhook] Pago ${paymentId} - status: ${payment.status}`);

  if (payment.status !== "approved") return ok("not approved");

  // Parsear external_reference: "userId|plan|premiumUntil"
  const ref = (payment.external_reference as string) ?? "";
  const parts = ref.split("|");

  if (parts.length < 3) {
    console.error("[mp-webhook] external_reference inválido:", ref);
    return ok("invalid reference");
  }

  const [userId, , premiumUntilStr] = parts;
  const premiumUntil = new Date(premiumUntilStr);

  if (!userId || isNaN(premiumUntil.getTime())) {
    console.error("[mp-webhook] Datos inválidos:", userId, premiumUntilStr);
    return ok("invalid data");
  }

  await activatePremium(userId, premiumUntil);

  return ok("premium activated");
});
