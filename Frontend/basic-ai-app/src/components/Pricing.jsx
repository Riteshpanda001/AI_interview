import React, { useState } from "react";
import "./Pricing.css";
import CheckoutModal from "./Pricing/CheckoutModal";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Pricing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);

  const plans = [
    {
      name: "Free",
      price: "₹0",
      period: "/month",
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
      price: "₹499",
      period: "/month",
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
      price: "₹999",
      period: "/month",
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

  const handleChoosePlan = (plan) => {
    if (plan.name === "Free") {
      if (!user) {
        navigate("/register");
      } else {
        navigate("/dashboard");
      }
      return;
    }

    if (!user) {
      navigate("/login?redirect=/");
      return;
    }

    setSelectedPlanForCheckout(plan);
    setShowCheckoutModal(true);
  };

  return (
    <section className="pricing-section">

      <div className="pricing-header">

        <span className="pricing-tag">
          💰 Pricing Plans
        </span>

        <h2>
          Choose the Perfect
          <span> Plan for You</span>
        </h2>

        <p>
          Flexible plans designed for students, job seekers,
          and professionals preparing for interviews.
        </p>

      </div>

      <div className="pricing-grid">

        {plans.map((plan, index) => (
          <div
            className={`pricing-card ${
              plan.popular ? "popular" : ""
            }`}
            key={index}
          >

            {plan.popular && (
              <div className="popular-badge">
                Most Popular
              </div>
            )}

            <h3>{plan.name}</h3>

            <div className="price">
              {plan.price}
              <span>{plan.period}</span>
            </div>

            <ul>
              {plan.features.map((feature, i) => (
                <li key={i}>
                  ✓ {feature}
                </li>
              ))}
            </ul>

            <button onClick={() => handleChoosePlan(plan)}>
              {plan.button}
            </button>

          </div>
        ))}

      </div>

      <CheckoutModal
        isOpen={showCheckoutModal}
        onClose={() => setShowCheckoutModal(false)}
        selectedPlan={selectedPlanForCheckout}
        billingCycle="monthly"
        onPaymentSuccess={() => {
          window.location.reload();
        }}
      />

    </section>
  );
};

export default Pricing;