import { NextRequest, NextResponse } from "next/server";

export default function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const userCookie = request.cookies.get("user")?.value;
    let user = null;
    try {
        user = userCookie ? JSON.parse(decodeURIComponent(userCookie)) : null;
    } catch { }

    // Protect /profile
    if (pathname.startsWith("/profile")) {
        if (!user) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        const role = typeof user?.role === "string" ? user.role.toLowerCase().trim() : "";
        if (role === "admin") {
            return NextResponse.redirect(new URL("/dashboard", request.url));
        }
    }

    // Protect /dashboard
    if (pathname.startsWith("/dashboard")) {
        if (!user) {
            return NextResponse.redirect(new URL("/login", request.url));
        }
        const role = typeof user?.role === "string" ? user.role.toLowerCase().trim() : "";
        if (role !== "admin") {
            return NextResponse.redirect(new URL("/profile", request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/profile/:path*", "/dashboard/:path*"]
};