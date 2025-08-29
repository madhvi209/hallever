// lib/redux/slice/jobApplicationSlice.ts

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch } from "../store";
import axios from "axios";

// Types
export interface JobApplication {
    id?: string;
    jobId: string;
    name: string;
    email: string;
    phone: string;
    resumeUrl?: string;
    status: "Pending" | "Selected" | "Rejected";
    createdOn?: string;
    updatedOn?: string;
}

interface JobApplicationState {
    applications: JobApplication[];
    selectedApplication: JobApplication | null;
    loading: boolean;
    error: string | null;
}

const initialState: JobApplicationState = {
    applications: [],
    selectedApplication: null,
    loading: false,
    error: null,
};

// Slice
const jobApplicationSlice = createSlice({
    name: "jobApplication",
    initialState,
    reducers: {
        setApplications(state, action: PayloadAction<JobApplication[]>) {
            state.applications = action.payload;
        },
        setSelectedApplication(state, action: PayloadAction<JobApplication | null>) {
            state.selectedApplication = action.payload;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.loading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
        updateStatus(
            state,
            action: PayloadAction<{ id: string; status: JobApplication["status"] }>
        ) {
            const { id, status } = action.payload;
            const app = state.applications.find((a) => a.id === id);
            if (app) app.status = status;
        },
        addApplication(state, action: PayloadAction<JobApplication>) {
            state.applications.push(action.payload);
        },
        deleteApplication(state, action: PayloadAction<string>) {
            state.applications = state.applications.filter((a) => a.id !== action.payload);
        },
    },
});

// Actions
export const {
    setApplications,
    setSelectedApplication,
    setLoading,
    setError,
    updateStatus,
    addApplication,
    deleteApplication,
} = jobApplicationSlice.actions;

export default jobApplicationSlice.reducer;

// Thunks

// Fetch all applications
export const fetchJobApplications = () => async (dispatch: AppDispatch) => {
    try {
        dispatch(setLoading(true));
        const res = await axios.get("/api/routes/job-applications");
        dispatch(setApplications(res.data));
        dispatch(setError(null));
    } catch (error) {
        dispatch(setError(error?.message || "Failed to fetch applications"));
    } finally {
        dispatch(setLoading(false));
    }
};

// Fetch single application
export const fetchJobApplicationById = (id: string) => async (dispatch: AppDispatch) => {
    try {
        dispatch(setLoading(true));
        const res = await axios.get(`/api/routes/job-applications/${id}`);
        dispatch(setSelectedApplication(res.data));
        dispatch(setError(null));
    } catch (error) {
        dispatch(setError(error?.message || "Failed to fetch application"));
    } finally {
        dispatch(setLoading(false));
    }
};

// Add application (multipart/form-data)
export const addJobApplication = (formData: FormData) => async (dispatch: AppDispatch) => {
    try {
        dispatch(setLoading(true));
        const res = await axios.post("/api/routes/job-applications", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
        dispatch(addApplication(res.data));
        dispatch(setSelectedApplication(null));
        dispatch(setError(null));
    } catch (error) {
        dispatch(setError(error?.message || "Failed to apply"));
    } finally {
        dispatch(setLoading(false));
    }
};

// Update status (admin)
export const updateJobApplicationStatus =
    (id: string, status: JobApplication["status"]) => async (dispatch: AppDispatch) => {
        try {
            await axios.put(`/api/routes/job-applications/${id}`, { status });
            dispatch(updateStatus({ id, status }));
        } catch (error) {
            console.error("Failed to update status", error);
        }
    };

// Delete application (admin)
export const deleteJobApplication = (id: string) => async (dispatch: AppDispatch) => {
    try {
        await axios.delete(`/api/routes/job-applications/${id}`);
        dispatch(deleteApplication(id));
    } catch (error) {
        console.error("Failed to delete job application", error);
    }
};


// Selectors
export const selectApplications = (state) => state.jobApplication.applications;
export const selectSelectedApplication = (state) => state.jobApplication.selectedApplication;
export const selectApplicationsLoading = (state) => state.jobApplication.loading;
export const selectApplicationsError = (state) => state.jobApplication.error;
