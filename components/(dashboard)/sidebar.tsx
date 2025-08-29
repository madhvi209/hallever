"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { FileText, Briefcase, Package, Users, LogOut, Menu, Settings, Home, Gift, ShieldUser, UsersRound } from "lucide-react";

const links = [
  { name: "Dashboard", href: "/dashboard/", icon: <Home /> },
  { name: "Users", href: "/dashboard/users", icon: <Users /> },
  { name: "Orders", href: "/dashboard/order", icon: <Package /> },
  { name: "Teams", href: "/dashboard/teams", icon: <UsersRound /> },
  { name: "Blogs", href: "/dashboard/blogs", icon: <FileText /> },
  { name: "OffersBanner", href: "/dashboard/offersBanner", icon: <FileText /> },
  { name: "Careers", href: "/dashboard/careers", icon: <Briefcase /> },
  { name: "Applications", href: "/dashboard/applications", icon: <Users /> },
  { name: "Products", href: "/dashboard/products", icon: <Package /> },
  { name: "Testimonials", href: "/dashboard/testimonials", icon: <ShieldUser /> },
  { name: "Services", href: "/dashboard/services", icon: <Settings /> },
  { name: "Offers", href: "/dashboard/offers", icon: <Gift /> },
  { name: "Forgot Password", href: "/dashboard/forgot-password", icon: <FileText /> },
  { name: "Leads", href: "/dashboard/leads", icon: <Users /> },
];

const Sidebar = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Auto-close sidebar on route change (mobile)
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800 md:block hidden">Hallever</h1>
          <p className="text-sm text-gray-500 mt-1 md:block hidden">Admin Panel</p>
        </div>

        
      </div>

      {/* Nav links */}
      <nav className="p-4 flex-1 overflow-y-auto">
        <ul className="space-y-2">
          {links.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.name}>
                <a
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                    ? "bg-[#FEA8A9] text-white shadow-sm"
                    : "text-gray-700 hover:bg-[#ffe4e4] hover:text-[#e53950]"
                    }`}
                  style={{ fontFamily: "var(--font-main)" }}
                >
                  {React.cloneElement(link.icon, {
                    className: `w-5 h-5 transition-transform group-hover:scale-110 ${isActive
                      ? "text-white"
                      : "text-gray-500"
                      }`,
                  })}
                  <span>{link.name}</span>
                </a>
              </li>
            );
          })}
        </ul>

        {/* Logout */}
        <div className="mt-6">
          <button
            onClick={() => {
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 text-gray-700 hover:bg-[#ffe4e4] hover:text-[#d32f2f]"
            style={{ fontFamily: "var(--font-main)" }}
          >
            <LogOut className="w-5 h-5 text-red-500 group-hover:text-[#d32f2f]" />
            <span className="text-red-500">Logout</span>
          </button>
        </div>

      </nav>
    </div>
  );

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="fixed top-4 left-4 z-[100] p-2 border rounded-lg shadow bg-white md:hidden"
        onClick={() => setOpen(true)}
        aria-label="Open sidebar"
      >
        <Menu className="w-4 h-4 text-gray-800" />
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 z-50 bg-white border-r shadow-md transition-transform duration-300 flex flex-col ${open ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:static`}
        style={{ maxWidth: 280 }}
      >
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
