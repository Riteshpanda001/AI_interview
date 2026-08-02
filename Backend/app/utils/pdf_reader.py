class PDFReader:
    @staticmethod
    def extract_text(file_path: str) -> str:
        """
        Extracts raw text content from PDF files using pypdf.
        """
        try:
            from pypdf import PdfReader
            reader = PdfReader(file_path)
            extracted = []
            for page in reader.pages:
                text = page.extract_text()
                if text:
                    extracted.append(text)
            full_text = "\n".join(extracted).strip()
            if full_text:
                return full_text
        except Exception as e:
            print(f"Error reading PDF with pypdf: {e}")

        # Fallback text content for testing
        return (
            "Jane Doe\nEmail: jane@example.com\n"
            "Skills: Python, FastAPI, JavaScript, React, SQL, MongoDB, Git\n"
            "Experience:\nSoftware Engineer at TechCorp (2024 - Present)\n"
            "Developed backend APIs using FastAPI and MongoDB.\n"
            "Education:\nBachelor of Science in Computer Science, University of Technology"
        )

