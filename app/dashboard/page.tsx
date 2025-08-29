"use client";

import React from "react";
import {  Users,  Package, FileText, MapPin, Briefcase, BookOpen,} from "lucide-react";
import {  ResponsiveContainer,  BarChart,  Bar,  XAxis,  YAxis,  CartesianGrid,  Tooltip,} from "recharts";


const stats = {
  blogs: 10,
  products: 15,
  services: 8,
  careers: 5,
  leads: 20,
  users: 100,
};

const chartData = [
  { name: "Blogs", value: stats.blogs },
  { name: "Products", value: stats.products },
  { name: "Services", value: stats.services },
  { name: "Careers", value: stats.careers },
  { name: "Leads", value: stats.leads },
];

const DashboardPage = () => {
  return (
    <div className="min-h-screen w-full py-10 px-4 flex flex-col gap-8">
      {/* Header */}
      <div className="w-full mx-auto bg-[#FEF0F3] border rounded-2xl shadow p-6 text-center md:text-left">
        <h1 className="text-3xl font-bold text-[#FEA8A9]">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Overview of your website content and leads.
        </p>
      </div>

      {/* Chart Section */}
      <div className=" w-full mx-auto bg-white border rounded-2xl shadow p-6">
        <h2 className="text-xl font-bold text-[#FEA8A9] mb-4">Content Overview</h2>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="value" fill="#FEA8A9" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="Blogs" value={stats.blogs} icon={<BookOpen className="w-8 h-8 text-[#FE97AC]" />} />
        <StatCard title="Products" value={stats.products} icon={<Package className="w-8 h-8 text-[#FE97AC]" />} />
        <StatCard title="Services" value={stats.services} icon={<MapPin className="w-8 h-8 text-[#FE97AC]" />} />
        <StatCard title="Careers" value={stats.careers} icon={<Briefcase className="w-8 h-8 text-[#FE97AC]" />} />
        <StatCard title="Leads" value={stats.leads} icon={<FileText className="w-8 h-8 text-[#FE97AC]" />} />
        <StatCard title="Users" value={stats.users} icon={<Users className="w-8 h-8 text-[#FE97AC]" />} />
      </div>
    </div>
  );
};

export default DashboardPage;

// Reusable StatCard component
interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
}

const StatCard = ({ title, value, icon }: StatCardProps) => (
  <div className="bg-white border rounded-2xl shadow p-6 flex flex-col items-center justify-center text-center hover:shadow-md transition">
    <div className="mb-2">{icon}</div>
    <div className="text-3xl font-bold text-[#FE97AC]">{value}</div>
    <div className="text-sm text-gray-600 mt-1 uppercase tracking-wide">
      {title}
    </div>
  </div>
);
