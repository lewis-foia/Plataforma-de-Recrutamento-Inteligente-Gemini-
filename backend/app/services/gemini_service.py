# app/services/gemini_service.py
import json
import logging
import google.generativeai as genai
from app.core.config import settings

logger = logging.getLogger(__name__)

class GeminiService:
    def __init__(self):
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY not configured in environment")
        if not settings.GEMINI_API_KEY.startswith("AIza"):
            logger.warning("GEMINI_API_KEY does not start with AIza - may be invalid")
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel("gemini-1.5-flash")

    async def extract_resume_data(self, text: str) -> dict:
        prompt = f"""
        Você é um especialista em análise de currículos. Extraia as informações do currículo abaixo.
        Retorne APENAS um JSON válido, sem nenhum texto antes ou depois:
        {{
            "full_name": "nome completo",
            "email": "email",
            "phone": "telefone",
            "skills": ["habilidade1", "habilidade2"],
            "education": [{{"degree": "curso", "institution": "instituição", "year": 2020}}],
            "experience": [{{"company": "empresa", "role": "cargo", "years": 3, "description": "descrição"}}],
            "certifications": ["certificação1"],
            "languages": [{{"language": "idioma", "level": "nível"}}],
            "summary": "resumo profissional"
        }}

        Currículo:
        {text}
        """
        try:
            response = await self.model.generate_content_async(prompt)
            return self._parse_json(response.text)
        except Exception as e:
            logger.error(f"Gemini extraction failed: {e}")
            # fallback para dados vazios para não quebrar o fluxo
            return {}

    async def evaluate_compatibility(
        self,
        resume_data: dict,
        job_title: str,
        job_description: str,
        job_requirements: str,
    ) -> tuple:
        prompt = f"""
        Compare o candidato abaixo com a vaga e avalie a compatibilidade.

        DADOS DO CANDIDATO:
        {json.dumps(resume_data, ensure_ascii=False, indent=2)}

        VAGA: {job_title}
        DESCRIÇÃO: {job_description}
        REQUISITOS: {job_requirements}

        Retorne APENAS um JSON válido com:
        {{
            "score": <número de 0 a 100>,
            "justification": "<justificativa detalhada em português>"
        }}
        """
        try:
            response = await self.model.generate_content_async(prompt)
            data = self._parse_json(response.text)
            score = float(data.get("score", 0))
            justification = str(data.get("justification", ""))
            return max(0.0, min(100.0, score)), justification
        except Exception as e:
            logger.error(f"Gemini compatibility evaluation failed: {e}")
            return 0.0, "Erro ao avaliar compatibilidade."

    def _parse_json(self, text: str) -> dict:
        cleaned = text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        return json.loads(cleaned.strip())