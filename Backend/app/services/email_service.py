import smtplib
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings


class EmailService:
    @staticmethod
    def _send_email_sync(to_email: str, subject: str, html_content: str) -> bool:
        """Synchronous SMTP send — runs in a thread to avoid blocking the event loop."""
        msg = MIMEMultipart("alternative")
        msg["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(html_content, "html", "utf-8"))

        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAILS_FROM_EMAIL, to_email, msg.as_string())

        return True

    @staticmethod
    async def send_email(to_email: str, subject: str, html_content: str) -> bool:
        """
        Send an HTML email via Gmail SMTP.
        Runs the blocking SMTP call in a thread executor so FastAPI stays non-blocking.
        Falls back to console logging if SMTP credentials are not configured.
        """
        # Detect unconfigured / placeholder credentials and fall back to console logging
        placeholder_emails = {"user@example.com", "noreply@example.com", ""}
        if settings.SMTP_USER in placeholder_emails or settings.SMTP_PASSWORD in {"password", ""}:
            print(f"\n{'='*60}")
            print(f"[EMAIL SERVICE] ⚠️  SMTP not configured — printing to console")
            print(f"  To     : {to_email}")
            print(f"  Subject: {subject}")
            print(f"  Body   : {html_content[:300]}...")
            print(f"{'='*60}\n")
            return True

        try:
            loop = asyncio.get_event_loop()
            await loop.run_in_executor(
                None,
                EmailService._send_email_sync,
                to_email,
                subject,
                html_content,
            )
            print(f"[EMAIL SERVICE] ✅ Email sent successfully to {to_email}")
            return True
        except smtplib.SMTPAuthenticationError:
            print(
                "[EMAIL SERVICE] ❌ SMTP Authentication failed. "
                "Make sure SMTP_USER and SMTP_PASSWORD are correct in .env. "
                "For Gmail, use an App Password (not your account password)."
            )
            return False
        except smtplib.SMTPException as exc:
            print(f"[EMAIL SERVICE] ❌ SMTP error sending to {to_email}: {exc}")
            return False
        except Exception as exc:
            print(f"[EMAIL SERVICE] ❌ Unexpected error sending email to {to_email}: {exc}")
            return False

