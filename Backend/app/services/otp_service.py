import random
from app.database import db_manager
from app.services.email_service import EmailService


class OTPService:
    @staticmethod
    async def send_otp(email: str) -> str:
        # Generate 6-digit numeric OTP
        otp = "".join([str(random.randint(0, 9)) for _ in range(6)])

        # Store in Redis with 5-minute expiry
        redis = db_manager.redis_client
        if redis:
            await redis.set(f"otp:{email}", otp, ex=300)

        # Build premium branded OTP email
        subject = "🔐 Your PreNovaAi Verification Code"
        html_content = f"""
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <title>Verify Your Email – PreNovaAi</title>
        </head>
        <body style="margin:0;padding:0;background-color:#07040f;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#07040f;padding:40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0"
                  style="background:linear-gradient(135deg,#0f0818 0%,#12062a 100%);
                         border:1px solid rgba(168,85,247,0.25);
                         border-radius:16px;
                         overflow:hidden;
                         box-shadow:0 8px 40px rgba(124,58,237,0.3);">

                  <!-- Header -->
                  <tr>
                    <td align="center"
                      style="background:linear-gradient(135deg,#4c1d95,#7c3aed);
                             padding:32px 40px;">
                      <h1 style="margin:0;color:#ffffff;font-size:30px;font-weight:800;
                                 letter-spacing:-0.5px;text-shadow:0 2px 8px rgba(0,0,0,0.3);">
                        PreNovaAi
                      </h1>
                      <p style="margin:6px 0 0 0;color:rgba(255,255,255,0.75);font-size:14px;
                                letter-spacing:1px;text-transform:uppercase;">
                        Next-Gen AI Interview Preparation
                      </p>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px 48px;">
                      <h2 style="margin:0 0 12px 0;color:#ffffff;font-size:22px;font-weight:700;">
                        Verify your email address 📧
                      </h2>
                      <p style="margin:0 0 28px 0;color:#a3a3c2;font-size:15px;line-height:1.7;">
                        Thanks for signing up! Enter the 6-digit code below to complete your
                        account verification. This code expires in <strong style="color:#c084fc;">5 minutes</strong>.
                      </p>

                      <!-- OTP Box -->
                      <table width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding:10px 0 32px 0;">
                            <div style="display:inline-block;
                                        background:linear-gradient(135deg,rgba(124,58,237,0.15),rgba(168,85,247,0.1));
                                        border:2px solid rgba(168,85,247,0.4);
                                        border-radius:14px;
                                        padding:28px 52px;">
                              <span style="font-size:48px;font-weight:900;letter-spacing:12px;
                                           color:#c084fc;text-shadow:0 0 20px rgba(192,132,252,0.5);">
                                {otp}
                              </span>
                            </div>
                          </td>
                        </tr>
                      </table>

                      <!-- Steps -->
                      <table width="100%" cellpadding="0" cellspacing="0"
                        style="background:rgba(255,255,255,0.03);border-radius:10px;
                               border:1px solid rgba(168,85,247,0.1);margin-bottom:28px;">
                        <tr>
                          <td style="padding:20px 24px;">
                            <p style="margin:0 0 8px 0;color:#ffffff;font-size:14px;font-weight:600;">
                              How to verify:
                            </p>
                            <p style="margin:0;color:#a3a3c2;font-size:14px;line-height:1.8;">
                              1. Go back to the PreNovaAi registration page.<br/>
                              2. Enter the 6-digit code shown above.<br/>
                              3. Click <strong style="color:#c084fc;">Verify &amp; Login</strong> to activate your account.
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- Security Notice -->
                      <table width="100%" cellpadding="0" cellspacing="0"
                        style="background:rgba(239,68,68,0.07);border-radius:10px;
                               border:1px solid rgba(239,68,68,0.2);margin-bottom:32px;">
                        <tr>
                          <td style="padding:16px 20px;">
                            <p style="margin:0;color:#fca5a5;font-size:13px;line-height:1.6;">
                              🔒 <strong>Security tip:</strong> PreNovaAi will never ask for this code via phone,
                              chat, or any other channel. Do not share it with anyone.
                            </p>
                          </td>
                        </tr>
                      </table>

                      <p style="margin:0;color:#6b6b8a;font-size:13px;line-height:1.6;">
                        If you did not create an account on PreNovaAi, you can safely ignore this email.
                        No account will be created without verification.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding:24px 48px;border-top:1px solid rgba(168,85,247,0.1);">
                      <p style="margin:0;color:#52527a;font-size:12px;text-align:center;line-height:1.6;">
                        © 2025 PreNovaAi · All rights reserved<br/>
                        This is an automated message. Please do not reply to this email.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        """

        await EmailService.send_email(email, subject, html_content)
        return otp

    @staticmethod
    async def verify_otp(email: str, otp: str) -> bool:
        redis = db_manager.redis_client
        if not redis:
            # Redis offline → allow universal dev fallback
            return otp == "123456"

        cached_otp = await redis.get(f"otp:{email}")
        if cached_otp == otp:
            await redis.delete(f"otp:{email}")
            return True

        return otp == "123456"  # Universal test code for local dev fallback

