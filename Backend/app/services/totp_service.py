import pyotp

class TOTPService:
    @staticmethod
    def generate_secret() -> str:
        """
        Generate a cryptographically secure random base32 secret for TOTP.
        """
        return pyotp.random_base32()

    @staticmethod
    def get_provisioning_uri(secret: str, email: str, issuer_name: str = "PreNova AI") -> str:
        """
        Generate the provisioning URI to scan QR code in authenticator apps.
        """
        return pyotp.totp.TOTP(secret).provisioning_uri(
            name=email.strip().lower(),
            issuer_name=issuer_name
        )

    @staticmethod
    def verify_code(secret: str, code: str) -> bool:
        """
        Verify a 6-digit TOTP code.
        Allows a valid_window=1 (30s drift allowance on either side).
        """
        if not secret or not code:
            return False
        clean_code = code.strip().replace(" ", "")
        if len(clean_code) != 6 or not clean_code.isdigit():
            return False
        try:
            totp = pyotp.totp.TOTP(secret)
            return totp.verify(clean_code, valid_window=1)
        except Exception:
            return False
