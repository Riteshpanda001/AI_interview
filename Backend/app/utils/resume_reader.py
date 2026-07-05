from app.utils.pdf_reader import PDFReader

class ResumeReader:
    @staticmethod
    def read_file(file_path: str) -> str:
        if file_path.lower().endswith(".pdf"):
            return PDFReader.extract_text(file_path)
        # Mock plain text parser for other extensions
        with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
            return f.read()
        return ""
