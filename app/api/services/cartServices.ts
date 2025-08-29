import { db } from "@/app/api/config/firebase"; // your firebase-admin instance

const CART_COLLECTION = "carts";

// Match frontend CartItem interface (see cartSlice.ts)
export interface CartItem {
    id: string; // product id
    name: string;
    price: number;
    quantity: number;
    image: string;
    wattage?: string;
}

export interface Cart {
    id: string;
    userId: string;
    items: CartItem[];
    createdOn: string;
    updatedOn: string;
}

class CartService {
    // Get cart by userId
    async getCart(userId: string): Promise<Cart | null> {
        const snapshot = await db.collection(CART_COLLECTION).doc(userId).get();
        if (!snapshot.exists) return null;
        return snapshot.data() as Cart;
    }

    // Create or update cart for a user
    async saveCart(userId: string, items: CartItem[]): Promise<Cart> {
        const now = new Date().toISOString();
        // Try to preserve createdOn if cart exists
        const existing = await this.getCart(userId);
        const cart: Cart = {
            id: userId,
            userId,
            items,
            createdOn: existing?.createdOn || now,
            updatedOn: now,
        };
        await db.collection(CART_COLLECTION).doc(userId).set(cart, { merge: true });
        return cart;
    }

    // Add item to cart (merge quantity if exists)
    async addToCart(userId: string, item: CartItem): Promise<Cart> {
        const cart = await this.getCart(userId);
        let items: CartItem[] = [];
        if (cart) {
            const existingIndex = cart.items.findIndex(i => i.id === item.id);
            if (existingIndex !== -1) {
                // Update quantity
                cart.items[existingIndex].quantity += item.quantity;
                items = cart.items;
            } else {
                items = [...cart.items, item];
            }
        } else {
            items = [item];
        }
        return await this.saveCart(userId, items);
    }

    // Update item quantity
    async updateQuantity(userId: string, id: string, quantity: number): Promise<Cart> {
        const cart = await this.getCart(userId);
        if (!cart) throw new Error("Cart not found");
        cart.items = cart.items.map(i =>
            i.id === id ? { ...i, quantity } : i
        );
        return await this.saveCart(userId, cart.items);
    }

    // Remove item
    async removeFromCart(userId: string, id: string): Promise<Cart> {
        const cart = await this.getCart(userId);
        if (!cart) throw new Error("Cart not found");
        cart.items = cart.items.filter(i => i.id !== id);
        return await this.saveCart(userId, cart.items);
    }

    // Clear cart
    async clearCart(userId: string): Promise<void> {
        await db.collection(CART_COLLECTION).doc(userId).delete();
    }

    // Merge guest cart with user cart (for login/sync)
    async mergeGuestCart(userId: string, guestItems: CartItem[]): Promise<Cart> {
        const cart = await this.getCart(userId);
        const merged: { [id: string]: CartItem } = {};
        if (cart) {
            cart.items.forEach(item => { merged[item.id] = { ...item }; });
        }
        guestItems.forEach(item => {
            if (merged[item.id]) {
                merged[item.id].quantity += item.quantity;
            } else {
                merged[item.id] = { ...item };
            }
        });
        const mergedItems = Object.values(merged);
        return await this.saveCart(userId, mergedItems);
    }
}

// Export a singleton instance
const CartServiceInstance = new CartService();

export default CartServiceInstance;
