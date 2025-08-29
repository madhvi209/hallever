import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "../store";
import axios from "axios";

// Offer type
export interface OfferBanner {
    id?: string;
    image: string;
    title: string;
    subtitle: string;
    createdOn?: string;
    updatedOn?: string;
}

// Slice state
interface OfferState {
    data: OfferBanner[];
    isLoading: boolean;
    error: string | null;
}

const initialState: OfferState = {
    data: [],
    isLoading: false,
    error: null,
};

const offerSlice = createSlice({
    name: "offers",
    initialState,
    reducers: {
        setOffersLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },
        setOffersData(state, action: PayloadAction<OfferBanner[]>) {
            state.data = action.payload;
        },
        addOffer(state, action: PayloadAction<OfferBanner>) {
            state.data.push(action.payload);
        },
        updateOffer(state, action: PayloadAction<OfferBanner>) {
            const index = state.data.findIndex((o) => o.id === action.payload.id);
            if (index !== -1) {
                state.data[index] = action.payload;
            }
        },
        removeOffer(state, action: PayloadAction<string>) {
            state.data = state.data.filter((o) => o.id !== action.payload);
        },
        setOffersError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
    },
});

export const {
    setOffersLoading,
    setOffersData,
    addOffer,
    updateOffer,
    removeOffer,
    setOffersError,
} = offerSlice.actions;

export default offerSlice.reducer;

// ======================= Async Thunks =======================

// Fetch all offers
export const fetchOffersBanner = () => async (dispatch: AppDispatch) => {
    try {
        dispatch(setOffersLoading(true));
        const res = await axios.get("/api/routes/offersBanner");
        dispatch(setOffersData(res.data.data));
    } catch (error) {
        dispatch(setOffersError(error.message || "Failed to fetch offers"));
    } finally {
        dispatch(setOffersLoading(false));
    }
};

// Create new offer (accept FormData)
export const createOfferBanner =
    (formData: FormData) => async (dispatch: AppDispatch) => {
        try {
            dispatch(setOffersLoading(true));
            const res = await axios.post("/api/routes/offersBanner", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            dispatch(addOffer(res.data.data));
        } catch (error) {
            dispatch(setOffersError(error.message || "Failed to create offer"));
        } finally {
            dispatch(setOffersLoading(false));
        }
    };

// Edit existing offer (accept FormData)
export const editOfferBanner =
    (id: string, formData: FormData) => async (dispatch: AppDispatch) => {
        try {
            dispatch(setOffersLoading(true));
            const res = await axios.put(`/api/routes/offersBanner/${id}`, formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            dispatch(updateOffer(res.data.data));
        } catch (error) {
            dispatch(setOffersError(error.message || "Failed to update offer"));
        } finally {
            dispatch(setOffersLoading(false));
        }
    };

// Remove offer
export const removeOfferBanner =
    (id: string) => async (dispatch: AppDispatch) => {
        try {
            dispatch(setOffersLoading(true));
            await axios.delete(`/api/routes/offersBanner/${id}`);
            dispatch(removeOffer(id));
        } catch (error) {
            dispatch(setOffersError(error.message || "Failed to remove offer"));
        } finally {
            dispatch(setOffersLoading(false));
        }
    };

export const selectOffersBanner = (state: { offersBanner: OfferState }) =>
    state.offersBanner.data;

export const selectOffersBannerLoading = (state: { offersBanner: OfferState }) =>
    state.offersBanner.isLoading;

