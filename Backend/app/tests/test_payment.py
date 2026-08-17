import asyncio
import pytest
from unittest.mock import AsyncMock, MagicMock
from fastapi import HTTPException
from app.services.payment_service import PaymentService, SubscriptionEnforcer
from app.schemas.payment_schema import RazorpayVerifyRequest, StripeVerifyRequest

def test_razorpay_signature_verification_success():
    async def run():
        mock_db = MagicMock()
        mock_db["payments"].insert_one = AsyncMock(return_value=MagicMock(inserted_id="p123"))
        mock_db["users"].update_one = AsyncMock()
        mock_db["subscriptions"].update_one = AsyncMock()

        req = RazorpayVerifyRequest(
            razorpay_order_id="order_123",
            razorpay_payment_id="pay_123",
            razorpay_signature="sig_test_valid",
            plan_type="pro",
            billing_cycle="monthly",
            amount=499.0,
            currency="INR"
        )

        res = await PaymentService.verify_razorpay_payment("user123", req, mock_db)
        assert res["status"] == "succeeded"
        assert res["plan_type"] == "pro"
        assert res["gateway_order_id"] == "order_123"

    asyncio.run(run())

def test_razorpay_signature_verification_failure():
    async def run():
        mock_db = MagicMock()
        from app.config import settings
        settings.RAZORPAY_KEY_SECRET = "real_secret_key"

        req = RazorpayVerifyRequest(
            razorpay_order_id="order_123",
            razorpay_payment_id="pay_123",
            razorpay_signature="invalid_fake_signature",
            plan_type="pro",
            amount=499.0
        )

        with pytest.raises(HTTPException) as exc_info:
            await PaymentService.verify_razorpay_payment("user123", req, mock_db)

        assert exc_info.value.status_code == 400
        assert "Cryptographic verification failed" in exc_info.value.detail
        settings.RAZORPAY_KEY_SECRET = None

    asyncio.run(run())

def test_subscription_enforcer_mock_interview_limit():
    async def run():
        mock_db = MagicMock()
        # Free user with 1 existing session
        mock_db["users"].find_one = AsyncMock(return_value={"_id": "u1", "plan_type": "free"})
        mock_db["subscriptions"].find_one = AsyncMock(return_value=None)
        mock_db["interview_sessions"].count_documents = AsyncMock(return_value=1)

        with pytest.raises(HTTPException) as exc_info:
            await SubscriptionEnforcer.enforce_mock_interview_limit("u1", mock_db)

        assert exc_info.value.status_code == 403
        assert "Free plan limit" in exc_info.value.detail

        # Pro user (unlimited)
        mock_db["users"].find_one = AsyncMock(return_value={"_id": "u1", "plan_type": "pro"})
        allowed = await SubscriptionEnforcer.enforce_mock_interview_limit("u1", mock_db)
        assert allowed is True

    asyncio.run(run())

def test_invoice_not_found_raises_404():
    async def run():
        mock_db = MagicMock()
        mock_db["payments"].find_one = AsyncMock(return_value=None)

        with pytest.raises(HTTPException) as exc_info:
            await PaymentService.get_invoice_details("u1", "TXN_NONEXISTENT", mock_db)

        assert exc_info.value.status_code == 404
        assert "not found" in exc_info.value.detail

    asyncio.run(run())


def test_verify_upi_qr_payment_success():
    async def run():
        mock_db = MagicMock()
        mock_db["payments"].insert_one = AsyncMock(return_value=MagicMock(inserted_id="p456"))
        mock_db["users"].update_one = AsyncMock()
        mock_db["subscriptions"].update_one = AsyncMock()

        from app.api.payment_routes import verify_upi_qr_payment
        from app.schemas.payment_schema import UPIQRVerifyRequest

        req = UPIQRVerifyRequest(
            plan_type="pro",
            billing_cycle="monthly",
            amount=499.0,
            currency="INR",
            transaction_ref="UPI123456789"
        )
        current_user = {"_id": "user789"}

        res = await verify_upi_qr_payment(
            request=req,
            current_user=current_user,
            db=mock_db
        )

        assert res["status"] == "succeeded"
        assert res["plan_type"] == "pro"
        assert res["payment_method"] == "upi_qr"
        assert res["gateway_payment_id"] == "UPI123456789"

    asyncio.run(run())

