import { createSlice, PayloadAction, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { AxiosError } from "axios";
// Selectors
import { RootState } from "../store";

// Lead interface
export interface Lead {
    id?: string;
    name: string;
    email: string;
    status?: "new" | "contacted" | "converted" | "rejected";
    phone?: string;
    role?: "dealer" | "customer" | "agency" | "distributor";
    city?: string;
    message?: string;
    createdOn?: string;
    updatedOn?: string;
}

// State interface
interface LeadState {
    data: Lead[];
    loading: boolean;
    error: string | null;
    selectedLead: Lead | null;
}

const initialState: LeadState = {
    data: [],
    loading: false,
    error: null,
    selectedLead: null,
};

// Slice
const leadSlice = createSlice({
    name: "leads",
    initialState,
    reducers: {
        setLeads: (state, action: PayloadAction<Lead[]>) => {
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
        setSelectedLead: (state, action: PayloadAction<Lead | null>) => {
            state.selectedLead = action.payload;
        },
        clearSelectedLead: (state) => {
            state.selectedLead = null;
        },
    },
});

export const {
    setLeads,
    setLoading,
    setError,
    setSelectedLead,
    clearSelectedLead,
} = leadSlice.actions;

export default leadSlice.reducer;

// Thunks

export const fetchLeads = () => async (dispatch: Dispatch): Promise<void> => {
    dispatch(setLoading(true));
    try {
        const response = await axios.get("/api/routes/leads");
        dispatch(setLeads(response.data.data));
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to delete lead"));
    }

};

export const addLead = (lead: Lead) => async (dispatch: Dispatch): Promise<Lead | void> => {
    dispatch(setLoading(true));
    try {
        const response = await axios.post("/api/routes/leads", lead);
        return response.data as Lead;
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to delete lead"));
    }

};

export const updateLead = (id: string, lead: Lead) => async (dispatch: Dispatch): Promise<Lead | void> => {
    dispatch(setLoading(true));
    try {
        const response = await axios.put(`/api/routes/leads/${id}`, lead);
        return response.data as Lead;
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to delete lead"));
    }

};

export const deleteLead = (id: string) => async (dispatch: Dispatch): Promise<void> => {
    dispatch(setLoading(true));
    try {
        await axios.delete(`/api/routes/leads/${id}`);
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to delete lead"));
    }

};

export const selectLeads = (state: RootState) => state.leads.data;
export const selectLoading = (state: RootState) => state.leads.loading;
export const selectError = (state: RootState) => state.leads.error;
export const selectSelectedLead = (state: RootState) => state.leads.selectedLead;
