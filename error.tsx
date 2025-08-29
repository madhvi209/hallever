'use client';

import { useEffect } from 'react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error('Global error:', error);
    }, [error]);

    return (
        <html>
            <body>
                <div className="flex items-center justify-center h-screen text-center">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
                        <p className="mb-4">{error.message}</p>
                        <button
                            onClick={() => reset()}
                            className="px-4 py-2 bg-black text-white rounded"
                        >
                            Try again
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
