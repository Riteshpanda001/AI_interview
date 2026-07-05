class PDFReader:
    @staticmethod
    def extract_text(file_path: str) -> str:
        """
        Extracts raw text content from PDF. In production, use PyPDF2 or pdfplumber.
        For local testing, we extract base metadata/mock string content.
        """
        print(f"Reading PDF from file: {file_path}")
        # Return fallback mock content for parsing simulation
        return (
            "Jane Doe\nEmail: jane@example.com\n"
            "Skills: Python, FastAPI, JavaScript, React, SQL, MongoDB, Git\n"
            "Experience:\nSoftware Engineer at TechCorp (2024 - Present)\n"
            "Developed backend APIs using FastAPI and MongoDB.\n"
            "Education:\nBachelor of Science in Computer Science, University of Technology"
        )
