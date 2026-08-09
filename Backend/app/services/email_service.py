import smtplib
import asyncio
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.config import settings

class EmailService:
    @staticmethod
    def build_verification_email_html(user_name: str, otp: str) -> str:
        safe_name = user_name or "Candidate"
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Verify Your Email – PreNova AI</title>
</head>
<body style="margin:0;padding:0;background-color:#05020c;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#05020c;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:linear-gradient(145deg, #0d081b 0%, #12062a 100%);
                 border:1px solid rgba(168,85,247,0.3);
                 border-radius:18px;
                 overflow:hidden;
                 box-shadow:0 12px 50px rgba(124,58,237,0.35);">

          <!-- Header -->
          <tr>
            <td align="center"
              style="background:linear-gradient(135deg,#4c1d95 0%,#7c3aed 100%);
                     padding:36px 40px;border-bottom:1px solid rgba(168,85,247,0.3);">
              <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:800;
                         letter-spacing:-0.5px;text-shadow:0 2px 10px rgba(0,0,0,0.4);">
                PreNova AI
              </h1>
              <p style="margin:6px 0 0 0;color:rgba(255,255,255,0.85);font-size:13px;
                        letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">
                AI Interview Preparation System
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 48px;">
              <h2 style="margin:0 0 16px 0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.3px;">
                Verify Your Email
              </h2>
              <p style="margin:0 0 20px 0;color:#c4c4e0;font-size:15px;line-height:1.7;">
                Hello <strong>{safe_name}</strong>,
              </p>
              <p style="margin:0 0 28px 0;color:#a3a3c2;font-size:15px;line-height:1.7;">
                Thank you for creating your <strong>PreNova AI</strong> account. Use the verification code below to activate your account.
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:10px 0 32px 0;">
                    <div style="display:inline-block;
                                background:linear-gradient(135deg,rgba(124,58,237,0.2),rgba(168,85,247,0.12));
                                border:2px solid rgba(168,85,247,0.45);
                                border-radius:16px;
                                padding:24px 48px;
                                box-shadow:0 0 25px rgba(168,85,247,0.25);">
                      <span style="font-size:46px;font-weight:900;letter-spacing:14px;
                                   color:#c084fc;text-shadow:0 0 20px rgba(192,132,252,0.6);
                                   font-family:'Courier New',Courier,monospace;">
                        {otp}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Notice -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:rgba(124,58,237,0.08);border-radius:12px;
                       border:1px solid rgba(168,85,247,0.2);margin-bottom:28px;">
                <tr>
                  <td style="padding:18px 24px;">
                    <p style="margin:0;color:#e9d5ff;font-size:14px;line-height:1.7;">
                      ⏳ The code expires in <strong style="color:#c084fc;">1 minute</strong>.
                    </p>
                    <p style="margin:8px 0 0 0;color:#a3a3c2;font-size:13px;line-height:1.6;">
                      If you did not request this account, please ignore this email.
                    </p>
                  </td>
                </tr>
              </table>

              <p style="margin:0;color:#6b6b8a;font-size:13px;line-height:1.6;">
                🔒 For security reasons, never share this code with anyone. PreNova AI support will never ask for your verification code.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 48px;background:rgba(7,4,15,0.8);border-top:1px solid rgba(168,85,247,0.15);">
              <p style="margin:0;color:#64648c;font-size:12px;text-align:center;line-height:1.6;">
                © PreNova AI · AI Interview Preparation System<br/>
                This is an automated message. Please do not reply directly to this mail.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    @staticmethod
    def build_password_reset_email_html(user_name: str, otp: str) -> str:
        safe_name = user_name or "Candidate"
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Your Password – PreNova AI</title>
</head>
<body style="margin:0;padding:0;background-color:#05020c;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#05020c;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:linear-gradient(145deg, #0d081b 0%, #12062a 100%);
                 border:1px solid rgba(168,85,247,0.3);
                 border-radius:18px;
                 overflow:hidden;
                 box-shadow:0 12px 50px rgba(124,58,237,0.35);">

          <!-- Header -->
          <tr>
            <td align="center"
              style="background:linear-gradient(135deg,#7c3aed 0%,#a855f7 100%);
                     padding:36px 40px;border-bottom:1px solid rgba(168,85,247,0.3);">
              <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:800;
                         letter-spacing:-0.5px;text-shadow:0 2px 10px rgba(0,0,0,0.4);">
                PreNova AI
              </h1>
              <p style="margin:6px 0 0 0;color:rgba(255,255,255,0.85);font-size:13px;
                        letter-spacing:1.5px;text-transform:uppercase;font-weight:600;">
                Password Recovery Request
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 48px;">
              <h2 style="margin:0 0 16px 0;color:#ffffff;font-size:24px;font-weight:700;letter-spacing:-0.3px;">
                Reset Your Password 🔑
              </h2>
              <p style="margin:0 0 20px 0;color:#c4c4e0;font-size:15px;line-height:1.7;">
                Hello <strong>{safe_name}</strong>,
              </p>
              <p style="margin:0 0 28px 0;color:#a3a3c2;font-size:15px;line-height:1.7;">
                We received a request to reset your password. Use the 6-digit recovery code below to complete the password reset process.
              </p>

              <!-- OTP Box -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding:10px 0 32px 0;">
                    <div style="display:inline-block;
                                background:linear-gradient(135deg,rgba(124,58,237,0.2),rgba(168,85,247,0.12));
                                border:2px solid rgba(168,85,247,0.45);
                                border-radius:16px;
                                padding:24px 48px;
                                box-shadow:0 0 25px rgba(168,85,247,0.25);">
                      <span style="font-size:46px;font-weight:900;letter-spacing:14px;
                                   color:#c084fc;text-shadow:0 0 20px rgba(192,132,252,0.6);
                                   font-family:'Courier New',Courier,monospace;">
                        {otp}
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Notice -->
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background:rgba(239,68,68,0.08);border-radius:12px;
                       border:1px solid rgba(239,68,68,0.2);margin-bottom:28px;">
                <tr>
                  <td style="padding:18px 24px;">
                    <p style="margin:0;color:#fca5a5;font-size:14px;line-height:1.7;">
                      ⏳ The code expires in <strong style="color:#f87171;">1 minute</strong>.
                    </p>
                    <p style="margin:8px 0 0 0;color:#f87171;font-size:13px;line-height:1.6;">
                      If you did not request a password reset, your password remains secure and active.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:28px 48px;background:rgba(7,4,15,0.8);border-top:1px solid rgba(168,85,247,0.15);">
              <p style="margin:0;color:#64648c;font-size:12px;text-align:center;line-height:1.6;">
                © PreNova AI · AI Interview Preparation System<br/>
                This is an automated message. Please do not reply directly to this mail.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    @staticmethod
    def build_contact_ticket_confirmation_html(user_name: str, ticket_number: str, subject: str, message: str) -> str:
        safe_name = user_name or "Valued User"
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Support Ticket Confirmed – PrepNova AI</title>
</head>
<body style="margin:0;padding:0;background-color:#05020c;font-family:'Segoe UI',Roboto,sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#05020c;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:linear-gradient(145deg, #0d081b 0%, #12062a 100%);
                 border:1px solid rgba(168,85,247,0.3);
                 border-radius:18px;
                 overflow:hidden;
                 box-shadow:0 12px 50px rgba(124,58,237,0.35);">
          <tr>
            <td align="center" style="background:linear-gradient(135deg,#4c1d95 0%,#7c3aed 100%);padding:30px;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;">PrepNova AI</h1>
              <p style="margin:4px 0 0 0;color:rgba(255,255,255,0.85);font-size:12px;text-transform:uppercase;font-weight:600;">
                Support Ticket Confirmed
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 16px 0;color:#ffffff;font-size:20px;font-weight:700;">
                We Received Your Message! 📩
              </h2>
              <p style="margin:0 0 16px 0;color:#c4c4e0;font-size:15px;line-height:1.6;">
                Hello <strong>{safe_name}</strong>,
              </p>
              <p style="margin:0 0 24px 0;color:#a3a3c2;font-size:15px;line-height:1.6;">
                Your support request has been logged under Ticket Number <strong style="color:#c084fc;">#{ticket_number}</strong>. Our support team will review your query and respond within 24 hours.
              </p>
              <div style="background:rgba(124,58,237,0.1);border:1px solid rgba(168,85,247,0.3);border-radius:12px;padding:20px;margin-bottom:24px;">
                <p style="margin:0 0 8px 0;color:#e9d5ff;font-size:14px;font-weight:700;">Ticket Information:</p>
                <p style="margin:0 0 6px 0;color:#a3a3c2;font-size:13px;"><strong>Ticket Number:</strong> #{ticket_number}</p>
                <p style="margin:0 0 6px 0;color:#a3a3c2;font-size:13px;"><strong>Subject:</strong> {subject}</p>
                <p style="margin:0;color:#a3a3c2;font-size:13px;"><strong>Message:</strong> {message}</p>
              </div>
              <p style="margin:0;color:#6b6b8a;font-size:13px;">
                Thank you for reaching out to PrepNova AI. Have a great day!
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;background:rgba(7,4,15,0.8);border-top:1px solid rgba(168,85,247,0.15);text-align:center;">
              <p style="margin:0;color:#64648c;font-size:12px;">© PrepNova AI · AI Interview Preparation System</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""

    @staticmethod
    def build_ticket_reply_html(user_name: str, ticket_number: str, reply_message: str, status: str) -> str:
        safe_name = user_name or "Valued User"
        return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Update on Support Ticket #{ticket_number} – PrepNova AI</title>
</head>
<body style="margin:0;padding:0;background-color:#05020c;font-family:'Segoe UI',Roboto,sans-serif;color:#ffffff;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#05020c;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0"
          style="background:linear-gradient(145deg, #0d081b 0%, #12062a 100%);
                 border:1px solid rgba(168,85,247,0.3);
                 border-radius:18px;
                 overflow:hidden;">
          <tr>
            <td align="center" style="background:linear-gradient(135deg,#7c3aed 0%,#a855f7 100%);padding:30px;">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:800;">PrepNova AI Support</h1>
              <p style="margin:4px 0 0 0;color:rgba(255,255,255,0.85);font-size:12px;text-transform:uppercase;font-weight:600;">
                Ticket #{ticket_number} Updated ({status})
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <h2 style="margin:0 0 16px 0;color:#ffffff;font-size:20px;font-weight:700;">
                Response from Support Specialist
              </h2>
              <p style="margin:0 0 16px 0;color:#c4c4e0;font-size:15px;line-height:1.6;">
                Hello <strong>{safe_name}</strong>,
              </p>
              <div style="background:rgba(124,58,237,0.12);border-left:4px solid #a855f7;border-radius:8px;padding:18px;margin:20px 0;">
                <p style="margin:0;color:#f8fafc;font-size:14px;line-height:1.7;">{reply_message}</p>
              </div>
              <p style="margin:20px 0 0 0;color:#94a3b8;font-size:13px;">
                Ticket Status: <strong style="color:#34d399;">{status}</strong>
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px;background:rgba(7,4,15,0.8);text-align:center;">
              <p style="margin:0;color:#64648c;font-size:12px;">© PrepNova AI · Customer Experience Team</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


    @staticmethod
    def _send_email_sync(to_email: str, subject: str, html_content: str) -> bool:
        """Synchronous SMTP send — runs in a thread to avoid blocking the event loop."""
        from_email = settings.effective_emails_from
        smtp_user = settings.effective_smtp_user
        smtp_password = (settings.SMTP_PASSWORD or "").replace(" ", "").strip()

        msg = MIMEMultipart("alternative")
        msg["From"] = f"{settings.EMAILS_FROM_NAME} <{from_email}>"
        msg["To"] = to_email
        msg["Subject"] = subject

        msg.attach(MIMEText(html_content, "html", "utf-8"))

        if settings.SMTP_PORT == 465:
            with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                server.login(smtp_user, smtp_password)
                server.sendmail(from_email, to_email, msg.as_string())
        else:
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=15) as server:
                server.ehlo()
                server.starttls()
                server.ehlo()
                server.login(smtp_user, smtp_password)
                server.sendmail(from_email, to_email, msg.as_string())

        return True

    @staticmethod
    async def send_email(to_email: str, subject: str, html_content: str) -> bool:
        """
        Send an HTML email via Gmail SMTP.
        Runs the blocking SMTP call in a thread executor so FastAPI stays non-blocking.
        Falls back to console logging if SMTP credentials are not configured.
        """
        import re
        otp_match = re.search(r'\b\d{6}\b', html_content)
        otp_code = otp_match.group(0) if otp_match else None

        # Always log prominent OTP notice in terminal console
        print(f"\n{'='*60}")
        print(f"[EMAIL SERVICE] 🔐 VERIFICATION OTP FOR: {to_email}")
        if otp_code:
            print(f"[EMAIL SERVICE] 🔑 CODE: {otp_code}")
        print(f"[EMAIL SERVICE] 📧 SUBJECT: {subject}")
        print(f"{'='*60}\n")

        smtp_user = settings.effective_smtp_user
        raw_password = (settings.SMTP_PASSWORD or "").strip()
        clean_password = raw_password.replace(" ", "")

        placeholder_emails = {"user@example.com", "noreply@example.com", "your-gmail@gmail.com", ""}
        placeholder_passwords = {"password", "your-16-char-app-password", "YOUR_GOOGLE_APP_PASSWORD", ""}

        if smtp_user in placeholder_emails or raw_password in placeholder_passwords or not clean_password:
            print("[EMAIL SERVICE] ⚠️  SMTP credentials not configured (placeholder detected in Backend/.env).")
            print("[EMAIL SERVICE] 💡 To receive OTP on user's real email, set your Google App Password in Backend/.env\n")
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
            print(f"[EMAIL SERVICE] ✅ Email successfully sent via SMTP to: {to_email}")
            return True
        except smtplib.SMTPAuthenticationError:
            print(
                "[EMAIL SERVICE] ❌ SMTP Authentication failed. "
                "Make sure SMTP_EMAIL/SMTP_USER and SMTP_PASSWORD are correct in Backend/.env. "
                "For Gmail, generate a 16-character App Password (not your account password)."
            )
            return False
        except smtplib.SMTPException as exc:
            print(f"[EMAIL SERVICE] ❌ SMTP error sending to {to_email}: {exc}")
            return False
        except Exception as exc:
            print(f"[EMAIL SERVICE] ❌ Unexpected error sending email to {to_email}: {exc}")
            return False
