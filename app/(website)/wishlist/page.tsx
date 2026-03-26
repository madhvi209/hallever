"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useWishlist } from "@/context/wishlist-context";
import { useCart } from "@/context/cart-context";
import { generateSlug } from "@/lib/utils";

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart, isInCart } = useCart();

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Heart className="h-5 w-5 text-[#E10600]" />
            Your Wishlist
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {wishlistItems.length} saved item{wishlistItems.length === 1 ? "" : "s"}
          </p>
        </div>
        {wishlistItems.length > 0 && (
          <Button variant="outline" onClick={clearWishlist}>
            Clear Wishlist
          </Button>
        )}
      </div>

      {wishlistItems.length === 0 ? (
        <div className="border rounded-lg p-10 text-center">
          <p className="text-muted-foreground mb-4">Your wishlist is empty.</p>
          <Link href="/products">
            <Button>Explore Products</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {wishlistItems.map((item) => (
            <div key={item.id} className="border rounded-lg overflow-hidden bg-white">
              <div className="relative h-48 w-full bg-muted">
                <Image
                  src={item.images?.[0] || "/placeholder.svg"}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <h2 className="font-medium line-clamp-1">{item.name}</h2>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {item.summary || "Premium lighting product"}
                </p>
                <p className="text-[#E10600] font-semibold mt-2">₹{item.price}</p>

                <div className="flex gap-2 mt-4">
                  <Button
                    className="flex-1"
                    onClick={() => addToCart(item)}
                    disabled={isInCart(item.id)}
                  >
                    <ShoppingCart className="w-4 h-4 mr-1" />
                    {isInCart(item.id) ? "In Cart" : "Add to Cart"}
                  </Button>
                  <Link className="flex-1" href={`/products/${generateSlug(item.name)}`}>
                    <Button variant="outline" className="w-full">
                      View
                    </Button>
                  </Link>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeFromWishlist(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
