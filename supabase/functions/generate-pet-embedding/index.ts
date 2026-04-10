import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Anthropic from "https://esm.sh/@anthropic-ai/sdk@0.27.0";
import { pipeline, env } from "https://cdn.jsdelivr.net/npm/@xenova/transformers@2.17.2";

env.allowLocalModels = false;
env.useBrowserCache  = false;

const SUPABASE_URL  = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_KEY  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANTHROPIC_KEY = Deno.env.get("ANTHROPIC_API_KEY")!;

const supabase  = createClient(SUPABASE_URL, SUPABASE_KEY);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

// MiniLM para text embeddings (384 dims, muy liviano)
// deno-lint-ignore no-explicit-any
let _embedder: any = null;
async function getEmbedder() {
  if (!_embedder) {
    _embedder = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }
  return _embedder;
}

/** Claude Haiku Vision analiza la imagen y devuelve descripción del animal */
async function describeAnimal(imageUrl: string): Promise<string> {
  // Descargar imagen y convertir a base64
  const response = await fetch(imageUrl);
  const buffer   = await response.arrayBuffer();
  const base64   = btoa(String.fromCharCode(...new Uint8Array(buffer)));
  const mimeType = response.headers.get("content-type") || "image/jpeg";

  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 300,
    messages: [{
      role: "user",
      content: [
        {
          type: "image",
          source: { type: "base64", media_type: mimeType as "image/jpeg" | "image/png" | "image/webp", data: base64 },
        },
        {
          type: "text",
          text: `Describí este animal de forma precisa para ayudar a encontrarlo si está perdido.
Incluí: especie, raza (si podés identificarla), color del pelaje, marcas distintivas, tamaño aproximado, y cualquier característica única visible.
Respondé solo con la descripción, sin introducciones ni comentarios. Máximo 3 oraciones.`,
        },
      ],
    }],
  });

  const text = message.content[0];
  return text.type === "text" ? text.text : "";
}

/** Convierte texto a embedding de 384 dims normalizado */
async function textToEmbedding(text: string): Promise<number[]> {
  const embedder = await getEmbedder();
  // deno-lint-ignore no-explicit-any
  const output   = await (embedder as any)(text, { pooling: "mean", normalize: true });
  return Array.from(output.data as Float32Array);
}

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let petId: string;
  let imageUrl: string;

  try {
    const body  = await req.json();
    const record = body.record ?? body;
    petId        = record.id;
    imageUrl     = record.image_url;

    if (!imageUrl) {
      return new Response(JSON.stringify({ skipped: true, reason: "sin imagen" }), { status: 200 });
    }
  } catch (err) {
    return new Response(JSON.stringify({ error: `parse error: ${err}` }), { status: 400 });
  }

  try {
    console.log(`[embedding] 🐾 analizando mascota ${petId}`);

    // 1. Claude Haiku describe visualmente al animal
    console.log(`[embedding] 👁 enviando imagen a Claude Haiku...`);
    const description = await describeAnimal(imageUrl);
    console.log(`[embedding] 📝 descripción: ${description}`);

    // 2. Convertir descripción a vector semántico
    console.log(`[embedding] 🔢 generando embedding de texto...`);
    const embedding = await textToEmbedding(description);

    // 3. Guardar embedding + descripción en la DB
    const { error } = await supabase
      .from("pets")
      .update({
        embedding:   `[${embedding.join(",")}]`,
        ai_description: description, // guardamos la descripción para mostrarla en la UI
      })
      .eq("id", petId);

    if (error) throw error;

    console.log(`[embedding] ✅ listo para pet ${petId}`);
    return new Response(JSON.stringify({ success: true, petId, description }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error(`[embedding] ❌ error:`, err);
    return new Response(JSON.stringify({ error: String(err), petId }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
