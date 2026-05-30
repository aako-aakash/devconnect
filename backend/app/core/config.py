from typing import List
from functools import lru_cache
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str

    SECRET_KEY: str = "dev-secret-change-in-production-use-32-plus-chars"
    ALGORITHM: str  = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080

    FRONTEND_URL: str  = "http://localhost:5173"
    EXTRA_ORIGINS: str = ""

    model_config = {"env_file": ".env", "extra": "ignore"}

    def all_origins(self) -> List[str]:
        base = [
            self.FRONTEND_URL.strip(),
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
        ]
        if self.EXTRA_ORIGINS:
            for o in self.EXTRA_ORIGINS.split(","):
                o = o.strip()
                if o:
                    base.append(o)
        return list(set(base))


@lru_cache()
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
