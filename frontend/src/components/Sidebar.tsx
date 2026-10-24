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
  faFileLines
} from '@fortawesome/free-solid-svg-icons';
import { NavLink } from 'react-router-dom'; // ✅ Changed from Link to NavLink
import { useTenant } from '../context/TenantContext';

import GraceCabsLogo from './GraceCabsLogo';

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
      { label: 'Provision Tenant', path: '/tenants/add', icon: faPlus },
      { label: 'Corporate Policies', path: '/tenants/policies', icon: faClipboardList },
      { label: 'Subscription & Billing', path: '/admin/billing', icon: faReceipt },
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
      { label: 'Configuration', path: '/configuration/master', icon: faCogs },
      { label: 'Email Configuration', path: '/configuration/email', icon: faEnvelope }
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
      {
        label: 'Vehicle Type',
        icon: faList,
        children: [
          { label: 'Add Vehicle Type', path: '/vehicle/vehicletype/add', icon: faPlus },
          { label: 'List Vehicle Type', path: '/vehicle/vehicletype/list', icon: faCarSide },
        ],
      },
      {
        label: 'Vehicle Model',
        icon: faList,
        children: [
          { label: 'Add Vehicle Model', path: '/vehicle/vehiclemodel/add', icon: faPlus },
          { label: 'List Vehicle Model', path: '/vehicle/vehiclemodel/list', icon: faCarAlt },
        ],
      },
      {
        label: 'Vehicle Master',
        icon: faList,
        children: [
          { label: 'Add Vehicle Master', path: '/vehicle/vehiclemaster/add', icon: faPlus },
          { label: 'List Vehicle Master', path: '/vehicle/vehiclemaster/list', icon: faTruck },
        ],
      },
    ],
  },
  {
    label: 'Orders',
    icon: faClipboardList,
    children: [
      { label: 'Confirm Pending List', path: '/orders/confirmpending', icon: faClipboardCheck },
      { label: 'Close Pending List', path: '/orders/closepending', icon: faTimesCircle },
      { label: 'Payment Pending List', path: '/orders/paymentpending', icon: faMoneyBillWave },
      { label: 'Completed List', path: '/orders/completed', icon: faCheckCircle },
      { label: 'Payment List', path: '/orders/paymentlist', icon: faCashRegister },
      { label: 'List Cancel Order', path: '/orders/cancelled', icon: faTimesCircle },
    ],
  },
  {
    label: 'Users',
    icon: faUsers,
    children: [
      { label: 'Add User', path: '/users/adduser', icon: faUserPen },
      { label: 'User List', path: '/users/list', icon: faUserFriends }
    ],
  },
   {
    label: 'Monthly Bookings',
    icon: faCalendarAlt,
    children: [
      { label: 'Monthly Invoice', path: '/booking/monthlybooking', icon: faCalendarCheck },
      { label: 'Monthly Report', path: '/booking/monthlyreport', icon: faFileLines },
      { label: 'OnCall Invoice', path: '/booking/oncallinvoice', icon: faFileLines },
    ],
  },
  {
    label: 'Owners',
    icon: faUserTie,
    children: [
      { label: 'Add Owner', path: '/vendors/add', icon: faUserPlus },
      { label: 'List Owner', path: '/vendors/list', icon: faUser },
    ],
  },
  {
    label: 'Drivers',
    icon: faUserSecret,
    children: [
      { label: 'Add Driver', path: '/drivers/add', icon: faUserPlus },
      { label: 'List Driver', path: '/drivers/list', icon: faUser },
      { label: 'List Assigned Task', path: '/drivers/assignedlist', icon: faTruck },
        { label: 'Trip Details', path: '/drivers/tripdetails', icon: faTruck },
    ],
  },
  
  {
    label: 'Invoice',
    icon: faFileInvoice,
    children: [
      { label: 'Pending Invoices', path: '/invoice/pending', icon: faReceipt },
      { label: 'Invoice Reminder', path: '/invoice/reminder', icon: faBell },
      { label: 'Payment For Invoices', path: '/invoice/paymentfor', icon: faMoneyBillWave },
      { label: 'Paid Invoice List', path: '/invoice/paid', icon: faCheckCircle },
      { label: 'All Invoice List', path: '/invoice/all', icon: faList },
      { label: 'Invoice Pay Holder', path: '/invoice/payholder', icon: faFileAlt },
    ],
  },
  {
    label: 'Reports',
    icon: faChartBar,
    children: [
      { label: 'Order Summary', path: '/reports/order-summary', icon: faClipboardCheck },
      { label: 'Company Order Summary', path: '/reports/company-order-summary', icon: faBuilding },
      { label: 'Overall Invoice Report', path: '/reports/overall-invoice-report', icon: faFileInvoice },
    ],
  },
  { label: 'Uploads', icon: faDatabase, path: '/uploads' },
  { label: 'Cache', icon: faDatabase, path: '/cache' },
];

const Sidebar: React.FC = () => {
  const [openDropdown, setOpenDropdown] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(false);
  const { currentTenant } = useTenant();
  const role = localStorage.getItem('role') || '';
  const isSuperAdmin = role === 'superadmin';

  const toggleDropdown = (label: string) => {
    setOpenDropdown((prev: any) =>
      prev.includes(label)
        ? prev.filter((item: any) => item !== label)
        : [...prev, label]
    );
  };

  const tenantName = currentTenant?.brandingTokens?.portalTitle || currentTenant?.name || 'Grace Cabs';
  const logoUrl = currentTenant?.brandingTokens?.logoUrl || '/images/favicon1.jpeg';

  // Strict role-based menu filtering: platform SaaS Tenants & Configuration are SuperAdmin only
  const visibleMenu = menu.filter((item) => {
    if (item.label === 'SaaS Tenants' || item.label === 'Configuration') {
      return isSuperAdmin;
    }
    return true;
  });

  return (
    <aside
      className={`fixed left-0 top-0 h-screen flex flex-col shadow-2xl transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-72'}
        z-40 bg-[#1C1A18] text-[#E0DAD1] border-r border-[#2E2A26]
      `}
    >
      {/* Brand Header */}
      <div className="sticky top-0 z-10 bg-[#141312] border-b border-[#2E2A26] px-4 py-3.5">
        <div className="flex items-center gap-3">
          {collapsed ? (
            <div className="w-10 h-10 rounded-xl bg-[#C04E24] flex items-center justify-center font-black text-white text-lg shadow-md">
              GC
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <GraceCabsLogo size="sm" variant="light" showTagline={false} />
            </div>
          )}
        </div>
        {!collapsed && (
          <div className="mt-2 pt-2 border-t border-[#2E2A26]/80 flex items-center justify-between">
            <span className="text-xs font-bold text-white truncate max-w-[150px]">
              {isSuperAdmin ? 'Grace Cabs SaaS Platform' : (currentTenant?.name || tenantName)}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C04E24]/20 text-[#E9B195] border border-[#C04E24]/40 uppercase tracking-wider">
              {isSuperAdmin ? 'Platform Admin' : `${currentTenant?.planTier || 'PRO'} Plan`}
            </span>
          </div>
        )}
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent py-3 px-2 text-slate-300">
        <ul className="space-y-1">
          {visibleMenu.map((item) => (
            <li key={item.label}>
              {item.children ? (
                <>
                  {/* Parent Menu Item */}
                  <button
                    className={`flex items-center w-full px-3.5 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium ${
                      collapsed ? 'justify-center' : ''
                    } hover:bg-white/10 hover:text-white ${
                      openDropdown.includes(item.label) ? 'text-white bg-white/5' : 'text-slate-300'
                    }`}
                    onClick={() => toggleDropdown(item.label)}
                  >
                    <FontAwesomeIcon icon={item.icon} className={`text-base ${collapsed ? '' : 'mr-3 text-teal-400/90'}`} />
                    {!collapsed && <span className="flex-1 text-left">{item.label}</span>}
                    {!collapsed && (
                      <FontAwesomeIcon
                        icon={openDropdown.includes(item.label) ? faChevronDown : faChevronRight}
                        className="ml-auto text-xs text-slate-400"
                      />
                    )}
                  </button>

                  {/* Submenu Dropdown */}
                  {openDropdown.includes(item.label) && !collapsed && (
                    <ul className="ml-5 pl-2 mt-1 space-y-1 border-l border-slate-700/60">
                      {item.children.map((subItem) => (
                        <li key={subItem.label}>
                          {subItem.children ? (
                            <>
                              <button
                                className="flex items-center w-full px-3 py-2 rounded-md text-xs font-medium text-slate-300 hover:bg-white/10 hover:text-white transition-colors duration-150"
                                onClick={() => toggleDropdown(`${item.label}-${subItem.label}`)}
                              >
                                <FontAwesomeIcon icon={subItem.icon} className="mr-2 text-xs text-teal-400/80" />
                                <span className="flex-1 text-left">{subItem.label}</span>
                                <FontAwesomeIcon
                                  icon={openDropdown.includes(`${item.label}-${subItem.label}`) ? faChevronDown : faChevronRight}
                                  className="text-[10px] text-slate-400"
                                />
                              </button>

                              {openDropdown.includes(`${item.label}-${subItem.label}`) && (
                                <ul className="ml-4 pl-2 mt-1 space-y-1 border-l border-[#2E2A26]">
                                  {subItem.children?.map((child) => (
                                    <li key={child.label}>
                                      <NavLink
                                        to={child.path || '#'}
                                        className={({ isActive }) =>
                                          `flex items-center px-3 py-1.5 text-xs rounded-md transition-all duration-150 ${
                                            isActive
                                              ? 'bg-[#C04E24]/20 text-[#E9B195] font-semibold border-l-2 border-[#C04E24] shadow-sm'
                                              : 'text-[#A8A199] hover:text-white hover:bg-white/5'
                                          }`
                                        }
                                      >
                                        <FontAwesomeIcon icon={child.icon} className="mr-2 text-[10px]" />
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
                                    ? 'bg-[#C04E24]/20 text-[#E9B195] font-semibold border-l-2 border-[#C04E24] shadow-sm'
                                    : 'text-[#A8A199] hover:text-white hover:bg-white/5'
                                }`
                              }
                            >
                              <FontAwesomeIcon icon={subItem.icon} className="mr-2 text-xs text-[#E9B195]" />
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
                        ? 'bg-[#C04E24] text-white font-semibold shadow-sm'
                        : 'text-[#A8A199] hover:bg-white/5 hover:text-white'
                    }`
                  }
                >
                  <FontAwesomeIcon icon={item.icon} className={`text-base ${collapsed ? '' : 'mr-3 text-[#E9B195]'}`} />
                  {!collapsed && <span>{item.label}</span>}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Collapse Toggle Footer */}
      <div className="p-3 bg-[#141312] border-t border-[#2E2A26] flex items-center justify-between">
        {!collapsed && (
          <div className="text-[11px] text-[#7A7570] font-medium">
            <span>Grace Cabs SaaS v2.5</span>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-[#A8A199] hover:text-white text-xs p-1.5 rounded hover:bg-white/5 transition"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronDown} className={collapsed ? '' : '-rotate-90'} />
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

