import React from "react";
import Header from "@/components/(dashboard)/Header";
import Sidebar from "@/components/(dashboard)/sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar: already sticky inside */}
      <Sidebar />

      {/* Right section with header + scrollable content */}
      <div className="flex-1 flex flex-col max-h-screen overflow-hidden">
        {/* Fixed/sticky Header */}
        <Header title="Dashboard" />

        {/* Scrollable main content */}
        <main className="flex-1 overflow-y-auto bg-[var(--background)] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
