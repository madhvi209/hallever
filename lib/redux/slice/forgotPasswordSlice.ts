import { createSlice, PayloadAction, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { AxiosError } from "axios";
// Selectors
import { RootState } from "../store";

// ForgotPassword interface
export interface ForgotPassword {
    id?: string;
    name: string;
    email: string;
    phone?: string;
    status?: "pending" | "completed";
    createdOn?: string;
    updatedOn?: string;
}

// State interface
interface ForgotPasswordState {
    data: ForgotPassword[];
    loading: boolean;
    error: string | null;
    selectedForgotPassword: ForgotPassword | null;
}

const initialState: ForgotPasswordState = {
    data: [],
    loading: false,
    error: null,
    selectedForgotPassword: null,
};

// Slice
const forgotPasswordSlice = createSlice({
    name: "forgotPassword",
    initialState,
    reducers: {
        setForgotPasswords: (state, action: PayloadAction<ForgotPassword[]>) => {
            state.data = action.payload;
            state.loading = false;
            state.error = null;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        setError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.loading = false;
        },
        setSelectedForgotPassword: (state, action: PayloadAction<ForgotPassword | null>) => {
            state.selectedForgotPassword = action.payload;
        },
        clearSelectedForgotPassword: (state) => {
            state.selectedForgotPassword = null;
        },
    },
});

export const {
    setForgotPasswords,
    setLoading,
    setError,
    setSelectedForgotPassword,
    clearSelectedForgotPassword,
} = forgotPasswordSlice.actions;

export default forgotPasswordSlice.reducer;

// Thunks

export const fetchForgotPasswords = () => async (dispatch: Dispatch): Promise<void> => {
    dispatch(setLoading(true));
    try {
        const response = await axios.get("/api/routes/forgotPassword");
        dispatch(setForgotPasswords(response.data.data));
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to fetch forgot passwords"));
    }

};

export const addForgotPassword = (forgotPassword: ForgotPassword) => async (dispatch: Dispatch): Promise<ForgotPassword | void> => {
    try {
        const response = await axios.post("/api/routes/forgotPassword", forgotPassword);
        return response.data as ForgotPassword;
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to add forgot password"));
    }

};

export const updateForgotPassword = (id: string, forgotPassword: ForgotPassword) => async (dispatch: Dispatch): Promise<ForgotPassword | void> => {
    try {
        const response = await axios.put(`/api/routes/forgotPassword/${id}`, forgotPassword);
        return response.data as ForgotPassword;
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to update forgot password"));
    }
};

export const deleteForgotPassword = (id: string) => async (dispatch: Dispatch): Promise<void> => {
    try {
        await axios.delete(`/api/routes/forgotPassword/${id}`);
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to delete forgot password"));
    }

};

export const selectForgotPasswords = (state: RootState) => state.forgotPassword.data;
export const selectLoading = (state: RootState) => state.forgotPassword.loading;
export const selectError = (state: RootState) => state.forgotPassword.error;
export const selectSelectedForgotPassword = (state: RootState) => state.forgotPassword.selectedForgotPassword;
