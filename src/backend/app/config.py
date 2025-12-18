from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_ENV: str = "dev"
    CORS_ORIGINS: str = "http://localhost:5173"
    DATA_REFRESH_MINUTES: int = 60
    HF_DATASETS: str = "ag_news,emotion"  # comma-separated

    @property
    def cors_list(self) -> List[str]:
        return [x.strip() for x in self.CORS_ORIGINS.split(",") if x.strip()]

    @property
    def hf_datasets_list(self) -> List[str]:
        return [x.strip() for x in self.HF_DATASETS.split(",") if x.strip()]

settings = Settings()
