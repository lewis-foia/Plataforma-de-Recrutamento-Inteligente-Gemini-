from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
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

# Tratamento de erros de validação (mostra detalhes no log)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"ERRO DE VALIDAÇÃO: {exc.errors()}")  # Aparece no terminal
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )