import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.27.0";

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY  = Deno.env.get("SERVICE_ROLE_KEY")!;
const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

const supabase  = createClient(SUPABASE_URL, SUPABASE_KEY);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const CACHE_TTL_MS   = 24 * 60 * 60 * 1000; // 24 horas
const TOP_K          = 5;
const AI_THRESHOLD   = 40;
const FREE_SEARCHES  = 2;

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function fetchAsBase64(url: string) {
  const res    = await fetch(url);
  const buffer = await res.arrayBuffer();
  const bytes  = new Uint8Array(buffer);
  // Convertir sin spread para evitar stack overflow en imágenes grandes
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  const mime   = (res.headers.get("content-type") || "image/jpeg").split(";")[0];
  return { data: base64, media_type: mime };
}

async function getUserId(authHeader: string | null): Promise<string | null> {
  if (!authHeader) return null;
  const token = authHeader.replace("Bearer ", "");
  const { data } = await supabase.auth.getUser(token);
  return data.user?.id ?? null;
}

type ProfileData = {
  is_premium: boolean;
  premium_until: string | null;
  ai_searches_used: number;
};

async function getProfile(userId: string): Promise<ProfileData | null> {
  const { data } = await supabase
    .from("profiles")
    .select("is_premium, premium_until, ai_searches_used")
    .eq("id", userId)
    .single();
  return data ?? null;
}

function checkPremium(profile: ProfileData): boolean {
  if (profile.is_premium) return true;
  if (profile.premium_until && new Date(profile.premium_until) > new Date()) return true;
  return false;
}

async function runClaudeSearch(sourcePet: { image_url: string }, candidates: SimilarPet[]): Promise<SimilarPet[]> {
  const withImage = candidates.filter(c => c.image_url);
  if (!withImage.length) return [];

  const [sourceImg, ...candidateImgs] = await Promise.all([
    fetchAsBase64(sourcePet.image_url),
    ...withImage.map(c => fetchAsBase64(c.image_url!)),
  ]);

  // deno-lint-ignore no-explicit-any
  const content: any[] = [
    { type: "image", source: { type: "base64", media_type: sourceImg.media_type, data: sourceImg.data } },
    { type: "text", text: "Esta es la mascota de referencia. Comparala con cada candidato:" },
    ...withImage.flatMap((_, i) => [
      { type: "text", text: `Candidato ${i + 1}:` },
      { type: "image", source: { type: "base64", media_type: candidateImgs[i].media_type, data: candidateImgs[i].data } },
    ]),
    {
      type: "text",
      text: `Analizá raza, color, marcas, forma de cara/orejas. ¿Cuál es la misma mascota?
Respondé SOLO con JSON: [{"index":1,"score":85},{"index":2,"score":10},...]
Score 0 = definitivamente NO, 100 = casi seguro que SÍ.`,
    },
  ];

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [{ role: "user", content }],
  });

  const raw     = message.content[0].type === "text" ? message.content[0].text : "[]";
  const match   = raw.match(/\[[\s\S]*\]/);
  const scores  = match ? JSON.parse(match[0]) as { index: number; score: number }[] : [];

  return withImage
    .map((pet, i) => ({ ...pet, ai_score: scores.find(s => s.index === i + 1)?.score ?? 0 }))
    .filter(p => p.ai_score >= AI_THRESHOLD)
    .sort((a, b) => b.ai_score - a.ai_score);
}

export type SimilarPet = {
  id: string;
  name: string | null;
  status: string;
  image_url: string | null;
  similarity: number;
  ai_score: number;
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });

  let petId: string;
  let forceRefresh = false;

  try {
    const body  = await req.json();
    petId        = body.petId;
    forceRefresh = body.forceRefresh === true;
    if (!petId) throw new Error("petId requerido");
  } catch (err) {
    return json({ error: String(err) }, 400);
  }

  // ── Autenticación ────────────────────────────────────────────────────────────
  const userId = await getUserId(req.headers.get("Authorization"));
  if (!userId) return json({ error: "No autenticado" }, 401);

  // ── Cargar perfil (premium + búsquedas usadas) ────────────────────────────
  const profile = await getProfile(userId);
  const premium = profile ? checkPremium(profile) : false;
  const searchesUsed = profile?.ai_searches_used ?? 0;
  const searchesRemaining = premium ? null : Math.max(0, FREE_SEARCHES - searchesUsed);

  // ── Verificar cache ───────────────────────────────────────────────────────────
  const { data: cache } = await supabase
    .from("pet_similarity_cache")
    .select("results, searched_at")
    .eq("pet_id", petId)
    .maybeSingle();

  const cacheAge    = cache ? Date.now() - new Date(cache.searched_at).getTime() : Infinity;
  const cacheValid  = cacheAge < CACHE_TTL_MS;
  const minutesAgo  = Math.floor(cacheAge / 60_000);

  // ── Si tiene cache válido ─────────────────────────────────────────────────────
  if (cacheValid && cache) {
    if (!forceRefresh) {
      return json({ results: cache.results, fromCache: true, minutesAgo, searches_remaining: searchesRemaining });
    }

    // Quiere refrescar: verificar si puede hacer una nueva búsqueda
    const exhausted = !premium && searchesUsed >= FREE_SEARCHES;
    if (exhausted) {
      // Sin búsquedas y sin premium → no puede refrescar
      return json({
        error: "searches_exhausted",
        message: "Agotaste tus búsquedas gratuitas con IA. Actualizá a Premium para seguir buscando.",
        searches_remaining: 0,
        results: cache.results,
        fromCache: true,
        minutesAgo,
      }, 402);
    }

    // Tiene búsquedas disponibles o es premium → borrar cache y continuar
    await supabase.from("pet_similarity_cache").delete().eq("pet_id", petId);
  }

  // ── Verificar límite de búsquedas gratuitas (sin cache) ──────────────────
  if (!premium && searchesUsed >= FREE_SEARCHES) {
    return json({
      error: "searches_exhausted",
      message: "Agotaste tus búsquedas gratuitas con IA. Actualizá a Premium para seguir buscando.",
      searches_remaining: 0,
      results: [],
      fromCache: false,
      minutesAgo: null,
    }, 402);
  }

  // ── Nueva búsqueda ───────────────────────────────────────────────────────────
  const [candidatesRes, sourceRes] = await Promise.all([
    supabase.rpc("find_similar_pets_by_id", { source_pet_id: petId }),
    supabase.from("pets").select("id, image_url").eq("id", petId).single(),
  ]);

  const candidates = ((candidatesRes.data ?? []) as SimilarPet[]).slice(0, TOP_K);
  const source     = sourceRes.data;

  if (!candidates.length || !source?.image_url) {
    return json({ results: [], fromCache: false, minutesAgo: null, searches_remaining: searchesRemaining });
  }

  const results = await runClaudeSearch(source, candidates);

  // ── Incrementar contador de búsquedas (solo usuarios free) ───────────────
  if (!premium) {
    await supabase
      .from("profiles")
      .update({ ai_searches_used: searchesUsed + 1 })
      .eq("id", userId);
  }

  // Guardar en cache
  await supabase.from("pet_similarity_cache").upsert({
    pet_id: petId,
    results,
    searched_at: new Date().toISOString(),
  });

  const newRemaining = premium ? null : Math.max(0, FREE_SEARCHES - (searchesUsed + 1));

  return json({ results, fromCache: false, minutesAgo: null, searches_remaining: newRemaining });
});
