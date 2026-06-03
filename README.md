## Pré‑requisitos

Ferramenta	Versão Mínima	Link para Download
Python		3.11+		https://www.python.org/downloads/
Node.js		20+		https://nodejs.org/
Git		Qualquer	https://git-scm.com/
PostgreSQL	16		https://www.postgresql.org/download/windows/



1️⃣ Configurar o Backend
Navegar para a pasta do projeto

cd C:\\caminho\\para\\recruitment-platform\\backend

## Criar e ativar ambiente virtual

python -m venv .venv
..venv\\Scripts\\Activate.ps1



## Instalar dependências

pip install -r requirements.txt



## Configurar variáveis de ambiente

## Editar o ficheiro .env e definir:

\- DATABASE\_URL (string de ligação ao PostgreSQL)

\- JWT\_SECRET\_KEY (chave secreta aleatória)

\- GEMINI\_API\_KEY (chave da API do Google Gemini)



2️⃣ Criar a Base de Dados
-- Executar no psql ou pgAdmin
CREATE USER "user" WITH PASSWORD 'password';
CREATE DATABASE recruitment\_db OWNER "user";
GRANT ALL PRIVILEGES ON DATABASE recruitment\_db TO "user";



Depois executar as migrações:

cd backend
alembic upgrade head



3️⃣ Criar Utilizador Admin (opcional)
.\\create-admin.ps1 -Email "admin@email.com" -Password "Admin123!"



4️⃣ Iniciar o Backend

uvicorn app.main:app --reload
Aceder a http://localhost:8000/docs para verificar.



5️⃣ Configurar e Iniciar o Frontend

cd ..\\frontend
npm install
npm run dev
Aceder a http://localhost:5173.



Resumo de Comandos (Powershell)

## \--- BACKEND ---

cd recruitment-platform\\backend
python -m venv .venv
..venv\\Scripts\\Activate.ps1
pip install -r requirements.txt

## Editar .env (GEMINI\_API\_KEY, JWT\_SECRET\_KEY, DATABASE\_URL)

notepad .env

## Base de Dados (após criar user e database no PostgreSQL)

alembic upgrade head

## Criar admin (opcional)

cd ..
.\\create-admin.ps1 -Email "admin@email.com" -Password "Admin123!"

## Iniciar servidor backend

cd backend
uvicorn app.main:app --reload

## \--- FRONTEND (noutro terminal) ---

cd recruitment-platform\\frontend
npm install
npm run dev
Comandos para inicializar o projeto noutro PC:



## 1\. Clonar ou copiar o projeto para o novo PC

git clone <url-do-repositorio> recruitment-platform
cd recruitment-platform



## 2\. Backend

cd backend
python -m venv .venv
..venv\\Scripts\\Activate.ps1
pip install -r requirements.txt



## Configurar .env (editar GEMINI\_API\_KEY, JWT\_SECRET\_KEY)

notepad .env



## Base de dados PostgreSQL (criar user e database se necessário)

## Depois executar migrações:



alembic upgrade head

## Criar admin (opcional)

cd ..
.\\create-admin.ps1 -Email "admin@email.com" -Password "Admin123!"



## Iniciar backend (terminal 1)

cd backend
uvicorn app.main:app --reload



## 3\. Frontend (terminal 2)

cd frontend
npm install
npm run dev
Pré-requisitos: Python 3.11+, Node.js 20+, PostgreSQL 16 instalados e a correr.
Aceder: http://localhost:5173 (frontend) | http://localhost:8000/docs (API).

