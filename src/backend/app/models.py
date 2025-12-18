from pydantic import BaseModel
from typing import Any, Dict, List, Optional

class DatasetInfo(BaseModel):
    name: str
    last_refreshed_utc: Optional[str] = None
    sample_count_cached: int = 0
    status: str = "unknown"
    error: Optional[str] = None

class DatasetSample(BaseModel):
    dataset: str
    rows: List[Dict[str, Any]]

class SuggestRequest(BaseModel):
    child_age: int
    difficulty: str  # "easy" | "medium" | "hard"
    goal: str        # e.g. "speech" | "attention" | "social"
    language: str    # "en" | "hi" | "ta"

class SuggestResponse(BaseModel):
    suggestions: List[str]
    rationale: str
