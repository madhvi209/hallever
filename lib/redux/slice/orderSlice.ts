// lib/redux/slice/orderSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../store";
import axios from "axios";

// Type for a selected product in the order
export interface SelectedProduct {
    id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    wattage: string;
}

// Type for the form data
export interface OrderFormData {
    fullName: string;
    email: string;
    phone: string;
    message: string;
    searchQuery?: string;
    selectedCategory?: string;
    selectedSubCategory?: string;
}

// Order type including ID
export interface Order {
    id: string;
    formData: OrderFormData;
    selectedProducts: SelectedProduct[];
    totalAmount: number;
    status?: 'processing' | 'in_transit' | 'delivered' | 'cancelled' | 'pending';
    createdAt?: string;
    updatedAt?: string;
}

// Slice state type
interface OrderState {
    orders: Order[];
    formData: OrderFormData;
    selectedProducts: SelectedProduct[];
    isLoading: boolean;
    error: string | null;
}

const initialState: OrderState = {
    orders: [],
    formData: {
        fullName: "",
        email: "",
        phone: "",
        message: "",
        searchQuery: "",
        selectedCategory: "",
        selectedSubCategory: "",
    },
    selectedProducts: [],
    isLoading: false,
    error: null,
};

const orderSlice = createSlice({
    name: "order",
    initialState,
    reducers: {
        setLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
            state.isLoading = false;
        },
        setOrders(state, action: PayloadAction<Order[]>) {
            state.orders = action.payload;
            state.isLoading = false;
        },
        setFormField: (
            state,
            action: PayloadAction<{ field: keyof OrderFormData; value: string }>
        ) => {
            state.formData[action.payload.field] = action.payload.value;
        },
        addSelectedProduct: (state, action: PayloadAction<SelectedProduct>) => {
            const exists = state.selectedProducts.find((p) => p.id === action.payload.id);
            if (!exists) state.selectedProducts.push(action.payload);
        },
        updateSelectedProduct: (
            state,
            action: PayloadAction<{ id: string; field: keyof SelectedProduct; value: string | number }>
        ) => {
            state.selectedProducts = state.selectedProducts.map((p) =>
                p.id === action.payload.id ? { ...p, [action.payload.field]: action.payload.value } : p
            );
        },
        removeSelectedProduct: (state, action: PayloadAction<string>) => {
            state.selectedProducts = state.selectedProducts.filter((p) => p.id !== action.payload);
        },
        resetOrderForm(state) {
            state.formData = initialState.formData;
            state.selectedProducts = [];
        },
        addOrderSuccess(state, action: PayloadAction<Order>) {
            state.orders.push(action.payload);
            state.isLoading = false;
        },
        updateOrderSuccess(state, action: PayloadAction<Order>) {
            const index = state.orders.findIndex((o) => o.id === action.payload.id);
            if (index !== -1) state.orders[index] = action.payload;
            state.isLoading = false;
        },
        deleteOrderSuccess(state, action: PayloadAction<string>) {
            state.orders = state.orders.filter((o) => o.id !== action.payload);
            state.isLoading = false;
        },
    },
});

export const {
    setLoading,
    setError,
    setOrders,
    setFormField,
    addSelectedProduct,
    updateSelectedProduct,
    removeSelectedProduct,
    resetOrderForm,
    addOrderSuccess,
    updateOrderSuccess,
    deleteOrderSuccess,
} = orderSlice.actions;

export default orderSlice.reducer;

// ----------------- THUNKS -----------------

// Fetch all orders
export const fetchOrders = () => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
        const res = await axios.get<{ success: boolean; data: Order[] }>("/api/routes/orders");
        dispatch(setOrders(res.data.data));
    } catch (error) {
        const err = error as { message?: string };
        dispatch(setError(err.message || "Failed to fetch orders"));
    }
};

// Add a new order
export const addOrder = (order: { formData: OrderFormData; selectedProducts: SelectedProduct[]; totalAmount: number; status?: Order['status'] }) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
        const res = await axios.post<{ success: boolean; data: Order }>("/api/routes/orders", order);
        console.log("this is res", res);
        dispatch(addOrderSuccess(res.data.data));
    } catch (error) {   
        const err = error as { message?: string };
        dispatch(setError(err.message || "Failed to add order"));
    }
};

// Update existing order
export const updateOrder = (order: Order) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
        const res = await axios.put<{ statusCode: number; data: Order }>(`/api/routes/orders/${order.id}`, order);
        dispatch(updateOrderSuccess(res.data.data));
    } catch (error) {
        const err = error as { message?: string };
        dispatch(setError(err.message || "Failed to update order"));
    }
};

// Delete order
export const deleteOrder = (id: string) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
        await axios.delete<{ statusCode: number; data: Order }>(`/api/routes/orders/${id}`);
        dispatch(deleteOrderSuccess(id));
    } catch (error) {
        const err = error as { message?: string };
        dispatch(setError(err.message || "Failed to delete order"));
    }
};

// Fetch order by ID
export const fetchOrderById = (id: string) => async (dispatch: AppDispatch) => {
    dispatch(setLoading(true));
    try {
        const res = await axios.get<{ statusCode: number; data: Order }>(`/api/routes/orders/${id}`);
        dispatch(updateOrderSuccess(res.data.data));
    } catch (err) {
        const errorObj = err as { message?: string };
        dispatch(setError(errorObj.message || "Failed to fetch order by ID"));
    }
};

// ----------------- SELECTORS -----------------
export const selectOrderForm = (state: RootState) => state.order.formData;
export const selectSelectedProducts = (state: RootState) => state.order.selectedProducts;
export const selectTotalAmount = (state: RootState) =>
    state.order.selectedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
export const selectAllOrders = (state: RootState) => state.order.orders;
export const selectOrderById = (state: RootState, id: string) =>
    state.order.orders.find((o) => o.id === id);
