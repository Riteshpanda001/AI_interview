import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import upiQrCode from "../assets/upi_qr_code.png";
import "./PayUpiQr.css";

const API_BASE_URL = "http://localhost:8000/api";

const PayUpiQr = () => {
  const { user, authFetch, fetchCurrentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const planParam = searchParams.get("plan") || "pro";
  const cycleParam = searchParams.get("cycle") || "monthly";

  const [transactionRef, setTransactionRef] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    // If auth state loaded and no user, send to login
    if (!loading && !user) {
      navigate(`/login?redirect=/pay-upi-qr?plan=${planParam}&cycle=${cycleParam}`);
    }
  }, [user, loading, navigate, planParam, cycleParam]);

  // Compute pricing details
  const planName = planParam.charAt(0).toUpperCase() + planParam.slice(1);
  let basePrice = 499;
  if (planName === "Premium") basePrice = 999;
  if (planName === "Enterprise") basePrice = 1999;

  const isYearly = cycleParam === "yearly";
  const monthlyPrice = isYearly ? Math.round(basePrice * 0.8) : basePrice;
  const rawTotal = isYearly ? monthlyPrice * 12 : monthlyPrice;

  const handlePayConfirm = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage("");

    try {
      const response = await authFetch(`${API_BASE_URL}/payment/verify-upi-qr`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_type: planParam.toLowerCase(),
          billing_cycle: cycleParam,
          amount: rawTotal,
          currency: "INR",
          transaction_ref: transactionRef || `pay_qr_manual_${Date.now()}`,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "UPI payment verification failed.");
      }

      const paymentData = await response.json();
      
      // Update local current user details
      if (localStorage.getItem("access_token")) {
        await fetchCurrentUser(localStorage.getItem("access_token"));
      }

      setPaymentSuccess(true);

      setTimeout(() => {
        setIsProcessing(false);
        navigate("/dashboard?payment=success");
      }, 2000);
    } catch (err) {
      setErrorMessage(err.message || "Failed to confirm payment. Please check your transaction reference.");
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="pay-upi-loading">
        <div className="pay-upi-spinner" />
        <p>Verifying secure session...</p>
      </div>
    );
  }

  return (
    <div className="pay-upi-page">
      <Navbar />

      <main className="pay-upi-main-container">
        <div className="pay-upi-card">
          <button className="pay-upi-back-btn" onClick={() => navigate("/pricing")}>
            ← Back to Pricing
          </button>

          {paymentSuccess ? (
            <div className="pay-upi-success-state">
              <div className="success-icon-circle">✓</div>
              <h2>Payment Received & Activated! 🎉</h2>
              <p>
                Your account is upgraded to <strong>{planName} ({cycleParam.toUpperCase()})</strong>. Redirecting you to your dashboard...
              </p>
            </div>
          ) : (
            <>
              <div className="pay-upi-header">
                <h2>Direct <span>UPI QR Checkout</span></h2>
                <p>Scan the code below with any UPI application to complete payment</p>
              </div>

              {errorMessage && <div className="pay-upi-alert-error">{errorMessage}</div>}

              <div className="pay-upi-content-grid">
                {/* Left Side: Summary & QR */}
                <div className="pay-upi-left">
                  <div className="pay-upi-summary-box">
                    <div className="summary-row">
                      <span className="summary-label">Chosen Plan</span>
                      <span className="summary-val">{planName} ({cycleParam.toUpperCase()})</span>
                    </div>
                    <div className="summary-row">
                      <span className="summary-label">Total Payable</span>
                      <span className="summary-val price">₹{rawTotal}</span>
                    </div>
                  </div>

                  <div className="pay-upi-qr-box">
                    <div className="pay-upi-image-wrapper">
                      <img src={upiQrCode} alt="UPI QR Code" className="pay-upi-qr-image" />
                    </div>
                    <div className="pay-upi-qr-details">
                      <p className="pay-upi-merchant">Ritesh kumar Panda</p>
                      <p className="pay-upi-id">UPI ID: <span>riteshkumarpanda044@okaxis</span></p>
                      <p className="pay-upi-instruction">Scan to pay with any UPI app (GPay, PhonePe, Paytm, BHIM, etc.)</p>
                    </div>
                  </div>
                </div>

                {/* Right Side: Form Confirm */}
                <div className="pay-upi-right">
                  <div className="pay-upi-instructions-card">
                    <h3>💡 Simple Payment Steps:</h3>
                    <ul>
                      <li>Open any UPI app on your phone.</li>
                      <li>Scan the QR code on the left.</li>
                      <li>Pay the exact amount: <strong>₹{rawTotal}</strong>.</li>
                      <li>Enter the 12-digit UTR/Ref number below and click confirm!</li>
                    </ul>
                  </div>

                  <form onSubmit={handlePayConfirm} className="pay-upi-form">
                    <div className="pay-upi-input-group">
                      <label htmlFor="upi-utr-input">Transaction Reference ID / UTR (Optional)</label>
                      <input
                        id="upi-utr-input"
                        type="text"
                        placeholder="e.g. 345678901234 (12-digit number)"
                        value={transactionRef}
                        onChange={(e) => setTransactionRef(e.target.value)}
                        className="pay-upi-text-input"
                      />
                      <span className="input-help-text">Providing UTR number assists in instant cryptographic server-side approval</span>
                    </div>

                    <button
                      type="submit"
                      className="pay-upi-submit-btn"
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Activating Subscription..." : `I Have Paid ₹${rawTotal}`}
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PayUpiQr;
