import React, { ReactNode } from "react";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F7FB] text-[#17171D] font-sans antialiased selection:bg-[#5B3DF5]/20 selection:text-[#5B3DF5]">
      <PublicHeader />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
