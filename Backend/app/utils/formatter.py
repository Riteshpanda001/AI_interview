import re

class TextFormatter:
    @staticmethod
    def strip_markdown(text: str) -> str:
        # Simple markdown stripper
        return re.sub(r'[*#`_\-]', '', text)
        
    @staticmethod
    def clean_json_string(text: str) -> str:
        # Strip ```json wrappers if present
        cleaned = text.strip()
        if cleaned.startswith("```"):
            lines = cleaned.splitlines()
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned = "\n".join(lines).strip()
        return cleaned
