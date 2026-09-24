import React, { useState, useEffect } from "react";
import "./PricingPlans.css";
import CheckoutModal from "./CheckoutModal";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// Format a raw plan from the API into the shape this component needs
const normalizePlan = (plan) => ({
  id: plan.id || plan._id || plan.slug,
  name: plan.name,
  slug: plan.slug || plan.plan_type || plan.name?.toLowerCase(),
  plan_type: plan.plan_type || plan.slug || "free",
  priceMonthly: plan.display_price_monthly || `₹${plan.price_monthly ?? 0}`,
  priceYearly: plan.display_price_yearly || `₹${plan.price_yearly ?? 0}`,
  period: "/month",
  yearlyPeriod: "/month",
  note: plan.yearly_note || "",
  features: plan.features || [],
  button:
    plan.plan_type === "free" || plan.slug === "free"
      ? "Start Free Trial"
      : `Choose ${plan.name}`,
  popular: plan.popular || false,
  display_order: plan.display_order ?? 99,
});

const PricingPlans = ({ onPaymentCompleted }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [billingCycle, setBillingCycle] = useState("monthly");
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load pricing plans from backend
  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`${API_BASE_URL}/pricing/`);
        if (!res.ok) {
          throw new Error(`Pricing API returned ${res.status}`);
        }
        const data = await res.json();
        if (!Array.isArray(data) || data.length === 0) {
          throw new Error("No pricing plans returned from server");
        }
        const normalized = data.map(normalizePlan).sort(
          (a, b) => a.display_order - b.display_order
        );
        setPlans(normalized);
      } catch (err) {
        console.error("[PricingPlans] Failed to load plans:", err);
        setError(err.message || "Could not load pricing plans. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchPlans();
  }, []);

  const handleChoosePlan = (plan) => {
    const isFree =
      plan.plan_type === "free" || plan.slug === "free" || plan.name === "Free Trial";
    if (isFree) {
      if (!user) navigate("/register");
      return;
    }

    if (!user) {
      navigate("/login?redirect=/pricing");
      return;
    }

    setSelectedPlanForCheckout(plan);
    setShowCheckoutModal(true);
  };

  const currentPlan = (user?.plan_type || "free").toLowerCase();

  if (loading) {
    return (
      <section className="pricing-plans-section">
        <div className="pricing-plans-header">
          <span className="pricing-plans-tag">💰 Pricing Plans</span>
          <h2>
            Choose the Perfect <span>Plan for You</span>
          </h2>
        </div>
        <div className="pricing-loading-state">
          <div className="pricing-spinner" />
          <p>Loading pricing plans…</p>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pricing-plans-section">
        <div className="pricing-plans-header">
          <span className="pricing-plans-tag">💰 Pricing Plans</span>
          <h2>
            Choose the Perfect <span>Plan for You</span>
          </h2>
        </div>
        <div className="pricing-error-state">
          <span className="pricing-error-icon">⚠️</span>
          <p className="pricing-error-message">{error}</p>
          <button
            className="plans-action-btn"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  if (plans.length === 0) {
    return (
      <section className="pricing-plans-section">
        <div className="pricing-plans-header">
          <span className="pricing-plans-tag">💰 Pricing Plans</span>
          <h2>
            Choose the Perfect <span>Plan for You</span>
          </h2>
        </div>
        <div className="pricing-empty-state">
          <p>No pricing plans available at this time. Please check back later.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="pricing-plans-section">
      <div className="pricing-plans-header">
        <span className="pricing-plans-tag">💰 Pricing Plans</span>
        <h2>
          Choose the Perfect <span>Plan for You</span>
        </h2>
        <p>
          Flexible plans designed for students, job seekers, and professionals
          preparing for interviews. Upgrade, downgrade, or cancel anytime.
        </p>

        {/* Billing Cycle Toggle */}
        <div className="billing-toggle-container">
          <button
            id="billing-toggle-monthly"
            className={`toggle-btn ${billingCycle === "monthly" ? "active" : ""}`}
            onClick={() => setBillingCycle("monthly")}
          >
            Monthly
          </button>
          <button
            id="billing-toggle-yearly"
            className={`toggle-btn ${billingCycle === "yearly" ? "active" : ""}`}
            onClick={() => setBillingCycle("yearly")}
          >
            Yearly
            <span className="save-badge">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="pricing-plans-grid">
        {plans.map((plan) => {
          const isYearly = billingCycle === "yearly";
          const currentPrice = isYearly ? plan.priceYearly : plan.priceMonthly;
          const currentPeriod = isYearly ? plan.yearlyPeriod : plan.period;
          const isFree =
            plan.plan_type === "free" || plan.slug === "free" || plan.name === "Free Trial";
          const isCurrentPlan =
            currentPlan === plan.plan_type ||
            currentPlan === plan.slug ||
            (isFree && currentPlan === "free");

          return (
            <div
              id={`pricing-card-${plan.slug || plan.id}`}
              className={`pricing-plans-card ${plan.popular ? "popular" : ""} ${isCurrentPlan ? "current-plan" : ""}`}
              key={plan.id}
            >
              {plan.popular && (
                <div className="plans-popular-badge">Most Popular</div>
              )}
              {isCurrentPlan && !plan.popular && (
                <div className="plans-current-badge">Your Plan</div>
              )}

              <h3>{plan.name}</h3>

              <div className="plans-price">
                {currentPrice}
                <span className="period">{currentPeriod}</span>
              </div>

              {isYearly && !isFree ? (
                <div className="billing-note">{plan.note}</div>
              ) : (
                <div className="billing-note-placeholder">&nbsp;</div>
              )}

              <ul className="plans-features-list">
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <span className="checkmark">✓</span> {feature}
                  </li>
                ))}
              </ul>

              <button
                id={`btn-choose-plan-${plan.slug || plan.id}`}
                className={`plans-action-btn ${plan.popular ? "popular-btn" : ""} ${
                  isCurrentPlan ? "current-plan-btn" : ""
                }`}
                onClick={() => handleChoosePlan(plan)}
                disabled={isFree && isCurrentPlan}
                aria-label={`Choose ${plan.name} plan`}
              >
                {isCurrentPlan
                  ? isFree
                    ? "Current Active Plan"
                    : "Pay to Activate / Renew"
                  : plan.button}
              </button>
            </div>
          );
        })}
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        selectedPlan={selectedPlanForCheckout}
        billingCycle={billingCycle}
        onPaymentSuccess={(data) => {
          if (onPaymentCompleted) onPaymentCompleted(data);
        }}
      />
    </section>
  );
};

export default PricingPlans;
