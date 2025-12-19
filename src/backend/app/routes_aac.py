from fastapi import APIRouter, Query
from pathlib import Path
from datetime import datetime
import json
import random
import hashlib

from .services_google import translate_text
from .services_google_images import fetch_image_url

router = APIRouter(prefix="/aac", tags=["AAC"])

# --- Load AAC pool from JSON (data-driven, not hardcoded in code) ---
POOL_PATH = Path(__file__).parent / "aac_pool.json"

def _load_pool() -> dict:
    if not POOL_PATH.exists():
        # If missing, return minimal safe pool
        return {"core": ["I", "you", "help", "want", "more", "stop", "go"]}
    return json.loads(POOL_PATH.read_text(encoding="utf-8"))

# --- Simple in-memory caches to reduce API hits ---
_translation_cache: dict[tuple[str, str], str] = {}
_image_cache: dict[str, str] = {}

# ✅ bump this when you change image selection logic to bust old cache
_IMAGE_CACHE_VERSION = "v2"

def _tts_voice_for_lang(lang: str) -> str:
    return {
        "hi": "hi-IN",
        "ta": "ta-IN",
        "te": "te-IN",
        "kn": "kn-IN",
        "ml": "ml-IN",
        "mr": "mr-IN",
        "bn": "bn-IN",
        "gu": "gu-IN",
        "pa": "pa-IN",
        "ur": "ur-IN",
        "en": "en-IN",
    }.get(lang, "en-IN")

def _stable_seed(seed: str) -> int:
    """
    seed=today  -> stable board per day
    seed=random -> changes every request
    seed=any    -> stable by that string
    """
    if seed == "random":
        return random.randint(0, 10**9)

    if seed == "today":
        seed = datetime.utcnow().strftime("%Y-%m-%d")

    h = hashlib.sha256(seed.encode("utf-8")).hexdigest()
    return int(h[:8], 16)

def _translate(concept: str, lang: str) -> str:
    """
    Safe translate wrapper:
    - Caches results
    - Doesn't crash if Google fails
    - Supports multiple possible translate_text() signatures
    """
    key = (concept.lower().strip(), lang)
    if key in _translation_cache:
        return _translation_cache[key]

    if lang == "en":
        translated = concept
    else:
        try:
            # Try common signatures (your project may use any one of these)
            try:
                translated = translate_text(concept, lang)  # (text, lang)
            except TypeError:
                try:
                    translated = translate_text(concept, target_lang=lang)  # (text, target_lang)
                except TypeError:
                    translated = translate_text(concept, target_language=lang)  # (text, target_language)
        except Exception:
            translated = concept  # fallback (never crash)

    _translation_cache[key] = translated
    return translated

def _image(concept: str) -> str:
    """
    ✅ Fixed image fetching:
    - Cache-bust with version
    - Calls fetch_image_url(concept) (NOT query strings)
    - Doesn't lock you into repeated "random" results
    """
    key = f"{_IMAGE_CACHE_VERSION}:{concept.lower().strip()}"
    if key in _image_cache:
        return _image_cache[key]

    url = fetch_image_url(concept)  # ✅ only concept
    _image_cache[key] = url
    return url

def _pick_unique(concepts: list[str], limit: int) -> list[str]:
    """De-dupe while preserving order."""
    seen = set()
    unique = []
    for w in concepts:
        k = w.lower().strip()
        if k not in seen:
            seen.add(k)
            unique.append(w)
        if len(unique) >= limit:
            break
    return unique

# -----------------------------
# Categories endpoint (for chips)
# -----------------------------
@router.get("/categories")
def get_categories():
    pool = _load_pool()
    return {"categories": sorted(list(pool.keys()))}

# -----------------------------
# symbols list endpoint
# -----------------------------
@router.get("/symbols")
def get_symbols(
    lang: str = Query("en", description="Language code like en, hi, ta"),
    limit: int = Query(50, ge=1, le=500),
    cats: str | None = Query(None, description="Comma-separated categories"),
):
    pool = _load_pool()

    selected_cats = list(pool.keys())
    if cats:
        requested = [c.strip() for c in cats.split(",") if c.strip()]
        selected_cats = [c for c in requested if c in pool] or selected_cats

    # Flatten
    concepts: list[str] = []
    for c in selected_cats:
        concepts.extend(pool.get(c, []))

    unique = _pick_unique(concepts, limit)

    items = []
    for idx, concept in enumerate(unique, start=1):
        items.append(
            {
                "id": str(idx),
                "concept": concept,
                "label": _translate(concept, lang),
                "image_url": _image(concept),
                "tts_lang": _tts_voice_for_lang(lang),
            }
        )

    return {"lang": lang, "count": len(items), "items": items}

# -----------------------------
# board endpoint (changing board)
# -----------------------------
@router.get("/board")
def get_board(
    lang: str = Query("en"),
    size: int = Query(25, ge=4, le=60),
    cats: str = Query("core,indian_food,actions,feelings"),
    seed: str = Query("today", description="today | random | any-string"),
):
    pool = _load_pool()

    requested_cats = [c.strip() for c in cats.split(",") if c.strip()]
    available_cats = [c for c in requested_cats if c in pool]
    if not available_cats:
        available_cats = list(pool.keys())

    # Build candidate list
    candidates: list[str] = []
    for c in available_cats:
        candidates.extend(pool.get(c, []))

    # De-dupe first (before shuffle)
    deduped = _pick_unique(candidates, 2000)

    # Shuffle using stable seed
    rnd = random.Random(_stable_seed(seed))
    rnd.shuffle(deduped)

    chosen = deduped[:size]

    tiles = []
    for i, concept in enumerate(chosen):
        tiles.append(
            {
                "id": f"tile_{i+1}",
                "concept": concept,
                "label": _translate(concept, lang),
                "image_url": _image(concept),
                "tts_lang": _tts_voice_for_lang(lang),
            }
        )

    return {
        "lang": lang,
        "size": size,
        "cats": available_cats,
        "seed": seed,
        "tiles": tiles,
    }
