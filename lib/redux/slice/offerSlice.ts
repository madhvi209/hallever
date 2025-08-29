// lib/redux/slice/offerSlice.ts

import { createSlice } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../store";
import axios from "axios";

// Types
export interface Offer {
    id?: string;
    title: string;
    code: string;
    description: string;
}

interface OfferState {
    offer: Offer | null;
    loading: boolean;
    error: string | null;
}

const initialState: OfferState = {
    offer: null,
    loading: false,
    error: null,
};

// Slice
const offerSlice = createSlice({
    name: "offer",
    initialState,
    reducers: {
        startLoading(state) {
            state.loading = true;
            state.error = null;
        },
        setOffer(state, action) {
            state.offer = action.payload;
            state.loading = false;
        },
        setError(state, action) {
            state.error = action.payload;
            state.loading = false;
        },
        clearOffer(state) {
            state.offer = null;
        },
    },
});

export const { startLoading, setOffer, setError, clearOffer } = offerSlice.actions;
export default offerSlice.reducer;

// Async Thunks
export const fetchOffer = () => async (dispatch: AppDispatch) => {
    dispatch(startLoading());
    try {
        const res = await axios.get("/api/routes/offers");
        dispatch(setOffer(res.data.data));
    } catch (error) {
        dispatch(setError(error.response?.data?.message || "Failed to fetch offer"));
    }
};

export const addOffer = (data: Offer) => async (dispatch: AppDispatch) => {
    dispatch(startLoading());
    try {
        await axios.post("/api/routes/offers", data);
        dispatch(fetchOffer());
    } catch (error) {
        dispatch(setError(error.response?.data?.message || "Failed to add offer"));
    }
};

export const updateOffer = (data: Offer) => async (dispatch: AppDispatch) => {
    dispatch(startLoading());
    try {
        await axios.put("/api/routes/offers", data);
        dispatch(fetchOffer());
    } catch (error) {
        dispatch(setError(error.response?.data?.message || "Failed to update offer"));
    }
};

export const deleteOffer = () => async (dispatch: AppDispatch) => {
    dispatch(startLoading());
    try {
        await axios.delete("/api/routes/offers");
        dispatch(clearOffer());
    } catch (error) {
        dispatch(setError(error.response?.data?.message || "Failed to delete offer"));
    }
};

// Selectors
export const selectOffer = (state: RootState) => state.offer.offer;
export const selectIsLoading = (state: RootState) => state.offer.loading;
export const selectError = (state: RootState) => state.offer.error;
