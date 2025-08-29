// app/layout.tsx or app/[locale]/layout.tsx (preferred structure)
import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import AppLayout from "@/components/layouts/AppLayout";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Hallever India - Premium Lighting Solutions",
  description: "Indoor & outdoor lights for every modern Indian home",
};

export default function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  return (
    <html lang={params.locale}>
      <body className={`${inter.className} flex flex-col min-h-screen`}>       
          <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
