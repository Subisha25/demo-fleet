import React, { ReactNode } from "react";
import PublicHeader from "./PublicHeader";
import PublicFooter from "./PublicFooter";

interface PublicLayoutProps {
  children: ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#1C1A18] font-sans antialiased selection:bg-[#C04E24]/20 selection:text-[#C04E24]">
      <PublicHeader />
      <main className="flex-grow pt-20">
        {children}
      </main>
      <PublicFooter />
    </div>
  );
}
