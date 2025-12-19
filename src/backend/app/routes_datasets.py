from fastapi import APIRouter

router = APIRouter()

@router.get("/datasets")
def list_datasets():
    return {
        "datasets": [
            {
                "name": "AAC Symbols",
                "status": "ready",
                "sample_count_cached": 1200,
                "last_refreshed_utc": "2025-01-01T10:00:00Z",
            },
            {
                "name": "Speech Prompts",
                "status": "ready",
                "sample_count_cached": 540,
                "last_refreshed_utc": "2025-01-01T10:00:00Z",
            },
        ]
    }
