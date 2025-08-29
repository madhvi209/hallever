import { createSlice, Dispatch } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { RootState } from "../store";

// Service interface
export interface ServiceItem {
    id?: string;
    title: string;
    description: string;
    features?: string[];
    category?: string;
    icon?: string;
    images?: string[];
    createdOn: string;
    updatedOn: string;
}

interface ServiceState {
    services: ServiceItem[];
    isLoading: boolean;
    error: string | null;
    selectedService: ServiceItem | null;
}

const initialState: ServiceState = {
    services: [],
    isLoading: false,
    error: null,
    selectedService: null,
};

const serviceSlice = createSlice({
    name: "service",
    initialState,
    reducers: {
        setServices: (state, action) => {
            state.services = action.payload;
            state.isLoading = false;
            state.error = null;
        },
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setSelectedService: (state, action) => {
            state.selectedService = action.payload;
        },
        clearSelectedService: (state) => {
            state.selectedService = null;
        },
        clearServices: (state) => {
            state.services = [];
        },
    },
});

export const {
    setServices,
    setIsLoading,
    setError,
    setSelectedService,
    clearSelectedService,
    clearServices,
} = serviceSlice.actions;

// ✅ Async Actions

export const fetchServices = () => async (dispatch: Dispatch) => {
    dispatch(setIsLoading(true));
    try {
        const res = await axios.get("/api/routes/services");
        dispatch(setServices(res.data.data));
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to fetch the services"));
    }
};

export const fetchServiceById = (id: string) => async (dispatch: Dispatch) => {
    dispatch(setIsLoading(true));
    try {
        const res = await axios.get(`/api/routes/services/${id}`);
        dispatch(setSelectedService(res.data.data));
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to fetch the service"));
    }
};

export const addService = (service: FormData) => async (dispatch: Dispatch) => {
    try {
        // Image upload is optional, so no need to enforce image in FormData
        const res = await axios.post("/api/routes/services", service, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        dispatch(setServices(res.data.data));
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to add the service"));
    }
};

export const updateService = (service: FormData, id: string) => async (dispatch: Dispatch) => {
    try {
        // Image upload is optional, so no need to enforce image in FormData
        const res = await axios.put(`/api/routes/services/${id}`, service, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        dispatch(setServices(res.data.data));
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to update the service"));
    }
};

export const deleteService = (id: string) => async (dispatch: Dispatch) => {
    try {
        const res = await axios.delete(`/api/routes/services/${id}`);
        dispatch(setServices(res.data.data));
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to delete the service"));
    }
};

// ✅ Selectors
export const selectServices = (state: RootState) => state.services.services;
export const selectSelectedService = (state: RootState) => state.services.selectedService;
export const selectIsLoading = (state: RootState) => state.services.isLoading;
export const selectError = (state: RootState) => state.services.error;

export default serviceSlice.reducer;
