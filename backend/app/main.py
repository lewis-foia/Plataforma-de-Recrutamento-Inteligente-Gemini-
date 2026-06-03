from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.router import api_router
from app.core.config import settings

app = FastAPI(
    title="Plataforma de Recrutamento Inteligente",
    description="API para análise de currículos e matching com vagas usando Gemini AI",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rotas da API
app.include_router(api_router)

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "recruitment-platform"}

@app.get("/")
async def root():
    return {
        "message": "Plataforma de Recrutamento Inteligente API",
        "version": "1.0.0",
        "docs": "/docs",
    }
