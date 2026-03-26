"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

interface WishlistItem {
  id: string;
  name: string;
  price: number;
  images: string[];
  summary?: string;
  category?: string;
  subCategory?: string;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (id: string) => void;
  toggleWishlist: (item: WishlistItem) => void;
  isInWishlist: (id: string | number | undefined) => boolean;
  clearWishlist: () => void;
  totalWishlistItems: number;
}

const STORAGE_KEY = "hallever-wishlist";
const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as WishlistItem[];
        if (Array.isArray(parsed)) setWishlistItems(parsed);
      }
    } catch {
      // Ignore corrupt local data.
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(wishlistItems));
    } catch {
      // Ignore storage write failures.
    }
  }, [wishlistItems]);

  const addToWishlist = (item: WishlistItem) => {
    setWishlistItems((prev) => {
      if (prev.some((x) => x.id === item.id)) return prev;
      return [...prev, item];
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlistItems((prev) => prev.filter((x) => x.id !== id));
  };

  const isInWishlist = (id: string | number | undefined) => {
    if (!id) return false;
    const key = String(id);
    return wishlistItems.some((x) => x.id === key);
  };

  const toggleWishlist = (item: WishlistItem) => {
    setWishlistItems((prev) => {
      const exists = prev.some((x) => x.id === item.id);
      if (exists) return prev.filter((x) => x.id !== item.id);
      return [...prev, item];
    });
  };

  const clearWishlist = () => setWishlistItems([]);
  const totalWishlistItems = wishlistItems.length;

  const value = useMemo(
    () => ({
      wishlistItems,
      addToWishlist,
      removeFromWishlist,
      toggleWishlist,
      isInWishlist,
      clearWishlist,
      totalWishlistItems,
    }),
    [wishlistItems]
  );

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }
  return context;
}
