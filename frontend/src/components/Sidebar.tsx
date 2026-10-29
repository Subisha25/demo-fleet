import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTachometerAlt, faCogs, faMoneyCheckAlt, faCar, faClipboardList,
  faUsers, faUserTie, faUserSecret, faFileInvoice, faChartBar, faDatabase,
  faChevronDown, faChevronRight, faPlus, faList, faEnvelope, faCity,
  faBuilding, faBoxOpen, faMapMarkerAlt, faReceipt, faBell, faCheckCircle,
  faTimesCircle, faUser, faUserPlus, faUserFriends, faTruck, faCarSide,
  faCarAlt, faMoneyBillWave, faCashRegister, faClipboardCheck, faFileAlt,
  faCrown, faUserPen,
  faCalendarAlt,
  faCalendarCheck,
  faFileLines,
  faComments,
  faSms
} from '@fortawesome/free-solid-svg-icons';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useTenant } from '../context/TenantContext';
import { FleetFlowLogo } from './FleetFlowLogo';

// Interface for menu items
interface MenuItem {
  label: string;
  path?: string;
  icon: any;
  children?: MenuItem[];
}

// Menu items
const menu: MenuItem[] = [
  {
    label: 'Dashboard',
    icon: faTachometerAlt,
    path: '/dashboard',
  },
  {
    label: 'SaaS Tenants',
    icon: faBuilding,
    children: [
      { label: 'Fleet Operators', path: '/tenants/list', icon: faList },
      { label: 'Registration Queue', path: '/tenants/registrations', icon: faClipboardCheck },
      { label: 'SaaS Plans', path: '/tenants/plans', icon: faCrown },
      { label: 'Provision Tenant', path: '/tenants/add', icon: faPlus },
      { label: 'Corporate Policies', path: '/tenants/policies', icon: faClipboardList },
      { label: 'Subscription & Billing', path: '/admin/billing', icon: faReceipt },
      { label: 'Subscription Reports', path: '/admin/billing/reports', icon: faReceipt },
      { label: 'Notification Logs', path: '/admin/notifications/audit', icon: faBell },
    ],
  },
  {
    label: 'Master',
    icon: faCrown,
    children: [
      {
        label: 'Tax',
        icon: faList,
        children: [
          { label: 'Add Tax', path: '/master/tax/add', icon: faPlus },
          { label: 'List Tax', path: '/master/tax/list', icon: faList },
        ],
      },
      {
        label: 'Pickup Area',
        icon: faMapMarkerAlt,
        children: [
          { label: 'Add Pickup Area', path: '/master/pickuparea/add', icon: faPlus },
          { label: 'Pickup Area Info', path: '/master/pickuparea/info', icon: faList },
        ],
      },
      {
        label: 'Pickup City',
        icon: faCity,
        children: [
          { label: 'Add Pickup City', path: '/master/pickupcity/add', icon: faPlus },
          { label: 'List Pickup City', path: '/master/pickupcity/list', icon: faList },
        ],
      },
      {
        label: 'Company',
        icon: faBuilding,
        children: [
          { label: 'Add Company', path: '/master/company/add', icon: faPlus },
          { label: 'List Company', path: '/master/company/list', icon: faList },
        ],
      },
      {
        label: 'Package',
        icon: faBoxOpen,
        children: [
          { label: 'Add Package', path: '/master/package/add', icon: faPlus },
          { label: 'List Package', path: '/master/package/list', icon: faList },
        ],
      },
    ],
  },
  {
    label: 'Configuration',
    icon: faCogs,
    children: [
      { label: 'SMS Integration', path: '/configuration/sms-integration', icon: faComments },
      { label: 'Settings', path: '/configuration/master', icon: faCogs },
      { label: 'Email Templates', path: '/configuration/email', icon: faEnvelope },
      { label: 'SMS Templates', path: '/configuration/sms', icon: faFileLines },
    ],
  },
  {
    label: 'Payment Mode',
    icon: faMoneyCheckAlt,
    children: [
      { label: 'Add Payment Mode', path: '/paymentmode/add', icon: faPlus },
      { label: 'List Payment Mode', path: '/paymentmode/list', icon: faList },
    ],
  },
  {
    label: 'Vehicle',
    icon: faCar,
    children: [
      { label: 'Add Vehicle', path: '/vehicle/add', icon: faPlus },
      { label: 'Vehicle List', path: '/vehicle/vehiclemaster/list', icon: faTruck },
    ],
  },
  {
    label: 'Orders',
    icon: faClipboardList,
    children: [
      { label: 'Confirm Pending', path: '/orders/confirmpending', icon: faClipboardCheck },
      { label: 'Close Pending', path: '/orders/closepending', icon: faTimesCircle },
      { label: 'Payment Pending', path: '/orders/paymentpending', icon: faMoneyBillWave },
      { label: 'Completed Order', path: '/orders/completed', icon: faCheckCircle },
      { label: 'Payment List', path: '/orders/paymentlist', icon: faCashRegister },
      { label: 'Cancelled Order', path: '/orders/cancelled', icon: faTimesCircle },
    ],
  },
  {
    label: 'Users',
    icon: faUsers,
    children: [
      { label: 'Add User', path: '/users/adduser', icon: faUserPlus },
      { label: 'User List', path: '/users/list', icon: faUserFriends },
    ],
  },
  {
    label: 'Owners',
    icon: faUserTie,
    children: [
      { label: 'Add Owner', path: '/vendors/add', icon: faUserPlus },
      { label: 'List Owner', path: '/vendors/list', icon: faList },
    ],
  },
  {
    label: 'Drivers',
    icon: faUserSecret,
    children: [
      { label: 'Add Driver', path: '/drivers/add', icon: faUserPlus },
      { label: 'Driver List', path: '/drivers/list', icon: faList },
      { label: 'Assigned List', path: '/drivers/assignedlist', icon: faClipboardCheck },
    ],
  },
  {
    label: 'Invoice',
    icon: faFileInvoice,
    children: [
      { label: 'Pending Invoices', path: '/invoice/pending', icon: faClipboardList },
      { label: 'Invoice Reminder', path: '/invoice/reminder', icon: faReceipt },
      { label: 'Payment For Invoices', path: '/invoice/paymentfor', icon: faMoneyBillWave },
      { label: 'Payment For Monthly', path: '/invoice/paymentformonthly', icon: faMoneyBillWave },
      { label: 'Paid Invoices', path: '/invoice/paid', icon: faCheckCircle },
      { label: 'All Invoices', path: '/invoice/all', icon: faFileAlt },
    ],
  },
  {
    label: 'Reports',
    icon: faChartBar,
    children: [
      { label: 'Booking Summary', path: '/reports/order-summary', icon: faFileAlt },
      { label: 'Company Booking Summary', path: '/reports/company-order-summary', icon: faBuilding },
      { label: 'Overall Invoice Report', path: '/reports/overall-invoice-report', icon: faReceipt },
    ],
  },
  {
    label: 'Billing & Plans',
    icon: faReceipt,
    children: [
      { label: 'Current Plan', path: '/billing/current', icon: faCrown },
      { label: 'Upgrade Plan', path: '/billing/checkout', icon: faMoneyBillWave },
      { label: 'Billing History', path: '/billing/history', icon: faReceipt },
    ],
  },
  {
    label: 'Profile',
    icon: faUser,
    path: '/profile',
  },
  {
    label: 'Cache',
    icon: faDatabase,
    path: '/cache',
  },
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const role = (localStorage.getItem('role') || 'User').toLowerCase();
  const isSuperAdmin = role === 'superadmin';
  const isInspecting = Boolean(localStorage.getItem('inspectingTenantId'));

  const tenantName = localStorage.getItem('tenantName') || 'FleetFlow Operator';

  const toggleDropdown = (label: string) => {
    setOpenDropdown((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const superAdminConfigurationItem: MenuItem = {
    label: 'Configuration',
    icon: faCogs,
    children: [
      { label: 'SMS Integration', path: '/configuration/sms-integration', icon: faComments },
      { label: 'Platform Email Templates', path: '/admin/configuration/email', icon: faEnvelope },
      { label: 'Notification Audit Logs', path: '/admin/notifications/audit-logs', icon: faBell },
      { label: 'Platform Settings', path: '/configuration/master', icon: faCogs },
    ],
  };

  const visibleMenu = isSuperAdmin
    ? [
        ...menu.filter((item) => item.label === 'Dashboard' || item.label === 'SaaS Tenants'),
        superAdminConfigurationItem,
        ...menu.filter((item) => item.label === 'Profile' || item.label === 'Cache'),
      ]
    : menu.filter((item) => item.label !== 'SaaS Tenants');

  return (
    <aside
      className={`fixed left-0 top-0 h-screen flex flex-col shadow-2xl transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-72'}
        z-40 bg-[#0B0B0F] text-gray-200 border-r border-[#1F1F2E]
      `}
    >
      {/* Brand Header */}
      <div className="sticky top-0 z-10 bg-[#0B0B0F] border-b border-[#1F1F2E] px-4 py-3.5">
        <div className="flex items-center gap-3">
          {collapsed ? (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-700 flex items-center justify-center font-black text-white text-lg shadow-md shadow-purple-900/30">
              FF
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <FleetFlowLogo size="sm" variant="light" showTagline={false} />
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="mt-2.5 pt-2.5 border-t border-[#1F1F2E] flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-200 truncate max-w-[150px]">
              {isSuperAdmin && !isInspecting ? 'FleetFlow SaaS Platform' : (currentTenant?.name || tenantName)}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-950/70 text-purple-300 border border-purple-700/50 uppercase tracking-wider">
              {isSuperAdmin && !isInspecting ? 'Platform Admin' : `${currentTenant?.planTier || 'PRO'} Plan`}
            </span>
          </div>
        )}
        {!collapsed && isInspecting && (
          <div className="mt-2 p-2 bg-amber-950/50 border border-amber-500/50 rounded-lg text-amber-200 text-xs">
            <div className="font-bold flex items-center justify-between">
              <span>🔍 Inspection Mode</span>
              <button
                onClick={() => navigate('/tenants/list')}
                className="text-[10px] bg-amber-500/30 hover:bg-amber-500/50 text-amber-100 px-1.5 py-0.5 rounded transition"
              >
                Back to Tenants
              </button>
            </div>
            <div className="truncate text-[11px] text-amber-300/80 mt-0.5">
              {currentTenant?.name}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent py-3 px-2 text-gray-300">
        <ul className="space-y-1">
          {visibleMenu.map((item) => (
            <li key={item.label}>
              {item.children ? (
                <>
                  {/* Parent Menu Item */}
                  <button
                    className={`flex items-center w-full px-3.5 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium ${
                      collapsed ? 'justify-center' : ''
                    } hover:bg-white/5 hover:text-white ${
                      openDropdown.includes(item.label) ? 'text-white bg-white/5' : 'text-gray-300'
                    }`}
                    onClick={() => toggleDropdown(item.label)}
                  >
                    <FontAwesomeIcon icon={item.icon} className={`text-base ${collapsed ? '' : 'mr-3 text-purple-400'}`} />
                    {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                    {!collapsed && (
                      <FontAwesomeIcon
                        icon={openDropdown.includes(item.label) ? faChevronDown : faChevronRight}
                        className="ml-auto text-xs text-gray-500"
                      />
                    )}
                  </button>

                  {/* Submenu Dropdown */}
                  {openDropdown.includes(item.label) && !collapsed && (
                    <ul className="ml-5 pl-2 mt-1 space-y-1 border-l border-[#1F1F2E]">
                      {item.children.map((subItem) => (
                        <li key={subItem.label}>
                          {subItem.children ? (
                            <>
                              <button
                                className="flex items-center w-full px-3 py-2 rounded-md text-xs font-medium text-gray-300 hover:bg-white/5 hover:text-white transition-colors duration-150"
                                onClick={() => toggleDropdown(`${item.label}-${subItem.label}`)}
                              >
                                <FontAwesomeIcon icon={subItem.icon} className="mr-2 text-xs text-purple-400" />
                                <span className="flex-1 text-left">{subItem.label}</span>
                                <FontAwesomeIcon
                                  icon={openDropdown.includes(`${item.label}-${subItem.label}`) ? faChevronDown : faChevronRight}
                                  className="text-[10px] text-gray-500"
                                />
                              </button>

                              {openDropdown.includes(`${item.label}-${subItem.label}`) && (
                                <ul className="ml-4 pl-2 mt-1 space-y-1 border-l border-[#1F1F2E]">
                                  {subItem.children?.map((child) => (
                                    <li key={child.label}>
                                      <NavLink
                                        to={child.path || '#'}
                                        className={({ isActive }) =>
                                          `flex items-center px-3 py-1.5 text-xs rounded-md transition-all duration-150 ${
                                            isActive
                                              ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-semibold shadow-sm shadow-purple-900/30'
                                              : 'text-gray-400 hover:text-white hover:bg-white/5'
                                          }`
                                        }
                                      >
                                        <FontAwesomeIcon icon={child.icon} className="mr-2 text-[10px] text-purple-400" />
                                        {child.label}
                                      </NavLink>
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </>
                          ) : (
                            <NavLink
                              to={subItem.path || '#'}
                              className={({ isActive }) =>
                                `flex items-center px-3 py-2 text-xs rounded-md font-medium transition-all duration-150 ${
                                  isActive
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-semibold shadow-sm shadow-purple-900/30'
                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`
                              }
                            >
                              <FontAwesomeIcon icon={subItem.icon} className="mr-2 text-xs text-purple-400" />
                              {subItem.label}
                            </NavLink>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path || '#'}
                  className={({ isActive }) =>
                    `flex items-center px-3.5 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium ${
                      collapsed ? 'justify-center' : ''
                    } ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-700 text-white font-semibold shadow-md shadow-purple-900/40'
                        : 'text-gray-300 hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <FontAwesomeIcon icon={item.icon} className={`text-base ${collapsed ? '' : 'mr-3 text-purple-400'}`} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Toggle Footer */}
      <div className="p-3 bg-[#0B0B0F] border-t border-[#1F1F2E] flex items-center justify-between">
        {!collapsed && (
          <div className="text-[11px] text-gray-500 font-medium">
            <span>FleetFlow SaaS v2.5</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-400 hover:text-white text-xs p-1.5 rounded hover:bg-white/5 transition"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronDown} className={collapsed ? '' : '-rotate-90'} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
