import { NextRequest, NextResponse } from "next/server";
import ProductService from "@/app/api/services/productServices";
import { ProductItem } from "@/lib/redux/slice/productSlice";

type SortOption = "relevance" | "price_asc" | "price_desc" | "newest";

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[\s\-_,.]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array.from({ length: n + 1 }, () => 0)
  );

  for (let i = 0; i <= m; i += 1) dp[i][0] = i;
  for (let j = 0; j <= n; j += 1) dp[0][j] = j;

  for (let i = 1; i <= m; i += 1) {
    for (let j = 1; j <= n; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }

  return dp[m][n];
}

function buildSearchText(product: ProductItem): string {
  return [
    product.name,
    product.summary,
    product.category,
    product.subCategory,
    product.wattage,
    ...(product.features || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function relevanceScore(product: ProductItem, queryTokens: string[]): number {
  if (queryTokens.length === 0) return 0;
  const text = buildSearchText(product);
  let score = 0;

  queryTokens.forEach((token) => {
    if (product.name.toLowerCase() === token) score += 20;
    if (product.name.toLowerCase().includes(token)) score += 10;
    if ((product.category || "").toLowerCase().includes(token)) score += 6;
    if ((product.subCategory || "").toLowerCase().includes(token)) score += 5;
    if ((product.summary || "").toLowerCase().includes(token)) score += 4;
    if (text.includes(token)) score += 2;
  });

  return score;
}

function parseNumber(value: string | null): number | null {
  if (!value) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function getDidYouMean(query: string, products: ProductItem[]): string | null {
  const clean = query.trim().toLowerCase();
  if (!clean || clean.length < 3) return null;

  const vocab = new Set<string>();
  products.forEach((p) => {
    tokenize(p.name).forEach((token) => vocab.add(token));
    tokenize(p.category || "").forEach((token) => vocab.add(token));
    tokenize(p.subCategory || "").forEach((token) => vocab.add(token));
  });

  let bestWord = "";
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const word of vocab) {
    const d = levenshtein(clean, word);
    if (d < bestDistance) {
      bestDistance = d;
      bestWord = word;
    }
  }

  if (!bestWord) return null;
  // Require meaningful improvement and avoid noisy suggestions.
  return bestDistance > 0 && bestDistance <= 2 ? bestWord : null;
}

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const q = (url.searchParams.get("q") || "").trim();
    const category = (url.searchParams.get("category") || "").trim();
    const minPrice = parseNumber(url.searchParams.get("minPrice"));
    const maxPrice = parseNumber(url.searchParams.get("maxPrice"));
    const sort = (url.searchParams.get("sort") || "relevance") as SortOption;
    const page = Math.max(Number(url.searchParams.get("page") || 1), 1);
    const limit = Math.min(
      Math.max(Number(url.searchParams.get("limit") || 12), 1),
      48
    );

    const queryTokens = tokenize(q);
    const allProducts = await ProductService.getAllProducts();

    const filtered = allProducts.filter((product) => {
      if (
        category &&
        (product.category || "").toLowerCase() !== category.toLowerCase()
      ) {
        return false;
      }

      if (minPrice !== null && Number(product.price) < minPrice) return false;
      if (maxPrice !== null && Number(product.price) > maxPrice) return false;

      if (queryTokens.length === 0) return true;
      const text = buildSearchText(product);
      return queryTokens.every((token) => text.includes(token));
    });

    if (sort === "price_asc") {
      filtered.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sort === "price_desc") {
      filtered.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sort === "newest") {
      filtered.sort((a, b) => Number(b.updatedOn || 0) - Number(a.updatedOn || 0));
    } else {
      filtered.sort(
        (a, b) => relevanceScore(b, queryTokens) - relevanceScore(a, queryTokens)
      );
    }

    const total = filtered.length;
    const totalPages = Math.max(Math.ceil(total / limit), 1);
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * limit;
    const data = filtered.slice(start, start + limit);

    const didYouMean = total === 0 && q ? getDidYouMean(q, allProducts) : null;
    const categories = Array.from(
      new Set(allProducts.map((p) => p.category).filter(Boolean))
    );

    return NextResponse.json({
      statusCode: 200,
      message: "Search completed",
      data,
      meta: {
        query: q,
        total,
        page: safePage,
        limit,
        totalPages,
        didYouMean,
        categories,
      },
      errorCode: "NO",
      errorMessage: "",
    });
  } catch (error) {
    return NextResponse.json(
      {
        statusCode: 500,
        errorCode: "SEARCH_ERROR",
        errorMessage:
          error instanceof Error ? error.message : "Failed to search products",
      },
      { status: 500 }
    );
  }
}
