// /app/api/routes/cart/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import CartService, { CartItem } from "@/app/api/services/cartServices";

/**
 * GET /api/routes/cart/[id]
 * Fetches the cart for a user by userId.
 * If userId is "guest" or not provided, returns an empty cart (handled on client via localStorage).
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;

    if (!userId || userId === "guest") {
      return NextResponse.json({
        success: true,
        items: [],
        message: "Guest cart handled via localStorage",
      });
    }

    const cart = await CartService.getCart(userId);

    return NextResponse.json({
      success: true,
      items: cart?.items || [],
      message: "Cart fetched successfully",
    });
  } catch (error: any) {
    console.error("GET CART ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to fetch cart" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/routes/cart/[id]
 * Overwrites the user's cart with the provided items array.
 * For guest users, does not persist to backend.
 * Expects: { items: CartItem[] }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const body = await req.json();
    const items: CartItem[] = body.items;

    if (!Array.isArray(items)) {
      return NextResponse.json(
        { success: false, message: "Invalid items payload" },
        { status: 400 }
      );
    }

    if (!userId || userId === "guest") {
      return NextResponse.json({
        success: true,
        items,
        message: "Guest cart only stored in localStorage",
      });
    }

    const updatedCart = await CartService.saveCart(userId, items);

    return NextResponse.json({
      success: true,
      items: updatedCart.items,
      message: "Cart saved successfully",
    });
  } catch (error: any) {
    console.error("POST CART ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to save cart" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/routes/cart/[id]
 * Add or update a single item in the user's cart.
 * Expects: { item: CartItem }
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const body = await req.json();
    const item: CartItem = body.item;

    if (!item || typeof item !== "object" || !item.id) {
      return NextResponse.json(
        { success: false, message: "Invalid item payload" },
        { status: 400 }
      );
    }

    if (!userId || userId === "guest") {
      return NextResponse.json({
        success: true,
        item,
        message: "Guest cart only stored in localStorage",
      });
    }

    const updatedCart = await CartService.addToCart(userId, item);

    return NextResponse.json({
      success: true,
      items: updatedCart.items,
      message: "Item added/updated in cart",
    });
  } catch (error: any) {
    console.error("PATCH CART ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update cart" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/routes/cart/[id]
 * Update the quantity of a cart item.
 * Expects: { id: string, quantity: number }
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    const body = await req.json();
    const { id: itemId, quantity } = body;

    if (!itemId || typeof quantity !== "number") {
      return NextResponse.json(
        { success: false, message: "Invalid payload" },
        { status: 400 }
      );
    }

    if (!userId || userId === "guest") {
      return NextResponse.json({
        success: true,
        id: itemId,
        quantity,
        message: "Guest cart only stored in localStorage",
      });
    }

    const updatedCart = await CartService.updateQuantity(userId, itemId, quantity);

    return NextResponse.json({
      success: true,
      items: updatedCart.items,
      message: "Item quantity updated",
    });
  } catch (error: any) {
    console.error("PUT CART ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to update quantity" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/routes/cart/[id]
 * Remove an item from the user's cart, or clear the cart if no item id is provided.
 * Expects: { id?: string }
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: userId } = await params;
    let itemId: string | undefined = undefined;

    if (req.method === "DELETE") {
      const url = new URL(req.url);
      itemId = url.searchParams.get("id") || undefined;

      if (!itemId) {
        try {
          const body = await req.json();
          if (body && typeof body.id === "string") {
            itemId = body.id;
          }
        } catch { }
      }
    }

    if (!userId || userId === "guest") {
      return NextResponse.json({
        success: true,
        id: itemId,
        message: "Guest cart only stored in localStorage",
      });
    }

    if (itemId) {
      const updatedCart = await CartService.removeFromCart(userId, itemId);
      return NextResponse.json({
        success: true,
        items: updatedCart.items,
        message: "Item removed from cart",
      });
    } else {
      await CartService.clearCart(userId);
      return NextResponse.json({
        success: true,
        items: [],
        message: "Cart cleared",
      });
    }
  } catch (error: any) {
    console.error("DELETE CART ERROR:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to delete cart item" },
      { status: 500 }
    );
  }
}
