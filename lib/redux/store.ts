// lib/redux/store.ts
import { configureStore } from "@reduxjs/toolkit";
import blogReducer from "./slice/blogSlice";
import careerReducer from "./slice/careerSlice";
import productReducer from "./slice/productSlice";
import serviceReducer from "./slice/serviceSlice";
import leadReducer from "./slice/leadSlice";    
import authReducer from "./slice/authSlice";
import countReducer from "./slice/countSlice";
import offerReducer from "./slice/offerSlice";
import jobApplicationReducer from './slice/jobApplicationsSlice';
import testimonialsReducer from "./slice/testimonialsSlice"
import teamReducer from "./slice/teamSlice"
import offerBannerReducer from "./slice/offerBannerSlice"
import orderReducer from "./slice/orderSlice"
import forgotPasswordReducer from "./slice/forgotPasswordSlice"
import cartReducer from "./slice/cartSlice";

      

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        count: countReducer,
        blogs: blogReducer,
        careers: careerReducer,
        products: productReducer,
        services: serviceReducer,
        leads: leadReducer,
        jobApplication: jobApplicationReducer,
        offer: offerReducer,
        testimonials:testimonialsReducer,
        team:teamReducer,
        offersBanner:offerBannerReducer,
        order: orderReducer,
        forgotPassword: forgotPasswordReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
