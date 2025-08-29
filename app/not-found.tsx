// app/not-found.tsx
"use client";

import { usePathname, useRouter } from "next/navigation";

export default function NotFound() {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-xl mx-auto text-center">
                {/* 404 Header */}
                <h1 className="text-8xl md:text-9xl font-bold text-red-500 mb-4 animate-bounce">
                    404
                </h1>
                <div className="w-24 h-1 bg-red-400 mx-auto rounded-full mb-6"></div>

                {/* Error Message */}
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-4">
                    Oops! Page Not Found
                </h2>
                <p className="text-lg text-gray-600 max-w-md mx-auto leading-relaxed mb-8">
                    The page you’re looking for doesn’t exist or has been moved.
                    Let’s get you back on track!
                </p>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:border-red-500 hover:text-red-500 transition"
                    >
                        ← Go Back
                    </button>
                    <button
                        onClick={() => router.push("/")}
                        className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                        ⌂ Back to Home
                    </button>
                </div>

                {/* Footer Message */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-500">
                        Error Code: <span className="font-mono text-red-400">404</span> •
                        Route: <span className="font-mono text-red-400">{pathname}</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
