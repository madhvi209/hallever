import { AnyAction, createSlice, Dispatch, ThunkAction } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { RootState } from "../store";

// ✅ Product interface
export interface ProductItem {
    id?: string | number;
    name: string;
    price: number;
    summary: string;
    wattage: string;
    images: string[];
    link?: string;
    category?: | "Indoor" | "Outdoor" | "Tent Decoration" | "Raw Materials"| "Machinery" | "Solar Lights"| "Others";
    subCategory?: string; 
    specifications?: {
        dimensions?: string;
        weight?: string;
        voltage?: string;
        efficiency?: string;
        useCase?: string;
        warranty?: string;
    };
    features?: string[];
    technicalSpecs?: {
        [key: string]: string;
    };
    brochureUrl?: string;
    createdOn?: string;
    updatedOn?: number;
}

// ✅ Redux state type
interface ProductState {
    products: ProductItem[];
    isLoading: boolean;
    error: string | null;
    selectedProduct: ProductItem | null;
}

// ✅ Initial state
const initialState: ProductState = {
    products: [],
    isLoading: false,
    error: null,
    selectedProduct: null,
};

// ✅ Utility function for file conversion (optional)
export function fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// ✅ Slice
const productSlice = createSlice({
    name: "product",
    initialState,
    reducers: {
        setProducts: (state, action) => {
            state.products = action.payload;
            state.isLoading = false;
            state.error = null;
        },
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setSelectedProduct: (state, action) => {
            state.selectedProduct = action.payload;
        },
        clearSelectedProduct: (state) => {
            state.selectedProduct = null;
        },
        clearProducts: (state) => {
            state.products = [];
        },
    },
});

export const {
    setProducts,
    setIsLoading,
    setError,
    setSelectedProduct,
    clearSelectedProduct,
    clearProducts,
} = productSlice.actions;

// ✅ Fetch all products
export const fetchProducts = () => async (dispatch: Dispatch) => {
    dispatch(setIsLoading(true));
    try {
        const res = await axios.get("/api/routes/products");
        dispatch(setProducts(res.data.data));
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to fetch the products"));
    }
};

// ✅ Fetch by ID
export const fetchProductById = (
    id: string
): ThunkAction<Promise<ProductItem | null>, RootState, unknown, AnyAction> =>
    async (dispatch) => {
        dispatch(setIsLoading(true));
        try {
            const res = await axios.get(`/api/routes/products/${id}`);
            const product = res.data.data;
            dispatch(setSelectedProduct(product));
            return product;
        } catch (error) {
            const axiosError = error as AxiosError;
            dispatch(setError(axiosError.message || "Failed to fetch product"));
            return null;
        } finally {
            dispatch(setIsLoading(false));
        }
    };

// ✅ Add product
export const addProduct = (formData: FormData) => async (dispatch: Dispatch) => {
    try {
        const res = await axios.post("/api/routes/products", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        dispatch(fetchProducts() as unknown as AnyAction);
        window.location.reload();
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to add product"));
    }
};

// ✅ Update product
export const updateProduct = (formData: FormData, id: string) => async (dispatch: Dispatch) => {
    try {
        const res = await axios.put(`/api/routes/products/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        dispatch(fetchProducts() as unknown as AnyAction);
        window.location.reload();
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to update product"));
    }
};

// ✅ Delete product
export const deleteProduct = (id: string) => async (dispatch: Dispatch) => {
    try {
        const res = await axios.delete(`/api/routes/products/${id}`);
        dispatch(setProducts(res.data.data));
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to delete product"));
        window.location.reload();
    }
};

// ✅ Selectors
export const selectProducts = (state: RootState) => state.products.products;
export const selectSelectedProduct = (state: RootState) => state.products.selectedProduct;
export const selectIsLoading = (state: RootState) => state.products.isLoading;
export const selectError = (state: RootState) => state.products.error;

// ✅ Selector to get sub-categories for a selected category
export const selectSubCategories = (state: RootState, category: string) => {
    const filtered = state.products.products.filter(
        (p) => p.category?.toLowerCase() === category.toLowerCase()
    );
    const unique = Array.from(
        new Set(filtered.map((p) => p.subCategory).filter(Boolean))
    );
    return unique;
};

export default productSlice.reducer;
