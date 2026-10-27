import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Editor } from "@tinymce/tinymce-react";
import PageLayout from "../../../components/PageLayout";
import axiosInstance from "../../../utils/axiosInstance";
import { showToast, AlertContainer } from "../../../components/AlertBox";
import {
  ArrowLeft,
  Eye,
  RotateCcw,
  Save,
  Check,
  Copy,
  Info,
  Shield,
  Mail,
  AlertTriangle,
  X,
} from "lucide-react";

interface PlaceholderGroup {
  category: string;
  items: { tag: string; label: string; sample: string }[];
}

const PLACEHOLDER_CATALOG: PlaceholderGroup[] = [
  {
    category: "Fleet & Platform Branding",
    items: [
      { tag: "###FleetName###", label: "Fleet Business Name", sample: "Apex Mobility" },
      { tag: "###CompanyName###", label: "Corporate Client Name", sample: "Infosys Ltd" },
      { tag: "###SupportPhone###", label: "Contact Phone", sample: "+91 9876543210" },
      { tag: "###SupportEmail###", label: "Support Email", sample: "support@apexmobility.com" },
      { tag: "###PortalTitle###", label: "Portal Display Title", sample: "Apex Fleet Portal" },
      { tag: "###Address###", label: "Fleet Registered Address", sample: "123 Tech Park, Bangalore" },
      { tag: "###GstNumber###", label: "GSTIN Number", sample: "29ABCDE1234F1Z5" },
    ],
  },
  {
    category: "Trips, Bookings & Vehicles",
    items: [
      { tag: "###BookingCode###", label: "Booking Reference ID", sample: "BK-2026-9041" },
      { tag: "###OrderNumber###", label: "Order Number", sample: "ORD-88219" },
      { tag: "###DriverName###", label: "Assigned Driver Name", sample: "Suresh Kumar" },
      { tag: "###VehicleNumber###", label: "Vehicle Reg Number", sample: "KA-01-EQ-9988" },
      { tag: "###UserName###", label: "Passenger / Staff Name", sample: "Rajesh Kumar" },
      { tag: "###UserEmail###", label: "Passenger Email", sample: "rajesh@techcorp.com" },
    ],
  },
  {
    category: "Billing, Invoicing & Receipts",
    items: [
      { tag: "###InvoiceNumber###", label: "Invoice Number", sample: "INV-2026-0042" },
      { tag: "###TotalAmount###", label: "Total Amount (₹)", sample: "3,540.00" },
      { tag: "###PlanTier###", label: "SaaS Plan Tier", sample: "PRO" },
      { tag: "###BillingCycle###", label: "Billing Cycle", sample: "MONTHLY" },
      { tag: "###ExpiryDate###", label: "Subscription Expiry Date", sample: "Nov 30, 2026" },
      { tag: "###RenewalUrl###", label: "Renewal Portal Link", sample: "https://fleetflow.com/billing/checkout" },
      { tag: "###TransactionReference###", label: "Payment Txn Ref", sample: "TXN_772188" },
    ],
  },
  {
    category: "Authentication & Accounts",
    items: [
      { tag: "###ActivationUrl###", label: "Expiring Activation URL", sample: "https://fleetflow.com/activate-account?token=act_..." },
      { tag: "###LoginUrl###", label: "Operator Login Portal", sample: "https://fleetflow.com/adminlogin" },
      { tag: "###RejectionReason###", label: "Application Rejection Reason", sample: "Incomplete documentation submitted." },
      { tag: "###Password###", label: "Masked Password", sample: "••••••••••••" },
    ],
  },
];

const EditEmail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Template Data
  const [config, setConfig] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [fromName, setFromName] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [emailBCC, setEmailBCC] = useState("");
  const [scope, setScope] = useState<"FLEET" | "PLATFORM">("FLEET");
  const [category, setCategory] = useState("OPERATIONAL");
  const [isTenantOverride, setIsTenantOverride] = useState(false);
  const [loading, setLoading] = useState(true);

  // Unsaved changes tracking
  const [initialData, setInitialData] = useState<any>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  // Live Preview Modal
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewSubject, setPreviewSubject] = useState("");
  const [previewHtml, setPreviewHtml] = useState("");
  const [previewLoading, setPreviewLoading] = useState(false);

  // Copy indicator
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmailConfig = async () => {
      try {
        const res = await axiosInstance.get(`/emailConfRoutes/getEmailConfById/${id}`);
        const data = res.data.emailConf;
        setConfig(data);
        setTitle(data.title || "");
        setEmailCode(data.emailCode || "");
        setSubject(data.subject || "");
        setMessage(data.message || "");
        setFromName(data.fromName || "");
        setFromAddress(data.fromAddress || "");
        setEmailBCC(data.emailBcc || "");
        setScope(data.scope || "FLEET");
        setCategory(data.category || "OPERATIONAL");

        const isOverride = Boolean(data.tenantId && data.tenantId !== "e7b8a1c0-0000-0000-0000-000000000001");
        setIsTenantOverride(isOverride);

        setInitialData({
          subject: data.subject || "",
          message: data.message || "",
          fromName: data.fromName || "",
          fromAddress: data.fromAddress || "",
          emailBCC: data.emailBcc || "",
        });
      } catch (err: any) {
        showToast(err?.response?.data?.message || "Failed to load email configuration", "error");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEmailConfig();
  }, [id]);

  const hasUnsavedChanges =
    initialData &&
    (subject !== initialData.subject ||
      message !== initialData.message ||
      fromName !== initialData.fromName ||
      fromAddress !== initialData.fromAddress ||
      emailBCC !== initialData.emailBCC);

  const handleCopyTag = (tag: string) => {
    navigator.clipboard.writeText(tag);
    setCopiedTag(tag);
    setTimeout(() => setCopiedTag(null), 2000);
  };

  const handleInsertTag = (tag: string) => {
    setSubject((prev) => `${prev} ${tag}`);
    showToast(`Added ${tag} to Subject`, "info");
  };

  const handleOpenPreview = async () => {
    try {
      setPreviewLoading(true);
      setPreviewOpen(true);
      const res = await axiosInstance.post("/emailConfRoutes/preview", {
        emailConfigId: id,
        emailCode,
        subject,
        message,
      });

      if (res.data && res.data.success) {
        setPreviewSubject(res.data.renderedSubject);
        setPreviewHtml(res.data.renderedBody);
      }
    } catch (err) {
      showToast("Failed to render preview", "error");
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleResetToDefault = async () => {
    if (!window.confirm("Reset this template back to platform default? Your fleet customizations will be removed.")) {
      return;
    }

    try {
      await axiosInstance.post(`/emailConfRoutes/reset/${id}`);
      showToast("Template reset to platform default successfully", "success");
      navigate("/email/configurations");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to reset template", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axiosInstance.put(`/emailConfRoutes/updateEmailConf/${id}`, {
        subject,
        message,
        fromName,
        fromAddress,
        emailBcc: emailBCC,
      });

      showToast("Email template updated successfully!", "success");
      setInitialData({ subject, message, fromName, fromAddress, emailBCC });
      navigate("/email/configurations");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to update email configuration", "error");
    }
  };

  const handleCancel = () => {
    if (hasUnsavedChanges) {
      setShowExitConfirm(true);
    } else {
      navigate("/email/configurations");
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="p-12 text-center text-slate-500 text-sm">Loading template editor...</div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <AlertContainer />
      <div className="max-w-7xl mx-auto py-6 space-y-6">
        {/* Header Bar */}
        <div className="bg-[#1C1A18] border-b-4 border-[#C04E24] rounded-xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                onClick={handleCancel}
                className="text-[#DE8A66] hover:text-white flex items-center gap-1 text-xs font-semibold mr-2 transition"
              >
                <ArrowLeft size={14} /> Back
              </button>
              <span
                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                  scope === "PLATFORM"
                    ? "bg-purple-900/80 text-purple-200 border border-purple-400/40"
                    : "bg-emerald-900/80 text-emerald-200 border border-emerald-400/40"
                }`}
              >
                {scope} SCOPE
              </span>
              <span className="text-slate-400 text-xs font-mono">{emailCode}</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
            <p className="text-xs text-[#EDE9E3] mt-1">
              Category: <span className="font-semibold text-white">{category}</span> &bull; Edit subject, HTML structure, and placeholders.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isTenantOverride && (
              <button
                type="button"
                onClick={handleResetToDefault}
                className="px-3 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 text-xs font-bold rounded-lg border border-rose-500/30 transition flex items-center gap-1.5"
                title="Reset to Platform Default Template"
              >
                <RotateCcw size={13} />
                <span>Reset to Default</span>
              </button>
            )}
            <button
              type="button"
              onClick={handleOpenPreview}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-[#FAF8F5] text-xs font-bold rounded-lg border border-white/10 transition flex items-center gap-1.5"
            >
              <Eye size={13} />
              <span>Live Preview</span>
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-5 py-2 bg-[#C04E24] hover:bg-[#A43D1A] text-white font-bold text-xs rounded-lg transition shadow-sm flex items-center gap-1.5"
            >
              <Save size={14} />
              <span>Save Template</span>
            </button>
          </div>
        </div>

        {/* Override / Inheritance Information Banner */}
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 text-xs ${
            isTenantOverride
              ? "bg-amber-50 border-amber-200 text-amber-900"
              : "bg-[#FAF8F5] border-[#E0DAD1] text-[#5C5752]"
          }`}
        >
          <Info size={18} className={isTenantOverride ? "text-amber-600 mt-0.5" : "text-[#C04E24] mt-0.5"} />
          <div>
            <p className="font-bold text-[#1C1A18]">
              {isTenantOverride ? "Fleet-Specific Override Active" : "Default Inherited Template"}
            </p>
            <p className="mt-0.5 leading-relaxed">
              {isTenantOverride
                ? "This template contains custom edits belonging specifically to your fleet. Other fleets continue using the platform default. You can reset to platform default at any time."
                : "This template is currently inherited from the platform default. When you save changes, a fleet-specific copy will be automatically created so other fleets are unaffected."}
            </p>
          </div>
        </div>

        {/* Main Editor + Placeholder Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Form & TinyMCE */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl border border-[#E0DAD1] p-6 shadow-sm space-y-5">
              {/* Subject */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider">
                    Email Subject Line <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-[11px] text-[#7A7570]">Supports dynamic placeholders</span>
                </div>
                <input
                  type="text"
                  className="w-full border border-[#D5CFC9] px-3.5 py-2.5 rounded-lg text-sm text-[#1C1A18] focus:ring-2 focus:ring-[#C04E24] focus:outline-none"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g. Booking Confirmation - ###BookingCode### (###FleetName###)"
                  required
                />
              </div>

              {/* Sender Name & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                    From Display Name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-[#D5CFC9] px-3.5 py-2 rounded-lg text-sm text-[#1C1A18] focus:ring-2 focus:ring-[#C04E24] focus:outline-none"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder="FleetFlow Platform"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                    From Address
                  </label>
                  <input
                    type="email"
                    className="w-full border border-[#D5CFC9] px-3.5 py-2 rounded-lg text-sm text-[#1C1A18] focus:ring-2 focus:ring-[#C04E24] focus:outline-none"
                    value={fromAddress}
                    onChange={(e) => setFromAddress(e.target.value)}
                    placeholder="notifications@fleetflow.com"
                  />
                </div>
              </div>

              {/* Message Body (TinyMCE) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider">
                    Template HTML Message Body <span className="text-rose-500">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleOpenPreview}
                    className="text-xs font-bold text-[#C04E24] hover:underline flex items-center gap-1"
                  >
                    <Eye size={12} /> Test Rendering
                  </button>
                </div>
                <div className="border border-[#D5CFC9] rounded-lg overflow-hidden">
                  <Editor
                    apiKey="5cxmnr0pn9j08n8sasynohd5mkr2td49kgwxi57qp7w30n63"
                    value={message}
                    onEditorChange={(content) => setMessage(content)}
                    init={{
                      height: 480,
                      menubar: true,
                      plugins: ["advlist", "autolink", "lists", "link", "image", "table", "code"],
                      toolbar:
                        "undo redo | bold italic underline | alignleft aligncenter alignright | bullist numlist | table link | code",
                      content_style:
                        "body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 14px; line-height: 1.6; color: #1C1A18; }",
                    }}
                  />
                </div>
              </div>

              {/* Optional BCC */}
              <div>
                <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                  Optional BCC Addresses (Comma separated)
                </label>
                <input
                  type="text"
                  className="w-full border border-[#D5CFC9] px-3.5 py-2 rounded-lg text-sm text-[#1C1A18] focus:ring-2 focus:ring-[#C04E24] focus:outline-none"
                  value={emailBCC}
                  onChange={(e) => setEmailBCC(e.target.value)}
                  placeholder="audit@fleetflow.com, records@fleetflow.com"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-[#FAF8F5] flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-4 py-2 border border-[#D5CFC9] rounded-lg text-xs font-bold text-[#5C5752] hover:bg-slate-50 transition"
                >
                  Cancel / Discard
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenPreview}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-[#1C1A18] text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                  >
                    <Eye size={13} />
                    <span>Preview</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-[#C04E24] hover:bg-[#A43D1A] text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
                  >
                    <Save size={13} />
                    <span>Save Changes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Supported Placeholders Palette */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl border border-[#E0DAD1] p-5 shadow-sm sticky top-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#FAF8F5]">
                <h3 className="text-xs font-bold text-[#1C1A18] uppercase tracking-wider flex items-center gap-1.5">
                  <span>Available Placeholders</span>
                </h3>
                <span className="text-[10px] text-[#7A7570]">Click tag to copy</span>
              </div>

              <div className="max-h-[600px] overflow-y-auto space-y-4 pr-1 mt-3">
                {PLACEHOLDER_CATALOG.map((grp) => (
                  <div key={grp.category} className="space-y-2">
                    <p className="text-[11px] font-bold text-[#C04E24] uppercase tracking-wider">
                      {grp.category}
                    </p>
                    <div className="space-y-1.5">
                      {grp.items.map((item) => (
                        <div
                          key={item.tag}
                          className="p-2 rounded-lg bg-[#FAF8F5] border border-[#E0DAD1] hover:border-[#C04E24] transition group flex items-center justify-between text-xs"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="font-mono font-bold text-[#843217] block truncate">
                              {item.tag}
                            </span>
                            <span className="text-[11px] text-[#7A7570] block truncate">
                              {item.label} (e.g. {item.sample})
                            </span>
                          </div>
                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                            <button
                              type="button"
                              onClick={() => handleInsertTag(item.tag)}
                              className="px-1.5 py-1 text-[10px] font-bold bg-[#FAF8F5] hover:bg-slate-200 text-slate-700 rounded transition"
                              title="Add to Subject"
                            >
                              + Subj
                            </button>
                            <button
                              type="button"
                              onClick={() => handleCopyTag(item.tag)}
                              className="p-1 text-slate-600 hover:text-[#C04E24] rounded transition"
                              title="Copy placeholder tag"
                            >
                              {copiedTag === item.tag ? (
                                <Check size={13} className="text-emerald-600" />
                              ) : (
                                <Copy size={13} />
                              )}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview Modal */}
        {previewOpen && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-fadeIn border border-[#E0DAD1]">
              <div className="p-4 bg-[#1C1A18] text-white flex items-center justify-between border-b border-[#2E2A26]">
                <div className="flex items-center gap-2">
                  <Eye size={16} className="text-[#DE8A66]" />
                  <span className="text-sm font-bold">Template Live Rendering Preview</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-4">
                {previewLoading ? (
                  <div className="py-12 text-center text-slate-500 text-sm">Rendering mock data preview...</div>
                ) : (
                  <>
                    <div className="bg-[#FAF8F5] p-3.5 rounded-lg border border-[#E0DAD1]">
                      <span className="text-[11px] font-bold text-[#7A7570] uppercase tracking-wider block">
                        Rendered Subject
                      </span>
                      <p className="text-sm font-bold text-[#1C1A18] mt-0.5">{previewSubject}</p>
                    </div>

                    <div className="border border-[#E0DAD1] rounded-xl p-6 bg-white min-h-[300px]">
                      <div
                        className="prose max-w-none text-slate-800 text-sm"
                        dangerouslySetInnerHTML={{ __html: previewHtml }}
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 bg-[#FAF8F5] border-t border-[#E0DAD1] flex justify-end">
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  className="px-4 py-2 bg-[#1C1A18] text-white text-xs font-bold rounded-lg hover:bg-slate-800 transition"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exit Confirmation Modal */}
        {showExitConfirm && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-[#E0DAD1]">
              <div className="flex items-center gap-3 text-amber-600">
                <AlertTriangle size={24} />
                <h3 className="text-base font-bold text-[#1C1A18]">Discard Unsaved Changes?</h3>
              </div>
              <p className="text-xs text-[#5C5752] leading-relaxed">
                You have unsaved changes in this template. Are you sure you want to discard your edits and return to the list?
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExitConfirm(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Stay on Editor
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowExitConfirm(false);
                    navigate("/email/configurations");
                  }}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition"
                >
                  Discard & Exit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default EditEmail;
