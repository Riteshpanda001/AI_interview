import React, { useState, useEffect } from "react";
import "./SubscriptionManager.css";
import { useAuth } from "../../context/AuthContext";
import InvoiceModal from "./InvoiceModal";

const API_BASE_URL = "http://localhost:8000/api";

const SubscriptionManager = ({ onUpgradeClick }) => {
  const { authFetch, user, fetchCurrentUser } = useAuth();

  const [subscription, setSubscription] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState({ type: "", text: "" });

  // Invoice Modal State
  const [selectedTxId, setSelectedTxId] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);

  useEffect(() => {
    fetchSubscriptionData();
    fetchPaymentHistory();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      const res = await authFetch(`${API_BASE_URL}/payment/subscription`);
      if (res.ok) {
        const data = await res.json();
        setSubscription(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const res = await authFetch(`${API_BASE_URL}/payment/history`);
      if (res.ok) {
        const data = await res.json();
        setHistory(data || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCancelSubscription = async () => {
    if (!window.confirm("Are you sure you want to cancel your subscription? Your plan will revert to Free.")) {
      return;
    }

    try {
      const res = await authFetch(`${API_BASE_URL}/payment/cancel-subscription`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        setActionMsg({ type: "success", text: "Subscription cancelled successfully." });
        fetchSubscriptionData();
        if (localStorage.getItem("access_token")) {
          await fetchCurrentUser(localStorage.getItem("access_token"));
        }
      } else {
        setActionMsg({ type: "error", text: data.detail || "Failed to cancel." });
      }
    } catch (err) {
      setActionMsg({ type: "error", text: "Error cancelling subscription." });
    }
  };

  const openInvoice = (txId) => {
    setSelectedTxId(txId);
    setShowInvoiceModal(true);
  };

  if (loading) {
    return (
      <div className="sub-manager-loading">
        <div className="spinner"></div>
        <p>Loading subscription details...</p>
      </div>
    );
  }

  const currentPlan = subscription?.plan_type || user?.plan_type || "free";

  return (
    <div className="subscription-manager-container">
      {actionMsg.text && (
        <div className={`sub-alert ${actionMsg.type}`}>{actionMsg.text}</div>
      )}

      {/* Active Subscription Banner */}
      <div className="active-sub-card">
        <div className="sub-card-left">
          <span className="sub-tier-badge">{currentPlan.toUpperCase()} PLAN</span>
          <h2>Current Subscription: <span>{currentPlan.toUpperCase()}</span></h2>
          <p className="sub-meta">
            Status: <strong className="status-active">Active</strong> • Billing Cycle:{" "}
            <strong>{subscription?.billing_cycle || "Monthly"}</strong>
          </p>

          {subscription?.expires_at && (
            <p className="sub-renewal-date">
              Next Renewal / Period Ends:{" "}
              {new Date(subscription.expires_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        <div className="sub-card-right">
          {currentPlan !== "free" ? (
            <div className="sub-action-buttons">
              <button
                className="btn-upgrade-plan"
                onClick={() => onUpgradeClick && onUpgradeClick()}
              >
                Change / Upgrade Plan
              </button>

              <button className="btn-cancel-sub" onClick={handleCancelSubscription}>
                Cancel Subscription
              </button>
            </div>
          ) : (
            <button
              className="btn-upgrade-plan"
              onClick={() => onUpgradeClick && onUpgradeClick()}
            >
              Upgrade to Pro 🚀
            </button>
          )}
        </div>
      </div>

      {/* Payment History & Invoice Download */}
      <div className="payment-history-section">
        <h3>Invoice & Payment History</h3>
        <p className="history-subheading">View transaction logs and download tax invoices for accounting.</p>

        <div className="history-table-wrapper">
          <table className="history-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Plan Name</th>
                <th>Cycle</th>
                <th>Amount</th>
                <th>Gateway</th>
                <th>Date</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {history.length > 0 ? (
                history.map((tx) => (
                  <tr key={tx.id}>
                    <td className="tx-id-cell">{tx.transaction_id}</td>
                    <td>
                      <span className="plan-pill">{tx.plan_type.toUpperCase()}</span>
                    </td>
                    <td>{(tx.billing_cycle || "monthly").toUpperCase()}</td>
                    <td className="amount-cell">
                      {tx.currency === "INR" ? "₹" : "$"}{tx.amount}
                    </td>
                    <td>{(tx.payment_method || "razorpay").toUpperCase()}</td>
                    <td>
                      {tx.created_at
                        ? new Date(tx.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "Recent"}
                    </td>
                    <td>
                      <button
                        className="btn-download-invoice"
                        onClick={() => openInvoice(tx.transaction_id || tx.id)}
                      >
                        📄 Download Invoice
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-history-cell">
                    No payment history recorded yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        transactionId={selectedTxId}
      />
    </div>
  );
};

export default SubscriptionManager;
