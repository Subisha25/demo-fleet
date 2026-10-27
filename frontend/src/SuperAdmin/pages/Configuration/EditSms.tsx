import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PageLayout from "../../../components/PageLayout";
import axiosInstance from "../../../utils/axiosInstance";
import { showToast, AlertContainer } from "../../../components/AlertBox";

const EditSms: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [templateCode, setTemplateCode] = useState("");
  const [senderId, setSenderId] = useState("GRCCAB");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const res = await axiosInstance.get(`/smsTemplateRoutes/getSmsTemplateById/${id}`);
        const data = res.data.smsTemplate;
        setTitle(data.title || "");
        setTemplateCode(data.templateCode || "");
        setSenderId(data.senderId || "GRCCAB");
        setMessage(data.message || "");
      } catch (err: any) {
        showToast(err.response?.data?.message || "Failed to load SMS template", "error");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchTemplate();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      showToast("Message content is required", "warn");
      return;
    }

    try {
      setSaving(true);
      await axiosInstance.put(`/smsTemplateRoutes/updateSmsTemplate/${id}`, {
        title,
        templateCode,
        senderId,
        message,
      });

      showToast("SMS template updated successfully!", "success");
      setTimeout(() => navigate("/configuration/sms"), 800);
    } catch (err: any) {
      showToast(err.response?.data?.message || "Failed to update SMS template", "error");
    } finally {
      setSaving(false);
    }
  };

  // Preview sample placeholders
  const sampleData: Record<string, string> = {
    CustomerName: "John Doe",
    BookingCode: "FF-10023",
    PickupTime: "10:30 AM",
    DriverName: "Ramesh Kumar",
    DriverPhone: "9876543210",
    VehicleNumber: "KA-01-AB-1234",
    VehicleModel: "Toyota Innova",
    Otp: "4589",
    InvoiceAmount: "₹ 1,850",
    FleetName: "FleetFlow Fleet",
  };

  const renderPreview = () => {
    let preview = message;
    for (const key of Object.keys(sampleData)) {
      preview = preview.replace(new RegExp(`###${key}###`, "g"), sampleData[key]);
      preview = preview.replace(new RegExp(`\\{${key}\\}`, "g"), sampleData[key]);
    }
    return preview;
  };

  if (loading) return <p className="p-6">Loading SMS template...</p>;

  return (
    <PageLayout>
      <AlertContainer />
      <div className="max-w-4xl mx-auto bg-white border border-gray-300 rounded-md p-6 mt-6 shadow-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Edit SMS Template</h2>
          <button
            type="button"
            onClick={() => navigate("/configuration/sms")}
            className="text-gray-600 hover:text-gray-900 border border-gray-300 px-3 py-1.5 rounded-md text-sm"
          >
            Back to Templates
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                className="w-full border border-gray-400 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block font-medium text-gray-700 mb-1">Template Code</label>
              <input
                type="text"
                className="w-full border border-gray-300 bg-gray-100 px-3 py-2 rounded text-gray-600 cursor-not-allowed"
                value={templateCode}
                readOnly
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-gray-700 mb-1">Sender ID</label>
            <input
              type="text"
              maxLength={6}
              className="w-48 border border-gray-400 px-3 py-2 rounded uppercase tracking-wider"
              value={senderId}
              onChange={(e) => setSenderId(e.target.value.toUpperCase())}
            />
            <p className="text-xs text-gray-500 mt-1">6-character DLT registered header (e.g., GRCCAB).</p>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-medium text-gray-700">Message Body</label>
              <span className="text-xs text-gray-500">{message.length} characters</span>
            </div>
            <textarea
              rows={4}
              className="w-full border border-gray-400 px-3 py-2 rounded font-mono text-sm focus:ring-2 focus:ring-blue-500"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Enter SMS message text with placeholders like ###CustomerName### or ###BookingCode###"
              required
            />
            <div className="mt-2 text-xs text-gray-500">
              <span className="font-semibold">Available Placeholders:</span> ###CustomerName###, ###BookingCode###, ###PickupTime###, ###DriverName###, ###DriverPhone###, ###VehicleNumber###, ###VehicleModel###, ###Otp###, ###InvoiceAmount###, ###FleetName###
            </div>
          </div>

          {/* Live Preview Box */}
          <div className="bg-gray-50 border border-gray-300 rounded-md p-4">
            <h4 className="text-xs font-semibold uppercase text-gray-500 mb-2">Live Handset Preview</h4>
            <div className="bg-white border border-gray-200 rounded-lg p-3 text-sm text-gray-800 shadow-sm max-w-md font-sans leading-relaxed">
              <div className="text-xs text-gray-400 mb-1">From: {senderId || 'GRCCAB'}</div>
              <div>{renderPreview()}</div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate("/configuration/sms")}
              className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded shadow transition-colors disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Template"}
            </button>
          </div>
        </form>
      </div>
    </PageLayout>
  );
};

export default EditSms;
