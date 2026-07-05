import random
import string

class SystemHelpers:
    @staticmethod
    def generate_random_string(length: int = 10) -> str:
        letters = string.ascii_letters + string.digits
        return ''.join(random.choice(letters) for _ in range(length))

    @staticmethod
    def sanitize_filename(filename: str) -> str:
        keepcharacters = ('.', '_', '-')
        return "".join(c for c in filename if c.isalnum() or c in keepcharacters).rstrip()
