import React from "react";
import { Mail, Phone } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import config from "../../../../src/config/config";
import FleetFlowLogo from "../../../components/FleetFlowLogo";

type CompanyData = {
  companyId: string;
  companyName: string;
  companyLogo: string;
  seoUrl: string;
  fleetSlug?: string;
  fleetName?: string;
  fleetLogo?: string;
};

const UserLoginHeader: React.FC<{ companyData: CompanyData | null }> = ({ companyData }) => {
  const BASE_URL = config.baseurl.apibaseurl;
  const { fleetSlug, companySlug, seoUrl } = useParams<{ fleetSlug?: string; companySlug?: string; seoUrl?: string }>();

  const activeFleet = fleetSlug || companyData?.fleetSlug;
  const activeCompany = companySlug || seoUrl || companyData?.seoUrl;
  const portalLink = activeFleet && activeCompany ? `/company/${activeFleet}/${activeCompany}` : (activeCompany ? `/company/${activeCompany}` : '/');

  const logoSrc =
    companyData?.companyLogo
      ? `${BASE_URL}/uploads/companyLogo/${companyData.companyLogo}`
      : null;

  const fleetLogoSrc = companyData?.fleetLogo
    ? (companyData.fleetLogo.startsWith('http') || companyData.fleetLogo.startsWith('/')
        ? companyData.fleetLogo
        : `${BASE_URL}/uploads/fleetLogo/${companyData.fleetLogo}`)
    : null;

  return (
    <header className="w-full bg-white shadow-sm">
      
      {/* 🔝 Top bar */}
      <div className="w-full bg-[#f8f9fa] border-b border-gray-200 text-sm">
        <div className="container mx-auto px-4 py-1 flex justify-between items-center text-gray-700">
          <div className="flex items-center space-x-2">
            <Mail size={14} className="text-[#C04E24]" />
            <span className="text-[13px]">support@fleetflow.com</span>
          </div>

          <div className="flex items-center space-x-2">
            <Phone size={14} className="text-[#C04E24]" />
            <span className="text-[13px]">+91 98417 22675</span>
          </div>
        </div>
      </div>

      {/* 🟢 Logo Row */}
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* ✅ LEFT SIDE – FLEET & PLATFORM BRANDING */}
        <div className="flex items-center gap-3">
          <Link to={portalLink} className="flex items-center gap-3">
            {fleetLogoSrc ? (
              <img
                src={fleetLogoSrc}
                alt={companyData?.fleetName || "Fleet Logo"}
                className="max-h-[44px] object-contain rounded"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : null}
            {companyData?.fleetName && (
              <div className="border-l border-gray-300 pl-3">
                <span className="text-base font-bold text-gray-800 tracking-tight block">
                  {companyData.fleetName}
                </span>
                <span className="text-[10px] text-gray-500 uppercase tracking-widest block font-medium">
                  Corporate Mobility
                </span>
              </div>
            )}
            {!fleetLogoSrc && !companyData?.fleetName && (
              <FleetFlowLogo size="sm" showTagline={false} />
            )}
          </Link>
        </div>

        {/* ✅ RIGHT SIDE – COMPANY LOGO (API BASED) */}
        <div>
          {logoSrc && (
            <img
              src={logoSrc}
              alt={companyData?.companyName || "Company Logo"}
              className="w-[160px] h-[60px] object-contain"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.display = "none";
              }}
            />
          )}
        </div>

      </div>
    </header>
  );
};

export default UserLoginHeader;