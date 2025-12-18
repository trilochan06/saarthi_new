from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import settings
from .scheduler import start_scheduler
from .datasets import list_datasets, get_samples, refresh_dataset
from .models import DatasetSample, SuggestRequest, SuggestResponse
from .ml import suggest, rationale

app = FastAPI(title="Saarthi Backend", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    start_scheduler()

@app.get("/health")
def health():
    return {"status": "ok"}

@app.get("/datasets")
def datasets():
    return {"datasets": list_datasets()}

@app.get("/datasets/{name}/samples", response_model=DatasetSample)
def dataset_samples(name: str, limit: int = 25):
    rows = get_samples(name, limit=limit)
    return DatasetSample(dataset=name, rows=rows)

@app.post("/datasets/{name}/refresh")
def dataset_refresh(name: str):
    meta = refresh_dataset(name)
    return {"dataset": meta}

@app.post("/ml/suggest", response_model=SuggestResponse)
def ml_suggest(req: SuggestRequest):
    s = suggest(req)
    return SuggestResponse(suggestions=s, rationale=rationale(req.language))
