from typing import Dict, List, Any
from datetime import datetime, timezone

from datasets import load_dataset  # huggingface datasets
from .config import settings

CACHE: Dict[str, Dict[str, Any]] = {}

def utc_now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

def refresh_dataset(name: str, sample_size: int = 200) -> Dict[str, Any]:
    """
    Loads a small sample using streaming=True (no full download).
    """
    meta = {
        "name": name,
        "last_refreshed_utc": None,
        "sample_count_cached": 0,
        "status": "loading",
        "error": None,
    }

    try:
        ds = load_dataset(name, split="train", streaming=True)  # streaming mode :contentReference[oaicite:4]{index=4}
        rows: List[dict] = []
        for i, row in enumerate(ds):
            rows.append(dict(row))
            if i + 1 >= sample_size:
                break

        meta["last_refreshed_utc"] = utc_now_iso()
        meta["sample_count_cached"] = len(rows)
        meta["status"] = "ready"

        CACHE[name] = {
            "meta": meta,
            "rows": rows,
        }
        return meta

    except Exception as e:
        meta["status"] = "error"
        meta["error"] = str(e)
        CACHE[name] = {"meta": meta, "rows": []}
        return meta

def refresh_all() -> List[Dict[str, Any]]:
    results = []
    for name in settings.hf_datasets_list:
        results.append(refresh_dataset(name))
    return results

def list_datasets() -> List[Dict[str, Any]]:
    results = []
    for name in settings.hf_datasets_list:
        if name not in CACHE:
            CACHE[name] = {"meta": {"name": name, "status": "not_loaded", "error": None, "last_refreshed_utc": None, "sample_count_cached": 0}, "rows": []}
        results.append(CACHE[name]["meta"])
    return results

def get_samples(name: str, limit: int = 25) -> List[Dict[str, Any]]:
    if name not in CACHE:
        refresh_dataset(name)
    return (CACHE.get(name, {}).get("rows") or [])[:limit]
