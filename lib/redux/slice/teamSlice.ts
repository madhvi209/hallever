// lib/redux/slice/teamSlice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { AppDispatch, RootState } from "../store";
import axios from "axios";

export interface TeamMember {
    id: string;
    name: string;
    position: string;
    bio?: string;
    image?: string;
    createdOn: string;
    updatedOn: string;
}

interface TeamState {
    data: TeamMember[];
    isLoading: boolean;
    error: string | null;
    selectedTeamMember: TeamMember | null;
}

const initialState: TeamState = {
    data: [],
    isLoading: false,
    error: null,
    selectedTeamMember: null,
};

const teamSlice = createSlice({
    name: "team",
    initialState,
    reducers: {
        setTeamData: (state, action: PayloadAction<TeamMember[]>) => {
            state.data = action.payload;
            state.isLoading = false;
            state.error = null;
        },
        setTeamLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        setTeamError: (state, action: PayloadAction<string | null>) => {
            state.error = action.payload;
            state.isLoading = false;
        },
        addTeamMember: (state, action: PayloadAction<TeamMember>) => {
            state.data.push(action.payload);
        },
        updateTeamMember: (state, action: PayloadAction<TeamMember>) => {
            const index = state.data.findIndex(m => m.id === action.payload.id);
            if (index !== -1) {
                state.data[index] = action.payload;
            }
        },
        deleteTeamMember: (state, action: PayloadAction<string>) => {
            state.data = state.data.filter(m => m.id !== action.payload);
        },
        setSelectedTeamMember: (state, action: PayloadAction<TeamMember | null>) => {
            state.selectedTeamMember = action.payload;
        },
    },
});

export const {
    setTeamData,
    setTeamLoading,
    setTeamError,
    addTeamMember,
    updateTeamMember,
    deleteTeamMember,
    setSelectedTeamMember,
} = teamSlice.actions;

export default teamSlice.reducer;

// ✅ Async Thunks
export const fetchTeam = () => async (dispatch: AppDispatch) => {
    dispatch(setTeamLoading(true));
    try {
        const res = await axios.get("/api/routes/teams");
        dispatch(setTeamData(res.data.data));
    } catch (error) {
        dispatch(setTeamError(error.message || "Failed to fetch team"));
    }
};

export const createTeamMember = (formData: FormData) => async (dispatch: AppDispatch) => {
    try {
        const res = await axios.post("/api/routes/teams", formData);
        dispatch(addTeamMember(res.data.data));
    } catch (error) {
        dispatch(setTeamError(error.message || "Failed to create team member"));
    }
};

export const editTeamMember = (id: string, formData: FormData) => async (dispatch: AppDispatch) => {
    try {
        const res = await axios.put(`/api/routes/teams/${id}`, formData);
        dispatch(updateTeamMember(res.data.data));
    } catch (error) {
        dispatch(setTeamError(error.message || "Failed to update team member"));
    }
};

export const removeTeamMember = (id: string) => async (dispatch: AppDispatch) => {
    try {
        await axios.delete(`/api/routes/teams/${id}`);
        dispatch(deleteTeamMember(id));
    } catch (error) {
        dispatch(setTeamError(error.message || "Failed to delete team member"));
    }
};

// ✅ Selectors
export const selectTeam = (state: RootState) => state.team.data;
export const selectTeamLoading = (state: RootState) => state.team.isLoading;
export const selectTeamError = (state: RootState) => state.team.error;
export const selectSelectedTeamMember = (state: RootState) => state.team.selectedTeamMember;
