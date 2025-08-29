"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useDispatch, useSelector } from "react-redux"
import { fetchOffer, selectOffer } from "@/lib/redux/slice/offerSlice"
import { AppDispatch } from "@/lib/redux/store"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Gift, Clock, Star } from "lucide-react"

export default function HomePage() {
    const [showOffer, setShowOffer] = useState(false)
    const pathname = usePathname()

    const dispatch = useDispatch<AppDispatch>()
    const offer = useSelector(selectOffer)

    // Do not show popup on auth pages or dashboard
    const isBlockedRoute = (() => {
        if (!pathname) return false
        if (pathname === "/login" || pathname === "/signup" || pathname === "/logout") return true
        if (pathname.startsWith("/dashboard")) return true
        return false
    })()

    useEffect(() => {
        if (isBlockedRoute) return

        const timer = setTimeout(() => {
            dispatch(fetchOffer())
            setShowOffer(true)
        }, 15000) // Show after 15 seconds

        return () => clearTimeout(timer)
    }, [dispatch, isBlockedRoute])

    const handleCloseOffer = () => {
        setShowOffer(false)
    }

    const handleClaimOffer = () => {
        console.log("Offer claimed!")
        setShowOffer(false)
    }

    if (isBlockedRoute) return null

    return (
        <div>
            {/* Offer Popup */}
            <Dialog open={showOffer} onOpenChange={setShowOffer}>
                <DialogContent className="sm:max-w-md border-0 p-0 overflow-hidden">
                    <div className="relative bg-gradient-to-br from-purple-600 via-pink-600 to-red-500 text-white">
                        {/* Close Button */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-2 text-white hover:bg-white/20 z-10"
                            onClick={handleCloseOffer}
                        >
                        </Button>

                        {/* Popup Content */}
                        <div className="p-8 text-center">
                            <div className="mb-4">
                                <Gift className="h-16 w-16 mx-auto mb-4 text-yellow-300" />
                                <Badge className="bg-yellow-400 text-black font-bold text-sm px-3 py-1 mb-4">
                                    LIMITED TIME OFFER
                                </Badge>
                            </div>

                            <DialogHeader className="space-y-4 mb-6">
                                <DialogTitle className="text-3xl font-bold text-white text-center">
                                    🎉 {offer?.title || "Special Offer!"}
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center justify-center gap-2 text-yellow-300">
                                    <Star className="h-5 w-5 fill-current" />
                                    <span className="font-semibold">Free shipping included</span>
                                    <Star className="h-5 w-5 fill-current" />
                                </div>

                                <div className="flex items-center justify-center gap-2 text-white/80">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-sm">Offer expires in 24 hours</span>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Button
                                    onClick={handleClaimOffer}
                                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-3 text-lg transition-all duration-200 transform hover:scale-105"
                                >
                                    {offer?.description || "Claim Offer"}
                                </Button>


                                <Button
                                    variant="ghost"
                                    onClick={handleCloseOffer}
                                    className="w-full text-white/80 hover:text-white hover:bg-white/10"
                                >
                                    Maybe later
                                </Button>
                            </div>

                            <p className="text-xs text-white/60 mt-4">
                                Use code:{" "}
                                <span className="font-mono font-bold">
                                    {offer?.code || "WELCOME50"}
                                </span>
                            </p>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
