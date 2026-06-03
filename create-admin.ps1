<#
.SYNOPSIS
    Cria um utilizador Admin na base de dados do projeto.
.DESCRIPTION
    Gera um hash bcrypt para a senha fornecida e insere o registo
    diretamente na tabela users com role = 'ADMIN'.
    Requer que o ambiente virtual do backend esteja disponível.
.PARAMETER Email
    Email do administrador (default: admin@recruitai.com)
.PARAMETER Password
    Senha do administrador (default: Admin123!)
.NOTES
    Execute na raiz do projeto (recruitment-platform).
    O backend/.env deve ter a DATABASE_URL correta.
#>

param(
    [string]$Email = "admin@recruitai.com",
    [string]$Password = "Admin123!"
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Get-Location
$BackendDir = Join-Path $ProjectRoot "backend"

Write-Host "`n=== Criar Utilizador Admin ===" -ForegroundColor Cyan

# 1. Ativar ambiente virtual
$venvActivate = Join-Path $BackendDir ".venv\Scripts\Activate.ps1"
if (-not (Test-Path $venvActivate)) {
    Write-Host "[ERRO] Ambiente virtual nao encontrado em $venvActivate" -ForegroundColor Red
    Write-Host "Execute primeiro o setup do backend." -ForegroundColor Yellow
    exit 1
}
Write-Host "[1/4] A ativar ambiente virtual..." -ForegroundColor Gray
& $venvActivate

# 2. Gerar hash da senha
Write-Host "[2/4] A gerar hash bcrypt..." -ForegroundColor Gray
$hashScript = "import bcrypt; print(bcrypt.hashpw('$Password'.encode(), bcrypt.gensalt()).decode())"
$hash = python -c $hashScript 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERRO] Falha ao gerar hash: $hash" -ForegroundColor Red
    exit 1
}
Write-Host "       Hash gerado com sucesso." -ForegroundColor Green

# 3. Criar e executar script Python de insercao
Write-Host "[3/4] A inserir utilizador na base de dados..." -ForegroundColor Gray
$pythonScript = @"
import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy import text
import uuid
from app.core.config import settings

async def main():
    engine = create_async_engine(settings.DATABASE_URL)
    async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        result = await session.execute(
            text("SELECT id FROM users WHERE email = :email"),
            {"email": "$Email"}
        )
        if result.scalar_one_or_none():
            print("Ja existe um utilizador com este email.")
            return
        user_id = uuid.uuid4()
        await session.execute(
            text("INSERT INTO users (id, email, password_hash, role, is_active, created_at, updated_at) VALUES (:id, :email, :password_hash, 'ADMIN', true, NOW(), NOW())"),
            {"id": user_id, "email": "$Email", "password_hash": "$hash"}
        )
        await session.commit()
        print(f"Admin criado com sucesso! ID: {user_id}")
        print(f"Email: $Email")
        print(f"Senha: $Password")
asyncio.run(main())
"@
$tempFile = Join-Path $BackendDir "_create_admin.py"
Set-Content -Path $tempFile -Value $pythonScript -Encoding UTF8

Set-Location $BackendDir
python _create_admin.py
Remove-Item $tempFile -Force -ErrorAction SilentlyContinue

# 4. Concluir
Write-Host "[4/4] Concluido!" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Admin criado com sucesso!" -ForegroundColor Green
Write-Host "   Email: $Email" -ForegroundColor White
Write-Host "   Senha: $Password" -ForegroundColor White
Write-Host ""
Write-Host "Aceda a http://localhost:5173/login para entrar." -ForegroundColor Cyan

deactivate
Set-Location $ProjectRoot
