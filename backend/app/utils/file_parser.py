import PyPDF2
import docx

def extract_text_from_file(file_path: str, content_type: str) -> str:
    if "pdf" in content_type:
        reader = PyPDF2.PdfReader(file_path)
        return " ".join(page.extract_text() or "" for page in reader.pages)
    else:  # DOCX
        doc = docx.Document(file_path)
        return "\n".join(p.text for p in doc.paragraphs)
