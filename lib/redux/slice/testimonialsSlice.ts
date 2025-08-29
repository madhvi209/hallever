// /store/testimonialSlice.ts
import { createSlice, PayloadAction, Dispatch } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { RootState } from "../store";

// Testimonial interface
export interface Testimonial {
    id?: string;
    name: string;
    event: string;
    location: string;
    rating: number;
    text: string;
    status?: "active" | "inactive";
    createdOn?: string;
    updatedOn?: string;
}

// State interface
interface TestimonialState {
    data: Testimonial[];
    loading: boolean;
    error: string | null;
    selectedTestimonial: Testimonial | null;
}

const initialState: TestimonialState = {
    data: [],
    loading: false,
    error: null,
    selectedTestimonial: null,
};

// Slice
const testimonialSlice = createSlice({
    name: "testimonials",
    initialState,
    reducers: {
        setTestimonials: (state, action: PayloadAction<Testimonial[]>) => {
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
        setSelectedTestimonial: (
            state,
            action: PayloadAction<Testimonial | null>
        ) => {
            state.selectedTestimonial = action.payload;
        },
        clearSelectedTestimonial: (state) => {
            state.selectedTestimonial = null;
        },

        // ✅ Update testimonial reducer (fixed to use `data`)
        updateTestimonialSuccess: (state, action: PayloadAction<Testimonial>) => {
            const index = state.data.findIndex((t) => t.id === action.payload.id);
            if (index !== -1) {
                state.data[index] = action.payload;
            }
        },

        // ✅ Add testimonial reducer
        addTestimonialSuccess: (state, action: PayloadAction<Testimonial>) => {
            state.data.push(action.payload);
        },

        // ✅ Delete testimonial reducer
        deleteTestimonialSuccess: (state, action: PayloadAction<string>) => {
            state.data = state.data.filter((t) => t.id !== action.payload);
        },
    },
});

export const {
    setTestimonials,
    setLoading,
    setError,
    setSelectedTestimonial,
    clearSelectedTestimonial,
    updateTestimonialSuccess,
    addTestimonialSuccess,
    deleteTestimonialSuccess,
} = testimonialSlice.actions;

export default testimonialSlice.reducer;

// ✅ Thunks

// Fetch all testimonials
export const fetchTestimonials =
    () => async (dispatch: Dispatch): Promise<void> => {
        dispatch(setLoading(true));
        try {
            const response = await axios.get("/api/routes/testimonials");
            dispatch(setTestimonials(response.data.data));
        } catch (error) {
            const axiosError = error as AxiosError;
            dispatch(setError(axiosError.message || "Failed to fetch testimonials"));
        }
    };

// Add a new testimonial
export const addTestimonial =
    (testimonial: Testimonial) =>
        async (dispatch: Dispatch): Promise<Testimonial | void> => {
            dispatch(setLoading(true));
            try {
                const response = await axios.post(
                    "/api/routes/testimonials",
                    testimonial
                );
                const added = response.data.data as Testimonial;
                dispatch(addTestimonialSuccess(added)); // ✅ update redux
                return added;
            } catch (error) {
                const axiosError = error as AxiosError;
                dispatch(setError(axiosError.message || "Failed to add testimonial"));
            } finally {
                dispatch(setLoading(false));
            }
        };

// Update a testimonial by ID
export const updateTestimonial =
    (id: string, testimonial: Partial<Testimonial>) =>
        async (dispatch: Dispatch): Promise<Testimonial | void> => {
            dispatch(setLoading(true));
            try {
                const response = await axios.put(
                    `/api/routes/testimonials/${id}`,
                    testimonial
                );
                const updated = response.data.data as Testimonial;

                dispatch(updateTestimonialSuccess(updated)); // ✅ update redux
                return updated;
            } catch (error) {
                const axiosError = error as AxiosError;
                dispatch(setError(axiosError.message || "Failed to update testimonial"));
            } finally {
                dispatch(setLoading(false));
            }
        };

// Delete a testimonial by ID
export const deleteTestimonial =
    (id: string) => async (dispatch: Dispatch): Promise<void> => {
        dispatch(setLoading(true));
        try {
            await axios.delete(`/api/routes/testimonials/${id}`);
            dispatch(deleteTestimonialSuccess(id)); // ✅ update redux
        } catch (error) {
            const axiosError = error as AxiosError;
            dispatch(setError(axiosError.message || "Failed to delete testimonial"));
        } finally {
            dispatch(setLoading(false));
        }
    };

// ✅ Selectors
export const selectTestimonials = (state: RootState) =>
    state.testimonials.data;
export const selectIsLoading = (state: RootState) =>
    state.testimonials.loading;
export const selectError = (state: RootState) => state.testimonials.error;
export const selectTestimonialItem = (state: RootState) =>
    state.testimonials.selectedTestimonial;
