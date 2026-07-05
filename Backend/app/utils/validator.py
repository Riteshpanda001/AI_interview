import re

class InputValidator:
    @staticmethod
    def validate_email(email: str) -> bool:
        regex = r'^\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
        return bool(re.match(regex, email))

    @staticmethod
    def validate_password_strength(password: str) -> bool:
        # Minimum 6 characters
        return len(password) >= 6
