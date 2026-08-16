import re
import os
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
import httpx
from app.config import settings

def normalize_phone_number(phone: str) -> str:
    """Normalizes phone numbers to standard E.164 format e.g. +919876543210."""
    if not phone:
        return ""
    clean = re.sub(r"[^\d+]", "", phone.strip())
    if clean.startswith("+"):
        return clean
    if len(clean) == 10:
        return f"+91{clean}"  # Default to India country code if 10 digits
    return f"+{clean}"

class SMSProviderInterface(ABC):
    @abstractmethod
    async def send_sms(self, phone_number: str, message: str) -> bool:
        pass

class ConsoleSMSProvider(SMSProviderInterface):
    async def send_sms(self, phone_number: str, message: str) -> bool:
        print(f"\n==========================================")
        print(f"[SMS CONSOLE FALLBACK] To: {phone_number}")
        print(f"[SMS CONSOLE FALLBACK] Message: {message}")
        print(f"==========================================\n")
        return True

class TwilioSMSProvider(SMSProviderInterface):
    def __init__(self, account_sid: str, auth_token: str, from_number: str):
        self.account_sid = account_sid
        self.auth_token = auth_token
        self.from_number = from_number

    async def send_sms(self, phone_number: str, message: str) -> bool:
        if not self.account_sid or not self.auth_token or not self.from_number:
            print("[TWILIO SMS] Missing credentials. Falling back to Console SMS Provider.")
            return await ConsoleSMSProvider().send_sms(phone_number, message)

        url = f"https://api.twilio.com/2010-04-01/Accounts/{self.account_sid}/Messages.json"
        data = {
            "To": phone_number,
            "From": self.from_number,
            "Body": message
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, data=data, auth=(self.account_sid, self.auth_token))
                if res.status_code in (200, 201):
                    return True
                print(f"[TWILIO SMS ERROR] Status {res.status_code}: {res.text}")
                return False
        except Exception as e:
            print(f"[TWILIO SMS EXCEPTION] {e}")
            return False

class MSG91SMSProvider(SMSProviderInterface):
    def __init__(self, auth_key: str, sender_id: str, template_id: str = ""):
        self.auth_key = auth_key
        self.sender_id = sender_id
        self.template_id = template_id

    async def send_sms(self, phone_number: str, message: str) -> bool:
        if not self.auth_key:
            print("[MSG91 SMS] Missing auth key. Falling back to Console SMS Provider.")
            return await ConsoleSMSProvider().send_sms(phone_number, message)

        url = "https://control.msg91.com/api/v5/flow/"
        clean_phone = phone_number.replace("+", "")
        payload = {
            "template_id": self.template_id,
            "short_url": "1",
            "recipients": [{"mobiles": clean_phone, "message": message}]
        }
        headers = {
            "authkey": self.auth_key,
            "content-type": "application/json"
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload, headers=headers)
                return res.status_code == 200
        except Exception as e:
            print(f"[MSG91 SMS EXCEPTION] {e}")
            return False

class Fast2SMSSMSProvider(SMSProviderInterface):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def send_sms(self, phone_number: str, message: str) -> bool:
        if not self.api_key:
            print("[FAST2SMS] Missing API key. Falling back to Console SMS Provider.")
            return await ConsoleSMSProvider().send_sms(phone_number, message)

        clean_phone = phone_number.replace("+91", "").replace("+", "").strip()
        url = "https://www.fast2sms.com/dev/bulkV2"
        headers = {"authorization": self.api_key}
        payload = {
            "route": "otp",
            "variables_values": message,
            "numbers": clean_phone
        }
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, data=payload, headers=headers)
                data = res.json()
                return data.get("return") is True
        except Exception as e:
            print(f"[FAST2SMS EXCEPTION] {e}")
            return False

class SMSService:
    @staticmethod
    def _get_provider() -> SMSProviderInterface:
        provider_type = getattr(settings, "SMS_PROVIDER", os.getenv("SMS_PROVIDER", "console")).lower().strip()
        if provider_type == "twilio":
            return TwilioSMSProvider(
                account_sid=getattr(settings, "TWILIO_ACCOUNT_SID", os.getenv("TWILIO_ACCOUNT_SID", "")),
                auth_token=getattr(settings, "TWILIO_AUTH_TOKEN", os.getenv("TWILIO_AUTH_TOKEN", "")),
                from_number=getattr(settings, "TWILIO_PHONE_NUMBER", os.getenv("TWILIO_PHONE_NUMBER", ""))
            )
        elif provider_type == "msg91":
            return MSG91SMSProvider(
                auth_key=getattr(settings, "MSG91_AUTH_KEY", os.getenv("MSG91_AUTH_KEY", "")),
                sender_id=getattr(settings, "MSG91_SENDER_ID", os.getenv("MSG91_SENDER_ID", "")),
                template_id=getattr(settings, "MSG91_TEMPLATE_ID", os.getenv("MSG91_TEMPLATE_ID", ""))
            )
        elif provider_type in ("fast2sms", "fastsms"):
            return Fast2SMSSMSProvider(
                api_key=getattr(settings, "FAST2SMS_API_KEY", os.getenv("FAST2SMS_API_KEY", ""))
            )
        return ConsoleSMSProvider()

    @staticmethod
    async def send_otp_sms(phone_number: str, otp_code: str) -> bool:
        normalized_phone = normalize_phone_number(phone_number)
        message = f"🔐 Your PreNova AI verification code is: {otp_code}. Valid for 5 minutes. Do NOT share this code."
        provider = SMSService._get_provider()
        return await provider.send_sms(normalized_phone, message)
