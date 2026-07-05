import React, { useState } from "react";
import "./PricingPlans.css";

const PricingPlans = () => {
  const [billingCycle, setBillingCycle] = useState("monthly"); // 'monthly' or 'yearly'

  const plans = [
    {
      name: "Free",
      priceMonthly: "₹0",
      priceYearly: "₹0",
      period: "/month",
      yearlyPeriod: "/month",
      note: "Free forever",
      features: [
        "5 AI Mock Interviews",
        "Basic ATS Resume Analysis",
        "Basic Performance Analytics",
        "Limited Company Questions",
      ],
      button: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      priceMonthly: "₹499",
      priceYearly: "₹399",
      period: "/month",
      yearlyPeriod: "/month",
      note: "Billed annually (₹4,788/yr)",
      features: [
        "Unlimited AI Interviews",
        "Advanced ATS Analysis",
        "Company-Specific Preparation",
        "Performance Dashboard",
        "Interview History",
      ],
      button: "Choose Pro",
      popular: true,
    },
    {
      name: "Premium",
      priceMonthly: "₹999",
      priceYearly: "₹799",
      period: "/month",
      yearlyPeriod: "/month",
      note: "Billed annually (₹9,588/yr)",
      features: [
        "Everything in Pro",
        "AI Career Roadmap",
        "Priority Support",
        "Resume Templates",
        "Exclusive Interview Sets",
      ],
      button: "Choose Premium",
      popular: false,
    },
  ];

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
            className={`toggle-btn ${billingCycle === "monthly" ? "active" : ""}`}
            onClick={() => setBillingCycle("monthly")}
          >
            Monthly
          </button>
          <button
            className={`toggle-btn ${billingCycle === "yearly" ? "active" : ""}`}
            onClick={() => setBillingCycle("yearly")}
          >
            Yearly
            <span className="save-badge">Save 20%</span>
          </button>
        </div>
      </div>

      <div className="pricing-plans-grid">
        {plans.map((plan, index) => {
          const isYearly = billingCycle === "yearly";
          const currentPrice = isYearly ? plan.priceYearly : plan.priceMonthly;
          const currentPeriod = isYearly ? plan.yearlyPeriod : plan.period;

          return (
            <div
              className={`pricing-plans-card ${plan.popular ? "popular" : ""}`}
              key={index}
            >
              {plan.popular && <div className="plans-popular-badge">Most Popular</div>}

              <h3>{plan.name}</h3>

              <div className="plans-price">
                {currentPrice}
                <span className="period">{currentPeriod}</span>
              </div>

              {isYearly && plan.name !== "Free" ? (
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

              <button className={`plans-action-btn ${plan.popular ? "popular-btn" : ""}`}>
                {plan.button}
              </button>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default PricingPlans;
