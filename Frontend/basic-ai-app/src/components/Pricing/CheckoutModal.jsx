import React, { useState, useEffect } from "react";
import "./CheckoutModal.css";
import { useAuth } from "../../context/AuthContext";
import razorpayLogo from "../../assets/google.png"; // or generic payment icons

const API_BASE_URL = "http://localhost:8000/api";

const CheckoutModal = ({ isOpen, onClose, selectedPlan, billingCycle, onPaymentSuccess }) => {
  const { user, authFetch, fetchCurrentUser } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState("razorpay"); // 'razorpay' or 'stripe'
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Load Razorpay Script dynamically
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  if (!isOpen || !selectedPlan) return null;

  const isYearly = billingCycle === "yearly";
  const planName = selectedPlan.name || "Pro";
  
  // Calculate price based on plan & cycle
  let basePrice = 499;
  if (planName === "Premium") basePrice = 999;
  if (planName === "Enterprise") basePrice = 1999;

  const monthlyPrice = isYearly ? Math.round(basePrice * 0.8) : basePrice;
  const rawTotal = isYearly ? monthlyPrice * 12 : monthlyPrice;
  const currency = paymentMethod === "razorpay" ? "INR" : "USD";
  const symbol = currency === "INR" ? "₹" : "$";
  const displayAmount = currency === "INR" ? rawTotal : Math.round(rawTotal / 80);

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage("");

    try {
      if (paymentMethod === "razorpay") {
        // Step 1: Create Order ID
        const orderRes = await authFetch(`${API_BASE_URL}/payment/create-razorpay-order`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan_type: planName.toLowerCase(),
            billing_cycle: billingCycle,
            amount: displayAmount,
            currency: "INR",
          }),
        });

        const orderData = await orderRes.json();

        // Step 2: Open Razorpay Popup or simulate if test mode
        if (window.Razorpay) {
          const options = {
            key: orderData.key_id || "rzp_test_mock_prepnova_key_12345",
            amount: displayAmount * 100,
            currency: "INR",
            name: "PrepNova AI",
            description: `${planName} Subscription (${billingCycle})`,
            order_id: orderData.order_id,
            prefill: {
              name: user?.full_name || "Valued User",
              email: user?.email || "",
            },
            theme: { color: "#7c3aed" },
            handler: async (response) => {
              await completeCheckoutProcess({
                gateway_order_id: response.razorpay_order_id || orderData.order_id,
                gateway_payment_id: response.razorpay_payment_id || `pay_${Date.now()}`,
                signature: response.razorpay_signature || "mock_sig",
                payment_method: "razorpay",
              });
            },
            modal: {
              ondismiss: () => {
                setIsProcessing(false);
              },
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        } else {
          // Simulation fallback for local dev
          setTimeout(async () => {
            await completeCheckoutProcess({
              gateway_order_id: orderData.order_id,
              gateway_payment_id: `pay_sim_${Date.now()}`,
              payment_method: "razorpay",
            });
          }, 1200);
        }
      } else {
        // Stripe Checkout Simulation
        const stripeRes = await authFetch(`${API_BASE_URL}/payment/create-stripe-session`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            plan_type: planName.toLowerCase(),
            billing_cycle: billingCycle,
            amount: displayAmount,
            currency: "USD",
          }),
        });

        await stripeRes.json();

        setTimeout(async () => {
          await completeCheckoutProcess({
            gateway_order_id: `cs_stripe_${Date.now()}`,
            gateway_payment_id: `pi_stripe_${Date.now()}`,
            payment_method: "stripe",
          });
        }, 1200);
      }
    } catch (err) {
      setErrorMessage(err.message || "Payment checkout failed. Please try again.");
      setIsProcessing(false);
    }
  };

  const completeCheckoutProcess = async (gatewayData) => {
    try {
      const response = await authFetch(`${API_BASE_URL}/payment/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: displayAmount,
          payment_method: gatewayData.payment_method,
          plan_type: planName.toLowerCase(),
          billing_cycle: billingCycle,
          currency: currency,
          gateway_order_id: gatewayData.gateway_order_id,
          gateway_payment_id: gatewayData.gateway_payment_id,
          signature: gatewayData.signature,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Payment processing failed.");
      }

      setPaymentSuccess(true);
      if (user?.access_token || localStorage.getItem("access_token")) {
        await fetchCurrentUser(localStorage.getItem("access_token"));
      }

      setTimeout(() => {
        setIsProcessing(false);
        setPaymentSuccess(false);
        onClose();
        if (onPaymentSuccess) onPaymentSuccess(data);
      }, 1800);
    } catch (err) {
      setErrorMessage(err.message || "Finalizing payment failed.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="checkout-modal-overlay">
      <div className="checkout-modal-card">
        <button className="checkout-close-btn" onClick={onClose}>
          ✕
        </button>

        {paymentSuccess ? (
          <div className="checkout-success-state">
            <div className="success-icon-circle">✓</div>
            <h2>Payment Successful! 🎉</h2>
            <p>
              Your account has been upgraded to <strong>{planName} ({billingCycle})</strong>. Access your new AI tools now!
            </p>
          </div>
        ) : (
          <>
            <div className="checkout-header">
              <h2>Upgrade to <span>{planName}</span></h2>
              <p>Complete your payment securely with Razorpay or Stripe</p>
            </div>

            {errorMessage && <div className="checkout-alert-error">{errorMessage}</div>}

            {/* Plan Summary Box */}
            <div className="checkout-summary-box">
              <div className="summary-row">
                <span className="summary-label">Selected Plan</span>
                <span className="summary-val">{planName} Plan ({billingCycle.toUpperCase()})</span>
              </div>

              <div className="summary-row">
                <span className="summary-label">Base Rate</span>
                <span className="summary-val">{symbol}{monthlyPrice} / month</span>
              </div>

              {isYearly && (
                <div className="summary-row">
                  <span className="summary-label">Yearly Savings</span>
                  <span className="summary-val highlight">Save 20%</span>
                </div>
              )}

              <div className="summary-divider" />

              <div className="summary-row total-row">
                <span className="total-label">Total Payable</span>
                <span className="total-price">{symbol}{displayAmount}</span>
              </div>
            </div>

            {/* Payment Gateway Chooser */}
            <div className="payment-gateway-chooser">
              <label className="gateway-label">Choose Payment Gateway</label>
              <div className="gateway-options">
                <div
                  className={`gateway-card ${paymentMethod === "razorpay" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("razorpay")}
                >
                  <span className="gateway-icon">🇮🇳</span>
                  <div>
                    <span className="gateway-title">Razorpay</span>
                    <span className="gateway-desc">UPI, NetBanking, Cards (INR)</span>
                  </div>
                </div>

                <div
                  className={`gateway-card ${paymentMethod === "stripe" ? "active" : ""}`}
                  onClick={() => setPaymentMethod("stripe")}
                >
                  <span className="gateway-icon">💳</span>
                  <div>
                    <span className="gateway-title">Stripe</span>
                    <span className="gateway-desc">Credit / Debit Cards (USD)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Action Button */}
            <form onSubmit={handlePaySubmit}>
              <button
                type="submit"
                className="btn-complete-payment"
                disabled={isProcessing}
              >
                {isProcessing
                  ? "Processing Secure Checkout..."
                  : `Pay ${symbol}${displayAmount} via ${paymentMethod === "razorpay" ? "Razorpay" : "Stripe"}`}
              </button>
            </form>

            <div className="checkout-footer-note">
              🔒 256-Bit SSL Encrypted & Secure Payment Gateway
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutModal;
