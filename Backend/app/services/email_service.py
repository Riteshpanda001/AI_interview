import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

class EmailService:
    @staticmethod
    async def send_email(to_email: str, subject: str, html_content: str):
        # In a real system, you would connect to SMTP server
        # For boilerplate / local dev, we will log to console to prevent blocking
        try:
            print(f"--- Sending Email To: {to_email} ---")
            print(f"Subject: {subject}")
            print(f"Content: {html_content}")
            print("---------------------------------")
        except Exception:
            try:
                safe_subject = subject.encode('ascii', errors='replace').decode('ascii')
                safe_content = html_content.encode('ascii', errors='replace').decode('ascii')
                print(f"--- Sending Email To: {to_email} (Fallback: Non-ASCII characters replaced) ---")
                print(f"Subject: {safe_subject}")
                print(f"Content: {safe_content}")
                print("---------------------------------")
            except Exception:
                pass
        
        # SMTP logic commented out for mock execution:
        """
        msg = MIMEMultipart()
        msg['From'] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
        msg['To'] = to_email
        msg['Subject'] = subject
        
        msg.attach(MIMEText(html_content, 'html'))
        
        try:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                server.sendmail(settings.EMAILS_FROM_EMAIL, to_email, msg.as_string())
            print("Email sent successfully")
        except Exception as e:
            print(f"Error sending email: {e}")
        """
        return True
