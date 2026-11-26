import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ScrollToTop from './components/ScrollToTop';
import { AuthProvider } from './context/AuthContext';
import { TenantProvider } from './context/TenantContext';
import PrivateRoute, { SuperAdminRoute } from './routes/PrivateRoutes';
import Login from './SuperAdmin/pages/Login/Login';
import Sidebar from './components/Sidebar';
import { showToast, AlertContainer } from './components/AlertBox';
import FleetLogin from './SuperAdmin/pages/Login/FleetLogin';
import SubscriptionRequiredModal from './components/SubscriptionRequiredModal';
import axiosInstance from './utils/axiosInstance';
import DemoViewPage from './components/Homepage/DemoViewPage';

// SaaS Tenants
import TenantList from './SuperAdmin/pages/Tenants/TenantList';
import AddTenant from './SuperAdmin/pages/Tenants/AddTenant';
import RegistrationsQueue from './SuperAdmin/pages/Tenants/RegistrationsQueue';
import SubscriptionCheckout from './SuperAdmin/pages/Billing/SubscriptionCheckout';
import FleetInspection from './SuperAdmin/pages/Tenants/FleetInspection';
import PlanManagement from './SuperAdmin/pages/Tenants/PlanManagement';
import TenantBillingHistory from './SuperAdmin/pages/Tenants/TenantBillingHistory';

// SaaS Subscriptions & Billing
import CurrentPlan from './SuperAdmin/pages/Billing/CurrentPlan';
import SubscriptionHistory from './SuperAdmin/pages/Billing/SubscriptionHistory';
import SuperAdminSubscriptionReports from './SuperAdmin/pages/Billing/SuperAdminSubscriptionReports';
import NotificationAuditLogs from './SuperAdmin/pages/Configuration/NotificationAuditLogs';
import ProfileManagement from './SuperAdmin/pages/Profile/ProfileManagement';

// SaaS Public Pages
import FleetRegistration from './components/Homepage/FleetRegistration';
import Pricing from './components/Homepage/Pricing';
import ActivateAccount from './components/Homepage/ActivateAccount';

// Dashboard
import Dashboard from './SuperAdmin/pages/Dashboard/Dashboard';

// Master
import AddTax from './SuperAdmin/pages/Master/Tax/AddTax';
import ListTax from './SuperAdmin/pages/Master/Tax/ListTax';
import AddPickupCity from './SuperAdmin/pages/Master/PickupCity/AddPickupCity';
import ListPickupCity from './SuperAdmin/pages/Master/PickupCity/ListPickupCity';
import PickupAreaAdd from './SuperAdmin/pages/Master/PickupArea/PickupAreaAdd';
import PickupAreaInfo from './SuperAdmin/pages/Master/PickupArea/PickupAreaInfo';
import AddCompany from './SuperAdmin/pages/Master/Company/AddCompany';
import ListCompany from './SuperAdmin/pages/Master/Company/ListCompany';
import EditCompany from './SuperAdmin/pages/Master/Company/EditCompany';
import AddPackage from './SuperAdmin/pages/Master/Package/AddPackage';
import ListPackage from './SuperAdmin/pages/Master/Package/ListPackage';

// Configuration
import Configuration from './SuperAdmin/pages/Configuration/Configuration';
import EmailConfiguration from './SuperAdmin/pages/Configuration/EmailConfiguration';
import EditEmail from './SuperAdmin/pages/Configuration/EditEmail';
import EditMainTemplate from './SuperAdmin/pages/Configuration/EditMainTemplate';
import SmsConfiguration from './SuperAdmin/pages/Configuration/SmsConfiguration';
import EditSms from './SuperAdmin/pages/Configuration/EditSms';
import SmsIntegrationSettings from './SuperAdmin/pages/Configuration/SmsIntegrationSettings';

// Payment Mode
import AddPaymentMode from './SuperAdmin/pages/PaymentMode/AddPaymentMode';
import ListPaymentMode from './SuperAdmin/pages/PaymentMode/ListPaymentMode';

// Vehicle
import AddVehicle from './SuperAdmin/pages/Vehicle/AddVehicle';
import AddVehicleType from './SuperAdmin/pages/Vehicle/VehicleType/AddVehicleType';
import ListVehicleType from './SuperAdmin/pages/Vehicle/VehicleType/ListVehicleType';
import AddVehicleModel from './SuperAdmin/pages/Vehicle/VehicleModel/AddVehicleModel';
import ListVehicleModel from './SuperAdmin/pages/Vehicle/VehicleModel/ListVehicleModel';
import AddVehicleMaster from './SuperAdmin/pages/Vehicle/VehicleMaster/AddVehicleMaster';
import ListVehicleMaster from './SuperAdmin/pages/Vehicle/VehicleMaster/ListVehicleMaster';

// Orders
import ConfirmPendingList from './SuperAdmin/pages/Orders/ConfirmPendingList';
import ViewConfirmPendingOrder from './SuperAdmin/pages/Orders/view/viewConfrimPendingList';
import EditConfirmPendingList from './SuperAdmin/pages/Orders/Edit/editConfirmPendingList';
import ClosePendingList from './SuperAdmin/pages/Orders/ClosePendingList';
import ViewClosePendingOrder from './SuperAdmin/pages/Orders/view/viewClosePendingList';
import ClosePendingOrderDetails from './SuperAdmin/pages/Orders/close/closePendingList';
import EditClosePendingOrder from './SuperAdmin/pages/Orders/Edit/editClosePendingList';
import PaymentPendingList from './SuperAdmin/pages/Orders/PaymentPendingList';
import ViewPaymentPendingList from './SuperAdmin/pages/Orders/view/viewPaymentPendingList';
import CompletedList from './SuperAdmin/pages/Orders/CompletedList';
import PaymentList from './SuperAdmin/pages/Orders/PaymentList';
import ViewPaymentList from './SuperAdmin/pages/Orders/view/viewPaymentList';
import ListCancelOrder from './SuperAdmin/pages/Orders/ListCancelOrder';

// Users
import UserList from './SuperAdmin/pages/Users/UserList';
import CreateInvoice from './SuperAdmin/pages/Users/Createinvoice';
import UserDetails from './SuperAdmin/pages/Users/UserDetails';

// Owners
import AddVendor from './SuperAdmin/pages/Vendors/AddVendor';
import ListVendor from './SuperAdmin/pages/Vendors/ListVendor';

// Drivers
import AddDriver from './SuperAdmin/pages/Drivers/AddDriver';
import ListDriver from './SuperAdmin/pages/Drivers/ListDriver';
import AssignedList from './SuperAdmin/pages/Drivers/ListAssignedTask';
import TripDetails from './SuperAdmin/pages/Drivers/TripDetails';

// Invoice
import PendingInvoices from './SuperAdmin/pages/Invoice/PendingInvoices';
import InvoiceReminder from './SuperAdmin/pages/Invoice/InvoiceReminder';
import PaymentForInvoices from './SuperAdmin/pages/Invoice/PaymentForInvoices';
import PaidInvoiceList from './SuperAdmin/pages/Invoice/PaidInvoiceList';
import AllInvoiceList from './SuperAdmin/pages/Invoice/AllInvoiceList';
import InvoicePayHolder from './SuperAdmin/pages/Invoice/InvoicePayHolder';

// Reports
import OrderSummary from './SuperAdmin/pages/Reports/OrderSummary';
import CompanyOrderSummary from './SuperAdmin/pages/Reports/CompanyOrderSummary';
import OverallInvoiceReport from './SuperAdmin/pages/Reports/OverallInvoiceReport';

// Cache
import Cache from './SuperAdmin/pages/Cache/Cache';
import Header from './components/Header';
import AddUser from './SuperAdmin/pages/Users/AddUser';
import ViewCancelOrder from './SuperAdmin/pages/Orders/view/viewListCancelOrder';
import ViewCompletedList from './SuperAdmin/pages/Orders/view/viewCompletedLis';
import PaymentSuccess from './SuperAdmin/pages/Invoice/PaymentSuccess';
import UserInvoiceDetails from './SuperAdmin/pages/Invoice/UserInvoiceDetails';
import UserInvoice from './SuperAdmin/pages/Users/UserInvoice';
import UserAccount from './SuperAdmin/pages/Users/UserAccount';
import UserLogin from './SuperAdmin/pages/Users/UserLogin';
import VehicleDetails from './SuperAdmin/pages/Users/UserVehicleDetails';
import UserAddressEditForm from './SuperAdmin/pages/Users/UserEditAddress';
import ConfirmPendingOrders from './SuperAdmin/pages/Users/List/ConfirmPending';
import PaymentPendingOrders from './SuperAdmin/pages/Users/List/PaymentPending';
import ClosePendingOrders from './SuperAdmin/pages/Users/List/ClosePending';
import CompletedOrders from './SuperAdmin/pages/Users/List/CompletedOrder';
import ViewConfirmPendingOrderList from './SuperAdmin/pages/Users/viewdetails/viewConfrimPendingList';
import ViewPaymentPending from './SuperAdmin/pages/Users/viewdetails/viewPaymentPendingList';
import ViewClosePendingOrderList from './SuperAdmin/pages/Users/viewdetails/viewClosePendingList';
import UserViewConfirmPendingOrder from './SuperAdmin/pages/Users/viewdetails/viewConfrimPendingList';
import UserViewClosePendingOrderList from './SuperAdmin/pages/Users/viewdetails/viewClosePendingList';
import UserViewPaymentPending from './SuperAdmin/pages/Users/viewdetails/viewPaymentPendingList';
import UserViewPaymentList from './SuperAdmin/pages/Users/viewdetails/viewPaymentList';
import UserViewCancelOrder from './SuperAdmin/pages/Users/viewdetails/viewListCancelOrder';
import UserViewCompletedList from './SuperAdmin/pages/Users/viewdetails/viewCompletedLis';
import MyAccount from './SuperAdmin/pages/Users/MyAccount';
import HowItWorks from './SuperAdmin/pages/Users/HowItWorks';
import MyorderDetails from './SuperAdmin/pages/Users/BookingHistory/MyorderDetails';
import MycancelorderDetails from './SuperAdmin/pages/Users/BookingHistory/MycancelorderDetails';
import MypaymentHistory from './SuperAdmin/pages/Users/BookingHistory/MypaymentHistory';
import MyPendingInvoices from './SuperAdmin/pages/Users/BookingHistory/MypendingInvoices';
import MyInvoices from './SuperAdmin/pages/Users/BookingHistory/MyInvoices';
import ManagerUserList from './SuperAdmin/pages/Users/List/ManagerUserList';
import UserViewDetails from './SuperAdmin/pages/Users/List/UserViewDetails';
import ForgotPassword from './SuperAdmin/pages/Login/ForgetPasword';
import CompanyHeader from './SuperAdmin/pages/Users/List/CompanyHeader';
import ManagerAddUser from './SuperAdmin/pages/Users/ManagerAddUser';
// import GraceCab from './SuperAdmin/pages/Homepage/home';
import PaymentReturn from './SuperAdmin/pages/Payment/PaymentReturn';
import TravelHeader from './SuperAdmin/pages/Users/header';
// import TermsAndConditions from './SuperAdmin/pages/Homepage/Selections/TermsAndConditions';
// import PrivacyPolicy from './SuperAdmin/pages/Homepage/Selections/PrivacyPolicy';
// import CancelReservation from './SuperAdmin/pages/Homepage/Selections/CancelReservation';
// import SimpleHeader from './SuperAdmin/pages/Homepage/Selections/simpleheader';
import HomePage from './components/PublicSite/HomePage';
import AboutPage from './components/PublicSite/AboutPage';
import ServicesPage from './components/PublicSite/ServicesPage';
import PortfolioPage from './components/PublicSite/PortfolioPage';
import ContactPage from './components/PublicSite/ContactPage';
import PublicBookingWizard from './components/PublicSite/PublicBookingWizard';
import TermsAndConditions from './components/Homepage/TermsAndConditions';
import PrivacyPolicy from './components/Homepage/PrivacyPolicy';
import CancelReservation from './components/Homepage/CancelReservation';
import SimpleHeader from './components/Homepage/simpleheader';
import PartnerRegistrationForm from './components/Homepage/fromdata';
import Monthlybooking from './SuperAdmin/pages/Users/Bookings/monthlybooking';
import MonthlyReport from './SuperAdmin/pages/Users/Bookings/monthlyreport';
import PaymentForMonthlyInvoices from './SuperAdmin/pages/Invoice/PaymentForMonthlyInvoices';
import UploadUsers from './SuperAdmin/pages/uploadfile/uploadfile';
import Oncallinvoice from './SuperAdmin/pages/Users/Bookings/oncallbooking';
import OnCallInvoiceView from './SuperAdmin/pages/Orders/view/Oncallinvoiceview';
import SubscriptionLockModal from './components/SubscriptionLockModal';

const Layout = () => {
  const role = localStorage.getItem("role");
  const isDemoView = localStorage.getItem("isDemoMode") === "true" || localStorage.getItem("isDemoView") === "true" || role === "demo";
  const [subModalOpen, setSubModalOpen] = React.useState(false);
  const [subModalDetail, setSubModalDetail] = React.useState<any>({});
  const [lockModalOpen, setLockModalOpen] = React.useState(false);
  const [lockModalDetail, setLockModalDetail] = React.useState<any>({});

  React.useEffect(() => {
    // If not superadmin or demo, proactively check subscription lock status on mounting/layout render
    const checkLockStatus = async () => {
      const token = localStorage.getItem("token");
      if (!token || role === "superadmin" || isDemoView) return;

      try {
        const res = await axiosInstance.get('/tenants/current/subscription-lock-status');
        if (res.data?.isLocked) {
          setLockModalDetail(res.data);
          setLockModalOpen(true);
        }
      } catch (err: any) {
        // If 403 returned directly with SUBSCRIPTION_PAYMENT_REQUIRED
        const data = err.response?.data;
        if (data?.code === 'SUBSCRIPTION_PAYMENT_REQUIRED' || data?.isLocked) {
          setLockModalDetail(data);
          setLockModalOpen(true);
        }
      }
    };

    checkLockStatus();

    const handleSubRequired = (event: any) => {
      const detail = event?.detail || {};
      if (detail.isLocked) {
        setLockModalDetail(detail);
        setLockModalOpen(true);
      } else {
        setSubModalDetail(detail);
        setSubModalOpen(true);
      }
    };

    const handleDemoReadOnly = (event: any) => {
      const msg = event?.detail?.message || "You're viewing the CABZ Demo Preview. Register your fleet and start your free trial to access operational features.";
      showToast(msg, 'warn');
    };

    // Universal action guard for Demo View: block operational write/mutate actions
    const handleDemoActionCapture = (e: MouseEvent) => {
      if (!isDemoView) return;
      const pathname = (window.location.pathname || '').toLowerCase();
      // NEVER block anything on login, registration or public auth pages
      if (/^\/(login|adminlogin|forgetpasword|activate|register-fleet|company)/.test(pathname) || pathname.includes('/login')) {
        return;
      }

      const target = e.target as HTMLElement;
      if (!target) return;
      const buttonOrAction = target.closest('button, input[type="submit"], [role="button"], a');
      if (!buttonOrAction) return;

      const text = (buttonOrAction.textContent || '').trim().toLowerCase();
      const href = buttonOrAction.getAttribute('href') || '';

      // Allow navigation links across all preview menus and auth actions
      const isAllowedAction = href.includes('register') || href.includes('login') || href.includes('home') ||
        text.includes('sign in') || text.includes('log in') || text.includes('login') ||
        text.includes('exit demo') || text.includes('start 7-day') || text.includes('free trial') || text.includes('documentation');
      if (isAllowedAction) return;

      // Allow menu navigation (Task 2: "allow navigation across all preview menus")
      if (buttonOrAction.tagName.toLowerCase() === 'a' && !href.includes('javascript') && href.length > 0 && !text.includes('delete') && !text.includes('remove') && !text.includes('dispatch')) {
        return;
      }

      // Allow modal dismiss / close actions
      if (text === '×' || text === '✕' || text === 'close' || text === 'cancel' || buttonOrAction.getAttribute('data-action') === 'close') {
        return;
      }

      // Check operational write/mutate action keywords inside demo session
      const isMutateAction = /^(add|create|new|edit|update|delete|remove|save|confirm order|assign driver|close order|close pending|record payment|generate invoice|upload|import|export|dispatch|terminate|suspend|activate)/i.test(text)
        || (buttonOrAction.getAttribute('title') || '').toLowerCase().includes('delete')
        || (buttonOrAction.getAttribute('aria-label') || '').toLowerCase().includes('delete');

      if (isMutateAction) {
        e.preventDefault();
        e.stopPropagation();
        showToast("You're viewing the CABZ Demo Preview. Register your fleet and start your free trial to access operational features.", 'warn');
      }
    };

    window.addEventListener('fleetflow:subscription_required', handleSubRequired);
    window.addEventListener('cabz:demo_read_only', handleDemoReadOnly);
    if (isDemoView) {
      document.addEventListener('click', handleDemoActionCapture, true);
    }

    return () => {
      window.removeEventListener('fleetflow:subscription_required', handleSubRequired);
      window.removeEventListener('cabz:demo_read_only', handleDemoReadOnly);
      document.removeEventListener('click', handleDemoActionCapture, true);
    };
  }, [role, isDemoView]);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* {role !== "manager" &&<Sidebar />} */}
      {role !== "user" && role !== "manager" && <Sidebar />}

      <AlertContainer />
      <SubscriptionLockModal
        isOpen={lockModalOpen}
        lockReason={lockModalDetail.lockReason}
        subscriptionStatus={lockModalDetail.subscriptionStatus}
        planTier={lockModalDetail.planTier}
        billingCycle={lockModalDetail.billingCycle}
        payableAmount={lockModalDetail.payableAmount}
        baseAmount={lockModalDetail.baseAmount}
        taxAmount={lockModalDetail.taxAmount}
        periodEnd={lockModalDetail.periodEnd}
        message={lockModalDetail.message}
        onPaymentSuccess={() => {
          setLockModalOpen(false);
          window.location.reload();
        }}
      />
      <SubscriptionRequiredModal
        isOpen={subModalOpen}
        onClose={() => setSubModalOpen(false)}
        title={subModalDetail.title}
        message={subModalDetail.message}
        isExpired={subModalDetail.isExpired}
        resource={subModalDetail.resource}
        current={subModalDetail.current}
        limit={subModalDetail.limit}
        planTier={subModalDetail.planTier}
      />
      <main
        className={`flex-1 bg-gray-100 p-2 overflow-auto ${
          role !== "manager" ? "ml-74" : ""
        }`}
      >
        {isDemoView && (
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white px-4 py-2.5 text-xs font-semibold flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md sticky top-0 z-40 rounded-xl mb-3 border border-purple-400/30">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-yellow-400 text-slate-950 font-black rounded text-[10px] uppercase tracking-wider shadow-sm">
                Demo Preview Mode
              </span>
              <span>
                CABZ Fleet Operations Demo Preview • Read-Only. Register your fleet and start your 7-day free trial to unlock full operations.
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => {
                  localStorage.removeItem('isDemoMode');
                  localStorage.removeItem('isDemoView');
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  localStorage.removeItem('role');
                  localStorage.removeItem('tenantId');
                  window.location.href = '/register-fleet';
                }}
                className="px-3 py-1 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-lg shadow-sm transition text-xs"
              >
                Start 7-Day Free Trial
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('isDemoMode');
                  localStorage.removeItem('isDemoView');
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  localStorage.removeItem('role');
                  localStorage.removeItem('tenantId');
                  window.location.href = '/';
                }}
                className="px-2.5 py-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition text-xs"
              >
                Exit Demo
              </button>
            </div>
          </div>
        )}

        {role === "manager" ? <TravelHeader /> : <Header />}

        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/" element={<Dashboard />} />
          {/* SaaS Multi-Tenant Routes (SuperAdmin Only) */}
          <Route path="/tenants/list" element={<SuperAdminRoute><TenantList /></SuperAdminRoute>} />
          <Route path="/tenants/add" element={<SuperAdminRoute><AddTenant /></SuperAdminRoute>} />
          <Route path="/tenants/plans" element={<SuperAdminRoute><PlanManagement /></SuperAdminRoute>} />
          <Route path="/tenants/inspect/:tenantId" element={<SuperAdminRoute><FleetInspection /></SuperAdminRoute>} />
          <Route path="/tenants/overview/:tenantId" element={<SuperAdminRoute><FleetInspection /></SuperAdminRoute>} />
          <Route path="/tenants/billing-history/:tenantId" element={<SuperAdminRoute><TenantBillingHistory /></SuperAdminRoute>} />
          <Route path="/tenants/registrations" element={<SuperAdminRoute><RegistrationsQueue /></SuperAdminRoute>} />
          <Route path="/admin/registrations" element={<SuperAdminRoute><RegistrationsQueue /></SuperAdminRoute>} />
          <Route path="/admin/billing" element={<SuperAdminRoute><SubscriptionCheckout /></SuperAdminRoute>} />
          <Route path="/admin/billing/reports" element={<SuperAdminRoute><SuperAdminSubscriptionReports /></SuperAdminRoute>} />
          <Route path="/admin/notifications/audit" element={<SuperAdminRoute><NotificationAuditLogs /></SuperAdminRoute>} />
          <Route path="/admin/notifications/audit-logs" element={<SuperAdminRoute><NotificationAuditLogs /></SuperAdminRoute>} />
          <Route path="/admin/configuration/email" element={<SuperAdminRoute><EmailConfiguration /></SuperAdminRoute>} />

          {/* SaaS Tenant Subscriptions & Billing Routes */}
          <Route path="/billing" element={<CurrentPlan />} />
          <Route path="/billing/checkout" element={<SubscriptionCheckout />} />
          <Route path="/billing/current" element={<CurrentPlan />} />
          <Route path="/billing/history" element={<SubscriptionHistory />} />
          <Route path="/subscription/current" element={<CurrentPlan />} />
          <Route path="/subscription/history" element={<SubscriptionHistory />} />

          {/* Profile Management Routes */}
          <Route path="/profile" element={<ProfileManagement />} />
          <Route path="/settings/profile" element={<ProfileManagement />} />
          {/* Master Routes */}
          <Route path="/master/tax/add" element={<AddTax />} />
          <Route path="/master/tax/list" element={<ListTax />} />
          <Route path="/master/pickupcity/add" element={<AddPickupCity />} />
          <Route path="/master/pickupcity/list" element={<ListPickupCity />} />
          <Route path="/master/pickuparea/add" element={<PickupAreaAdd />} />
          <Route path="/master/pickuparea/info" element={<PickupAreaInfo />} />
          <Route path="/master/company/add" element={<AddCompany />} />
          <Route path="/master/company/list" element={<ListCompany />} />
          <Route path="/company/edit/:companyId" element={<EditCompany />} />
          <Route path="/master/package/add" element={<AddPackage />} />
          <Route path="/master/package/list" element={<ListPackage />} />
          {/* Configuration Routes (Accessible by SuperAdmin and Fleet Admin) */}
          <Route path="/configuration/master" element={<Configuration />} />
          <Route path="/configuration/email" element={<EmailConfiguration />} />
          <Route path="/email/configurations" element={<EmailConfiguration />} />
          <Route path="/email/configurations/edit/:id" element={<EditEmail />} />
          <Route path="/email/configurations/edit-main-template" element={<EditMainTemplate />} />
          <Route path="/configuration/sms" element={<SmsConfiguration />} />
          <Route path="/sms/configurations" element={<SmsConfiguration />} />
          <Route path="/sms/configurations/edit/:id" element={<EditSms />} />
          <Route path="/configuration/sms-integration" element={<SmsIntegrationSettings />} />
          <Route path="/settings/sms" element={<SmsIntegrationSettings />} />
          <Route path="/sms/integration" element={<SmsIntegrationSettings />} />
          {/* Payment Mode Routes */}
          <Route path="/paymentmode/add" element={<AddPaymentMode />} />
          <Route path="/paymentmode/list" element={<ListPaymentMode />} />
          {/* Vehicle Routes */}
          <Route path="/vehicle/add" element={<AddVehicle />} />
          <Route path="/vehicle/vehicletype/add" element={<AddVehicleType />} />
          <Route path="/vehicle/vehicletype/list" element={<ListVehicleType />} />
          <Route path="/vehicle/vehiclemodel/add" element={<AddVehicleModel />} />
          <Route path="/vehicle/vehiclemodel/list" element={<ListVehicleModel />} />
          <Route path="/vehicle/vehiclemaster/add" element={<AddVehicle />} />
          <Route path="/vehicle/vehiclemaster/list" element={<ListVehicleMaster />} />
          {/* Orders Routes */}
          <Route path="/orders/confirmpending" element={<ConfirmPendingList />} />
          <Route path="/orders/view/confirm-pending-order/:bookingId" element={<ViewConfirmPendingOrder />} />
          <Route path="/orders/confirmpending/:bookingId" element={<EditConfirmPendingList />} />
          <Route path="/orders/closepending" element={<ClosePendingList />} />
          <Route path="/orders/view/close-pending-order/:bookingId" element={<ViewClosePendingOrder />} />
          {/* <Route path="/orders/close/close-pending-order/:bookingId" element={<ClosePendingOrderDetails />} /> */}
          <Route path="/orders/close/close-pending-order/:bookingCode" element={<ClosePendingOrderDetails />} />
          <Route path="/orders/edit/close-pending-order/:bookingId" element={<EditClosePendingOrder />} />
          <Route path="/orders/paymentpending" element={<PaymentPendingList />} />
          <Route path="/orders/view/payment-pending-order/:bookingId" element={<ViewPaymentPendingList />} />
<Route path="/orders/view/completed-list/:bookingId" element={<ViewCompletedList />} />
<Route path="/orders/oncall-invoice/:onCallBillId" element={<OnCallInvoiceView />} />
          <Route path="/orders/completed" element={<CompletedList />} />
          <Route path="/orders/paymentlist" element={<PaymentList />} />
          <Route path="/orders/view/payment-list/:paymentId" element={<ViewPaymentList />} />
          <Route path="/orders/cancelled" element={<ListCancelOrder />} />
          <Route path="/orders/view/cancelled-order/:bookingId" element={<ViewCancelOrder />} />
          {/* Users Routes */}
          <Route path="/users/adduser" element={<AddUser />} />
          <Route path="/users/list" element={<UserList />} />

          <Route path="/users/userdetails/:userId" element={<UserDetails />} />
           {/* Booking  */}
          <Route path="/booking/monthlybooking" element={<Monthlybooking/>} />
          <Route path="/booking/monthlyreport" element={<MonthlyReport/>} />
          <Route path="/booking/oncallinvoice" element={<Oncallinvoice/>} />

<Route
  path="/booking/oncallinvoice/edit/:onCallBillId"
  element={<Oncallinvoice />}
/>
          {/* Owners Routes */}
          <Route path="/vendors/add" element={<AddVendor />} />
          <Route path="/vendors/list" element={<ListVendor />} />
          {/* Drivers Routes */}
          <Route path="/drivers/add" element={<AddDriver />} />
          <Route path="/drivers/list" element={<ListDriver />} />
          <Route path="/drivers/assignedlist" element={<AssignedList />} />
          <Route path="/drivers/tripdetails" element={<TripDetails />} />
          {/* Invoice Routes */}
          <Route path="/invoice/pending" element={<PendingInvoices />} />
          <Route path="/invoice/reminder" element={<InvoiceReminder />} />
          <Route path="/invoice/paymentfor" element={<PaymentForInvoices />} />
           <Route path="/invoice/paymentformonthly" element={<PaymentForMonthlyInvoices />} />
          <Route path="/invoice/paid" element={<PaidInvoiceList />} />
          <Route path="/invoice/all" element={<AllInvoiceList />} />
          <Route path="/invoice/payholder" element={<InvoicePayHolder />} />
          <Route path="/paymentsuccess" element={<PaymentSuccess/>} />
          {/* Reports Routes */}
          <Route path="/reports/order-summary" element={<OrderSummary />} />
          <Route path="/reports/company-order-summary" element={<CompanyOrderSummary />} />
          <Route path="/reports/overall-invoice-report" element={<OverallInvoiceReport />} />
          {/* Cache Route */}
          <Route path="/cache" element={<Cache />} />
          <Route path="/uploads" element={<UploadUsers />} />
          {/* Fallback Route */}
          <Route path="*" element={<div className="text-xl">Welcome! Select a menu item.</div>} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    
    <AuthProvider>
      <TenantProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
          {/* Public Website Routes & Aliases */}
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/contact" element={<ContactPage />} />

          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/privacypolicy" element={<PrivacyPolicy />} />
          <Route path="/PrivacyPolicy" element={<PrivacyPolicy />} />

          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
          <Route path="/TermsAndConditions" element={<TermsAndConditions />} />

          <Route path="/cancel-reservation" element={<CancelReservation />} />
          <Route path="/CancelReservation" element={<CancelReservation />} />

          <Route path="/simpleheader" element={<SimpleHeader />} />
          <Route path="/fromdata" element={<PartnerRegistrationForm />} />

          {/* SaaS Fleet Public Portal Routes */}
          <Route path="/register-fleet" element={<FleetRegistration />} />
          <Route path="/register" element={<FleetRegistration />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/activate-account" element={<ActivateAccount />} />
          <Route path="/activate" element={<ActivateAccount />} />
          <Route path="/demo" element={<DemoViewPage />} />
          <Route path="/demo-view" element={<DemoViewPage />} />

          {/* Public Cab Booking Routes */}
          <Route path="/book" element={<PublicBookingWizard />} />
          <Route path="/book-a-cab" element={<PublicBookingWizard />} />
          <Route path="/book-a-ride" element={<PublicBookingWizard />} />
          <Route path="/book-cab" element={<PublicBookingWizard />} />
          <Route path="/fleet/:slug/book" element={<PublicBookingWizard />} />
          <Route path="/:slug/book" element={<PublicBookingWizard />} />

          {/* Auth Routes */}
          <Route path="/adminlogin" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/login/:slug" element={<FleetLogin />} />
          <Route path="/:slug/login" element={<FleetLogin />} />
          <Route path="/forgetpasword" element={<ForgotPassword />} />

          <Route path="/managerusers/list/:id" element={<ManagerUserList />} />
          <Route path="/users/userviewdetails/:userId" element={<UserViewDetails />} />
          {/* Two-Slug Company User Login & Registration */}
          <Route path="/company/:fleetSlug/:companySlug" element={<UserLogin />} />
          <Route path="/Company/:fleetSlug/:companySlug" element={<UserLogin />} />
          <Route path="/company/:fleetSlug/:companySlug/managerAddUser" element={<ManagerAddUser />} />
          <Route path="/Company/:fleetSlug/:companySlug/managerAddUser" element={<ManagerAddUser />} />
          {/* Backward compatibility: single-slug */}
          <Route path="/company/:seoUrl" element={<UserLogin />} />
          <Route path="/Company/:seoUrl" element={<UserLogin />} />
          <Route path="/invoice/user-invoice-details/:userId" element={<UserInvoiceDetails />} />
        <Route path="/users/userinvoice/:id" element={<UserInvoice />} />
                  <Route path="/users/createinvoice/:id" element={<CreateInvoice />} />

          <Route path="/users/useraccount/:id" element={<UserAccount />} />
          <Route path="/users/uservehicledetails/:id" element={<VehicleDetails />} />
          <Route path="/Users/UserEditAddressForm/:id" element={<UserAddressEditForm />} />
<Route path="/user/confirm-pending" element={<ConfirmPendingOrders />} />
<Route path="/user/payment-pending" element={<PaymentPendingOrders />} />
<Route path="/user/close-pending" element={<ClosePendingOrders />} />
<Route path="/user/completed" element={<CompletedOrders />} />
<Route path="/users/view/confirm-pending-orderlist/:bookingId" element={<UserViewConfirmPendingOrder />} />

          <Route path="/users/view/close-pending-orderlist/:bookingId" element={<UserViewClosePendingOrderList />} />

          <Route path="/users/view/payment-pending-orderlist/:bookingId" element={< UserViewPaymentPending />} />
          <Route path="/users/view/payment-list/:bookingId" element={<UserViewPaymentList />} />

          <Route path="/users/view/cancelled-order/:bookingId" element={<UserViewCancelOrder />} />

<Route path="/users/view/completed-lists/:bookingId" element={<UserViewCompletedList />} />

<Route path="/users/myaccount" element={<MyAccount />} />

<Route path="/user/howitworks" element={<HowItWorks />} />

<Route path="/company/:seoUrl/managerAddUser" element={<ManagerAddUser />} />
<Route path="/Company/:seoUrl/managerAddUser" element={<ManagerAddUser />} />


           <Route path="/Users/BookingHistory/MyorderDetails/:id" element={<MyorderDetails />} />
            <Route path="/Users/BookingHistory/MycancelorderDetails/:id" element={<MycancelorderDetails />} />
             <Route path="/Users/BookingHistory/MypaymentHistory/:id" element={<MypaymentHistory />} />
              <Route path="/Users/BookingHistory/MypendingInvoices/:id" element={<MyPendingInvoices />} />
               <Route path="/Users/BookingHistory/MyInvoices/:id" element={<MyInvoices />} />
               <Route path="/payments/return" element={<PaymentReturn />} />
               {/* Protected Routes (Dashboard & Admin) */}
               <Route path="/*" element={<PrivateRoute><Layout /></PrivateRoute>} />
               {/* Public Fallback Route for any unmatched route */}
               <Route path="*" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
      </TenantProvider>
    </AuthProvider>
  );
};

export default App;