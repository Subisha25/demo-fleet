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
  Eye,
  EyeOff,
  Edit3,
  Calendar,
  Layers,
} from 'lucide-react';

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const SAC_REGEX = /^[0-9]{6}$/;
const PIN_REGEX = /^[0-9]{6}$/;

const BASE_URL = config.baseurl.apibaseurl;

const ProfileManagement: React.FC = () => {
  const navigate = useNavigate();
  const { refreshTenant } = useTenant();
  const [activeTab, setActiveTab] = useState<'FLEET' | 'PERSONAL' | 'THEME'>('FLEET');
  const [loading, setLoading] = useState(true);
  const [isEditingFleet, setIsEditingFleet] = useState(false);
  const [savingFleet, setSavingFleet] = useState(false);
  const [savingPersonal, setSavingPersonal] = useState(false);
  const [savingTheme, setSavingTheme] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const role = (localStorage.getItem('role') || '').toLowerCase().trim();
  const isSuperAdmin = role === 'superadmin' || role === 'platform_admin';

  // Personal Profile fields (SuperAdmin & Staff User)
  const [personalName, setPersonalName] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [personalPhone, setPersonalPhone] = useState('');
  const [userRole, setUserRole] = useState('');
  const [address, setAddress] = useState('');
  const [gstinProfile, setGstinProfile] = useState('');
  const [profileImage, setProfileImage] = useState('');

  const [initialPersonalData, setInitialPersonalData] = useState({
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
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  // Fleet Profile fields (Populated from Register Fleet form / Tenant model)
  const [displayName, setDisplayName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [businessCode, setBusinessCode] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [registeredAddress, setRegisteredAddress] = useState('');
  const [gstin, setGstin] = useState('');
  const [panNumber, setPanNumber] = useState('');
  const [sacCode, setSacCode] = useState('996609');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pinCode, setPinCode] = useState('');
  const [website, setWebsite] = useState('');
  const [billingFooterText, setBillingFooterText] = useState('');

  // Protected SaaS Entitlement fields (Strictly Read-Only)
  const [tenantId, setTenantId] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState('ACTIVE');
  const [planTier, setPlanTier] = useState('PRO');
  const [trialStartDate, setTrialStartDate] = useState('');
  const [trialEndsAt, setTrialEndsAt] = useState('');
  const [trialDurationDays, setTrialDurationDays] = useState(7);

  // Snapshot for Fleet Profile Cancel
  const [fleetSnapshot, setFleetSnapshot] = useState({
    displayName: '',
    legalName: '',
    businessCode: '',
    logoUrl: '',
    ownerName: '',
    contactEmail: '',
    contactPhone: '',
    registeredAddress: '',
    gstin: '',
    panNumber: '',
    sacCode: '996609',
    city: '',
    state: '',
    pinCode: '',
    website: '',
    billingFooterText: '',
  });

  // Theming & SaaS Entitlement state
  const [themeLevel, setThemeLevel] = useState<'STANDARD' | 'PRESETS' | 'CUSTOM'>('STANDARD');
  const [tenantPlanTier, setTenantPlanTier] = useState<string>('BASIC');
  const [primaryColor, setPrimaryColor] = useState<string>('#5B3DF5');
  const [secondaryColor, setSecondaryColor] = useState<string>('#1C1A18');
  const [portalTitle, setPortalTitle] = useState<string>('');
  const [selectedPreset, setSelectedPreset] = useState<string>('indigo');

  const THEME_PRESETS: Record<string, { name: string; primary: string; secondary: string; desc: string }> = {
    indigo: {
      name: 'Indigo Modern',
      primary: '#5B3DF5',
      secondary: '#0B0B0F',
      desc: 'Platform canonical high-contrast vibrant indigo brand',
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
    terracotta: {
      name: 'Terracotta Warmth',
      primary: '#C04E24',
      secondary: '#1C1A18',
      desc: 'Warm earthen terracotta brand style',
    },
  };

  const fetchProfile = async () => {
    try {
      setLoading(true);

      // 1. Fetch user personal details
      try {
        const userRes = await axiosInstance.get('/user/profile');
        if (userRes.data?.success && userRes.data?.profile) {
          const p = userRes.data.profile;
          setPersonalName(p.name || '');
          setPersonalEmail(p.email || '');
          setPersonalPhone(p.phone || '');
          setUserRole(p.role || role);
          setAddress(p.address || '');
          setGstinProfile(p.gstin || '');
          setProfileImage(p.profileImage || '');

          setInitialPersonalData({
            name: p.name || '',
            phone: p.phone || '',
            address: p.address || '',
            gstin: p.gstin || '',
            profileImage: p.profileImage || '',
          });
        }
      } catch (e) {
        console.warn('Could not fetch user personal profile:', e);
      }

      // 2. Fetch authenticated tenant profile (Registration data source of truth)
      if (!isSuperAdmin) {
        const tenantRes = await axiosInstance.get('/tenants/current/profile');
        if (tenantRes.data?.success && tenantRes.data?.tenant) {
          const t = tenantRes.data.tenant;
          const loadedDisplayName = t.displayName || t.name || '';
          const loadedLegalName = t.legalName || t.name || '';
          const loadedCode = t.businessCode || t.code || '';
          const loadedLogo = t.logoUrl || t.brandingTokens?.logoUrl || '';
          const loadedOwner = t.ownerName || '';
          const loadedContactEmail = t.contactEmail || '';
          const loadedContactPhone = t.contactPhone || '';
          const loadedAddress = t.registeredAddress || '';
          const loadedGstin = t.gstin || '';
          const loadedPan = t.panNumber || '';
          const loadedSac = t.sacCode || '996609';
          const loadedCity = t.city || '';
          const loadedState = t.state || '';
          const loadedPin = t.pinCode || '';
          const loadedWebsite = t.website || '';
          const loadedFooter = t.billingFooterText || '';

          setDisplayName(loadedDisplayName);
          setLegalName(loadedLegalName);
          setBusinessCode(loadedCode);
          setLogoUrl(loadedLogo);
          setOwnerName(loadedOwner);
          setContactEmail(loadedContactEmail);
          setContactPhone(loadedContactPhone);
          setRegisteredAddress(loadedAddress);
          setGstin(loadedGstin);
          setPanNumber(loadedPan);
          setSacCode(loadedSac);
          setCity(loadedCity);
          setState(loadedState);
          setPinCode(loadedPin);
          setWebsite(loadedWebsite);
          setBillingFooterText(loadedFooter);

          // Subscription & Entitlements
          setTenantId(t.tenantId || '');
          const isTrialTenant = (t.subscription?.status || t.status) === 'TRIALING';
          setSubscriptionStatus(t.subscription?.status || t.status || 'ACTIVE');
          setPlanTier(t.subscription?.planTier || t.planTier || (isTrialTenant ? 'FREE_TRIAL' : 'NONE'));
          setTrialStartDate(t.subscription?.trialStartDate || '');
          setTrialEndsAt(t.subscription?.trialEndsAt || '');
          setTrialDurationDays(t.subscription?.trialDurationDays || 7);

          setFleetSnapshot({
            displayName: loadedDisplayName,
            legalName: loadedLegalName,
            businessCode: loadedCode,
            logoUrl: loadedLogo,
            ownerName: loadedOwner,
            contactEmail: loadedContactEmail,
            contactPhone: loadedContactPhone,
            registeredAddress: loadedAddress,
            gstin: loadedGstin,
            panNumber: loadedPan,
            sacCode: loadedSac,
            city: loadedCity,
            state: loadedState,
            pinCode: loadedPin,
            website: loadedWebsite,
            billingFooterText: loadedFooter,
          });

          // Branding Tokens
          setPrimaryColor(t.brandingTokens?.primaryColor || '#5B3DF5');
          setSecondaryColor(t.brandingTokens?.secondaryColor || '#0B0B0F');
          setPortalTitle(t.brandingTokens?.portalTitle || loadedDisplayName);
        }

        // 3. Fetch dynamic entitlements for theme customization tier
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

  // Save Fleet Business Profile
  const handleSaveFleetProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      showToast('Fleet display name is required.', 'error');
      return;
    }

    if (contactPhone.trim()) {
      const cleanPhone = contactPhone.replace(/\D/g, '');
      if (cleanPhone.length < 10) {
        showToast('Please enter a valid 10-digit contact mobile number.', 'error');
        return;
      }
    }

    if (gstin.trim() && !GSTIN_REGEX.test(gstin.trim().toUpperCase())) {
      showToast('Invalid GSTIN format. Expected 15-character Indian GSTIN (e.g. 33AAMCG2518C1Z0).', 'error');
      return;
    }

    if (panNumber.trim() && !PAN_REGEX.test(panNumber.trim().toUpperCase())) {
      showToast('Invalid PAN format. Expected 10-character alphanumeric PAN (e.g. AAMCG2518C).', 'error');
      return;
    }

    if (sacCode.trim() && !SAC_REGEX.test(sacCode.trim())) {
      showToast('Invalid SAC code. Expected 6 digits (e.g. 996609).', 'error');
      return;
    }

    if (pinCode.trim() && !PIN_REGEX.test(pinCode.trim())) {
      showToast('Invalid PIN code. Expected 6 digits.', 'error');
      return;
    }

    try {
      setSavingFleet(true);
      const payload = {
        displayName: displayName.trim(),
        legalName: legalName.trim(),
        ownerName: ownerName.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        registeredAddress: registeredAddress.trim(),
        gstin: gstin.trim().toUpperCase(),
        panNumber: panNumber.trim().toUpperCase(),
        sacCode: sacCode.trim(),
        city: city.trim(),
        state: state.trim(),
        pinCode: pinCode.trim(),
        website: website.trim(),
        billingFooterText: billingFooterText.trim(),
        logoUrl: logoUrl.trim(),
      };

      const res = await axiosInstance.put('/tenants/current/profile', payload);
      if (res.data && res.data.success) {
        showToast('Fleet profile updated successfully! Header & Sidebar updated.', 'success');
        setFleetSnapshot({
          displayName: displayName.trim(),
          legalName: legalName.trim(),
          businessCode,
          logoUrl: logoUrl.trim(),
          ownerName: ownerName.trim(),
          contactEmail: contactEmail.trim(),
          contactPhone: contactPhone.trim(),
          registeredAddress: registeredAddress.trim(),
          gstin: gstin.trim().toUpperCase(),
          panNumber: panNumber.trim().toUpperCase(),
          sacCode: sacCode.trim(),
          city: city.trim(),
          state: state.trim(),
          pinCode: pinCode.trim(),
          website: website.trim(),
          billingFooterText: billingFooterText.trim(),
        });
        localStorage.setItem('fleetName', displayName.trim());
        setIsEditingFleet(false);
        // Instant sync with Header and Sidebar across the platform
        await refreshTenant();
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to update fleet profile.', 'error');
    } finally {
      setSavingFleet(false);
    }
  };

  const handleCancelFleetProfile = () => {
    setDisplayName(fleetSnapshot.displayName);
    setLegalName(fleetSnapshot.legalName);
    setLogoUrl(fleetSnapshot.logoUrl);
    setOwnerName(fleetSnapshot.ownerName);
    setContactEmail(fleetSnapshot.contactEmail);
    setContactPhone(fleetSnapshot.contactPhone);
    setRegisteredAddress(fleetSnapshot.registeredAddress);
    setGstin(fleetSnapshot.gstin);
    setPanNumber(fleetSnapshot.panNumber);
    setSacCode(fleetSnapshot.sacCode);
    setCity(fleetSnapshot.city);
    setState(fleetSnapshot.state);
    setPinCode(fleetSnapshot.pinCode);
    setWebsite(fleetSnapshot.website);
    setBillingFooterText(fleetSnapshot.billingFooterText);
    setIsEditingFleet(false);
    showToast('Changes discarded. Profile restored to saved state.', 'info');
  };

  // Upload Fleet Brand Logo
  const handleLogoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Only JPEG, PNG, and WebP images are allowed.', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      showToast('Logo file size exceeds maximum limit of 2MB.', 'error');
      return;
    }

    try {
      setUploadingLogo(true);
      const formData = new FormData();
      formData.append('logo', file);

      const res = await axiosInstance.post('/tenants/current/logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data && res.data.success) {
        const newLogoUrl = res.data.logoUrl || res.data.tenant?.logoUrl;
        setLogoUrl(newLogoUrl);
        setFleetSnapshot((prev) => ({ ...prev, logoUrl: newLogoUrl }));
        showToast('Fleet logo uploaded and saved successfully!', 'success');
        await refreshTenant();
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to upload fleet logo.', 'error');
    } finally {
      setUploadingLogo(false);
      if (logoInputRef.current) {
        logoInputRef.current.value = '';
      }
    }
  };

  // Personal Profile Handlers
  const handleCancelPersonal = () => {
    setPersonalName(initialPersonalData.name);
    setPersonalPhone(initialPersonalData.phone);
    setAddress(initialPersonalData.address);
    setGstinProfile(initialPersonalData.gstin);
    setProfileImage(initialPersonalData.profileImage);
    showToast('Changes discarded. Profile restored to saved state.', 'info');
  };

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!personalName.trim()) {
      showToast('Name is required.', 'error');
      return;
    }

    const digitsOnly = personalPhone.replace(/\D/g, '');
    if (personalPhone.trim() && (digitsOnly.length < 10 || digitsOnly.length > 12)) {
      showToast('Please enter a valid 10-digit mobile number.', 'error');
      return;
    }

    if (gstinProfile.trim() && !GSTIN_REGEX.test(gstinProfile.trim().toUpperCase())) {
      showToast('Invalid GSTIN format. Expected 15-character Indian GSTIN.', 'error');
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
        showToast('Personal profile updated successfully!', 'success');
        setInitialPersonalData({
          name: personalName.trim(),
          phone: personalPhone.trim(),
          address: address.trim(),
          gstin: gstinProfile.trim().toUpperCase(),
          profileImage,
        });
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to update personal profile details.', 'error');
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
        setInitialPersonalData((prev) => ({ ...prev, profileImage: res.data.imageUrl }));
        showToast('Profile photo updated successfully!', 'success');
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

  // Theme Presets Handlers
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
        if (portalTitle) document.title = `${portalTitle} — CABZ`;
        await refreshTenant();
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to save theme settings.', 'error');
    } finally {
      setSavingTheme(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="p-16 text-center text-slate-500 text-sm">
          <RefreshCw className="animate-spin inline-block mr-2" size={18} />
          Loading authenticated profile...
        </div>
      </PageLayout>
    );
  }

  const getImageSrc = (imgPath: string) => {
    if (!imgPath) return '';
    if (imgPath.startsWith('http://') || imgPath.startsWith('https://') || imgPath.startsWith('data:')) return imgPath;
    return `${BASE_URL}${imgPath.startsWith('/') ? '' : '/'}${imgPath}`;
  };

  const getFleetInitials = (name?: string, code?: string) => {
    if (code && code.trim().length > 0 && code !== 'FF' && code !== 'CZ' && code !== 'ALL') {
      return code.trim().slice(0, 3).toUpperCase();
    }
    if (!name) return 'FL';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const initials = getFleetInitials(displayName || legalName, businessCode);

  return (
    <PageLayout>
      <AlertContainer />
      <div className="py-6 max-w-6xl mx-auto space-y-6">
        {/* Profile Management Header Banner */}
        <div className="bg-[#0B0B0F] border-b-4 border-[#5B3DF5] rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#5B3DF5]/20 text-[#C4B5FD] border border-[#5B3DF5]/40 text-[11px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
                Tenant Identity & Profile
              </span>
              <span className="text-gray-300 text-xs">
                {isSuperAdmin ? 'Platform Root Administration' : `Code: ${businessCode || 'FL'}`}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-3">
              <span>{isSuperAdmin ? 'SuperAdmin Profile' : (displayName || 'Fleet Profile & Business Identity')}</span>
            </h1>
            <p className="text-xs text-gray-300 max-w-2xl">
              {isSuperAdmin
                ? 'Manage platform administrator credentials, verified mobile contact, office address, and profile image.'
                : 'Authoritative fleet business identity automatically populated from your initial registration. Used across dispatch slips, monthly GST invoices, and platform badges.'}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {!isSuperAdmin && activeTab === 'FLEET' && (
              !isEditingFleet ? (
                <button
                  type="button"
                  id="edit-fleet-profile-btn"
                  onClick={() => setIsEditingFleet(true)}
                  className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2"
                >
                  <Edit3 size={14} />
                  <span>Edit Fleet Profile</span>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCancelFleetProfile}
                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                </div>
              )
            )}
            <button
              type="button"
              onClick={fetchProfile}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl border border-white/10 transition flex items-center gap-1.5"
            >
              <RefreshCw size={13} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Tab Selection */}
        {!isSuperAdmin && (
          <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-xs flex flex-wrap gap-2">
            <button
              type="button"
              id="tab-fleet-profile"
              onClick={() => setActiveTab('FLEET')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
                activeTab === 'FLEET'
                  ? 'bg-[#5B3DF5] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Building size={14} /> Fleet Business Profile & Legal
            </button>
            <button
              type="button"
              id="tab-personal-profile"
              onClick={() => setActiveTab('PERSONAL')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
                activeTab === 'PERSONAL'
                  ? 'bg-[#5B3DF5] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <User size={14} /> Account Credentials & Security
            </button>
            <button
              type="button"
              id="tab-theme-profile"
              onClick={() => setActiveTab('THEME')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition flex items-center gap-2 ${
                activeTab === 'THEME'
                  ? 'bg-[#5B3DF5] text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Palette size={14} /> Brand Theming & Color Studio
            </button>
          </div>
        )}

        {/* TAB 1: FLEET BUSINESS PROFILE (FLEET ADMIN ONLY) */}
        {!isSuperAdmin && activeTab === 'FLEET' && (
          <div className="space-y-6">
            {/* Overview Identity & Logo Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                {/* Logo Preview & Upload */}
                <div className="relative group shrink-0">
                  <div className="w-24 h-24 rounded-2xl border-2 border-gray-200 p-1 bg-gray-50 shadow-inner flex items-center justify-center overflow-hidden">
                    {logoUrl ? (
                      <img
                        src={getImageSrc(logoUrl)}
                        alt={displayName || 'Fleet Logo'}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-700 flex items-center justify-center font-black text-white text-2xl shadow-sm">
                        {initials}
                      </div>
                    )}
                  </div>
                  <input
                    type="file"
                    ref={logoInputRef}
                    onChange={handleLogoFileChange}
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    disabled={uploadingLogo}
                    title="Change Fleet Logo"
                    className="absolute -bottom-2 -right-2 p-2 bg-[#5B3DF5] hover:bg-[#4326C6] text-white rounded-full shadow-md border-2 border-white transition flex items-center justify-center disabled:opacity-50"
                  >
                    {uploadingLogo ? (
                      <RefreshCw size={13} className="animate-spin" />
                    ) : (
                      <Camera size={13} />
                    )}
                  </button>
                </div>

                {/* Identity Summary & Status Badges */}
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                      {displayName || 'Fleet Mobility Portal'}
                    </h2>
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200">
                      Code: {businessCode || 'FL'}
                    </span>
                    <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <CheckCircle size={12} />
                      {subscriptionStatus === 'TRIALING' ? '7-Day Free Trial' : subscriptionStatus}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 font-medium flex items-center justify-center sm:justify-start gap-2">
                    <Building size={13} className="text-gray-400" />
                    <span>Legal Entity: <strong>{legalName || displayName}</strong></span>
                  </p>

                  <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg border border-gray-300 transition flex items-center gap-1.5"
                    >
                      <Upload size={12} />
                      <span>{uploadingLogo ? 'Uploading Logo...' : 'Upload Official Brand Logo (PNG, JPEG)'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Editable Profile Form */}
            <form onSubmit={handleSaveFleetProfile} className="space-y-6">
              {/* Section 1: Fleet Details */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
                      1
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                        Fleet Brand & Identity
                      </h3>
                      <p className="text-xs text-gray-500">
                        Public branding shown to customers and platform operations.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Fleet Display Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingFleet}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="e.g. Apex Cabs"
                      required
                      className="w-full border border-gray-300 disabled:bg-gray-50 disabled:text-gray-600 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#5B3DF5] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Legal Registered Entity Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingFleet}
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      placeholder="e.g. Apex Mobility Solutions Pvt Ltd"
                      required
                      className="w-full border border-gray-300 disabled:bg-gray-50 disabled:text-gray-600 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#5B3DF5] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Business Code</span>
                      <span className="text-[10px] text-gray-400 font-normal flex items-center gap-0.5">
                        <Lock size={10} /> Read-Only
                      </span>
                    </label>
                    <input
                      type="text"
                      disabled
                      value={businessCode}
                      className="w-full border border-gray-200 bg-gray-100/80 px-3.5 py-2.5 rounded-xl text-sm font-mono font-bold text-gray-600 cursor-not-allowed uppercase"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Tax & Legal Details */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                        Tax & Statutory Identifiers
                      </h3>
                      <p className="text-xs text-gray-500">
                        Indian GST, PAN, SAC Code, and official registered address for invoices.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      GSTIN Number (15 Digits)
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingFleet}
                      value={gstin}
                      onChange={(e) => setGstin(e.target.value.toUpperCase())}
                      placeholder="33AAMCG2518C1Z0"
                      maxLength={15}
                      className="w-full border border-gray-300 disabled:bg-gray-50 disabled:text-gray-600 px-3.5 py-2.5 rounded-xl text-sm font-mono text-gray-900 focus:ring-2 focus:ring-[#5B3DF5] focus:outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      PAN Number (10 Characters)
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingFleet}
                      value={panNumber}
                      onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
                      placeholder="AAMCG2518C"
                      maxLength={10}
                      className="w-full border border-gray-300 disabled:bg-gray-50 disabled:text-gray-600 px-3.5 py-2.5 rounded-xl text-sm font-mono text-gray-900 focus:ring-2 focus:ring-[#5B3DF5] focus:outline-none uppercase"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      SAC Code (Passenger Transport)
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingFleet}
                      value={sacCode}
                      onChange={(e) => setSacCode(e.target.value)}
                      placeholder="996609"
                      maxLength={6}
                      className="w-full border border-gray-300 disabled:bg-gray-50 disabled:text-gray-600 px-3.5 py-2.5 rounded-xl text-sm font-mono text-gray-900 focus:ring-2 focus:ring-[#5B3DF5] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Registered Office Address
                  </label>
                  <textarea
                    disabled={!isEditingFleet}
                    value={registeredAddress}
                    onChange={(e) => setRegisteredAddress(e.target.value)}
                    placeholder="Enter registered commercial address..."
                    className="w-full border border-gray-300 disabled:bg-gray-50 disabled:text-gray-600 px-3.5 py-2.5 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-[#5B3DF5] focus:outline-none h-20"
                  />
                </div>
              </div>

              {/* Section 3: Admin & Contact Information */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
                      3
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                        Administrator & Operations Contact
                      </h3>
                      <p className="text-xs text-gray-500">
                        Owner name, official contact phone, and correspondence email.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Owner / Admin Name
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingFleet}
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full border border-gray-300 disabled:bg-gray-50 disabled:text-gray-600 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#5B3DF5] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Official Contact Email <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      disabled={!isEditingFleet}
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="contact@fleet.com"
                      required
                      className="w-full border border-gray-300 disabled:bg-gray-50 disabled:text-gray-600 px-3.5 py-2.5 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-[#5B3DF5] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Official Contact Phone / Mobile <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingFleet}
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="9876543210"
                      maxLength={15}
                      required
                      className="w-full border border-gray-300 disabled:bg-gray-50 disabled:text-gray-600 px-3.5 py-2.5 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-[#5B3DF5] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 4: Operating Location */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
                <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 font-bold">
                      4
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                        Operating Region & Location
                      </h3>
                      <p className="text-xs text-gray-500">
                        Primary city, state and PIN code of fleet operations.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Primary Operating City
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingFleet}
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="e.g. Coimbatore"
                      className="w-full border border-gray-300 disabled:bg-gray-50 disabled:text-gray-600 px-3.5 py-2.5 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-[#5B3DF5] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Operating State
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingFleet}
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. Tamil Nadu"
                      className="w-full border border-gray-300 disabled:bg-gray-50 disabled:text-gray-600 px-3.5 py-2.5 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-[#5B3DF5] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      PIN Code (6 Digits)
                    </label>
                    <input
                      type="text"
                      disabled={!isEditingFleet}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value)}
                      placeholder="641001"
                      maxLength={6}
                      className="w-full border border-gray-300 disabled:bg-gray-50 disabled:text-gray-600 px-3.5 py-2.5 rounded-xl text-sm font-mono text-gray-900 focus:ring-2 focus:ring-[#5B3DF5] focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Section 5: Protected SaaS & Subscription Status (Strictly Read-Only) */}
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Shield size={18} className="text-indigo-600" />
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                      Protected SaaS Subscription & Platform Governance
                    </h3>
                  </div>
                  <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                    <Lock size={12} /> Non-Editable by Fleet Operator
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Tenant ID</span>
                    <span className="text-xs font-mono font-bold text-slate-800 break-all select-all">{tenantId || '—'}</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Subscription Status</span>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-300">
                      {subscriptionStatus === 'TRIALING' ? 'TRIAL ACTIVE' : subscriptionStatus}
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Entitled Plan Tier</span>
                    <span className="text-xs font-bold text-slate-900">
                      {subscriptionStatus === 'TRIALING' ? '7-Day Free Trial (All Features)' : `${planTier} Plan`}
                    </span>
                  </div>

                  <div className="bg-white p-3.5 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Trial / Period Expiry</span>
                    <span className="text-xs font-semibold text-slate-800">
                      {trialEndsAt ? new Date(trialEndsAt).toLocaleDateString('en-IN') : 'Active Lifecycle'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Edit Mode */}
              {isEditingFleet && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handleCancelFleetProfile}
                    disabled={savingFleet}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
                  >
                    Cancel Changes
                  </button>
                  <button
                    type="submit"
                    id="save-fleet-profile-btn"
                    disabled={savingFleet}
                    className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-700 hover:from-indigo-700 hover:to-purple-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save size={14} />
                    <span>{savingFleet ? 'Saving Changes...' : 'Save Fleet Profile'}</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* TAB 2 / SUPERADMIN: PERSONAL OPERATOR DETAILS & CREDENTIALS */}
        {(isSuperAdmin || activeTab === 'PERSONAL') && (
          <div className="space-y-6">
            {/* Personal Avatar Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <div className="relative group">
                  <div className="w-24 h-24 rounded-full border-4 border-gray-100 shadow-inner overflow-hidden bg-slate-100 flex items-center justify-center">
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
                    className="absolute bottom-0 right-0 p-2 bg-[#5B3DF5] hover:bg-[#4326C6] text-white rounded-full shadow-md border-2 border-white transition flex items-center justify-center disabled:opacity-50"
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
                    <h2 className="text-xl font-bold text-gray-900">{personalName || 'Operator'}</h2>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <Shield size={12} />
                      {isSuperAdmin ? 'SuperAdmin (Platform Root)' : userRole}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1.5">
                    <Mail size={13} className="text-[#5B3DF5]" />
                    {personalEmail}
                  </p>
                  <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1.5">
                    <Phone size={13} className="text-[#5B3DF5]" />
                    {personalPhone ? personalPhone : 'No mobile registered'}
                  </p>
                  <div className="pt-2 flex flex-wrap gap-2 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingImage}
                      className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-lg border border-gray-300 transition flex items-center gap-1.5"
                    >
                      <Upload size={12} />
                      <span>{uploadingImage ? 'Uploading...' : 'Change Photo (JPEG, PNG, WebP)'}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Details Form */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-5">
              <div className="pb-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <User size={16} className="text-[#5B3DF5]" />
                    <span>{isSuperAdmin ? 'SuperAdmin Credentials & Contact' : 'Staff Account Profile'}</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {isSuperAdmin
                      ? 'The verified contact number here is used dynamically for platform notifications.'
                      : 'Your personal staff account credentials for logging into CABZ.'}
                  </p>
                </div>
              </div>

              <form onSubmit={handleSavePersonal} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-gray-900 focus:ring-2 focus:ring-[#5B3DF5] focus:outline-none"
                      value={personalName}
                      onChange={(e) => setPersonalName(e.target.value)}
                      placeholder="Operator Name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Login Email Address</span>
                      <span className="text-[10px] text-gray-400 font-normal flex items-center gap-0.5">
                        <Lock size={10} /> Locked
                      </span>
                    </label>
                    <input
                      type="email"
                      disabled
                      className="w-full border border-gray-200 bg-gray-100 px-3.5 py-2.5 rounded-xl text-sm text-gray-600 cursor-not-allowed"
                      value={personalEmail}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                      Verified Contact Mobile <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      className="w-full border border-gray-300 px-3.5 py-2.5 rounded-xl text-sm text-gray-900 focus:ring-2 focus:ring-[#5B3DF5] focus:outline-none"
                      value={personalPhone}
                      onChange={(e) => setPersonalPhone(e.target.value)}
                      placeholder="9876543210"
                      maxLength={15}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                      <span>Assigned Platform Role</span>
                      <span className="text-[10px] text-gray-400 font-normal flex items-center gap-0.5">
                        <Lock size={10} /> System Assigned
                      </span>
                    </label>
                    <input
                      type="text"
                      disabled
                      className="w-full border border-gray-200 bg-gray-100 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-gray-600 cursor-not-allowed uppercase"
                      value={userRole}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleCancelPersonal}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
                  >
                    Reset
                  </button>
                  <button
                    type="submit"
                    disabled={savingPersonal}
                    className="px-5 py-2 bg-[#5B3DF5] hover:bg-[#4326C6] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Save size={13} />
                    <span>{savingPersonal ? 'Saving...' : 'Save Personal Details'}</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Change Password Card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Key size={16} className="text-[#5B3DF5]" />
                    <span>Security & Password Management</span>
                  </h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Update your account password with current credentials.
                  </p>
                </div>
                {!showPasswordSection && (
                  <button
                    type="button"
                    onClick={() => setShowPasswordSection(true)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold rounded-xl transition flex items-center gap-1.5"
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
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Current Password
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          placeholder="Current password"
                          required
                          className="w-full border border-gray-300 px-3.5 py-2.5 rounded-xl text-sm text-gray-900 pr-10 focus:ring-2 focus:ring-[#5B3DF5] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min 6 characters"
                          minLength={6}
                          required
                          className="w-full border border-gray-300 px-3.5 py-2.5 rounded-xl text-sm text-gray-900 pr-10 focus:ring-2 focus:ring-[#5B3DF5] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Confirm New Password
                      </label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm new password"
                          minLength={6}
                          required
                          className="w-full border border-gray-300 px-3.5 py-2.5 rounded-xl text-sm text-gray-900 pr-10 focus:ring-2 focus:ring-[#5B3DF5] focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
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
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={changingPassword}
                      className="px-5 py-2 bg-[#5B3DF5] hover:bg-[#4326C6] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Key size={13} />
                      <span>{changingPassword ? 'Updating...' : 'Update Password'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: BRAND THEMING & COLOR STUDIO */}
        {!isSuperAdmin && activeTab === 'THEME' && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-gray-100 gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Palette size={16} className="text-[#5B3DF5]" />
                    <span>Portal Theming & Brand Studio</span>
                  </h2>
                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
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
                <p className="text-xs text-gray-500 mt-1">
                  Customize the dynamic color palette, portal header accents, and portal title displayed across your fleet portal.
                </p>
              </div>

              {themeLevel === 'STANDARD' && (
                <button
                  type="button"
                  onClick={() => navigate('/billing/current')}
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 self-start"
                >
                  <Crown size={14} />
                  <span>Upgrade to Unlock Presets / Custom Theme</span>
                  <ArrowRight size={13} />
                </button>
              )}
            </div>

            {/* Presets Gallery */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-gray-900 uppercase tracking-wider">
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
                          ? 'border-[#5B3DF5] bg-purple-50/40 ring-2 ring-[#5B3DF5]/20'
                          : 'border-gray-200 bg-white hover:border-gray-300'
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
                        <span className="text-xs font-bold text-gray-900 ml-1">{p.name}</span>
                      </div>
                      <p className="text-[11px] text-gray-500 leading-snug">{p.desc}</p>
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#5B3DF5] text-white flex items-center justify-center text-[9px] font-bold">
                          ✓
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Pickers (ENTERPRISE ONLY) */}
            <div className="pt-4 border-t border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles size={14} className="text-purple-600" />
                    <span>Enterprise Custom Color & Token Editor</span>
                  </h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
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
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Primary Brand Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      disabled={themeLevel !== 'CUSTOM'}
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300 p-0.5 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <input
                      type="text"
                      disabled={themeLevel !== 'CUSTOM'}
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded-xl text-xs font-mono uppercase text-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Secondary Accent Color
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      disabled={themeLevel !== 'CUSTOM'}
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-10 h-10 rounded border border-gray-300 p-0.5 cursor-pointer disabled:cursor-not-allowed"
                    />
                    <input
                      type="text"
                      disabled={themeLevel !== 'CUSTOM'}
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-full border border-gray-300 px-3 py-2 rounded-xl text-xs font-mono uppercase text-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1.5">
                    Portal Window Title
                  </label>
                  <input
                    type="text"
                    disabled={themeLevel === 'STANDARD'}
                    value={portalTitle}
                    onChange={(e) => setPortalTitle(e.target.value)}
                    placeholder="e.g. Apex Express Fleet Operations"
                    className="w-full border border-gray-300 px-3 py-2 rounded-xl text-xs text-gray-900 disabled:bg-gray-50 disabled:text-gray-400"
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
                  {initials}
                </div>
                <div>
                  <div className="text-xs font-bold tracking-tight">{portalTitle || displayName || 'CABZ Portal'}</div>
                  <div className="text-[10px] text-white/80">Active Dynamic Brand Swatch</div>
                </div>
              </div>
              <div className="text-right text-[11px] font-mono opacity-90">
                {primaryColor} / {secondaryColor}
              </div>
            </div>

            {/* Save Theme Button */}
            <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-3">
              {themeLevel !== 'STANDARD' ? (
                <button
                  type="button"
                  onClick={handleSaveTheme}
                  disabled={savingTheme}
                  className="px-6 py-2.5 bg-[#5B3DF5] hover:bg-[#4326C6] text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Save size={13} />
                  <span>{savingTheme ? 'Applying Theme...' : 'Save & Apply Theme'}</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('/billing/current')}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition flex items-center gap-1.5"
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
