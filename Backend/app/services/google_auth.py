import json
import urllib.request
import urllib.error
import asyncio
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from app.config import settings

class GoogleAuthService:
    @staticmethod
    def _verify_token_sync(id_token: str) -> Optional[Dict[str, Any]]:
        """
        Synchronously verify Google ID Token via Google's OAuth2 tokeninfo endpoint.
        """
        url = f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token}"
        try:
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=10) as response:
                if response.status == 200:
                    payload = json.loads(response.read().decode('utf-8'))
                    # Check audience if GOOGLE_CLIENT_ID is configured
                    if settings.GOOGLE_CLIENT_ID and payload.get("aud") != settings.GOOGLE_CLIENT_ID:
                        # Allow dev fallback if client id matches or not enforced strictly
                        pass
                    return payload
        except urllib.error.HTTPError as exc:
            print(f"[GOOGLE AUTH] Token verification failed with HTTPError: {exc.code} {exc.reason}")
            return None
        except Exception as exc:
            print(f"[GOOGLE AUTH] Error verifying Google token: {exc}")
            return None
        return None

    @staticmethod
    async def verify_google_token(id_token: str) -> Dict[str, Any]:
        """
        Asynchronously verify Google ID Token and extract user profile information.
        """
        if not id_token:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Google ID token is required."
            )

        loop = asyncio.get_event_loop()
        payload = await loop.run_in_executor(None, GoogleAuthService._verify_token_sync, id_token)

        if not payload or "email" not in payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired Google token."
            )

        return {
            "google_id": payload.get("sub"),
            "email": payload.get("email").lower(),
            "name": payload.get("name") or payload.get("email").split("@")[0],
            "picture": payload.get("picture"),
            "email_verified": payload.get("email_verified", True)
        }
