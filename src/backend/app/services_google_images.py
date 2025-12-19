import os
import json
import requests
import urllib.parse
from pathlib import Path

PLACEHOLDER = "https://via.placeholder.com/256?text=AAC"

ARASAAC_SEARCH = "https://api.arasaac.org/api/pictograms/en/search/{}"
ARASAAC_PNG = "https://static.arasaac.org/pictograms/{}/{}_500.png"

# Optional mapping file (create later if you want)
MAP_PATH = Path(__file__).parent / "aac_image_map.json"

def _load_map() -> dict:
    if MAP_PATH.exists():
        try:
            return json.loads(MAP_PATH.read_text(encoding="utf-8"))
        except Exception:
            return {}
    return {}

_CONCEPT_MAP = _load_map()

def _normalize(s: str) -> str:
    return (s or "").strip().lower()

def _extract_keywords(item) -> list[str]:
    """
    ARASAAC keywords can be:
      - ["eat", "food"]
      - [{"keyword":"eat"}, {"keyword":"food"}]
    """
    kws = item.get("keywords", [])
    out = []
    if isinstance(kws, list):
        for k in kws:
            if isinstance(k, str):
                out.append(_normalize(k))
            elif isinstance(k, dict):
                out.append(_normalize(k.get("keyword", "")))
    return [k for k in out if k]

def _score_item(item, wanted_terms: list[str]) -> int:
    """
    Higher = better match.
    - Exact keyword match => +100
    - Partial match => +20
    """
    keywords = _extract_keywords(item)
    score = 0
    for term in wanted_terms:
        t = _normalize(term)
        if not t:
            continue
        if t in keywords:
            score += 100
        else:
            for kw in keywords:
                if t in kw or kw in t:
                    score += 20
    return score

def _best_arasaac_png(terms: list[str]) -> str | None:
    """
    Search ARASAAC with multiple terms and pick best scored result.
    Prevents always taking "first" which is often generic.
    """
    all_results = []

    for term in terms:
        q = urllib.parse.quote(_normalize(term))
        if not q:
            continue
        try:
            r = requests.get(ARASAAC_SEARCH.format(q), timeout=8)
            r.raise_for_status()
            results = r.json() or []
            if isinstance(results, list):
                all_results.extend(results[:25])  # limit results
        except Exception:
            continue

    if not all_results:
        return None

    ranked = sorted(all_results, key=lambda x: _score_item(x, terms), reverse=True)
    best = ranked[0]
    pic_id = best.get("_id")
    if not pic_id:
        return None

    return ARASAAC_PNG.format(pic_id, pic_id)

def _google_image_url(query: str) -> str | None:
    """
    Optional Google Custom Search fallback (if keys are configured)
    """
    api_key = os.getenv("GOOGLE_SEARCH_API_KEY")
    cx = os.getenv("GOOGLE_SEARCH_CX")
    if not api_key or not cx:
        return None

    try:
        resp = requests.get(
            "https://www.googleapis.com/customsearch/v1",
            params={
                "key": api_key,
                "cx": cx,
                "q": query + " pictogram icon",
                "searchType": "image",
                "num": 1,
                "safe": "active",
            },
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()
        items = data.get("items", [])
        if not items:
            return None
        return items[0].get("link")
    except Exception:
        return None

def fetch_image_url(concept: str) -> str:
    """
    Priority:
    1) mapping keywords -> best ARASAAC match
    2) concept itself -> best ARASAAC match
    3) google fallback (optional)
    4) placeholder
    """
    c = _normalize(concept)

    mapped = _CONCEPT_MAP.get(c, [])
    if mapped:
        img = _best_arasaac_png(mapped)
        if img:
            return img

    img = _best_arasaac_png([concept])
    if img:
        return img

    g = _google_image_url(concept)
    if g:
        return g

    return PLACEHOLDER
