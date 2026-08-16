import asyncio
import pytest
from app.services.payment_service import PaymentService

def test_prorated_upgrade_calculation():
    from unittest.mock import AsyncMock, MagicMock
    from datetime import datetime, timezone, timedelta

    async def run():
        mock_db = MagicMock()
        now = datetime.now(timezone.utc)
        mock_db["subscriptions"].find_one = AsyncMock(return_value={
            "user_id": "user_123",
            "plan_type": "pro",
            "amount": 499,
            "expires_at": now + timedelta(days=15)
        })

        calc = await PaymentService.calculate_prorated_upgrade("user_123", "enterprise", mock_db)
        assert calc["current_plan"] == "PRO"
        assert calc["target_plan"] == "ENTERPRISE"
        assert calc["unused_credit"] > 0
        assert calc["prorated_amount_due"] < calc["target_plan_price"]

    asyncio.run(run())

def test_gateway_webhook_status():
    from unittest.mock import AsyncMock, MagicMock
    async def run():
        mock_db = MagicMock()
        mock_db["payments"].count_documents = AsyncMock(return_value=12)

        status = await PaymentService.get_gateway_webhook_status(mock_db)
        assert "razorpay_gateway" in status
        assert "stripe_gateway" in status
        assert status["processed_webhooks_count"] == 12

    asyncio.run(run())

def test_invoice_pdf_generator():
    from unittest.mock import AsyncMock, MagicMock
    from datetime import datetime, timezone

    async def run():
        mock_db = MagicMock()
        mock_db["payments"].find_one = AsyncMock(return_value={
            "transaction_id": "TXN_998877",
            "amount": 499,
            "currency": "INR",
            "status": "succeeded",
            "payment_method": "razorpay",
            "plan_type": "pro",
            "billing_cycle": "monthly",
            "created_at": datetime.now(timezone.utc)
        })
        mock_db["users"].find_one = AsyncMock(return_value={"full_name": "Test User", "email": "test@prepnova.ai"})

        pdf_bytes = await PaymentService.generate_invoice_pdf("user_123", "TXN_998877", mock_db)
        assert pdf_bytes is not None
        assert len(pdf_bytes) > 200
        assert pdf_bytes.startswith(b"%PDF")

    asyncio.run(run())
