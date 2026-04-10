"""
Genera embeddings de alta calidad para todas las mascotas en Supabase.
Usa DINOv2-base (mucho mejor que ViT-base para similitud visual).

Instalación:
    pip install torch torchvision timm rembg pillow requests supabase numpy

Uso:
    cd scripts
    python generate_embeddings.py

Variables de entorno (en scripts/.env o exportadas):
    SUPABASE_URL=https://xxx.supabase.co
    SUPABASE_SERVICE_KEY=eyJ...  (service_role key, bypasea RLS)
"""

import os
import io
import sys
import time
import numpy as np
import requests
import torch
import timm
from PIL import Image
from rembg import remove, new_session
from supabase import create_client

# ── Cargar variables de entorno desde .env si existe ──────────────────────────
env_path = os.path.join(os.path.dirname(__file__), ".env")
if os.path.exists(env_path):
    for line in open(env_path):
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            os.environ.setdefault(k.strip(), v.strip())

SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_KEY", "")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("❌ Faltan SUPABASE_URL o SUPABASE_SERVICE_KEY en el .env")
    sys.exit(1)

# ── Configuración ──────────────────────────────────────────────────────────────
SIMILARITY_DIMS  = 768      # DINOv2-base: 768 dims (mismo que el SQL actual)
BATCH_SLEEP      = 0.5      # segundos entre pets (evitar rate limiting)
FORCE_REGENERATE = False    # True = regenera aunque ya tenga embedding

# ── Cargar modelos ─────────────────────────────────────────────────────────────
print("🔄 Cargando modelos...")

# DINOv2-base — entrenado para similitud visual, mucho mejor que ViT-base
model = timm.create_model("vit_base_patch14_dinov2.lvd142m", pretrained=True, num_classes=0)
model.eval()

data_config = timm.data.resolve_model_data_config(model)
transform    = timm.data.create_transform(**data_config, is_training=False)

# Sesión de rembg (u2net) — mejor que @imgly/background-removal
rembg_session = new_session("u2net")

print("✅ Modelos listos\n")

# ── Helpers ────────────────────────────────────────────────────────────────────
def download_image(url: str) -> Image.Image:
    resp = requests.get(url, timeout=15)
    resp.raise_for_status()
    return Image.open(io.BytesIO(resp.content)).convert("RGBA")


def remove_background(img: Image.Image) -> Image.Image:
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    result = remove(buf.getvalue(), session=rembg_session)
    return Image.open(io.BytesIO(result)).convert("RGBA")


def crop_to_bounding_box(img: Image.Image, padding: float = 0.05) -> Image.Image:
    """Recorta al área no-transparente del animal (elimina fondo vacío)."""
    bbox = img.getbbox()
    if not bbox:
        return img.convert("RGB")
    w, h = img.size
    pad_x = int(w * padding)
    pad_y = int(h * padding)
    x0 = max(0, bbox[0] - pad_x)
    y0 = max(0, bbox[1] - pad_y)
    x1 = min(w, bbox[2] + pad_x)
    y1 = min(h, bbox[3] + pad_y)
    return img.crop((x0, y0, x1, y1)).convert("RGB")


def generate_embedding(image_url: str) -> list[float]:
    img = download_image(image_url)
    img = remove_background(img)
    img = crop_to_bounding_box(img)

    tensor = transform(img).unsqueeze(0)
    with torch.no_grad():
        embedding = model(tensor).squeeze().numpy()

    # Normalizar para cosine similarity
    norm = np.linalg.norm(embedding)
    if norm > 0:
        embedding = embedding / norm

    return embedding.tolist()


def format_vector(embedding: list[float]) -> str:
    return f"[{','.join(str(round(v, 8)) for v in embedding)}]"

# ── Main ───────────────────────────────────────────────────────────────────────
def main():
    sb = create_client(SUPABASE_URL, SUPABASE_KEY)

    # Traer todas las mascotas con imagen
    query = sb.table("pets").select("id, name, image_url, embedding").neq("image_url", None)
    if not FORCE_REGENERATE:
        query = query.is_("embedding", "null")

    resp  = query.execute()
    pets  = resp.data or []
    total = len(pets)

    if total == 0:
        print("✅ No hay mascotas sin embedding.")
        return

    print(f"📋 {total} mascota(s) para procesar\n{'─'*50}")

    ok = err = 0
    for i, pet in enumerate(pets, 1):
        pet_id    = pet["id"]
        name      = pet.get("name") or "Sin nombre"
        image_url = pet["image_url"]

        print(f"[{i}/{total}] {name} ({pet_id[:8]}...)")

        try:
            print(f"  → Descargando imagen...")
            print(f"  → Removiendo fondo...")
            print(f"  → Generando embedding (DINOv2-base)...")
            embedding = generate_embedding(image_url)

            sb.table("pets").update({
                "embedding_dino": format_vector(embedding),  # DINOv2 (alta calidad)
                "embedding": format_vector(embedding),       # columna original (compatibilidad)
            }).eq("id", pet_id).execute()
            print(f"  ✅ Guardado ({len(embedding)} dims)")
            ok += 1

        except Exception as e:
            print(f"  ❌ Error: {e}")
            err += 1

        if i < total:
            time.sleep(BATCH_SLEEP)

    print(f"\n{'─'*50}")
    print(f"✅ {ok} embeddings generados")
    if err:
        print(f"❌ {err} errores")


if __name__ == "__main__":
    main()
