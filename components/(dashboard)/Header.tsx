"use client";

import React from "react";
import { Menu } from "lucide-react"; // example toggle icon

const Header = ({ title }: { title: string }) => {
  return (
    <header className="sticky top-0 w-full h-16 flex flex-col justify-center px-4 sm:px-6 bg-white border-b border-gray-200 shadow-sm z-50">
      <div className="flex items-center justify-between h-full">
        {/* Left section with toggle button and title */}
        <div className="flex items-center gap-6 sm:gap-5 max-w-[80%]">
          {/* Toggle button (hamburger menu or sidebar trigger) */}
          <button className="block sm:hidden p-1">
            <Menu className="w-5 h-5 text-[var(--primary-green)]" />
          </button>

          {/* Title (doesn't get overwritten on mobile) */}
          <div className="text-base sm:text-lg font-semibold text-[var(--primary-green)] truncate">
            {title}
          </div>
        </div>

        {/* Right section with avatar */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[var(--primary-light-green)] flex items-center justify-center font-bold text-[var(--primary-green)] border-2 border-[var(--primary-green)] text-sm sm:text-base">
            H
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
