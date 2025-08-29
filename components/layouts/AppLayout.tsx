"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Header from "../(website)/header";
import Footer from "../(website)/footer";
import PopUpOffer from "../(website)/popupOffer";
import FloatingChat from "../(website)/floatingButton";
import { LanguageProvider } from "@/context/language-context";
import { CartProvider } from "@/context/cart-context";
import { Provider } from "react-redux";
import { store } from "@/lib/redux/store";

export default function AppLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    // const isNotFound = pathname === "/404" || pathname === "/not-found";

    // Check if route is dashboard/admin
    const isDashboard =
        pathname.startsWith("/admin") || pathname.startsWith("/dashboard");

    // Routes where Header & Footer should not appear
    const noHeaderFooterRoutes = ["/login", "/signup", "/404", "/not-found"];

    const shouldHideHeaderFooter =
        isDashboard || noHeaderFooterRoutes.includes(pathname);

    return (
        <Provider store={store}>
            <LanguageProvider>
                <CartProvider>
                    {/* Header */}
                    {!shouldHideHeaderFooter && <Header />}

                    {/* Floating UI (only for website pages, not dashboard) */}
                    {!isDashboard  && <FloatingChat />}
                    {!isDashboard  && <PopUpOffer />}


                    {/* Main Content */}
                    <main className="flex-1">{children}</main>

                    {/* Footer */}
                    {!shouldHideHeaderFooter && <Footer />}
                </CartProvider>
            </LanguageProvider>
        </Provider>
    );
}
