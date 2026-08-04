import React from "react";
import "./Pricing.css";

import Navbar from "../components/Navbar";
import PricingPlans from "../components/Pricing/PricingPlans";
import Footer from "../components/Footer";

const Pricing = () => {
  return (
    <div className="pricing-page">
      <Navbar />

      <main className="pricing-container-wrapper">
        <PricingPlans />
      </main>

      <Footer />
    </div>
  );
};

export default Pricing;