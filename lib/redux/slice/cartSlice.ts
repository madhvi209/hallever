// lib/redux/slice/cartSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { RootState, AppDispatch } from "../store";
import axios from "axios";

export interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
    wattage?: string;
}

interface CartState {
    items: CartItem[];
    isLoading: boolean;
    error: string | null;
}

const initialState: CartState = {
    items: [],
    isLoading: false,
    error: null,
};

const cartSlice = createSlice({
    name: "cart",
    initialState,
    reducers: {
        setCartItems: (state, action: PayloadAction<CartItem[]>) => {
            state.items = action.payload;
        },
        addToCart: (state, action: PayloadAction<CartItem>) => {
            const existingItem = state.items.find((item) => item.id === action.payload.id);

            if (existingItem) {
                existingItem.quantity += action.payload.quantity;
            } else {
                state.items.push(action.payload);
            }

            localStorage.setItem("guestCart", JSON.stringify(state.items));
        },
        removeFromCart: (state, action: PayloadAction<string>) => {
            state.items = state.items.filter((item) => item.id !== action.payload);
            localStorage.setItem("guestCart", JSON.stringify(state.items));
        },
        updateQuantity: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
            const item = state.items.find((item) => item.id === action.payload.id);
            if (item) {
                item.quantity = action.payload.quantity;
                localStorage.setItem("guestCart", JSON.stringify(state.items));
            }
        },
        clearCart: (state) => {
            state.items = [];
            localStorage.removeItem("guestCart");
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
        },
    },
});

export const {
    setCartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    setLoading,
    setError,
} = cartSlice.actions;

// ======================
// Selectors
// ======================
export const selectCartItems = (state: RootState) => state.cart.items;
export const selectCartTotal = (state: RootState) =>
    state.cart.items.reduce((total, item) => total + item.price * item.quantity, 0);
export const selectCartItemsCount = (state: RootState) =>
    state.cart.items.reduce((count, item) => count + item.quantity, 0);

export default cartSlice.reducer;

// ======================
// Thunks
// ======================

// Fetch user cart from server
export const fetchCart = (userId: string) => async (dispatch: AppDispatch) => {
    try {
        dispatch(setLoading(true));
        const response = await axios.get(`/api/routes/cart/${userId}`);
        dispatch(setCartItems(response.data.items));
    } catch (error: any) {
        dispatch(setError(error.message));
    } finally {
        dispatch(setLoading(false));
    }
};

// Save user cart to server
export const saveCart = (userId: string, items: CartItem[]) => async (dispatch: AppDispatch) => {
    try {
        dispatch(setLoading(true));
        await axios.post(`/api/routes/cart/${userId}`, { items, merge: false });
        dispatch(setCartItems(items));
    } catch (error: any) {
        dispatch(setError(error.message));
    } finally {
        dispatch(setLoading(false));
    }
};

// Merge guest cart with server cart on login
export const syncCartOnLogin = (userId: string) => async (dispatch: AppDispatch) => {
    try {
        dispatch(setLoading(true));

        const guestCart: CartItem[] = JSON.parse(localStorage.getItem("guestCart") || "[]");

        if (guestCart.length > 0) {
            await axios.post(`/api/routes/cart/${userId}`, {
                items: guestCart,
                merge: true,
            });
        }

        const response = await axios.get(`/api/routes/cart/${userId}`);
        dispatch(setCartItems(response.data.items));

        localStorage.removeItem("guestCart");
    } catch (error: any) {
        dispatch(setError(error.message));
    } finally {
        dispatch(setLoading(false));
    }
};
