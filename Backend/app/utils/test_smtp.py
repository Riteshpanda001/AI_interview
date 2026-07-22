import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import sys

# Ensure Backend root is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.config import settings

def test_gmail_smtp_connection():
    print("\n" + "=" * 60)
    print("[DIAGNOSTIC] PRENOVA AI - GMAIL SMTP DIAGNOSTIC TOOL")
    print("=" * 60)

    smtp_host = settings.SMTP_HOST
    smtp_port = settings.SMTP_PORT
    smtp_user = settings.effective_smtp_user
    smtp_password = settings.SMTP_PASSWORD

    print(f"SMTP Host      : {smtp_host}")
    print(f"SMTP Port      : {smtp_port}")
    print(f"SMTP Email/User: {smtp_user}")
    print(f"SMTP Password  : {'*' * len(smtp_password) if smtp_password else '(Empty)'}")

    if not smtp_password or smtp_password in {"password", "your-16-char-app-password", "YOUR_GOOGLE_APP_PASSWORD"}:
        print("\n[PROBLEM DETECTED] SMTP_PASSWORD in .env is set to placeholder 'YOUR_GOOGLE_APP_PASSWORD'.")
        print("\n[SOLUTION - HOW TO FIX]:")
        print("1. Turn ON '2-Step Verification' on your Google Account (prenovaai001@gmail.com).")
        print("2. Visit https://myaccount.google.com/apppasswords")
        print("3. Generate a 16-character App Password.")
        print("4. Paste it into Backend/.env as: SMTP_PASSWORD=\"abcdefghijklmnop\"")
        print("=" * 60 + "\n")
        return False

    print("\nAttempting SMTP Connection & Authentication with Gmail...")
    try:
        with smtplib.SMTP(smtp_host, smtp_port, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(smtp_user, smtp_password)
            print("[SUCCESS] Gmail SMTP Authentication Succeeded!")
            print("Real verification emails will be delivered directly to users' inboxes.")
            print("=" * 60 + "\n")
            return True
    except smtplib.SMTPAuthenticationError as exc:
        print(f"\n[AUTHENTICATION ERROR] {exc}")
        print("Reason: Gmail rejected the email or password.")
        print("Solution: Generate a new 16-character App Password at https://myaccount.google.com/apppasswords")
        print("=" * 60 + "\n")
        return False
    except Exception as exc:
        print(f"\n[CONNECTION ERROR] {exc}")
        print("=" * 60 + "\n")
        return False

if __name__ == "__main__":
    test_gmail_smtp_connection()
