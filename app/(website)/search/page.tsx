"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Product {
  id: string;
  name: string;
  price: number;
  summary: string;
  images: string[];
  category?: string;
  subCategory?: string;
}

interface SearchMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  didYouMean: string | null;
  categories: string[];
}

export default function SearchPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [meta, setMeta] = useState<SearchMeta>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
    didYouMean: null,
    categories: [],
  });
  const [loading, setLoading] = useState(false);

  const q = params.get("q") || "";
  const category = params.get("category") || "";
  const minPrice = params.get("minPrice") || "";
  const maxPrice = params.get("maxPrice") || "";
  const sort = params.get("sort") || "relevance";
  const page = Number(params.get("page") || 1);
  const limit = Number(params.get("limit") || 12);

  const [filterState, setFilterState] = useState({
    minPrice,
    maxPrice,
    category,
    sort,
  });

  useEffect(() => {
    setFilterState({ minPrice, maxPrice, category, sort });
  }, [minPrice, maxPrice, category, sort]);

  const queryString = useMemo(() => {
    const next = new URLSearchParams();
    if (q) next.set("q", q);
    if (category) next.set("category", category);
    if (minPrice) next.set("minPrice", minPrice);
    if (maxPrice) next.set("maxPrice", maxPrice);
    if (sort) next.set("sort", sort);
    next.set("page", String(page || 1));
    next.set("limit", String(limit || 12));
    return next.toString();
  }, [q, category, minPrice, maxPrice, sort, page, limit]);

  useEffect(() => {
    const fetchSearch = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/routes/products/search?${queryString}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.errorMessage || "Search failed");
        setProducts(json.data || []);
        setMeta(json.meta || meta);
      } catch (_err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  const updateParams = (changes: Record<string, string>) => {
    const next = new URLSearchParams(params.toString());
    Object.entries(changes).forEach(([k, v]) => {
      if (!v) next.delete(k);
      else next.set(k, v);
    });
    if (!("page" in changes)) next.set("page", "1");
    router.push(`/search?${next.toString()}`);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Search Results</h1>
        <p className="text-sm text-muted-foreground mt-1">
          {q ? `Showing results for "${q}"` : "Browse products"}
        </p>
      </div>

      <section className="border rounded-lg p-4 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <SlidersHorizontal className="h-4 w-4" />
          <h2 className="font-medium">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <Input
            placeholder="Min price"
            value={filterState.minPrice}
            onChange={(e) =>
              setFilterState((s) => ({ ...s, minPrice: e.target.value }))
            }
          />
          <Input
            placeholder="Max price"
            value={filterState.maxPrice}
            onChange={(e) =>
              setFilterState((s) => ({ ...s, maxPrice: e.target.value }))
            }
          />
          <select
            className="border rounded-md px-3 py-2 bg-background"
            value={filterState.category}
            onChange={(e) =>
              setFilterState((s) => ({ ...s, category: e.target.value }))
            }
          >
            <option value="">All Categories</option>
            {meta.categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            className="border rounded-md px-3 py-2 bg-background"
            value={filterState.sort}
            onChange={(e) =>
              setFilterState((s) => ({ ...s, sort: e.target.value }))
            }
          >
            <option value="relevance">Relevance</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="newest">Newest</option>
          </select>
        </div>
        <div className="mt-3 flex gap-2">
          <Button
            onClick={() =>
              updateParams({
                minPrice: filterState.minPrice,
                maxPrice: filterState.maxPrice,
                category: filterState.category,
                sort: filterState.sort,
                page: "1",
              })
            }
          >
            Apply Filters
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setFilterState({ minPrice: "", maxPrice: "", category: "", sort: "relevance" });
              updateParams({
                minPrice: "",
                maxPrice: "",
                category: "",
                sort: "relevance",
                page: "1",
              });
            }}
          >
            Reset
          </Button>
        </div>
      </section>

      {meta.didYouMean && (
        <p className="mb-4 text-sm">
          Did you mean{" "}
          <button
            className="text-[#E10600] underline"
            onClick={() => updateParams({ q: meta.didYouMean || "", page: "1" })}
          >
            {meta.didYouMean}
          </button>
          ?
        </p>
      )}

      <p className="text-sm text-muted-foreground mb-4">{meta.total} products found</p>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, idx) => (
            <div key={idx} className="h-52 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-muted-foreground">
          No products found.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="relative h-40 w-full bg-muted">
                <Image
                  src={product.images?.[0] || "/placeholder.svg"}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-3">
                <h3 className="font-medium text-sm line-clamp-1">{product.name}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                  {product.summary}
                </p>
                <p className="text-[#E10600] font-semibold mt-2">₹{product.price}</p>
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-8 flex items-center justify-center gap-2">
        <Button
          variant="outline"
          disabled={meta.page <= 1}
          onClick={() => updateParams({ page: String(meta.page - 1) })}
        >
          Previous
        </Button>
        <span className="text-sm">
          Page {meta.page} of {meta.totalPages}
        </span>
        <Button
          variant="outline"
          disabled={meta.page >= meta.totalPages}
          onClick={() => updateParams({ page: String(meta.page + 1) })}
        >
          Next
        </Button>
      </div>
    </main>
  );
}
