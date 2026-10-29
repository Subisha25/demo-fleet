import React, { useState, useEffect } from "react";
import PageLayout from "../../../components/PageLayout";
import axiosInstance from "../../../utils/axiosInstance";
import { showToast, AlertContainer } from "../../../components/AlertBox";
import { useTenant } from "../../../context/TenantContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCrown,
  faCheckCircle,
  faExclamationTriangle,
  faReceipt,
  faCreditCard,
  faFileInvoiceDollar,
  faShieldAlt,
  faArrowRight,
  faHistory,
  faDownload,
  faClock,
  faSync,
} from "@fortawesome/free-solid-svg-icons";

interface PlanTier {
  id: string;
  name: string;
  monthlyPrice: number;
  vehicleQuota: number;
  driverQuota: number;
  corporateQuota: number;
}

interface SubscriptionInvoice {
  id?: number | string;
  subscriptionInvoiceId?: string;
  invoiceNumber: string;
  planTier: string;
  billingCycle: string;
  baseAmount: number | string;
  discountAmount?: number | string;
  taxAmount: number | string;
  totalAmount: number | string;
  currency: string;
  status?: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  paymentStatus?: "PENDING" | "PAID" | "FAILED" | "CANCELLED";
  paymentGateway?: string;
  gatewayTransactionId?: string;
  transactionReference?: string;
  paidAt?: string;
  periodStart?: string;
  periodEnd?: string;
  billingPeriodStart?: string;
  billingPeriodEnd?: string;
  createdAt: string;
}

const CANONICAL_PLANS: PlanTier[] = [
  {
    id: "basic",
    name: "Starter Mobility",
    monthlyPrice: 299,
    vehicleQuota: 15,
    driverQuota: 15,
    corporateQuota: 3,
  },
  {
    id: "pro",
    name: "Growth Fleet Pro",
    monthlyPrice: 349,
    vehicleQuota: 75,
    driverQuota: 75,
    corporateQuota: 20,
  },
  {
    id: "enterprise",
    name: "Enterprise Mobility Suite",
    monthlyPrice: 549,
    vehicleQuota: 250,
    driverQuota: 250,
    corporateQuota: 100,
  },
];

const SubscriptionCheckout: React.FC = () => {
  const { currentTenant, refreshTenant } = useTenant();

  const [selectedPlanId, setSelectedPlanId] = useState<string>("pro");
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("annual");
  const [invoices, setInvoices] = useState<SubscriptionInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [processingCheckout, setProcessingCheckout] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<SubscriptionInvoice | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<SubscriptionInvoice | null>(null);

  const fetchInvoices = async () => {
    setLoadingInvoices(true);
    try {
      const res = await axiosInstance.get("/admin/billing/invoices");
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setInvoices(res.data.data);
      }
    } catch (err: any) {
      console.error("Failed to load subscription invoices:", err);
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [currentTenant]);

  const selectedPlan =
    CANONICAL_PLANS.find((p) => p.id === selectedPlanId) || CANONICAL_PLANS[1];

  // Price calculations matching backend canonical formula
  const rawMonths = billingCycle === "annual" ? 12 : 1;
  const rawBase = selectedPlan.monthlyPrice * rawMonths;
  const discount = billingCycle === "annual" ? Math.round(rawBase * 0.15) : 0;
  const taxableSubtotal = rawBase - discount;
  const cgst = Math.round(taxableSubtotal * 0.09 * 100) / 100;
  const sgst = Math.round(taxableSubtotal * 0.09 * 100) / 100;
  const totalTax = cgst + sgst;
  const grandTotal = taxableSubtotal + totalTax;

  const formatINR = (amt: number | string) => {
    const num = typeof amt === "string" ? parseFloat(amt) : amt;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(num || 0);
  };

  const handleInitiateCheckout = async () => {
    setProcessingCheckout(true);
    try {
      const res = await axiosInstance.post("/admin/billing/checkout", {
        planTier: selectedPlan.id,
        billingCycle,
      });

      if (res.data.success && res.data.data?.invoice) {
        setActiveInvoice(res.data.data.invoice);
        showToast(`Subscription invoice ${res.data.data.invoice.invoiceNumber} generated!`, "success");
        fetchInvoices();
      } else {
        showToast(res.data.message || "Failed to generate subscription invoice", "error");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Checkout error", "error");
    } finally {
      setProcessingCheckout(false);
    }
  };

  const handleSimulatePayment = async (invoiceId: any) => {
    try {
      const simulatedPaymentId = `PAY_SIM_${Date.now()}`;
      const res = await axiosInstance.post("/admin/billing/verify-payment", {
        subscriptionInvoiceId: invoiceId,
        invoiceId,
        gatewayTransactionId: simulatedPaymentId,
        transactionReference: simulatedPaymentId,
        paymentGateway: "SMARTGATEWAY",
      });

      if (res.data.success) {
        showToast("Payment verified! Subscription renewed and access restored.", "success");
        setActiveInvoice(null);
        fetchInvoices();
        refreshTenant();
      } else {
        showToast(res.data.message || "Payment verification failed", "error");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Payment verification error", "error");
    }
  };

  const handleTriggerLifecycleCheck = async () => {
    try {
      const res = await axiosInstance.post("/admin/billing/run-lifecycle-check");
      if (res.data.success) {
        showToast(
          `Lifecycle scan complete: ${res.data.summary.remindersSent} reminders, ${res.data.summary.gracePeriodNotices} grace notices, ${res.data.summary.suspendedTenants} suspended.`,
          "success"
        );
        refreshTenant();
      }
    } catch (err: any) {
      showToast("Failed to run lifecycle scan", "error");
    }
  };

  const subscriptionStatus = currentTenant?.subscription?.status || "ACTIVE";
  const planTier = currentTenant?.planTier || "PRO";
  const vehicleQuota = currentTenant?.subscription?.vehicleQuota || 75;
  const driverQuota = currentTenant?.subscription?.driverQuota || 75;

  return (
    <PageLayout
      breadcrumbName="Subscription & Billing"
      title="SaaS Subscription & Billing Desk"
      subtitle="Manage your fleet tier quotas, review GST tax invoices, and complete secure subscription renewals."
      actions={
        <div className="flex gap-2">
          <button
            onClick={handleTriggerLifecycleCheck}
            className="px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
            title="Scan for renewal reminders and grace period enforcement"
          >
            <FontAwesomeIcon icon={faClock} />
            Scan Lifecycle
          </button>
          <button
            onClick={fetchInvoices}
            className="px-3 py-2 bg-[#C04E24] hover:bg-[#A43D1A] text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
          >
            <FontAwesomeIcon icon={faSync} className={loadingInvoices ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      }
    >
      <AlertContainer />

      {/* Active Subscription Status Banner */}
      <div className="bg-[#0B0B0F] border-b-4 border-purple-600 rounded-2xl p-6 text-white mb-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-md">
              Current Plan: {planTier}
            </span>
            <span
              className={`px-3 py-1 rounded-md text-xs font-bold uppercase ${
                subscriptionStatus === "ACTIVE"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
                  : subscriptionStatus === "GRACE_PERIOD"
                  ? "bg-amber-500/30 text-amber-300 border border-amber-400/50"
                  : "bg-rose-500/30 text-rose-300 border border-rose-400/50"
              }`}
            >
              Status: {subscriptionStatus}
            </span>
          </div>

          <h2 className="text-xl font-black tracking-tight mt-3 text-white">
            Workspace: {currentTenant?.name || "FleetFlow Fleet Operations"}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            Authoritative multi-tenant context. Enforced backend quotas protect database integrity.
          </p>
        </div>

        <div className="flex gap-4 shrink-0 bg-white/10 p-4 rounded-xl border border-white/15 text-center">
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-300">Vehicle Quota</div>
            <div className="text-xl font-black text-purple-400">{vehicleQuota}</div>
          </div>
          <div className="w-px bg-white/20"></div>
          <div>
            <div className="text-[10px] uppercase font-bold text-slate-300">Driver Quota</div>
            <div className="text-xl font-black text-purple-400">{driverQuota}</div>
          </div>
        </div>
      </div>

      {/* Pricing / Plan Switcher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Left 2 Cols: Plan Selection */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">Select Fleet Subscription Tier</h3>
                <p className="text-xs text-slate-500">Pick the capacity tier needed for your fleet operations.</p>
              </div>

              {/* Monthly vs Annual Toggle */}
              <div className="inline-flex items-center bg-slate-50 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setBillingCycle("monthly")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    billingCycle === "monthly" ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-600"
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle("annual")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    billingCycle === "annual" ? "bg-gradient-to-r from-indigo-600 to-purple-700 text-white shadow-sm" : "text-slate-600"
                  }`}
                >
                  <span>Annual</span>
                  <span className="bg-emerald-600 text-white text-[10px] px-1.5 py-0.2 rounded font-black">
                    15% OFF
                  </span>
                </button>
              </div>
            </div>

            {/* Plan Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {CANONICAL_PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                const price =
                  billingCycle === "annual"
                    ? Math.round(plan.monthlyPrice * 12 * 0.85)
                    : plan.monthlyPrice;

                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlanId(plan.id)}
                    className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                      isSelected
                        ? "border-purple-600 bg-purple-50/60 ring-2 ring-purple-200 shadow-md"
                        : "border-slate-200 hover:border-purple-400 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-black text-sm text-slate-900">{plan.name}</span>
                      {isSelected && (
                        <FontAwesomeIcon icon={faCheckCircle} className="text-purple-600 text-sm" />
                      )}
                    </div>

                    <div className="mt-3">
                      <span className="text-xl font-black text-purple-700">{formatINR(price)}</span>
                      <span className="text-[10px] text-slate-500 font-medium ml-1">
                        /{billingCycle === "annual" ? "yr" : "mo"}
                      </span>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] text-slate-600 space-y-1">
                      <div>🚗 Up to {plan.vehicleQuota} Vehicles</div>
                      <div>👤 Up to {plan.driverQuota} Drivers</div>
                      <div>🏢 Up to {plan.corporateQuota} Corporate Clients</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Invoice Checkout Banner (If Generated) */}
          {activeInvoice && (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-md animate-fade-in">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 rounded font-bold text-[10px] uppercase">
                    Invoice #{activeInvoice.invoiceNumber}
                  </span>
                  <h4 className="text-base font-bold text-slate-900 mt-2">
                    Payment Required for {activeInvoice.planTier} Plan
                  </h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Amount Due: <strong className="text-slate-900 text-sm">{formatINR(activeInvoice.totalAmount)}</strong> (including 18% GST).
                  </p>
                </div>
                <button
                  onClick={() => handleSimulatePayment(activeInvoice.subscriptionInvoiceId || activeInvoice.id)}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-md shrink-0"
                >
                  <FontAwesomeIcon icon={faCreditCard} />
                  Simulate SmartGateway Payment
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Live Order Summary & Tax Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Order Summary</h3>
            <p className="text-xs text-slate-500 mb-6">Authoritative GST tax calculation.</p>

            <div className="space-y-3 text-xs border-b border-slate-100 pb-4">
              <div className="flex justify-between text-slate-600">
                <span>Selected Plan</span>
                <span className="font-bold text-slate-800">{selectedPlan.name}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Billing Period</span>
                <span className="font-semibold text-slate-800 capitalize">
                  {billingCycle} ({rawMonths} Month{rawMonths > 1 ? "s" : ""})
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Base Plan Price</span>
                <span className="font-semibold text-slate-800">{formatINR(rawBase)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>15% Annual Prepayment Discount</span>
                  <span>- {formatINR(discount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-800 font-bold pt-2 border-t border-slate-100">
                <span>Taxable Subtotal</span>
                <span>{formatINR(taxableSubtotal)}</span>
              </div>
            </div>

            {/* GST Breakdown */}
            <div className="space-y-2 text-xs py-3 border-b border-slate-100 text-slate-600">
              <div className="flex justify-between">
                <span>CGST (9%)</span>
                <span>{formatINR(cgst)}</span>
              </div>
              <div className="flex justify-between">
                <span>SGST (9%)</span>
                <span>{formatINR(sgst)}</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-800">
                <span>Total Tax (18% GST)</span>
                <span>{formatINR(totalTax)}</span>
              </div>
            </div>

            <div className="pt-4 flex justify-between items-baseline">
              <span className="text-sm font-bold text-slate-900">Total Payable</span>
              <span className="text-2xl font-black text-purple-700">{formatINR(grandTotal)}</span>
            </div>
          </div>

          <div className="pt-6">
            <button
              onClick={handleInitiateCheckout}
              disabled={processingCheckout}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {processingCheckout ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Generating Invoice...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faShieldAlt} />
                  Generate Invoice & Checkout
                </>
              )}
            </button>
            <p className="text-[10px] text-slate-400 text-center mt-2">
              GST invoices are archived for compliant corporate accounting.
            </p>
          </div>
        </div>
      </div>

      {/* Subscription Invoices History Table */}
      <div className="bg-white rounded-2xl border border-[#E0DAD1] shadow-sm overflow-hidden mb-12">
        <div className="p-5 border-b border-[#FAF8F5] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <FontAwesomeIcon icon={faFileInvoiceDollar} className="text-[#C04E24] text-sm" />
            <h3 className="text-sm font-bold text-[#1C1A18]">Subscription Invoices & Receipts</h3>
          </div>
          <span className="text-xs text-[#7A7570]">{invoices.length} records</span>
        </div>

        {loadingInvoices ? (
          <div className="py-12 text-center text-xs text-[#7A7570]">Loading invoice records...</div>
        ) : invoices.length === 0 ? (
          <div className="py-12 text-center text-xs text-[#7A7570]">
            No subscription invoices recorded yet. Generate an invoice above to begin.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E0DAD1] text-[10px] font-bold text-[#7A7570] uppercase tracking-wider">
                  <th className="py-3 px-4">Invoice #</th>
                  <th className="py-3 px-4">Plan & Cycle</th>
                  <th className="py-3 px-4">Taxable</th>
                  <th className="py-3 px-4">18% GST</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Payment Ref</th>
                  <th className="py-3 px-4 text-right">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF8F5]">
                {invoices.map((inv) => {
                  const isPaid = (inv.paymentStatus || inv.status) === "PAID";
                  const statusLabel = inv.paymentStatus || inv.status || "PENDING";
                  const txnRef = inv.transactionReference || inv.gatewayTransactionId || "—";
                  return (
                    <tr key={inv.subscriptionInvoiceId || inv.id || inv.invoiceNumber} className="hover:bg-[#FAF8F5]/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#C04E24]">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-bold text-[#1C1A18] uppercase">{inv.planTier}</span>
                        <span className="text-[10px] text-[#7A7570] block capitalize">
                          {inv.billingCycle}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#5C5752]">
                        {formatINR(Number(inv.baseAmount) - Number(inv.discountAmount || 0))}
                      </td>
                      <td className="py-3 px-4 text-[#5C5752]">{formatINR(inv.taxAmount)}</td>
                      <td className="py-3 px-4 font-bold text-[#1C1A18]">{formatINR(inv.totalAmount)}</td>
                      <td className="py-3 px-4">
                        {isPaid ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            PAID
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF8E1] text-[#B76E00]">
                            {statusLabel}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-[#7A7570]">
                        {txnRef}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedReceipt(inv)}
                          className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#EDE9E3] text-[#1C1A18] border border-[#E0DAD1] rounded text-[11px] font-semibold transition"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Tax Receipt Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#E0DAD1]">
            <div className="flex items-center justify-between pb-4 border-b border-[#FAF8F5]">
              <div className="flex items-center gap-2">
                <FontAwesomeIcon icon={faReceipt} className="text-[#C04E24]" />
                <h3 className="text-base font-bold text-[#1C1A18]">Tax Invoice Receipt</h3>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-[#7A7570] hover:text-[#1C1A18] text-lg leading-none"
              >
                &times;
              </button>
            </div>

            <div className="py-4 space-y-4 text-xs">
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E0DAD1] grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[#7A7570]">Invoice Number</span>
                  <div className="font-mono font-bold text-[#C04E24] text-sm">
                    {selectedReceipt.invoiceNumber}
                  </div>
                </div>
                <div>
                  <span className="text-[#7A7570]">Payment Status</span>
                  <div>
                    <span
                      className={`font-bold uppercase ${
                        (selectedReceipt.paymentStatus || selectedReceipt.status) === "PAID" ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      {selectedReceipt.paymentStatus || selectedReceipt.status}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-[#7A7570]">Plan & Billing</span>
                  <div className="font-bold text-[#1C1A18] uppercase">
                    {selectedReceipt.planTier} ({selectedReceipt.billingCycle})
                  </div>
                </div>
                <div>
                  <span className="text-[#7A7570]">Date Issued</span>
                  <div className="font-semibold text-[#1C1A18]">
                    {new Date(selectedReceipt.createdAt).toLocaleDateString("en-IN")}
                  </div>
                </div>
              </div>

              <div className="border border-[#E0DAD1] rounded-xl p-4 space-y-2">
                <div className="flex justify-between text-[#5C5752]">
                  <span>Base Plan Fee</span>
                  <span>{formatINR(selectedReceipt.baseAmount)}</span>
                </div>
                {Number(selectedReceipt.discountAmount) > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>15% Prepayment Discount</span>
                    <span>- {formatINR(selectedReceipt.discountAmount || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#5C5752]">
                  <span>CGST (9%)</span>
                  <span>{formatINR(Number(selectedReceipt.taxAmount) / 2)}</span>
                </div>
                <div className="flex justify-between text-[#5C5752]">
                  <span>SGST (9%)</span>
                  <span>{formatINR(Number(selectedReceipt.taxAmount) / 2)}</span>
                </div>
                <div className="flex justify-between font-bold text-[#1C1A18] pt-2 border-t border-[#FAF8F5] text-sm">
                  <span>Total Amount Paid</span>
                  <span className="text-[#C04E24]">{formatINR(selectedReceipt.totalAmount)}</span>
                </div>
              </div>

              {(selectedReceipt.transactionReference || selectedReceipt.gatewayTransactionId) && (
                <div className="text-[11px] text-[#5C5752] bg-[#FAF8F5] p-3 rounded-lg border border-[#E0DAD1]">
                  <strong>Gateway Reference:</strong> {selectedReceipt.transactionReference || selectedReceipt.gatewayTransactionId}
                  {selectedReceipt.paidAt && (
                    <span className="block mt-0.5">
                      <strong>Paid At:</strong> {new Date(selectedReceipt.paidAt).toLocaleString("en-IN")}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#FAF8F5] flex justify-between items-center">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#FAF8F5] hover:bg-[#EDE9E3] text-[#1C1A18] border border-[#E0DAD1] rounded-lg text-xs font-semibold flex items-center gap-1.5"
              >
                <FontAwesomeIcon icon={faDownload} />
                Print / Save PDF
              </button>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-2 bg-[#C04E24] text-white rounded-lg text-xs font-semibold hover:bg-[#A43D1A]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default SubscriptionCheckout;
