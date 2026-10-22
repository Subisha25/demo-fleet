import React, { useState, useEffect } from "react";
import PageLayout from "../../../components/PageLayout";
import axiosInstance from "../../../utils/axiosInstance";
import { showToast, AlertContainer } from "../../../components/AlertBox";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faTimesCircle,
  faPaperPlane,
  faEye,
  faBuilding,
  faClock,
  faSearch,
  faFilter,
  faSync,
} from "@fortawesome/free-solid-svg-icons";

interface RegistrationRequest {
  id: number | string;
  requestId?: string;
  businessCode: string;
  fleetName: string;
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  city: string;
  state: string;
  requestedPlan: string;
  requestedBilling: string;
  fleetSize?: number | string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedAt?: string;
  reviewedBy?: number | string;
  reviewerNotes?: string;
  rejectionReason?: string;
  associatedTenantId?: string;
  createdAt: string;
}

const RegistrationsQueue: React.FC = () => {
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("PENDING");
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [selectedReq, setSelectedReq] = useState<RegistrationRequest | null>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | "VIEW" | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [submittingAction, setSubmittingAction] = useState(false);

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get("/admin/registrations");
      if (res.data && res.data.success && Array.isArray(res.data.data)) {
        setRequests(res.data.data);
      } else {
        setRequests([]);
      }
    } catch (err: any) {
      console.error("Failed to load registrations:", err);
      showToast(err.response?.data?.message || "Failed to load registrations queue", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const filteredRequests = requests.filter((r) => {
    const matchesTab = activeTab === "ALL" || r.status === activeTab;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      r.fleetName.toLowerCase().includes(q) ||
      r.businessCode.toLowerCase().includes(q) ||
      r.adminName.toLowerCase().includes(q) ||
      r.adminEmail.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q);
    return matchesTab && matchesSearch;
  });

  const counts = {
    ALL: requests.length,
    PENDING: requests.filter((r) => r.status === "PENDING").length,
    APPROVED: requests.filter((r) => r.status === "APPROVED").length,
    REJECTED: requests.filter((r) => r.status === "REJECTED").length,
  };

  const handleApprove = async () => {
    if (!selectedReq) return;
    setSubmittingAction(true);
    const reqId = selectedReq.requestId || selectedReq.id;
    try {
      const res = await axiosInstance.post(`/admin/registrations/${reqId}/approve`, {
        reviewNotes: reviewNote,
      });

      if (res.data.success) {
        showToast(`Tenant ${selectedReq.fleetName} approved! Activation link sent to ${selectedReq.adminEmail}`, "success");
        setActionType(null);
        setSelectedReq(null);
        setReviewNote("");
        fetchRegistrations();
      } else {
        showToast(res.data.message || "Approval failed", "error");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Error processing approval", "error");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleReject = async () => {
    if (!selectedReq) return;
    if (!reviewNote.trim()) {
      showToast("Please provide a reason for rejecting this application", "error");
      return;
    }
    setSubmittingAction(true);
    const reqId = selectedReq.requestId || selectedReq.id;
    try {
      const res = await axiosInstance.post(`/admin/registrations/${reqId}/reject`, {
        rejectionReason: reviewNote,
      });

      if (res.data.success) {
        showToast(`Application for ${selectedReq.fleetName} rejected`, "success");
        setActionType(null);
        setSelectedReq(null);
        setReviewNote("");
        fetchRegistrations();
      } else {
        showToast(res.data.message || "Rejection failed", "error");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Error processing rejection", "error");
    } finally {
      setSubmittingAction(false);
    }
  };

  const handleResendToken = async (req: RegistrationRequest) => {
    const reqId = req.requestId || req.id;
    try {
      const res = await axiosInstance.post(`/admin/registrations/${reqId}/resend-token`);
      if (res.data.success) {
        showToast(`New activation link generated and dispatched to ${req.adminEmail}`, "success");
      } else {
        showToast(res.data.message || "Could not re-issue activation token", "error");
      }
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to resend activation token", "error");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
            Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-600"></span>
            Rejected
          </span>
        );
      case "PENDING":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Pending Review
          </span>
        );
    }
  };

  return (
    <PageLayout
      breadcrumbName="Registration Requests"
      title="Fleet Registration Queue"
      subtitle="Review inbound public SaaS registrations, verify operator credentials, and issue 24-hour cryptographic activation tokens."
      actions={
        <button
          onClick={fetchRegistrations}
          className="flex items-center gap-2 px-4 py-2 bg-[#C04E24] hover:bg-[#A43D1A] text-white rounded-lg text-xs font-semibold shadow-sm transition"
        >
          <FontAwesomeIcon icon={faSync} className={loading ? "animate-spin" : ""} />
          Refresh Queue
        </button>
      }
    >
      <AlertContainer />

      {/* Metric Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {(["ALL", "PENDING", "APPROVED", "REJECTED"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`p-4 rounded-xl border text-left transition-all ${
              activeTab === tab
                ? "bg-[#1C1A18] text-white border-[#C04E24] shadow-md border-b-4"
                : "bg-white text-[#1C1A18] border-[#E0DAD1] hover:border-[#C04E24]/50"
            }`}
          >
            <div className="text-xs font-bold uppercase tracking-wider opacity-80">{tab} Applications</div>
            <div className="text-2xl font-black mt-1">{counts[tab]}</div>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#E0DAD1] shadow-sm mb-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <FontAwesomeIcon icon={faSearch} className="absolute left-3.5 top-3 text-[#7A7570] text-xs" />
          <input
            type="text"
            placeholder="Search fleet, code, admin, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-[#E0DAD1] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#C04E24]/20 focus:border-[#C04E24]"
          />
        </div>
        <div className="text-xs text-[#7A7570] font-medium">
          Showing <span className="font-bold text-[#1C1A18]">{filteredRequests.length}</span> of {requests.length} total applications
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-8 h-8 border-4 border-[#C04E24] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-xs font-semibold text-[#7A7570]">Loading registrations...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="py-16 text-center text-[#7A7570]">
            <FontAwesomeIcon icon={faBuilding} className="text-4xl mb-3 opacity-30" />
            <h4 className="text-sm font-bold text-[#1C1A18]">No applications match your filter</h4>
            <p className="text-xs text-[#7A7570] mt-1">Try switching tabs or clearing your search query.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#FAF8F5] border-b border-[#E0DAD1] text-[11px] font-bold text-[#7A7570] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Ref & Fleet Name</th>
                  <th className="py-3.5 px-4">Admin Contact</th>
                  <th className="py-3.5 px-4">Location</th>
                  <th className="py-3.5 px-4">Requested Plan</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Submitted</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#FAF8F5] text-xs">
                {filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#FAF8F5]/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#1C1A18]">{req.fleetName}</div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="font-mono text-[10px] bg-[#FAF8F5] border border-[#E0DAD1] text-[#1C1A18] px-1.5 py-0.5 rounded font-semibold">
                          {req.businessCode}
                        </span>
                        <span className="text-[10px] text-[#7A7570]">#REG-{String(req.id).padStart(5, "0")}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-[#1C1A18]">{req.adminName}</div>
                      <div className="text-[#5C5752] text-[11px]">{req.adminEmail}</div>
                      <div className="text-[#7A7570] text-[10px]">{req.adminPhone}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="text-[#1C1A18] font-medium">{req.city}</div>
                      <div className="text-[#7A7570] text-[10px]">{req.state}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-[#C04E24] uppercase">{req.requestedPlan}</div>
                      <div className="text-[10px] text-[#5C5752] capitalize">{req.requestedBilling} Billing</div>
                      {req.fleetSize && (
                        <div className="text-[10px] text-slate-400">{req.fleetSize} vehicles reported</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">{getStatusBadge(req.status)}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-[11px]">
                      {new Date(req.createdAt).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedReq(req);
                            setActionType("VIEW");
                          }}
                          title="View Details"
                          className="p-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition"
                        >
                          <FontAwesomeIcon icon={faEye} className="w-3.5 h-3.5" />
                        </button>

                        {req.status === "PENDING" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedReq(req);
                                setActionType("APPROVE");
                                setReviewNote("");
                              }}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition flex items-center gap-1 shadow-sm"
                            >
                              <FontAwesomeIcon icon={faCheckCircle} />
                              Approve
                            </button>
                            <button
                              onClick={() => {
                                setSelectedReq(req);
                                setActionType("REJECT");
                                setReviewNote("");
                              }}
                              className="px-2.5 py-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-md transition flex items-center gap-1 shadow-sm"
                            >
                              <FontAwesomeIcon icon={faTimesCircle} />
                              Reject
                            </button>
                          </>
                        )}

                        {req.status === "APPROVED" && (
                          <button
                            onClick={() => handleResendToken(req)}
                            title="Resend Activation Token"
                            className="px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition flex items-center gap-1"
                          >
                            <FontAwesomeIcon icon={faPaperPlane} className="text-teal-600" />
                            Resend Link
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: View Details */}
      {actionType === "VIEW" && selectedReq && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Application #{selectedReq.id}</h3>
              <button
                onClick={() => setActionType(null)}
                className="text-slate-400 hover:text-slate-600 text-lg leading-none"
              >
                &times;
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-400">Fleet Name</span>
                  <div className="font-bold text-slate-800 text-sm">{selectedReq.fleetName}</div>
                </div>
                <div>
                  <span className="text-[#7A7570]">Business Code</span>
                  <div className="font-mono font-bold text-[#C04E24] text-sm">{selectedReq.businessCode}</div>
                </div>
                <div>
                  <span className="text-slate-400">Owner / Admin</span>
                  <div className="font-semibold text-slate-800">{selectedReq.adminName}</div>
                </div>
                <div>
                  <span className="text-slate-400">Status</span>
                  <div>{getStatusBadge(selectedReq.status)}</div>
                </div>
                <div>
                  <span className="text-slate-400">Email Address</span>
                  <div className="font-semibold text-slate-800">{selectedReq.adminEmail}</div>
                </div>
                <div>
                  <span className="text-slate-400">Phone Number</span>
                  <div className="font-semibold text-slate-800">{selectedReq.adminPhone}</div>
                </div>
                <div>
                  <span className="text-slate-400">City / State</span>
                  <div className="font-semibold text-slate-800">{selectedReq.city}, {selectedReq.state}</div>
                </div>
                <div>
                  <span className="text-slate-400">Plan & Billing</span>
                  <div className="font-bold text-emerald-700 uppercase">{selectedReq.requestedPlan} ({selectedReq.requestedBilling})</div>
                </div>
              </div>

              {selectedReq.associatedTenantId && (
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                  <span className="text-emerald-700 font-bold block mb-0.5">Provisioned Tenant ID:</span>
                  <span className="font-mono text-emerald-900 font-semibold">{selectedReq.associatedTenantId}</span>
                </div>
              )}

              {selectedReq.rejectionReason && (
                <div className="bg-rose-50 p-3 rounded-lg border border-rose-200">
                  <span className="text-rose-700 font-bold block mb-0.5">Rejection Reason:</span>
                  <span className="text-rose-900">{selectedReq.rejectionReason}</span>
                </div>
              )}

              {selectedReq.reviewerNotes && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-slate-600 font-bold block mb-0.5">Reviewer Notes:</span>
                  <span className="text-slate-800">{selectedReq.reviewerNotes}</span>
                </div>
              )}
            </div>
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setActionType(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Approve Application */}
      {actionType === "APPROVE" && selectedReq && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Approve Fleet Application</h3>
            <p className="text-xs text-slate-600 mb-4">
              Approving <strong>{selectedReq.fleetName}</strong> ({selectedReq.businessCode}) will:
            </p>
            <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5 mb-4 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <li>Provision an isolated tenant environment for <strong>{selectedReq.fleetName}</strong>.</li>
              <li>Assign quotas for <strong>{selectedReq.requestedPlan.toUpperCase()}</strong> plan.</li>
              <li>Generate a 24-hour cryptographic activation token.</li>
              <li>Send an onboarding invitation link to <strong>{selectedReq.adminEmail}</strong>.</li>
            </ul>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Internal Review Note (Optional)
              </label>
              <textarea
                rows={2}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="E.g., Verified business documents and GST certificate."
                className="w-full p-2.5 border border-[#E0DAD1] rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-[#C04E24]/20 focus:border-[#C04E24]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                disabled={submittingAction}
                onClick={() => setActionType(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={submittingAction}
                onClick={handleApprove}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
              >
                {submittingAction && <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                Confirm Approval & Send Activation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Reject Application */}
      {actionType === "REJECT" && selectedReq && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-2">Reject Fleet Application</h3>
            <p className="text-xs text-slate-600 mb-4">
              Please state why <strong>{selectedReq.fleetName}</strong> is being rejected. This reason will be recorded and communicated to the applicant.
            </p>

            <div className="mb-4">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rejection Reason *
              </label>
              <textarea
                required
                rows={3}
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder="E.g., Incomplete business registration details or duplicate applicant."
                className="w-full p-2.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                disabled={submittingAction}
                onClick={() => setActionType(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                disabled={submittingAction || !reviewNote.trim()}
                onClick={handleReject}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition disabled:opacity-50"
              >
                {submittingAction ? "Rejecting..." : "Confirm Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default RegistrationsQueue;
