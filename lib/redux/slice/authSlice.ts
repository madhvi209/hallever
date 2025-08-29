import { createSlice, Dispatch } from "@reduxjs/toolkit";
import { RootState } from "../store";
import axios, { AxiosError } from "axios";


export interface User {
    uid?: string;
    email: string;
    fullName?: string;
    address?: string;
    gender?: string;
    nationality?: string;
    dob?: string;
    maritalStatus?: string;
    phoneNumber?: string;
    status?: string;
    role?: string;
    tlcId?: string;
    createdOn: string;
    updatedOn: string;
}

interface AuthState {
    user: User | null;
    users: User[];
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

const initialState: AuthState = {
    user: null,
    users: [],
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setUser: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
            state.isLoading = false;
            state.error = null;
        },
        setUsers: (state, action) => {
            state.users = action.payload;
            state.isLoading = false;
            state.error = null;
        },
        setIsAuthenticated: (state, action) => {
            state.isAuthenticated = action.payload;
        },
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
            state.isLoading = false;
        },
    },
});

export const { setUser, setUsers, setIsAuthenticated, setIsLoading, setError } = authSlice.actions;

export const login = ({ email, password }: { email: string; password: string }) => async (dispatch: Dispatch) => {
    dispatch(setIsLoading(true));
    try {
        // 1. Call login API
        const loginRes = await axios.post("/api/routes/auth", { email, password });
        if (loginRes.status !== 200) {
            dispatch(setError(loginRes.data.errorMessage || "Login failed"));
            dispatch(setIsLoading(false));
            return null;
        }
        // 2. Fetch user details (role, etc)
        const userRes = await axios.get(`/api/routes/auth?email=${encodeURIComponent(email)}`);
        if (userRes.status !== 200 || !userRes.data.data) {
            dispatch(setError("Could not fetch user details"));
            dispatch(setIsLoading(false));
            return null;
        }
        dispatch(setUser(userRes.data.data));
        dispatch(setError(null));
        return userRes.data.data;
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to get user"));
        return null;
    } finally {
        dispatch(setIsLoading(false));
    }
};

export const logout = () => async (dispatch: Dispatch) => {
    dispatch(setIsLoading(true));
    try {
        const response = await axios.post("/api/routes/auth");
        if (response.status === 200) {
            dispatch(setUser(null));
            dispatch(setIsAuthenticated(false));
        } else {
            dispatch(setError(response.data.message));
        }
    } catch (error: unknown) {
        const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
        dispatch(setError(message || "Unknown error"));
    } finally {
        dispatch(setIsLoading(false));
    }
};

export const registerUser = (user: { email: string; password: string; fullName?: string; phoneNumber?: string; role?: string }) => async (dispatch: Dispatch) => {
    dispatch(setIsLoading(true));
    try {
        const response = await axios.put("/api/routes/auth", user);
        if (response.status === 200 || response.status === 201) {
            dispatch(setUser(response.data.data));
            return response.data.data;
        } else {
            const message = response.data?.errorMessage || "Registration failed";
            dispatch(setError(message));
            throw new Error(message);
        }
    } catch (error) {
        const axiosError = error as AxiosError<{ errorMessage?: string; message?: string }>;
        const data = axiosError.response?.data;
        const message = data?.errorMessage || data?.message || axiosError.message || "Failed to register the user";
        dispatch(setError(message));
        throw new Error(message);
    } finally {
        dispatch(setIsLoading(false));
    }
};

export const deleteUserByUid = (uid: string) => async (dispatch: Dispatch) => {
    dispatch(setIsLoading(true));
    try {
        const response = await axios.delete("/api/routes/auth", {
            data: { uid },
            headers: { "Content-Type": "application/json" },
        });
        if (response.status === 200) {
            dispatch(setUser(null));
            dispatch(setIsAuthenticated(false));
        } else {
            dispatch(setError(response.data.errorMessage || "Delete failed"));
        }
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to delete user"));
    } finally {
        dispatch(setIsLoading(false));
    }
};

export const fetchUsers = () => async (dispatch: Dispatch) => {
    dispatch(setIsLoading(true));
    try {
        const response = await axios.get("/api/routes/auth?all=true");
        if (response.status === 200) {
            dispatch(setUsers(response.data.data));
        } else {
            dispatch(setError(response.data.errorMessage || "Failed to fetch users"));
        }
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to fetch user"));
    } finally {
        dispatch(setIsLoading(false));
    }
};

export const fetchUserById = (uid: string) => async (dispatch: Dispatch) => {
    dispatch(setIsLoading(true));
    try {
        const response = await axios.get(`/api/routes/auth?uid=${uid}`);
        if (response.status === 200) {
            dispatch(setUser(response.data.data));
        } else {
            dispatch(setError(response.data.errorMessage || "Failed to fetch user"));
        }
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to fetch"));
    } finally {
        dispatch(setIsLoading(false));
    }
};

export const updateUser = (payload: { uid: string } & Record<string, unknown>) => async (dispatch: Dispatch) => {
    dispatch(setIsLoading(true));
    try {
        const response = await axios.patch("/api/routes/auth", payload);
        if (response.status === 200) {
            return response.data;
        } else {
            dispatch(setError(response.data.errorMessage || "Failed to update user"));
        }
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to update"));
    } finally {
        dispatch(setIsLoading(false));
    }
};

export const addUser = (payload: { email: string; password: string; fullName?: string; role?: string; phoneNumber?: string; address?: string; status?: string; gender?: string; nationality?: string; dob?: string; maritalStatus?: string }) => async (dispatch: Dispatch) => {
    dispatch(setIsLoading(true));
    try {
        const response = await axios.put("/api/routes/auth", payload);
        if (response.status === 200 || response.status === 201) {
            return response.data;
        } else {
            dispatch(setError(response.data.errorMessage || "Failed to add user"));
        }
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to add user"));
    } finally {
        dispatch(setIsLoading(false));
    }
};

export const selectUser = (state: RootState) => state.auth.user;
export const selectUsers = (state: RootState) => state.auth.users;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectError = (state: RootState) => state.auth.error;

export default authSlice.reducer;