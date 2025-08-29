"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    wattage?: string;
    category?: string;
    subCategory?: string;
}

interface CartContextType {
    cartItems: CartItem[];
    addToCart: (product: any) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalAmount: number;
    isInCart: (id: string) => boolean;
    updateCartFromServer: (serverCart: any[]) => void;
    syncCartToServer: () => void;
    updatePricesFromProducts: (products: any[]) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        loadCartFromStorage();
        loadUserCartFromServer();
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        saveCartToStorage(cartItems);
    }, [cartItems]);

    const loadCartFromStorage = () => {
        try {
            const savedCart = localStorage.getItem('hallever-cart');
            if (savedCart) {
                const parsedCart = JSON.parse(savedCart);
                setCartItems(parsedCart);
            }
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
        }
    };

    const saveCartToStorage = (cartToSave: CartItem[]) => {
        try {
            localStorage.setItem('hallever-cart', JSON.stringify(cartToSave));
        } catch (error) {
            console.error('Error saving cart to localStorage:', error);
        }
    };

    const addToCart = (product: any) => {
        const existingItem = cartItems.find(item => item.id === product.id);
        
        if (existingItem) {
            // If item exists, increase quantity
            setCartItems(prev => prev.map(item =>
                item.id === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            // Add new item to cart
            const newItem: CartItem = {
                id: String(product.id),
                name: product.name,
                price: product.price || 0,
                quantity: 1,
                image: Array.isArray(product.images) ? product.images[0] || "/placeholder.svg" : product.images || "/placeholder.svg",
                wattage: product.wattage,
                category: product.category,
                subCategory: product.subCategory
            };
            
            setCartItems(prev => [...prev, newItem]);
        }
    };

    const removeFromCart = (id: string) => {
        setCartItems(prev => prev.filter(item => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) return;
        setCartItems(prev => prev.map(item =>
            item.id === id ? { ...item, quantity } : item
        ));
    };

    const clearCart = () => {
        setCartItems([]);
        // Persist immediately
        saveCartToStorage([]);
        try {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                // Update local user.cart
                const updatedUser = { ...user, cart: [] };
                localStorage.setItem('user', JSON.stringify(updatedUser));
                // Best-effort server sync for empty cart
                void fetch(`/api/routes/auth`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ uid: user.uid, cart: [] }),
                }).catch(() => {});
            }
        } catch (_) {
            // ignore
        }
    };

    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    const isInCart = (id: string) => {
        return cartItems.some(item => item.id === id);
    };

    const updateCartFromServer = (serverCart: any[]) => {
        // Convert server cart format to local cart format
        const convertedCart: CartItem[] = serverCart.map(item => ({
            id: String(item.id),
            name: item.name,
            price: item.price || 0,
            quantity: item.quantity || 1,
            image: Array.isArray(item.images) ? item.images[0] || "/placeholder.svg" : item.image || "/placeholder.svg",
            wattage: item.wattage,
            category: item.category,
            subCategory: item.subCategory
        }));
        
        setCartItems(convertedCart);
        saveCartToStorage(convertedCart);
    };

    // Update cart item prices and basic metadata from latest products
    const updatePricesFromProducts = (products: any[]) => {
        if (!Array.isArray(products) || products.length === 0) return;
        const productById = new Map<string, any>(
            products.map((p: any) => [String(p.id), p])
        );

        let changed = false;
        const updated = cartItems.map((item) => {
            const p = productById.get(String(item.id));
            if (!p) return item;
            const nextPrice = typeof p.price === 'number' ? p.price : item.price;
            const nextName = p.name || item.name;
            const nextImage = Array.isArray(p.images) ? (p.images[0] || item.image) : (p.images || item.image);
            const nextWattage = p.wattage ?? item.wattage;
            const nextCategory = p.category ?? item.category;
            if (
                nextPrice !== item.price ||
                nextName !== item.name ||
                nextImage !== item.image ||
                nextWattage !== item.wattage ||
                nextCategory !== item.category
            ) {
                changed = true;
                return {
                    ...item,
                    price: nextPrice,
                    name: nextName,
                    image: nextImage,
                    wattage: nextWattage,
                    category: nextCategory,
                } as CartItem;
            }
            return item;
        });

        if (changed) {
            setCartItems(updated);
            saveCartToStorage(updated);
            // Best effort sync; don't await
            void syncCartToServer();
        }
    };

    const mergeCarts = (localCart: CartItem[], serverCart: CartItem[]): CartItem[] => {
        const byIdLocal = new Map(localCart.map(i => [i.id, i] as const));
        const byIdServer = new Map(serverCart.map(i => [i.id, i] as const));

        const allIds = new Set<string>([...byIdLocal.keys(), ...byIdServer.keys()]);
        const merged: CartItem[] = [];
        for (const id of allIds) {
            const l = byIdLocal.get(id);
            const s = byIdServer.get(id);
            if (l && s) {
                // If item exists on both, take the max quantity to prevent doubling
                merged.push({ ...l, quantity: Math.max(l.quantity, s.quantity) });
            } else if (l) {
                merged.push({ ...l });
            } else if (s) {
                merged.push({ ...s });
            }
        }
        return merged;
    };

    const cartsAreEqual = (a: CartItem[], b: CartItem[]) => {
        if (a.length !== b.length) return false;
        const mapA = new Map(a.map(x => [x.id, x.quantity] as const));
        for (const item of b) {
            if (mapA.get(item.id) !== item.quantity) return false;
        }
        return true;
    };

    const loadUserCartFromServer = async () => {
        try {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                const localSaved = localStorage.getItem('hallever-cart');
                const localCart: CartItem[] = localSaved ? JSON.parse(localSaved) : [];

                if (user && user.email && Array.isArray(user.cart) && user.cart.length > 0) {
                    // Merge server cart with local cart and prefer summed quantities
                    const serverConverted: CartItem[] = user.cart.map((item: any) => ({
                        id: String(item.id),
                        name: item.name,
                        price: item.price || 0,
                        quantity: item.quantity || 1,
                        image: Array.isArray(item.images) ? item.images[0] || "/placeholder.svg" : item.image || "/placeholder.svg",
                        wattage: item.wattage,
                        category: item.category,
                        subCategory: item.subCategory
                    }));
                    // If both carts are same, avoid merging to prevent doubling
                    const merged = cartsAreEqual(localCart, serverConverted)
                        ? serverConverted
                        : mergeCarts(localCart, serverConverted);
                    setCartItems(merged);
                    saveCartToStorage(merged);

                    // Also update the stored user object to reflect merged cart
                    const updatedUser = { ...user, cart: merged };
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                } else if (localCart.length > 0) {
                    // Only local cart exists
                    setCartItems(localCart);
                }
            }
        } catch (error) {
            console.error('Error loading user cart from server:', error);
        }
    };

    const syncCartToServer = useCallback(async () => {
        try {
            const userStr = localStorage.getItem("user");
            if (userStr) {
                const user = JSON.parse(userStr);
                if (user && user.email && user.uid) {
                    console.log("🔄 Syncing cart to server for user:", user.uid);
                    
                    // Update user's cart on server using PATCH method
                    const response = await fetch(`/api/routes/auth`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            uid: user.uid,
                            cart: cartItems 
                        }),
                    });

                    if (!response.ok) {
                        const errorData = await response.json();
                        console.error("❌ Cart sync failed:", errorData);
                        throw new Error(errorData.errorMessage || "Failed to sync cart");
                    }

                    const result = await response.json();
                    console.log("✅ Cart synced successfully:", result);

                    // Keep the stored user.cart in sync so refresh reflects the latest cart
                    const freshUserStr = localStorage.getItem("user");
                    if (freshUserStr) {
                        const freshUser = JSON.parse(freshUserStr);
                        const updatedUser = { ...freshUser, cart: cartItems };
                        localStorage.setItem('user', JSON.stringify(updatedUser));
                    }
                }
            }
        } catch (error) {
            console.error('❌ Error syncing cart to server:', error);
            // Don't throw error to prevent app crashes, just log it
        }
    }, [cartItems]);

    // Sync cart to server whenever cart changes
    useEffect(() => {
        if (cartItems.length > 0) {
            syncCartToServer();
        }
    }, [cartItems, syncCartToServer]);

    const value: CartContextType = {
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalAmount,
        isInCart,
        updateCartFromServer,
        syncCartToServer,
        updatePricesFromProducts,
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
