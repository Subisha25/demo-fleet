import React from "react";
import { useLocation, Link } from "react-router-dom";

interface PageLayoutProps {
  children: React.ReactNode;
  breadcrumbName?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  breadcrumbName,
  title,
  subtitle,
  actions,
}) => {
  const location = useLocation();

  const generateBreadcrumb = () => {
    const pathnames = location.pathname.split("/").filter((x) => x);

    return (
      <nav aria-label="Breadcrumb" className="flex items-center space-x-1.5 text-xs text-gray-500 font-medium mb-3">
        <Link key="home" to="/dashboard" className="text-[#5B3DF5] hover:text-[#4326C6] transition font-semibold">
          Home
        </Link>
        {pathnames.map((value, index) => {
          const isLast = index === pathnames.length - 1;
          const label = isLast && breadcrumbName ? breadcrumbName : decodeURIComponent(value);

          return (
            <React.Fragment key={index}>
              <span className="text-gray-300">/</span>
              <span className={`capitalize ${isLast ? "text-gray-900 font-bold" : "text-gray-500"}`}>
                {label}
              </span>
            </React.Fragment>
          );
        })}
      </nav>
    );
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F7F7FB] p-4 sm:p-6 lg:p-8 flex justify-center items-start">
      <div className="w-full max-w-7xl bg-white rounded-xl border border-gray-200 shadow-sm p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 mb-4 border-b border-gray-100">
          <div>
            {generateBreadcrumb()}
            {title && (
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
                {title}
              </h1>
            )}
            {subtitle && (
              <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <div className="mt-3 sm:mt-0 flex items-center gap-2.5">{actions}</div>}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default PageLayout;
