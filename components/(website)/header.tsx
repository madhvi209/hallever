"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, User, LogIn, UserPlus, Globe, X, ShoppingCart, LogOut, LayoutDashboard } from "lucide-react"
import { Language, useLanguage } from "@/context/language-context"
import { useCart } from "@/context/cart-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import SearchBanner from "./searchBanner"
import PopupLanguage from "@/components/(website)/popupLanguage"

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const { t, language, setLanguage } = useLanguage()
  const { totalItems } = useCart()
  const router = useRouter()
  const pathname = usePathname()

  const refreshUserData = () => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser))
      } catch (error) {
        console.error("Failed to parse user from localStorage", error)
        localStorage.removeItem("user")
        setUser(null)
      }
    } else {
      setUser(null)
    }
  }

  useEffect(() => {
    refreshUserData()
  }, [pathname, totalItems]) // Listen to totalItems changes to refresh user data

  // Listen for cart changes to update header
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "user") {
        try {
          if (e.newValue) {
            setUser(JSON.parse(e.newValue))
          } else {
            setUser(null)
          }
        } catch (error) {
          console.error("Failed to parse user from storage change", error)
        }
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  const handleLogin = () => {
    router.push("/login")
    setMenuOpen(false)
  }

  const handleRegister = () => {
    router.push("/signup")
    setMenuOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    setUser(null)
    router.push("/login")
    setMenuOpen(false)
  }

  const handleDashboard = () => {
    if (!user) return
    const path = user.role === "admin" ? "/dashboard" : "/users"
    router.push(path)
    setMenuOpen(false)
  }

  const navigationItems = [
    { name: t("header.home"), href: "/" },
    { name: t("header.about"), href: "/about" },
    { name: t("header.products"), href: "/products" },
    { name: t("header.services"), href: "/services" },
    { name: t("header.blogs"), href: "/blogs" },
    { name: t("header.careers"), href: "/careers" },
    { name: t("header.contact"), href: "/contact" },
  ]

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/"
    return pathname.startsWith(href)
  }

  return (
    <>
    <PopupLanguage />
    <header className="w-full bg-background border-b border-border shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center space-x-2 lg:-mt-3 lg:-ml-10">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Image
                src="/images/logo.png"
                alt="Hallever Logo"
                width={140}
                height={60}
                className="object-contain"
              />
            </motion.div>
          </Link>

          <div className="flex sm:hidden items-center ml-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-10 h-10 p-2 hover:bg-accent">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                {[
                  { code: "en", label: "English" }, { code: "hi", label: "हिन्दी" }, { code: "mr", label: "मराठी" },
                  { code: "ta", label: "தமிழ்" }, { code: "bn", label: "বাংলা" }, { code: "te", label: "తెలుగు" }
                ].map(({ code, label }) => (
                  <DropdownMenuItem key={code} onClick={() => setLanguage(code as Language)} className={language === code ? "font-semibold text-grey-600" : ""}>
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="lg:hidden">
            <Button variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} className="w-10 h-10">
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>

          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <SearchBanner />
          </div>

          <nav className="hidden lg:flex items-center space-x-6">
            {navigationItems.map((item) => (
              <Link key={item.href} href={item.href}
                className={isActive(item.href) ? "text-black font-semibold text-sm transition-colors" : "text-muted-foreground hover:text-foreground font-medium text-sm transition-colors"}
                aria-current={isActive(item.href) ? "page" : undefined}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden sm:flex items-center space-x-3 ml-4">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="w-10 h-10 p-2 hover:bg-accent relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 bg-[#E10600] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {totalItems > 99 ? '99+' : totalItems}
                  </motion.div>
                )}
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-10 h-10 p-2 hover:bg-accent">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user ? (
                  <>
                    <DropdownMenuItem onClick={handleDashboard}>
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>{t("auth.logout")}</span>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={handleLogin}>
                      <LogIn className="mr-2 h-4 w-4" />
                      <span>{t("auth.login")}</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleRegister}>
                      <UserPlus className="mr-2 h-4 w-4" />
                      <span>{t("auth.register")}</span>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-10 h-10 p-2 hover:bg-accent">
                  <Globe className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-32">
                {[
                  { code: "en", label: "English" }, { code: "hi", label: "हिन्दी" }, { code: "mr", label: "मराठी" },
                  { code: "ta", label: "தமிழ்" }, { code: "bn", label: "বাংলা" }, { code: "te", label: "తెలుగు" }
                ].map(({ code, label }) => (
                  <DropdownMenuItem key={code} onClick={() => setLanguage(code as Language)} className={language === code ? "font-semibold text-grey-600" : ""}>
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {menuOpen && (
          <div className="lg:hidden mt-2 space-y-2 pb-4">
            <nav className="flex flex-col space-y-2">
              {navigationItems.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                  className={isActive(item.href) ? "block px-4 py-2 text-black font-semibold transition-colors" : "block px-4 py-2 text-muted-foreground hover:text-foreground font-medium transition-colors"}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            <div className="px-4 mt-2 md:hidden">
              <SearchBanner />
            </div>

            <div className="px-4 mt-2">
              <Link href="/cart" onClick={() => setMenuOpen(false)}>
                <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Cart
                  {totalItems > 0 && (
                    <span className="bg-[#E10600] text-white text-xs rounded-full px-2 py-1 font-bold">
                      {totalItems > 99 ? '99+' : totalItems}
                    </span>
                  )}
                </Button>
              </Link>
            </div>

            <div className="border-t border-border my-4"></div>

            <div className="px-4 mt-4">
              {user ? (
                <div className="space-y-2">
                  <Button onClick={handleDashboard} className="w-full justify-start">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button onClick={handleLogout} variant="outline" className="w-full justify-start">
                    <LogOut className="mr-2 h-4 w-4" />
                    {t("auth.logout")}
                  </Button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <Button onClick={handleLogin} className="flex-1 bg-primary text-white">
                    {t("auth.login")}
                  </Button>
                  <Button onClick={handleRegister} className="flex-1 bg-muted text-foreground">
                    {t("auth.register")}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
    </>
  )
}