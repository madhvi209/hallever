"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser, selectError } from "@/lib/redux/slice/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";

interface AlertType {
    type: "success" | "error";
    message: string;
}

const SignupForm = () => {
    const router = useRouter();
    const dispatch = useDispatch<AppDispatch>();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [alert, setAlert] = useState<AlertType | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setAlert(null);
        setLoading(true);

        if (!name || !email || !password) {
            setAlert({ type: "error", message: "Please fill all required fields." });
            setLoading(false);
            return;
        }

        // ✅ Format phone number to E.164
        let formattedPhone = phone.trim();
        if (formattedPhone && !formattedPhone.startsWith("+")) {
            formattedPhone = `+91${formattedPhone}`; // 👈 Replace with your actual default country code if needed
        }

        const e164Regex = /^\+[1-9]\d{1,14}$/;
        if (formattedPhone && !e164Regex.test(formattedPhone)) {
            setAlert({
                type: "error",
                message: "Please enter a valid phone number with country code (e.g. +919876543210).",
            });
            setLoading(false);
            return;
        }

        try {
            await dispatch(registerUser({
                email,
                password,
                fullName: name,
                phoneNumber: formattedPhone,
            }));

            setAlert({ type: "success", message: "Account created successfully!" });
            setLoading(false);
            setTimeout(() => router.replace("/login"), 2000);
            setTimeout(() => setAlert(null), 3000);
        } catch (err: any) {
            setAlert({ type: "error", message: err?.message || "Registration failed. Please try again." });
            setLoading(false);
            setTimeout(() => setAlert(null), 4000);
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-[rgba(0,0,0,0.4)] backdrop-blur-sm">
            <div className="max-w-md w-full p-6 bg-white bg-opacity-90 backdrop-blur-md rounded-xl shadow-lg space-y-6">
                <div className="text-center space-y-1">
                    <h2 className="text-2xl font-bold text-[var(--primary-red)] mb-3.5">Sign Up</h2>
                    <p className="text-center text-gray-500">Create your account to get started</p>
                </div>

                {alert && (
                    <div
                        className={`text-sm px-4 py-3 rounded-md ${alert.type === "success"
                            ? "bg-green-100 text-green-700 border border-green-300"
                            : "bg-red-100 text-red-700 border border-red-300"
                            }`}
                    >
                        {alert.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-[var(--primary-red)]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-[var(--primary-red)]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-[var(--primary-red)]"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring focus:ring-[var(--primary-red)]"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[var(--primary-red)] text-white py-2 rounded-md hover:bg-red-700 transition"
                    >
                        {loading ? "Signing up..." : "Sign Up"}
                    </button>

                    <div className="flex items-center my-2">
                        <hr className="flex-grow border-gray-300" />
                        <span className="mx-2 text-gray-500 text-sm">OR</span>
                        <hr className="flex-grow border-gray-300" />
                    </div>

                    <button
                        type="button"
                        onClick={() => router.push("/login")}
                        className="w-full bg-white text-gray-700 border border-gray-300 py-2 rounded-md hover:bg-gray-100 transition"
                    >
                        Already have an account? Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default SignupForm;
