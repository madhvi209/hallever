import { createSlice, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { setLoading } from "./leadSlice";
import { AxiosError } from "axios";


export interface Blog {
    id?: string;
    title: string;
    slug: string;
    titleLower?:string;
    summary: string;
    category?: string;
    image?: string;
    date?: string;
    createdOn?: string | FirebaseFirestore.FieldValue;
    updatedOn?: string | FirebaseFirestore.FieldValue;
}

interface BlogState {
    blogs: Blog[];
    isLoading: boolean;
    error: string | null;
    selectedBlog: Blog | null;
}

const initialState: BlogState = {
    blogs: [],
    isLoading: false,
    error: null,
    selectedBlog: null,
};

const blogSlice = createSlice({
    name: "blogs",
    initialState,
    reducers: {
        setBlogs: (state, action) => {
            state.blogs = action.payload;
            state.isLoading = false;
            state.error = null;
        },
        setIsLoading: (state, action) => {
            state.isLoading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setSelectedBlog: (state, action) => {
            state.selectedBlog = action.payload;
        },
        clearSelectedBlog: (state) => {
            state.selectedBlog = null;
        },
        clearBlogs: (state) => {
            state.blogs = [];
        },
    },
});

export const { setBlogs, setIsLoading, setError, setSelectedBlog, clearSelectedBlog, clearBlogs } = blogSlice.actions;

export const fetchBlogs = () => async (dispatch: Dispatch) => {
    dispatch(setIsLoading(true));
    try {
        const response = await axios.get("/api/routes/blogs");
        if (response.status === 200) {
            dispatch(setBlogs(response.data.data));
        } else {
            dispatch(setError(response.data.message));
        }
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed get blogs"));
    }
};

export const fetchBlogById = (id: string) => async (dispatch: Dispatch) => {
    dispatch(setIsLoading(true));
    try {
        const response = await axios.get(`/api/routes/blogs/${id}`);
        if (response.status === 200) {
            dispatch(setSelectedBlog(response.data.data));
        } else {
            dispatch(setError(response.data.message));
        }
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed get blog "));
    }
};


export const titleToQueryString = (title: string) =>
    encodeURIComponent(title.trim());


// Fetch blog by slug
export const fetchBlogByTitle = (id: string) => async (dispatch: Dispatch) => {
    dispatch(setLoading(true));
    try {
        const res = await axios.get(`/api/routes/blogs/${id}`);
        dispatch(setSelectedBlog(res.data.data));
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to get blog by title"));
    }
};


export const addBlog = (formData: FormData) => async (dispatch: Dispatch) => {
    try {
        const response = await axios.post("/api/routes/blogs", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        if (response.status === 200) {
            dispatch(setBlogs(response.data.data));
        } else {
            dispatch(setError(response.data.message));
        }
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to add blog"));
    }
};

export const updateBlog = (formData: FormData, id: string) => async (dispatch: Dispatch) => {
    try {
        const response = await axios.put(`/api/routes/blogs/${id}`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        if (response.status === 200) {
            dispatch(setBlogs(response.data.data));
        } else {
            dispatch(setError(response.data.message));
        }
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to update blog"));
    }
};

export const deleteBlog = (id: string) => async (dispatch: Dispatch) => {
    try {
        const response = await axios.delete(`/api/routes/blogs/${id}`);
        if (response.status === 200) {
            dispatch(setBlogs(response.data.data));
        } else {
            dispatch(setError(response.data.message));
        }
    } catch (error) {
        const axiosError = error as AxiosError;
        dispatch(setError(axiosError.message || "Failed to delete blog"));
    }
};

// Selectors
export const selectBlogs = (state: RootState) => state.blogs.blogs;
export const selectSelectedBlog = (state: RootState) => state.blogs.selectedBlog;
export const selectIsLoading = (state: RootState) => state.blogs.isLoading;
export const selectError = (state: RootState) => state.blogs.error;

// Export the reducer
export default blogSlice.reducer;
