import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { ProductItem } from "@/lib/redux/slice/productSlice"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Generate URL-friendly slug from product name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

// Find product by slug
export function findProductBySlug(products: ProductItem[], slug: string): ProductItem | undefined {
  return products.find(product => {
    const productSlug = generateSlug(product.name);
    return productSlug === slug;
  });
}

/**
 * Generate a unique user ID with the format TLC(MM)(count)
 * @param lastId The last TLC user ID in the database (e.g., TLC0605)
 * @returns {string} The generated unique user ID
 */
export function generateTLCUserId(lastId?: string): string {
  const now = new Date();
  const month = (now.getMonth() + 1).toString().padStart(2, '0'); // 01-12
  let count = 1;

  if (lastId && lastId.startsWith('TLC')) {
    const lastMonth = lastId.substring(3, 5);
    const lastCount = parseInt(lastId.substring(5), 10);
    if (lastMonth === month && !isNaN(lastCount)) {
      count = lastCount + 1;
    }
  }

  const countStr = count.toString().padStart(2, '0');
  return `TLC${month}${countStr}`;
}
