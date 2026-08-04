import React, { useState, useEffect } from "react";
import "./InvoiceModal.css";
import { useAuth } from "../../context/AuthContext";

const API_BASE_URL = "http://localhost:8000/api";

const InvoiceModal = ({ isOpen, onClose, transactionId }) => {
  const { authFetch } = useAuth();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen && transactionId) {
      fetchInvoice();
    }
  }, [isOpen, transactionId]);

  const fetchInvoice = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`${API_BASE_URL}/payment/invoice/${transactionId}`);
      if (!res.ok) throw new Error("Failed to load invoice details.");
      const data = await res.json();
      setInvoice(data);
    } catch (err) {
      setError(err.message || "Failed to load invoice.");
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="invoice-modal-overlay">
      <div className="invoice-modal-card">
        <div className="invoice-modal-actions no-print">
          <button className="btn-invoice-print" onClick={handlePrint}>
            🖨️ Print / Save PDF
          </button>
          <button className="btn-invoice-close" onClick={onClose}>
            ✕ Close
          </button>
        </div>

        {loading ? (
          <div className="invoice-loading">
            <div className="spinner"></div>
            <p>Generating Official Invoice...</p>
          </div>
        ) : error ? (
          <div className="invoice-error-box">{error}</div>
        ) : invoice ? (
          <div className="invoice-paper" id="printable-invoice">
            {/* Header */}
            <div className="invoice-paper-header">
              <div>
                <h1 className="company-logo">PrepNova <span>AI</span></h1>
                <p className="company-tagline">AI Interview Preparation Platform</p>
              </div>
              <div className="invoice-badge-right">
                <span className="invoice-title">TAX INVOICE</span>
                <span className="invoice-number">{invoice.invoice_number}</span>
              </div>
            </div>

            <div className="invoice-divider" />

            {/* Bill To & Date Details */}
            <div className="invoice-meta-grid">
              <div>
                <span className="meta-heading">Billed To:</span>
                <p className="meta-val highlight">{invoice.customer_name}</p>
                <p className="meta-sub">{invoice.customer_email}</p>
              </div>
              <div className="text-right">
                <span className="meta-heading">Transaction Date:</span>
                <p className="meta-val">
                  {invoice.date
                    ? new Date(invoice.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Today"}
                </p>
                <p className="meta-sub">Payment ID: {invoice.transaction_id}</p>
              </div>
            </div>

            {/* Invoice Line Items Table */}
            <table className="invoice-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Billing Cycle</th>
                  <th>Payment Method</th>
                  <th className="text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    <strong>PrepNova AI {invoice.plan_name} Subscription</strong>
                    <br />
                    <span className="item-sub">Access to AI Interview Prep & ATS Tools</span>
                  </td>
                  <td>{(invoice.billing_cycle || "monthly").toUpperCase()}</td>
                  <td>{(invoice.payment_method || "razorpay").toUpperCase()}</td>
                  <td className="text-right">
                    {invoice.currency === "INR" ? "₹" : "$"}{invoice.subtotal}
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Calculation Totals */}
            <div className="invoice-totals-wrapper">
              <div className="totals-box">
                <div className="totals-row">
                  <span>Subtotal</span>
                  <span>{invoice.currency === "INR" ? "₹" : "$"}{invoice.subtotal}</span>
                </div>
                <div className="totals-row">
                  <span>GST / Tax ({invoice.currency === "INR" ? "18%" : "10%"})</span>
                  <span>{invoice.currency === "INR" ? "₹" : "$"}{invoice.tax}</span>
                </div>
                <div className="totals-divider" />
                <div className="totals-row grand-total">
                  <span>Total Amount Paid</span>
                  <span>{invoice.currency === "INR" ? "₹" : "$"}{invoice.total_amount}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="invoice-footer">
              <p>Thank you for subscribing to PrepNova AI! For support, email support@prepnova.ai</p>
              <span className="status-verified-pill">✓ PAYMENT STATUS: {invoice.status.toUpperCase()}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default InvoiceModal;
