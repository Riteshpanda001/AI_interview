from passlib.context import CryptContext
import secrets
import string
import re

# ==========================================================
# Password Hashing Configuration
# ==========================================================

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# ==========================================================
# Hash Password
# ==========================================================

def hash_password(password: str) -> str:
    """
    Hash a plain password using bcrypt.
    """
    return pwd_context.hash(password)


# ==========================================================
# Verify Password
# ==========================================================

def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    """
    Verify plain password against hashed password.
    """
    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# ==========================================================
# Password Strength Validator
# ==========================================================

def validate_password(password: str):

    """
    Returns:
        (True, "Valid Password")
        OR
        (False, "Reason")
    """

    if len(password) < 8:
        return False, "Password must contain at least 8 characters."

    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter."

    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter."

    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one digit."

    if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one special character."

    return True, "Password is strong."


# ==========================================================
# Generate Secure Password
# ==========================================================

def generate_secure_password(length: int = 12):

    """
    Generate a random secure password.
    """

    characters = (
        string.ascii_letters
        + string.digits
        + "!@#$%^&*()"
    )

    return "".join(
        secrets.choice(characters)
        for _ in range(length)
    )


# ==========================================================
# Main (Testing)
# ==========================================================

if __name__ == "__main__":

    password = "Password@123"

    print("Original Password:")
    print(password)

    print("\nHash:")

    hashed = hash_password(password)

    print(hashed)

    print("\nVerify:")

    print(
        verify_password(
            password,
            hashed
        )
    )

    print("\nValidation:")

    print(
        validate_password(password)
    )

    print("\nGenerated Password:")

    print(
        generate_secure_password()
    )