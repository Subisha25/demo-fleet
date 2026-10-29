import React, { useState, useEffect } from 'react';
import PageLayout from '../../../components/PageLayout';
import axiosInstance from '../../../utils/axiosInstance';
import { showToast } from '../../../components/AlertBox';
import {
  ShieldCheck,
  Key,
  Radio,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  FileText,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
  Sparkles,
  Layers,
  PhoneCall,
  Info
} from 'lucide-react';

interface TemplateMapping {
  templateName: string;
  varCount: number;
  description: string;
  isApproved: boolean;
}

interface TenantSmsConfigData {
  configId?: string;
  tenantId?: string;
  provider: string;
  apiKeyMasked: string;
  senderId: string;
  otpRoute: string;
  status: string;
  isVerified: boolean;
  isEnabled: boolean;
  lastVerifiedAt?: string | null;
  lastVerificationResult?: string | null;
  templateMappings?: Record<string, any>;
  hasCustomKey?: boolean;
}

const DEFAULT_DLT_TEMPLATES: Record<string, TemplateMapping> = {
  BOOKING_CONFIRMED: {
    templateName: 'Booking Confimation Message',
    varCount: 10,
    description: 'Sent to customer upon booking creation with trip & vehicle details',
    isApproved: true,
  },
  DRIVER_ASSIGNED: {
    templateName: 'Driver Assigning',
    varCount: 6,
    description: 'Sent to customer when driver and cab are allocated to the booking',
    isApproved: true,
  },
  BOOKING_CANCELLED: {
    templateName: 'Booking Cancellation',
    varCount: 3,
    description: 'Sent to customer and fleet upon booking cancellation',
    isApproved: true,
  },
  INVOICE_CANCELLED: {
    templateName: 'Invoice Cancellation',
    varCount: 2,
    description: 'Sent to customer if an invoice is voided or cancelled',
    isApproved: true,
  },
  MANAGER_ALERT: {
    templateName: 'Manager Alert',
    varCount: 4,
    description: 'Sent to fleet manager for priority operational notifications',
    isApproved: true,
  },
  OTP_VERIFICATION: {
    templateName: 'OTP Authentication',
    varCount: 1,
    description: 'Sent via 2Factor OTP1 transactional route with auto-generated code',
    isApproved: true,
  },
};

const SmsIntegrationSettings: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [validating, setValidating] = useState<boolean>(false);
  const [testingSms, setTestingSms] = useState<boolean>(false);

  // Form State
  const [provider, setProvider] = useState<string>('2FACTOR');
  const [apiKey, setApiKey] = useState<string>('');
  const [apiKeyMasked, setApiKeyMasked] = useState<string>('');
  const [showApiKey, setShowApiKey] = useState<boolean>(false);
  const [senderId, setSenderId] = useState<string>('GRCCAB');
  const [otpRoute, setOtpRoute] = useState<string>('OTP1');
  const [isEnabled, setIsEnabled] = useState<boolean>(true);
  const [status, setStatus] = useState<string>('UNCONFIGURED');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [lastVerifiedAt, setLastVerifiedAt] = useState<string | null>(null);
  const [lastVerificationResult, setLastVerificationResult] = useState<string | null>(null);

  // Subscription state
  const [subscriptionStatus, setSubscriptionStatus] = useState<any>({
    isEligible: true,
    planCode: 'ENTERPRISE',
    status: 'ACTIVE',
  });

  // Test SMS Modal state
  const [isTestModalOpen, setIsTestModalOpen] = useState<boolean>(false);
  const [testPhoneNumber, setTestPhoneNumber] = useState<string>('');
  const [confirmTestSms, setConfirmTestSms] = useState<boolean>(false);

  // Fetch current tenant configuration
  const fetchConfig = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/sms/config');
      if (res.data && res.data.success) {
        const config: TenantSmsConfigData = res.data.data.config;
        if (config) {
          setProvider(config.provider || '2FACTOR');
          setApiKeyMasked(config.apiKeyMasked || '');
          setSenderId(config.senderId || 'GRCCAB');
          setOtpRoute(config.otpRoute || 'OTP1');
          setIsEnabled(config.isEnabled !== false);
          setStatus(config.status || 'UNCONFIGURED');
          setIsVerified(Boolean(config.isVerified));
          setLastVerifiedAt(config.lastVerifiedAt || null);
          setLastVerificationResult(config.lastVerificationResult || null);
        }
        if (res.data.data.subscriptionStatus) {
          setSubscriptionStatus(res.data.data.subscriptionStatus);
        }
      }
    } catch (err: any) {
      console.error('Failed to load SMS configuration:', err);
      showToast(err?.response?.data?.message || 'Could not load SMS settings', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Save / Update Configuration
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey && !apiKeyMasked) {
      showToast('Please enter an API Key for your SMS provider', 'error');
      return;
    }

    try {
      setSaving(true);
      const payload: any = {
        provider,
        senderId: senderId.trim().toUpperCase(),
        otpRoute: otpRoute.trim(),
        isEnabled,
      };

      // Only send apiKey if user typed a new one
      if (apiKey.trim()) {
        payload.apiKey = apiKey.trim();
      }

      const res = await axiosInstance.put('/sms/config', payload);
      if (res.data && res.data.success) {
        showToast(res.data.message || 'SMS configuration saved successfully!', 'success');
        setApiKey(''); // Clear raw secret from state immediately
        await fetchConfig();
      } else {
        showToast(res.data.message || 'Failed to save configuration', 'error');
      }
    } catch (err: any) {
      console.error('Save error:', err);
      showToast(err?.response?.data?.message || 'Failed to save SMS configuration', 'error');
    } finally {
      setSaving(false);
    }
  };

  // Safe Connection Validation (read-only balance check, zero SMS)
  const handleValidateConnection = async () => {
    try {
      setValidating(true);
      const res = await axiosInstance.post('/sms/config/validate');
      if (res.data && res.data.success) {
        showToast(res.data.message || 'Gateway connection validated successfully!', 'success');
        setIsVerified(true);
        setStatus('VERIFIED');
        setLastVerifiedAt(new Date().toISOString());
        setLastVerificationResult(res.data.message);
      } else {
        showToast(res.data.message || 'Gateway connection check failed', 'error');
        setIsVerified(false);
        setStatus('FAILED');
        setLastVerificationResult(res.data.message);
      }
    } catch (err: any) {
      console.error('Validation error:', err);
      showToast(err?.response?.data?.message || 'Validation failed. Check your API credentials.', 'error');
      setIsVerified(false);
      setStatus('FAILED');
    } finally {
      setValidating(false);
    }
  };

  // Explicit Test SMS Dispatch
  const handleSendTestSms = async () => {
    if (!confirmTestSms) {
      showToast('Please check the confirmation box to authorize test message dispatch.', 'error');
      return;
    }
    if (!testPhoneNumber || testPhoneNumber.replace(/\D/g, '').length !== 10) {
      showToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }

    try {
      setTestingSms(true);
      const res = await axiosInstance.post('/sms/config/test-sms', {
        phoneNumber: testPhoneNumber.trim(),
        confirmRealSms: true,
      });

      if (res.data && res.data.success) {
        showToast(res.data.message || 'Test SMS sent successfully!', 'success');
        setIsTestModalOpen(false);
        setTestPhoneNumber('');
        setConfirmTestSms(false);
      } else {
        showToast(res.data.message || 'Failed to send test SMS', 'error');
      }
    } catch (err: any) {
      console.error('Test SMS error:', err);
      showToast(err?.response?.data?.message || 'Failed to dispatch test SMS', 'error');
    } finally {
      setTestingSms(false);
    }
  };

  return (
    <PageLayout>
      <div className="py-6 max-w-7xl mx-auto space-y-6">
        {/* Header & Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-700 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">SMS Gateway & DLT Integration</h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Configure tenant-isolated 2Factor SMS credentials, DLT headers, and template compliance.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                isVerified
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : status === 'ACTIVE'
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              }`}
            >
              {isVerified ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              )}
              {isVerified ? 'Gateway Verified' : status === 'ACTIVE' ? 'Configured' : 'Needs Setup'}
            </span>

            <button
              onClick={fetchConfig}
              disabled={loading}
              className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:text-purple-600 hover:border-purple-300 transition-colors bg-white shadow-sm"
              title="Refresh Configuration"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* Security & Subscription Notice Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">AES-256 Tenant Encryption</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Credentials are encrypted at rest with server-side keys. Isolated per fleet with zero cross-tenant access.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm flex items-start gap-3">
            <div className="p-2 rounded-lg bg-purple-50 text-purple-700 mt-0.5">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">TRAI DLT Enforced</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Strict DLT template adherence. Open text parameters are blocked to guarantee 100% gateway delivery.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-sm flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">Subscription Status</h4>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  {subscriptionStatus.status || 'Active'}
                </span>
                <span className="text-xs text-slate-500 font-medium">Plan: {subscriptionStatus.planCode || 'Enterprise'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Configuration Form Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold text-slate-800 text-sm">Provider Credentials & Routing</h3>
            </div>
            <span className="text-xs text-slate-500">Changes apply immediately to upcoming notifications</span>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Provider Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  SMS Gateway Provider
                </label>
                <div className="relative">
                  <select
                    value={provider}
                    onChange={(e) => setProvider(e.target.value)}
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none transition"
                  >
                    <option value="2FACTOR">2Factor.in (Official India DLT Gateway)</option>
                  </select>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">
                  High-throughput transactional & OTP SMS route verified for Indian telecom operators.
                </p>
              </div>

              {/* Sender ID / DLT Header */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  DLT Approved Sender ID (Header)
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={senderId}
                  onChange={(e) => setSenderId(e.target.value.toUpperCase())}
                  placeholder="e.g. GRCCAB"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 uppercase font-mono tracking-wider focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none transition"
                  required
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  Exactly 6 alphabetical characters approved by your principal DLT entity (e.g. GRCCAB).
                </p>
              </div>

              {/* API Key */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  2Factor API Secret Key
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder={apiKeyMasked ? `Saved Key: ${apiKeyMasked}` : 'Enter your 2Factor API Key'}
                    className="w-full bg-white border border-slate-300 rounded-lg pl-3.5 pr-10 py-2.5 text-sm text-slate-800 focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none font-mono transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-xs text-slate-400 mt-1.5">
                  {apiKeyMasked ? (
                    <span className="text-emerald-600 font-medium">
                      ✓ Active key configured ({apiKeyMasked}). Leave blank to keep existing key.
                    </span>
                  ) : (
                    'Enter the API Key from your 2Factor dashboard.'
                  )}
                </p>
              </div>

              {/* OTP Route */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                  OTP Dedicated Route
                </label>
                <input
                  type="text"
                  value={otpRoute}
                  onChange={(e) => setOtpRoute(e.target.value)}
                  placeholder="e.g. OTP1"
                  className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm text-slate-800 uppercase font-mono tracking-wider focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none transition"
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  Dedicated 2Factor OTP gateway route (default is <span className="font-semibold text-slate-700">OTP1</span>).
                </p>
              </div>
            </div>

            {/* Toggle Gateway Active */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="enableSms"
                  checked={isEnabled}
                  onChange={(e) => setIsEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300"
                />
                <label htmlFor="enableSms" className="text-sm font-medium text-slate-800 cursor-pointer">
                  Enable SMS Notifications for this Fleet
                </label>
              </div>

              {lastVerifiedAt && (
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Last verified: {new Date(lastVerifiedAt).toLocaleString()}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleValidateConnection}
                  disabled={validating || (!apiKey && !apiKeyMasked)}
                  className="px-4 py-2.5 rounded-lg border border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 text-sm font-semibold inline-flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${validating ? 'animate-spin' : ''}`} />
                  {validating ? 'Validating Connection...' : 'Validate Gateway Connection'}
                </button>

                <button
                  type="button"
                  onClick={() => setIsTestModalOpen(true)}
                  disabled={!apiKeyMasked && !apiKey}
                  className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold inline-flex items-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  <Send className="w-4 h-4 text-purple-600" />
                  Send Test SMS
                </button>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white text-sm font-semibold inline-flex items-center gap-2 shadow-md hover:shadow-lg transition disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Save Configuration</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* DLT Registered Templates Table Card */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <h3 className="font-semibold text-slate-800 text-sm">DLT Pre-Approved Template Catalog</h3>
            </div>
            <span className="text-xs font-medium text-slate-500 bg-white px-2.5 py-1 rounded-md border border-slate-200">
              Sender Header: <strong className="text-purple-700">{senderId || 'GRCCAB'}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 text-slate-600 text-xs font-semibold uppercase tracking-wider border-b border-slate-200">
                  <th className="px-6 py-3.5">Notification Event</th>
                  <th className="px-6 py-3.5">Registered DLT Template Name</th>
                  <th className="px-6 py-3.5 text-center">DLT Variables</th>
                  <th className="px-6 py-3.5">Trigger Scenario</th>
                  <th className="px-6 py-3.5 text-center">DLT Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {Object.entries(DEFAULT_DLT_TEMPLATES).map(([key, template]) => (
                  <tr key={key} className="hover:bg-slate-50/75 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-slate-900 text-xs">
                      {key.replace(/_/g, ' ')}
                    </td>
                    <td className="px-6 py-3.5 font-mono text-xs text-purple-700 font-medium">
                      "{template.templateName}"
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {template.varCount} vars (var1..var{template.varCount})
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-xs text-slate-500 max-w-xs">
                      {template.description}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Approved
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-4 bg-slate-50/60 border-t border-slate-200 text-xs text-slate-500 flex items-start gap-2">
            <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
            <span>
              <strong>DLT Strict Formatting Rule:</strong> Indian telecom regulations mandate that transactional message variables match registered slot counts and sequence exactly. Dispatch routines automatically format required arguments to ensure zero rejection by the SMS gateway.
            </span>
          </div>
        </div>
      </div>

      {/* Test SMS Modal with Explicit Confirmation */}
      {isTestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Send Safe Test SMS</h3>
                  <p className="text-xs text-slate-500">Requires explicit user confirmation</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsTestModalOpen(false);
                  setConfirmTestSms(false);
                }}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800 leading-relaxed">
                  <strong>Explicit Confirmation Notice:</strong> This action will dispatch an actual test SMS to the provided mobile number using your configured sender ID (<strong>{senderId || 'GRCCAB'}</strong>) and approved DLT template.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Recipient Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-semibold">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    value={testPhoneNumber}
                    onChange={(e) => setTestPhoneNumber(e.target.value.replace(/\D/g, ''))}
                    placeholder="9876543210"
                    className="w-full bg-white border border-slate-300 rounded-lg pl-12 pr-4 py-2.5 text-sm text-slate-800 font-mono tracking-wider focus:ring-2 focus:ring-purple-600 focus:border-purple-600 outline-none transition"
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">Enter a valid 10-digit Indian mobile number.</p>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={confirmTestSms}
                    onChange={(e) => setConfirmTestSms(e.target.checked)}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 border-slate-300 mt-0.5"
                  />
                  <span className="text-xs text-slate-700 font-medium">
                    I explicitly confirm and authorize dispatching a real test message to this phone number.
                  </span>
                </label>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsTestModalOpen(false);
                  setConfirmTestSms(false);
                }}
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSendTestSms}
                disabled={testingSms || !confirmTestSms || testPhoneNumber.length !== 10}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white text-sm font-semibold inline-flex items-center gap-2 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testingSms ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Dispatching...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Test SMS</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

export default SmsIntegrationSettings;
