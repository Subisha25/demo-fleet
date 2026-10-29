import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PageLayout from '../../../components/PageLayout';
import axiosInstance from '../../../utils/axiosInstance';
import config from '../../../config/config';
import { showToast, AlertContainer } from '../../../components/AlertBox';
import { useTenant } from '../../../context/TenantContext';
import {
  User,
  Building,
  Mail,
  Phone,
  Shield,
  Save,
  RefreshCw,
  Upload,
  Globe,
  MapPin,
  FileText,
  CreditCard,
  CheckCircle,
  Lock,
  Key,
  AlertCircle,
  X,
  Camera,
  Palette,
  Sparkles,
  Crown,
  ArrowRight,
} from 'lucide-react';

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const SAC_REGEX = /^[0-9]{6}$/;

const BASE_URL = config.baseurl.apibaseurl;

const ProfileManagement: React.FC = () => {
  const navigate = useNavigate();
  const { refreshTenant } = useTenant();
  const [activeTab, setActiveTab] = useState<'PERSONAL' | 'BUSINESS' | 'THEME'>('PERSONAL');
  const [loading, setLoading] = useState(true);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingBusiness, setSavingBusiness] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const role = (localStorage.getItem('role') || '').toLowerCase().trim();
  const isSuperAdmin = role === 'superadmin' || role === 'platform_admin';

  // Personal Profile fields
  const [personalName, setPersonalName] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [personalPhone, setPersonalPhone] = useState('');
  const [userRole, setUserRole] = useState('');
  const [address, setAddress] = useState('');
  const [gstinProfile, setGstinProfile] = useState('');
  const [profileImage, setProfileImage] = useState('');

  // Initial snapshot for cancel / reset
  const [initialData, setInitialData] = useState({
    name: '',
    phone: '',
    address: '',
    gstin: '',
    profileImage: '',
  });

  // Password Change fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Business Profile fields (Fleet Admin)
  const [legalName, setLegalName] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [registeredAddress, setRegisteredAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [sacCode, setSacCode] = useState('996609');
  const [website, setWebsite] = useState('');
  const [businessEmail, setBusinessEmail] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [billingFooterText, setBillingFooterText] = useState('');

  // Theming & SaaS Entitlement state
  const [themeLevel, setThemeLevel] = useState<'STANDARD' | 'PRESETS' | 'CUSTOM'>('STANDARD');
  const [tenantPlanTier, setTenantPlanTier] = useState<string>('BASIC');
  const [primaryColor, setPrimaryColor] = useState<string>('#C04E24');
  const [secondaryColor, setSecondaryColor] = useState<string>('#1C1A18');
  const [portalTitle, setPortalTitle] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('terracotta');

  const THEME_PRESETS: Record<string, { name: string; primary: string; secondary: string; desc: string }> = {
    terracotta: {
      name: 'Terracotta Warmth',
      primary: '#C04E24',
      secondary: '#1C1A18',
      desc: 'System default warm earthen terracotta brand',
    },
    emerald: {
      name: 'Emerald Fleet',
      primary: '#0F766E',
      secondary: '#134E4A',
      desc: 'Eco-mobility forest teal & crisp emerald accents',
    },
    slate: {
      name: 'Slate Executive',
      primary: '#334155',
      secondary: '#1E293B',
      desc: 'Corporate VIP & luxury chauffeur dark slate',
    },
    indigo: {
      name: 'Indigo Express',
      primary: '#4F46E5',
      secondary: '#312E81',
      desc: 'Modern tech-forward dispatch & high-contrast indigo',
    },
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/user/profile');
      if (res.data && res.data.success) {
        const p = res.data.profile;
        setPersonalName(p.name || '');
        setPersonalEmail(p.email || '');
        setPersonalPhone(p.phone || '');
        setUserRole(p.role || role);
        setAddress(p.address || '');
        setGstinProfile(p.gstin || '');
        setProfileImage(p.profileImage || '');

        setInitialData({
          name: p.name || '',
          phone: p.phone || '',
          address: p.address || '',
          gstin: p.gstin || '',
          profileImage: p.profileImage || '',
        });

        const f = res.data.fleetProfile;
        if (f) {
          setLegalName(f.legalName || f.name || '');
          setDisplayName(f.displayName || f.name || '');
          setRegisteredAddress(f.registeredAddress || '');
          setGstin(f.gstin || '');
          setPanNumber(f.panNumber || '');
          setSacCode(f.sacCode || '996609');
          setWebsite(f.website || '');
          setBusinessEmail(f.businessEmail || f.contactEmail || '');
          setBusinessPhone(f.businessPhone || f.contactPhone || '');
          setCity(f.city || '');
          setState(f.state || '');
          setPinCode(f.pinCode || '');
          setLogoUrl(f.logoUrl || f.brandingTokens?.logoUrl || '');
          setBillingFooterText(f.billingFooterText || '');
          setPrimaryColor(f.brandingTokens?.primaryColor || '#C04E24');
          setSecondaryColor(f.brandingTokens?.secondaryColor || '#1C1A18');
          setPortalTitle(f.brandingTokens?.portalTitle || f.displayName || f.name || '');
        }

        // Fetch dynamic tenant entitlements
        try {
          const entRes = await axiosInstance.get('/tenants/current/entitlements');
          if (entRes.data?.success && entRes.data?.entitlements) {
            const ent = entRes.data.entitlements;
            setThemeLevel(ent.themeLevel || 'STANDARD');
            setTenantPlanTier(ent.planTier || 'BASIC');
          }
        } catch (e) {
          console.warn('Could not load tenant entitlements:', e);
        }
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to load profile details.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSelectPreset = (key: string) => {
    setSelectedPreset(key);
    const p = THEME_PRESETS[key];
    if (p) {
      setPrimaryColor(p.primary);
      setSecondaryColor(p.secondary);
    }
  };

  const handleSaveTheme = async (e: React.FormEvent) => {
    e.preventDefault();
    if (themeLevel === 'STANDARD') {
      showToast('Theme customization is locked on Basic plan. Upgrade to Pro for presets or Enterprise for custom branding.', 'warn');
      return;
    }

    try {
      setSavingTheme(true);
      const payload: any = {
        primaryColor,
        secondaryColor,
        portalTitle,
        themePreset: selectedPreset,
      };

      const res = await axiosInstance.put('/tenants/current/branding', payload);
      if (res.data && res.data.success) {
        showToast('Portal theme branding updated successfully!', 'success');
        document.documentElement.style.setProperty('--primary-tenant-color', primaryColor);
        if (portalTitle) document.title = `${portalTitle} — FleetFlow`;
        refreshTenant();
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to save theme settings.', 'error');
    } finally {
      setSavingTheme(false);
    }
  };

  const handleCancelPersonal = () => {
    setPersonalName(initialData.name);
    setPersonalPhone(initialData.phone);
    setAddress(initialData.address);
    setGstinProfile(initialData.gstin);
    setProfileImage(initialData.profileImage);
    showToast('Changes discarded. Profile restored to saved state.', 'info');
  };

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!personalName.trim()) {
      showToast('Name is required.', 'error');
      return;
    }

    // Phone validation
    const digitsOnly = personalPhone.replace(/\D/g, '');
    if (personalPhone.trim() && (digitsOnly.length < 10 || digitsOnly.length > 12)) {
      showToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }

    // GSTIN validation (optional for SuperAdmin, but if provided must follow format)
    if (gstinProfile.trim() && !GSTIN_REGEX.test(gstinProfile.trim().toUpperCase())) {
      showToast('Invalid GSTIN format. Expected 15-character Indian GSTIN (e.g. 33AAMCG2518C1Z0)', 'error');
      return;
    }

    try {
      setSavingPersonal(true);
      const res = await axiosInstance.put('/user/profile', {
        name: personalName.trim(),
        phone: personalPhone.trim(),
        address: address.trim(),
        gstin: gstinProfile.trim().toUpperCase(),
        profileImage,
      });

      if (res.data && res.data.success) {
        showToast('Profile updated successfully!', 'success');
        setInitialData({
          name: personalName.trim(),
          phone: personalPhone.trim(),
          address: address.trim(),
          gstin: gstinProfile.trim().toUpperCase(),
          profileImage,
        });
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to update profile details.', 'error');
    } finally {
      setSavingPersonal(false);
    }
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Only JPEG, PNG, and WebP images are allowed.', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Image size exceeds maximum limit of 2MB.', 'error');
      return;
    }

    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await axiosInstance.post('/user/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data && res.data.success) {
        setProfileImage(res.data.imageUrl);
        setInitialData((prev) => ({ ...prev, profileImage: res.data.imageUrl }));
        showToast('Profile photo uploaded and saved successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to upload profile photo.', 'error');
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentPassword) {
      showToast('Please enter your current password.', 'error');
      return;
    }

    if (newPassword.length < 6) {
      showToast('New password must be at least 6 characters long.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match.', 'error');
      return;
    }

    try {
      setChangingPassword(true);
      const res = await axiosInstance.put('/user/profile/password', {
        currentPassword,
        newPassword,
      });

      if (res.data && res.data.success) {
        showToast('Password changed successfully!', 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setShowPasswordSection(false);
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to change password.', 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  const handleSaveBusiness = async (e: React.FormEvent) => {
    e.preventDefault();

    if (gstin && !GSTIN_REGEX.test(gstin.trim().toUpperCase())) {
      showToast('Invalid GSTIN format. Expected 15-character Indian GSTIN (e.g., 33AAMCG2518C1Z0)', 'error');
      return;
    }
    if (panNumber && !PAN_REGEX.test(panNumber.trim().toUpperCase())) {
      showToast('Invalid PAN format. Expected 10-character alphanumeric PAN (e.g., AAMCG2518C)', 'error');
      return;
    }
    if (sacCode && !SAC_REGEX.test(sacCode.trim())) {
      showToast('Invalid SAC code. Expected 6 digits (e.g., 996609)', 'error');
      return;
    }

    try {
      setSavingBusiness(true);
      const res = await axiosInstance.put('/tenants/current/branding', {
        legalName,
        displayName,
        registeredAddress,
        gstin: gstin.trim().toUpperCase(),
        panNumber: panNumber.trim().toUpperCase(),
        sacCode: sacCode.trim(),
        website,
        businessEmail,
        businessPhone,
        city,
        state,
        pinCode,
        billingFooterText,
      });

      if (res.data && res.data.success) {
        showToast('Fleet business identity & legal profile updated successfully!', 'success');
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to update fleet identity.', 'error');
    } finally {
      setSavingBusiness(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="p-12 text-center text-slate-500 text-sm">
          <RefreshCw className="animate-spin inline-block mr-2" size={16} />
          Loading profile...
        </div>
      </PageLayout>
    );
  }

  const getImageSrc = (imgPath: string) => {
    if (!imgPath) return '';
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) return imgPath;
    return `${BASE_URL}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
  };

  const hasPersonalChanges =
    personalName !== initialData.name ||
    personalPhone !== initialData.phone ||
    address !== initialData.address ||
    gstinProfile !== initialData.gstin;

  return (
    <PageLayout>
      <AlertContainer />
      <div className="py-6 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-[#1C1A18] border-b-4 border-[#C04E24] rounded-xl p-6 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#C04E24]/20 text-[#DE8A66] border border-[#C04E24]/30 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                Identity & Access
              </span>
              <span className="text-[#EDE9E3] text-xs">Profile Management</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">
              {isSuperAdmin ? 'SuperAdmin Profile' : 'Fleet Profile & Business Identity'}
            </h1>
            <p className="text-xs text-[#EDE9E3] mt-1">
              {isSuperAdmin
                ? 'Manage platform administrator credentials, verified mobile contact, office address, and profile image.'
                : 'Manage personal administrator details and official fleet legal identity for invoices and PDFs.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchProfile}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-[#FAF8F5] text-xs font-bold rounded-lg border border-white/10 transition flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tab Selection (Non-SuperAdmin Only) */}
        {!isSuperAdmin && (
          <div className="bg-white rounded-xl border border-[#E0DAD1] p-2 shadow-sm flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('PERSONAL')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
                activeTab === 'PERSONAL'
                  ? 'bg-[#C04E24] text-white shadow-sm'
                  : 'text-[#5C5752] hover:bg-slate-50'
              }`}
            >
              <User size={14} /> Personal Account Profile
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('BUSINESS')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
                activeTab === 'BUSINESS'
                  ? 'bg-[#C04E24] text-white shadow-sm'
                  : 'text-[#5C5752] hover:bg-slate-50'
              }`}
            >
              <Building size={14} /> Fleet Business Profile & GSTIN
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('THEME')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
                activeTab === 'THEME'
                  ? 'bg-[#C04E24] text-white shadow-sm'
                  : 'text-[#5C5752] hover:bg-slate-50'
              }`}
            >
              <Palette size={14} /> Brand Theming & Color Studio
            </button>
          </div>
        )}

        {/* Section 1: Profile Avatar & Identity Card */}
        <div className="bg-white rounded-xl border border-[#E0DAD1] p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full border-4 border-[#F3EFEA] shadow-inner overflow-hidden bg-slate-100 flex items-center justify-center">
                {profileImage ? (
                  <img
                    src={getImageSrc(profileImage)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <User size={42} className="text-slate-400" />
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageFileChange}
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingImage}
                title="Upload Profile Photo"
                className="absolute bottom-0 right-0 p-2 bg-[#C04E24] hover:bg-[#A43D1A] text-white rounded-full shadow-md border-2 border-white transition flex items-center justify-center disabled:opacity-50"
              >
                {uploadingImage ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <Camera size={13} />
                )}
              </button>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-xl font-bold text-[#1C1A18]">{personalName || 'Operator'}</h2>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
                  <Shield size={12} />
                  {isSuperAdmin ? 'SuperAdmin (Platform Root)' : userRole}
                </span>
              </div>
              <p className="text-xs text-[#5C5752] flex items-center justify-center sm:justify-start gap-1.5">
                <Mail size={13} className="text-[#C04E24]" />
                {personalEmail}
              </p>
              <p className="text-xs text-[#5C5752] flex items-center justify-center sm:justify-start gap-1.5">
                <Phone size={13} className="text-[#C04E24]" />
                {personalPhone ? personalPhone : 'No mobile registered'}
              </p>
              <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="px-3 py-1.5 bg-[#F3EFEA] hover:bg-[#E0DAD1] text-[#1C1A18] text-xs font-bold rounded-lg border border-[#D5CFC9] transition flex items-center gap-1.5"
                >
                  <Upload size={12} />
                  <span>{uploadingImage ? 'Uploading...' : 'Change Photo (JPEG, PNG, WebP)'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Personal Profile / SuperAdmin Details */}
        {(isSuperAdmin || activeTab === 'PERSONAL') && (
          <div className="bg-white rounded-xl border border-[#E0DAD1] p-6 shadow-sm space-y-5">
            <div className="pb-3 border-b border-[#FAF8F5] flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[#1C1A18] uppercase tracking-wider flex items-center gap-2">
                  <User size={16} className="text-[#C04E24]" />
                  <span>{isSuperAdmin ? 'SuperAdmin Account & Contact Credentials' : 'Personal Operator Details'}</span>
                </h2>
                <p className="text-xs text-[#7A7570] mt-0.5">
                  {isSuperAdmin
                    ? 'The verified contact number here is used dynamically as the authoritative recipient for platform notifications.'
                    : 'Your personal account credentials for logging into FleetFlow.'}
                </p>
              </div>
              {hasPersonalChanges && (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  Unsaved Changes
                </span>
              )}
            </div>

            <form onSubmit={handleSavePersonal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                    Full Name / Administrator Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-[#D5CFC9] px-3.5 py-2.5 rounded-lg text-sm text-[#1C1A18] focus:ring-2 focus:ring-[#C04E24] focus:outline-none"
                    value={personalName}
                    onChange={(e) => setPersonalName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                    Login Email Address (Read-Only)
                  </label>
                  <input
                    type="email"
                    disabled
                    className="w-full border border-[#D5CFC9] bg-slate-50 px-3.5 py-2.5 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                    value={personalEmail}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">
                    Platform identity email cannot be altered directly from this screen.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                    Authoritative SuperAdmin Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-[#D5CFC9] px-3.5 py-2.5 rounded-lg text-sm text-[#1C1A18] focus:ring-2 focus:ring-[#C04E24] focus:outline-none"
                    value={personalPhone}
                    onChange={(e) => setPersonalPhone(e.target.value)}
                    placeholder="9080280818"
                    maxLength={13}
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Configured platform SMS recipient for operational alerts (defaults to 9080280818).
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                    GSTIN Number (Optional)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-[#D5CFC9] px-3.5 py-2.5 rounded-lg text-sm text-[#1C1A18] font-mono uppercase focus:ring-2 focus:ring-[#C04E24] focus:outline-none"
                    value={gstinProfile}
                    onChange={(e) => setGstinProfile(e.target.value.toUpperCase())}
                    placeholder="33AAMCG2518C1Z0"
                    maxLength={15}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                  Operating Office Address / Location
                </label>
                <textarea
                  className="w-full border border-[#D5CFC9] px-3.5 py-2.5 rounded-lg text-sm text-[#1C1A18] focus:ring-2 focus:ring-[#C04E24] focus:outline-none h-20"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Door No, Street Name, Tech Park, City, State, PIN..."
                />
              </div>

              <div className="pt-4 border-t border-[#FAF8F5] flex items-center justify-end gap-3">
                {hasPersonalChanges && (
                  <button
                    type="button"
                    onClick={handleCancelPersonal}
                    disabled={savingPersonal}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition flex items-center gap-1.5"
                  >
                    <X size={13} />
                    <span>Cancel / Revert</span>
                  </button>
                )}
                <button
                  type="submit"
                  disabled={savingPersonal}
                  className="px-5 py-2.5 bg-[#C04E24] hover:bg-[#A43D1A] text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save size={13} />
                  <span>{savingPersonal ? 'Saving...' : 'Save Profile Details'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Section 3: Security & Password Management */}
        <div className="bg-white rounded-xl border border-[#E0DAD1] p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#FAF8F5]">
            <div>
              <h2 className="text-sm font-bold text-[#1C1A18] uppercase tracking-wider flex items-center gap-2">
                <Lock size={16} className="text-[#C04E24]" />
                <span>Security & Password</span>
              </h2>
              <p className="text-xs text-[#7A7570] mt-0.5">
                Update account password with current-password verification.
              </p>
            </div>
            {!showPasswordSection && (
              <button
                type="button"
                onClick={() => setShowPasswordSection(true)}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-[#1C1A18] text-xs font-bold rounded-lg transition flex items-center gap-1.5"
              >
                <Key size={13} />
                <span>Change Password</span>
              </button>
            )}
          </div>

          {showPasswordSection && (
            <form onSubmit={handleChangePassword} className="space-y-4 pt-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                    Current Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full border border-[#D5CFC9] px-3.5 py-2.5 rounded-lg text-sm text-[#1C1A18] focus:ring-2 focus:ring-[#C04E24] focus:outline-none"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                    New Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="w-full border border-[#D5CFC9] px-3.5 py-2.5 rounded-lg text-sm text-[#1C1A18] focus:ring-2 focus:ring-[#C04E24] focus:outline-none"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                    Confirm New Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    className="w-full border border-[#D5CFC9] px-3.5 py-2.5 rounded-lg text-sm text-[#1C1A18] focus:ring-2 focus:ring-[#C04E24] focus:outline-none"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowPasswordSection(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  disabled={changingPassword}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="px-5 py-2 bg-[#1C1A18] hover:bg-[#2E2A26] text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Key size={13} />
                  <span>{changingPassword ? 'Verifying...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Tab 2: Fleet Business Profile (Fleet Admin Only) */}
        {!isSuperAdmin && activeTab === 'BUSINESS' && (
          <div className="bg-white rounded-xl border border-[#E0DAD1] p-6 shadow-sm space-y-5">
            <div className="pb-3 border-b border-[#FAF8F5]">
              <h2 className="text-sm font-bold text-[#1C1A18] uppercase tracking-wider flex items-center gap-2">
                <Building size={16} className="text-[#C04E24]" />
                <span>Fleet Legal Entity & Billing Branding</span>
              </h2>
              <p className="text-xs text-[#7A7570] mt-0.5">
                Official entity details rendered on customer invoices, trip PDFs, and dispatch documentation.
              </p>
            </div>

            <form onSubmit={handleSaveBusiness} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                    Fleet Legal Registered Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-[#D5CFC9] px-3.5 py-2.5 rounded-lg text-sm text-[#1C1A18] focus:ring-2 focus:ring-[#C04E24] focus:outline-none"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="e.g. Apex Mobility Solutions Pvt Ltd"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                    Public Display Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    className="w-full border border-[#D5CFC9] px-3.5 py-2.5 rounded-lg text-sm text-[#1C1A18] focus:ring-2 focus:ring-[#C04E24] focus:outline-none"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="e.g. Apex Cabs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                    GSTIN Number (15 Characters)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-[#D5CFC9] px-3.5 py-2.5 rounded-lg text-sm text-[#1C1A18] font-mono focus:ring-2 focus:ring-[#C04E24] focus:outline-none uppercase"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="29ABCDE1234F1Z5"
                    maxLength={15}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                    Income Tax PAN (10 Characters)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-[#D5CFC9] px-3.5 py-2.5 rounded-lg text-sm text-[#1C1A18] font-mono focus:ring-2 focus:ring-[#C04E24] focus:outline-none uppercase"
                    value={panNumber}
                    onChange={(e) => setPanNumber(e.target.value)}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                    SAC Code (Passenger Transport)
                  </label>
                  <input
                    type="text"
                    className="w-full border border-[#D5CFC9] px-3.5 py-2.5 rounded-lg text-sm text-[#1C1A18] font-mono focus:ring-2 focus:ring-[#C04E24] focus:outline-none"
                    value={sacCode}
                    onChange={(e) => setSacCode(e.target.value)}
                    placeholder="996609"
                    maxLength={6}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                    Official Website URL
                  </label>
                  <input
                    type="url"
                    className="w-full border border-[#D5CFC9] px-3.5 py-2.5 rounded-lg text-sm text-[#1C1A18] focus:ring-2 focus:ring-[#C04E24] focus:outline-none"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://apexcabs.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                    Customer Support Email
                  </label>
                  <input
                    type="email"
                    className="w-full border border-[#D5CFC9] px-3.5 py-2.5 rounded-lg text-sm text-[#1C1A18] focus:ring-2 focus:ring-[#C04E24] focus:outline-none"
                    value={businessEmail}
                    onChange={(e) => setBusinessEmail(e.target.value)}
                    placeholder="support@apexcabs.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                    Customer Support Phone
                  </label>
                  <input
                    type="text"
                    className="w-full border border-[#D5CFC9] px-3.5 py-2.5 rounded-lg text-sm text-[#1C1A18] focus:ring-2 focus:ring-[#C04E24] focus:outline-none"
                    value={businessPhone}
                    onChange={(e) => setBusinessPhone(e.target.value)}
                    placeholder="+91 9876543210"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                  Registered Legal Business Address
                </label>
                <textarea
                  className="w-full border border-[#D5CFC9] px-3.5 py-2.5 rounded-lg text-sm text-[#1C1A18] focus:ring-2 focus:ring-[#C04E24] focus:outline-none h-20"
                  value={registeredAddress}
                  onChange={(e) => setRegisteredAddress(e.target.value)}
                  placeholder="Door No, Street Name, Tech Park..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">City</label>
                  <input
                    type="text"
                    className="w-full border border-[#D5CFC9] px-3.5 py-2 rounded-lg text-sm text-[#1C1A18] focus:ring-2 focus:ring-[#C04E24] focus:outline-none"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Bangalore"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">State</label>
                  <input
                    type="text"
                    className="w-full border border-[#D5CFC9] px-3.5 py-2 rounded-lg text-sm text-[#1C1A18] focus:ring-2 focus:ring-[#C04E24] focus:outline-none"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="Karnataka"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">PIN Code</label>
                  <input
                    type="text"
                    className="w-full border border-[#D5CFC9] px-3.5 py-2 rounded-lg text-sm text-[#1C1A18] focus:ring-2 focus:ring-[#C04E24] focus:outline-none"
                    value={pinCode}
                    onChange={(e) => setPinCode(e.target.value)}
                    placeholder="560100"
                    maxLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider mb-1.5">
                  Invoice Footer Terms / Declarations
                </label>
                <input
                  type="text"
                  className="w-full border border-[#D5CFC9] px-3.5 py-2 rounded-lg text-sm text-[#1C1A18] focus:ring-2 focus:ring-[#C04E24] focus:outline-none"
                  value={billingFooterText}
                  onChange={(e) => setBillingFooterText(e.target.value)}
                  placeholder="e.g. This is a computer generated invoice. No physical signature required."
                />
              </div>

              <div className="pt-4 border-t border-[#FAF8F5] flex justify-end">
                <button
                  type="submit"
                  disabled={savingBusiness}
                  className="px-6 py-2.5 bg-[#C04E24] hover:bg-[#A43D1A] text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save size={13} />
                  <span>{savingBusiness ? 'Saving...' : 'Save Fleet Business Profile'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tab 3: Portal Theme Customization & Brand Studio (Fleet Admin Only) */}
        {!isSuperAdmin && activeTab === 'THEME' && (
          <div className="bg-white rounded-xl border border-[#E0DAD1] p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#FAF8F5] gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-[#1C1A18] uppercase tracking-wider flex items-center gap-2">
                    <Palette size={16} className="text-[#C04E24]" />
                    <span>Portal Theming & Brand Studio</span>
                  </h2>
                  <span
                    className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      themeLevel === 'CUSTOM'
                        ? 'bg-purple-100 text-purple-800 border border-purple-300'
                        : themeLevel === 'PRESETS'
                        ? 'bg-teal-100 text-teal-800 border border-teal-300'
                        : 'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}
                  >
                    {themeLevel === 'CUSTOM'
                      ? 'Enterprise Studio (Full Custom)'
                      : themeLevel === 'PRESETS'
                      ? 'Pro Studio (Curated Presets)'
                      : 'Basic (Standard Theme)'}
                  </span>
                </div>
                <p className="text-xs text-[#7A7570] mt-1">
                  Customize the dynamic color palette, portal header accents, and portal title displayed across your fleet.
                </p>
              </div>

              {themeLevel === 'STANDARD' && (
                <button
                  type="button"
                  onClick={() => navigate('/billing/current')}
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 self-start"
                >
                  <Crown size={14} />
                  <span>Upgrade to Unlock Presets / Custom Theme</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>

            {/* Basic Plan Limit Banner */}
            {themeLevel === 'STANDARD' && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-900 text-xs">
                <Lock size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-950">
                    Standard Theme Locked for Basic Plan
                  </p>
                  <p className="text-amber-800/90 leading-relaxed">
                    Your current SaaS subscription uses the standard system theme (Terracotta Warmth). Theme customizer and color presets are unlocked on <strong>Pro</strong> (4 brand presets) and <strong>Enterprise</strong> (full live color studio & token editor).
                  </p>
                </div>
              </div>
            )}

            {/* Presets Gallery (Available on PRO and ENTERPRISE) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-[#1C1A18] uppercase tracking-wider">
                  Curated Brand Color Presets
                </label>
                {themeLevel === 'STANDARD' && (
                  <span className="text-[11px] font-semibold text-amber-700 bg-amber-100/60 px-2 py-0.5 rounded">
                    Preview only on Basic
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {Object.entries(THEME_PRESETS).map(([key, p]) => {
                  const isSelected = selectedPreset === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      disabled={themeLevel === 'STANDARD'}
                      onClick={() => handleSelectPreset(key)}
                      className={`p-3.5 rounded-xl border text-left transition relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#C04E24] bg-orange-50/40 ring-2 ring-[#C04E24]/20'
                          : 'border-[#E0DAD1] bg-white hover:border-slate-300'
                      } ${themeLevel === 'STANDARD' ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className="w-5 h-5 rounded-full border border-black/10 shadow-sm"
                          style={{ backgroundColor: p.primary }}
                        />
                        <span
                          className="w-5 h-5 rounded-full border border-black/10 shadow-sm -ml-2"
                          style={{ backgroundColor: p.secondary }}
                        />
                        <span className="text-xs font-bold text-[#1C1A18] ml-1">{p.name}</span>
                      </div>
                      <p className="text-[11px] text-[#7A7570] leading-snug">{p.desc}</p>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#C04E24] text-white flex items-center justify-center text-[9px] font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Pickers (ENTERPRISE ONLY) */}
            <div className="pt-4 border-t border-[#FAF8F5] space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-[#1C1A18] uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={14} className="text-purple-600" />
                    <span>Enterprise Custom Color & Token Editor</span>
                  </h3>
                  <p className="text-[11px] text-[#7A7570] mt-0.5">
                    Fine-tune exact brand hex colors and custom portal titles.
                  </p>
                </div>
                {themeLevel !== 'CUSTOM' && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                    Enterprise Exclusive
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] mb-1.5">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      disabled={themeLevel !== 'CUSTOM'}
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded border border-[#D5CFC9] p-0.5 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <input
                      type="text"
                      disabled={themeLevel !== 'CUSTOM'}
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full border border-[#D5CFC9] px-3 py-2 rounded-lg text-xs font-mono uppercase text-[#1C1A18] disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] mb-1.5">
                    Secondary Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      disabled={themeLevel !== 'CUSTOM'}
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded border border-[#D5CFC9] p-0.5 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <input
                      type="text"
                      disabled={themeLevel !== 'CUSTOM'}
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-full border border-[#D5CFC9] px-3 py-2 rounded-lg text-xs font-mono uppercase text-[#1C1A18] disabled:bg-slate-50 disabled:text-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1A18] mb-1.5">
                    Portal Window Title
                  </label>
                  <input
                    type="text"
                    disabled={themeLevel === 'STANDARD'}
                    value={portalTitle}
                    onChange={(e) => setPortalTitle(e.target.value)}
                    placeholder="e.g. Apex Express Fleet Operations"
                    className="w-full border border-[#D5CFC9] px-3 py-2 rounded-lg text-xs text-[#1C1A18] disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>
              </div>
            </div>

            {/* Live Theme Preview Bar */}
            <div
              className="rounded-xl p-4 text-white shadow-sm flex items-center justify-between"
              style={{
                background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center font-black text-sm">
                  FF
                </div>
                <div>
                  <div className="text-xs font-bold tracking-tight">{portalTitle || displayName || 'FleetFlow Portal'}</div>
                  <div className="text-[10px] text-white/80">Active Dynamic Brand Swatch</div>
                </div>
              </div>
              <div className="text-right text-[11px] font-mono opacity-90">
                {primaryColor} / {secondaryColor}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-4 border-t border-[#FAF8F5] flex items-center justify-end gap-3">
              {themeLevel !== 'STANDARD' ? (
                <button
                  type="button"
                  onClick={handleSaveTheme}
                  disabled={savingTheme}
                  className="px-6 py-2.5 bg-[#C04E24] hover:bg-[#A43D1A] text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save size={13} />
                  <span>{savingTheme ? 'Applying Theme...' : 'Save & Apply Theme'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/billing/current')}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition flex items-center gap-1.5"
                >
                  <Crown size={13} />
                  <span>Upgrade to Enable Brand Styling</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};

export default ProfileManagement;
