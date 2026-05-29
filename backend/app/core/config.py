from typing import List
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Required
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str = "dev-secret-change-in-production-min-32-chars"
    ALGORITHM: str  = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080   # 7 days

    # CORS
    FRONTEND_URL: str  = "http://localhost:5173"
    EXTRA_ORIGINS: str = ""           # comma-separated extra origins

    model_config = {"env_file": ".env", "extra": "ignore"}

    @property
    def all_origins(self) -> List[str]:
        origins = [
            self.FRONTEND_URL.strip(),
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
        ]
        if self.EXTRA_ORIGINS:
            for o in self.EXTRA_ORIGINS.split(","):
                o = o.strip()
                if o:
                    origins.append(o)
        return list(set(origins))


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
