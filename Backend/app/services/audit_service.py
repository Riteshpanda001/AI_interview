import logging
from datetime import datetime, timezone
from typing import Optional, Dict, Any

logger = logging.getLogger("security_audit")

class AuditLogService:
    @staticmethod
    async def log_event(
        event_type: str,
        email: Optional[str] = None,
        user_id: Optional[str] = None,
        status: str = "SUCCESS",
        details: Optional[Dict[str, Any]] = None,
        req: Any = None,
        db: Any = None
    ) -> None:
        """
        Record a security audit log entry in MongoDB 'audit_logs' collection.
        """
        user_agent = req.headers.get("user-agent", "") if req else ""
        ip_address = req.client.host if req and req.client else "127.0.0.1"
        now = datetime.now(timezone.utc)

        log_doc = {
            "event_type": event_type,
            "email": email.lower().strip() if email else None,
            "user_id": str(user_id) if user_id is not None else None,
            "status": status,
            "ip_address": ip_address,
            "user_agent": user_agent,
            "details": details or {},
            "timestamp": now
        }

        # Print log entry in terminal
        logger.info(f"[SECURITY AUDIT] {event_type} | User: {email or user_id} | Status: {status} | IP: {ip_address}")

        if db is not None:
            try:
                if isinstance(db, dict):
                    coll = db.get("audit_logs")
                else:
                    coll = getattr(db, "audit_logs", None) or db["audit_logs"]
                
                if coll is not None:
                    await coll.insert_one(log_doc)
            except Exception as exc:
                logger.error(f"[AUDIT LOG ERROR] Failed to record audit log: {exc}")
