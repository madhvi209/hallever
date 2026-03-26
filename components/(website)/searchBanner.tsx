"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, Package, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/cart-context";
import { useLanguage } from "@/context/language-context";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  price: number;
  images: string[];
  category: string;
  subCategory?: string;
  wattage?: string;
}

const SearchBanner = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { addToCart, isInCart } = useCart();
  const { t } = useLanguage();

  const debouncedQuery = useMemo(() => searchQuery.trim(), [searchQuery]);

  useEffect(() => {
    if (!debouncedQuery) {
      setSearchResults([]);
      setIsSearching(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        setError(null);
        const res = await fetch(
          `/api/routes/products/search?q=${encodeURIComponent(
            debouncedQuery
          )}&limit=8`,
          { signal: controller.signal }
        );
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json.errorMessage || "Failed to search");
        }
        setSearchResults((json.data || []) as Product[]);
        setShowResults(true);
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          setError(t("search.error"));
          setSearchResults([]);
        }
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [debouncedQuery, t]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleProductClick = (product: Product) => {
    router.push(`/products/${product.name.toLowerCase().replace(/\s+/g, "-")}`);
    setShowResults(false);
    setSearchQuery("");
  };

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    addToCart(product);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setShowResults(false);
  };

  const openSearchPage = () => {
    if (!searchQuery.trim()) return;
    router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    setShowResults(false);
  };

  return (
    <div className="relative w-full max-w-lg" ref={searchRef}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={t("search.placeholder") || "Search products..."}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") openSearchPage();
          }}
          className="pl-10 pr-10 w-full"
          onFocus={() => {
            if (searchQuery.trim().length > 0) {
              setShowResults(true);
            }
          }}
        />
        {searchQuery && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {showResults && (searchResults.length > 0 || isSearching || !!error) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
          >
            {isSearching ? (
               <div className="p-4 text-center text-gray-500">
                 <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#E10600] mx-auto mb-2"></div>
                 {t("search.loading")}
               </div>
             ) : error ? (
               <div className="p-4 text-center text-red-500">
                 {t("search.error")}
               </div>
             ) : searchResults.length === 0 ? (
               <div className="p-4 text-center text-gray-500">
                 {t("search.noResults")}
               </div>
             ) : (
              <div className="py-2">
                {searchResults.map((product) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    onClick={() => handleProductClick(product)}
                  >
                    {/* Product Image */}
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                      <Image
                        src={Array.isArray(product.images) ? product.images[0] || '/images/placeholder.jpg' : product.images || '/images/placeholder.jpg'}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {product.name}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm text-gray-500">{product.category}</span>
                        {product.wattage && (
                          <span className="text-xs text-gray-400">• {product.wattage}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-sm font-semibold text-[#E10600]">
                          ₹{product.price}
                        </span>
                      </div>
                    </div>

                    {/* Add to Cart Button */}
                    <Button
                      size="sm"
                      variant="ghost"
                      className={`p-2 rounded-full ${
                        isInCart(product.id) 
                          ? "text-green-600 hover:text-green-700"
                          : "text-gray-400 hover:text-[#E10600]"
                      }`}
                      onClick={(e) => handleAddToCart(e, product)}
                      disabled={isInCart(product.id)}
                    >
                      {isInCart(product.id) ? (
                        <Package className="w-4 h-4" />
                      ) : (
                        <ShoppingCart className="w-4 h-4" />
                      )}
                    </Button>
                  </motion.div>
                ))}

                {/* View All Results */}
                {searchResults.length > 0 && (
                  <div className="p-3 border-t border-gray-100">
                    <Button
                      variant="outline"
                      className="w-full text-sm"
                      onClick={openSearchPage}
                    >
                      {t("search.viewAll").replace("{count}", searchResults.length.toString())}
                    </Button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBanner;
