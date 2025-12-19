from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .routes_datasets import router as datasets_router
from .routes_i18n import router as i18n_router
from .routes_aac import router as aac_router

app = FastAPI(title="Saarthi Backend", version="1.0.0")

# CORS (keep broad for local dev)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def health():
    return {"status": "ok"}

# Routers
app.include_router(datasets_router)
app.include_router(i18n_router)
app.include_router(aac_router)
