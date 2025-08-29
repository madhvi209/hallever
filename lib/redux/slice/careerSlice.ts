// lib/redux/features/careerSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppDispatch } from '../store';
import axios, { AxiosError } from 'axios';

// Correct interface name: Job
export interface Job {
    id?: string;
    title: string;
    department: string;
    location: string;
    type: 'Full-time' | 'Part-time' | 'Internship' | 'Remote';
    description?: string;
    skills: string[];
    responsibilities: string[];
    salaryRange?: string;
    experience?: string;
    education?: string;
    status?: 'open' | 'closed';
    createdOn?: string; 
    updatedOn?: string;
}

interface CareerState {
    careers: Job[];
    selectedCareer: Job | null;
    isLoading: boolean;
    error: string | null;
}

const initialState: CareerState = {
    careers: [],
    selectedCareer: null,
    isLoading: false,
    error: null,
};

// Thunks
export const fetchCareers = () => async (dispatch: AppDispatch) => {
    try {
        dispatch(setLoading(true));
        const res = await axios.get('/api/routes/jobs');
        dispatch(setCareers(res.data));
        dispatch(setError(null));
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || 'Failed to fetch careers'));
    } finally {
        dispatch(setLoading(false));
    }
};

export const createCareer = (newCareer: Job) => async (dispatch: AppDispatch) => {
    try {
        dispatch(setLoading(true));
        const res = await axios.post('/api/routes/jobs', newCareer);
        dispatch(addCareer(res.data));
        dispatch(setError(null));
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || 'Failed to add career'));
    } finally {
        dispatch(setLoading(false));
    }
};

export const updateCareer = (updatedCareer: Job) => async (dispatch: AppDispatch) => {
    try {
        dispatch(setLoading(true));
        const res = await axios.put(`/api/routes/jobs/${updatedCareer.id}`, updatedCareer);
        dispatch(editCareer(res.data));
        dispatch(setError(null));
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || 'Failed to update career'));
    } finally {
        dispatch(setLoading(false));
    }
};

export const deleteCareer = (id: string) => async (dispatch: AppDispatch) => {
    try {
        dispatch(setLoading(true));
        await axios.delete(`/api/routes/jobs/${id}`);
        dispatch(removeCareer(id));
        dispatch(setError(null));
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || 'Failed to delete career'));
    } finally {
        dispatch(setLoading(false));
    }
};

// Slice
const careerSlice = createSlice({
    name: 'careers',
    initialState,
    reducers: {
        setCareers(state, action: PayloadAction<Job[]>) {
            state.careers = action.payload;
        },
        addCareer(state, action: PayloadAction<Job>) {
            state.careers.unshift(action.payload);
        },
        editCareer(state, action: PayloadAction<Job>) {
            const index = state.careers.findIndex((c) => c.id === action.payload.id);
            if (index !== -1) {
                state.careers[index] = action.payload;
            }
        },
        removeCareer(state, action: PayloadAction<string>) {
            state.careers = state.careers.filter((c) => c.id !== action.payload);
        },
        selectCareer(state, action: PayloadAction<Job | null>) {
            state.selectedCareer = action.payload;
        },
        setLoading(state, action: PayloadAction<boolean>) {
            state.isLoading = action.payload;
        },
        setError(state, action: PayloadAction<string | null>) {
            state.error = action.payload;
        },
    },
});

export const {
    setCareers,
    addCareer,
    editCareer,
    removeCareer,
    selectCareer,
    setLoading,
    setError,
} = careerSlice.actions;

// Selectors
export const selectCareerList = (state) => state.careers.careers;
export const selectAllCareers = (state: { careers: CareerState }) => state.careers.careers;
export const selectSelectedCareer = (state: { careers: CareerState }) => state.careers.selectedCareer;
export const selectCareerLoading = (state: { careers: CareerState }) => state.careers.isLoading;
export const selectCareerError = (state: { careers: CareerState }) => state.careers.error;

export default careerSlice.reducer;
