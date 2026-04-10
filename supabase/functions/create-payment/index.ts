import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY  = Deno.env.get("SERVICE_ROLE_KEY")!;
const MP_ACCESS_TOKEN = Deno.env.get("MP_ACCESS_TOKEN")!;
const APP_URL       = Deno.env.get("APP_URL")!; // ej: https://app.firulais.com

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

const PLANS: Record<string, { title: string; price: number; months: number }> = {
  monthly: { title: "Firulais Premium - Mensual", price: 4500, months: 1 },
  annual:  { title: "Firulais Premium - Anual",   price: 38000, months: 12 },
};

async function getUserId(authHeader: string | null): Promise<string | null> {
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const { data } = await supabase.auth.getUser(token);
  return data.user?.id ?? null;
}

async function getUserEmail(userId: string): Promise<string> {
  const { data } = await supabase.auth.admin.getUserById(userId);
  return data.user?.email ?? "usuario@firulais.com";
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  const userId = await getUserId(req.headers.get("Authorization"));
  if (!userId) return json({ error: "No autenticado" }, 401);

  let plan: string;
  try {
    const body = await req.json();
    plan = body.plan;
    if (!PLANS[plan]) throw new Error("Plan inválido");
  } catch (err) {
    return json({ error: String(err) }, 400);
  }

  const { title, price, months } = PLANS[plan];
  const email = await getUserEmail(userId);

  // Calcular fecha de vencimiento para la referencia
  const premiumUntil = new Date();
  premiumUntil.setMonth(premiumUntil.getMonth() + months);

  const webhookUrl = `${SUPABASE_URL}/functions/v1/mp-webhook`;

  const preference = {
    items: [{
      id: plan,
      title,
      quantity: 1,
      currency_id: "ARS",
      unit_price: price,
    }],
    payer: { email },
    back_urls: {
      success: `${APP_URL}/premium?status=approved`,
      failure: `${APP_URL}/premium?status=rejected`,
      pending: `${APP_URL}/premium?status=pending`,
    },
    auto_return: "approved",
    external_reference: `${userId}|${plan}|${premiumUntil.toISOString()}`,
    notification_url: webhookUrl,
    statement_descriptor: "FIRULAIS PREMIUM",
  };

  const mpRes = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${MP_ACCESS_TOKEN}`,
    },
    body: JSON.stringify(preference),
  });

  const mpData = await mpRes.json();

  if (!mpRes.ok) {
    console.error("[create-payment] MP error:", mpData);
    return json({ error: "Error al crear preferencia en MercadoPago" }, 500);
  }

  return json({
    init_point: mpData.init_point,             // producción
    sandbox_init_point: mpData.sandbox_init_point, // testing
    preference_id: mpData.id,
  });
});
