import { NextRequest, NextResponse } from "next/server";
import ForgotPasswordService from "@/app/api/services/forgotPassword";
import consoleManager from "@/app/api/utils/consoleManager";
import { db } from "@/app/api/config/firebase";

// GET all forgot password
export async function GET() {
    try {
        const forgotPassword = await ForgotPasswordService.getAllForgotPassword();
        return NextResponse.json({ success: true, data: forgotPassword }, { status: 200 });
    } catch (error) {
        consoleManager.error("Error in GET /api/forgotPassword:", error as Error);
        return NextResponse.json({ success: false, message: "Failed to fetch forgot password" } as const, { status: 500 });
    }
}

// POST new forgot password
export async function POST(req: NextRequest): Promise<NextResponse> {
    try {
        const body = await req.json();
        const { name, email, phone, status } = body;

        if (!name || !email || !phone) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        // Normalize phone helper
        const normalizePhone = (raw: string) => {
            const digits = (raw || '').replace(/\D/g, '');
            const local10 = digits.length >= 10 ? digits.slice(-10) : digits;
            const country = digits.length > 10 ? digits.slice(0, digits.length - 10) : '91';
            return { local10, e164: `+${country}${local10}` };
        };

        // Verify that a user with this email exists
        const snapshot = await db.collection("users").where("email", "==", email.toLowerCase()).get();
        if (snapshot.empty) {
            return NextResponse.json({ message: "Email not found. Please enter a registered email." }, { status: 404 });
        }

        // Match phone with stored user phone/phoneNumber (compare last 10 digits)
        const userDoc = snapshot.docs[0];
        const userData = userDoc.data() as any;
        const provided = normalizePhone(phone).local10;
        const stored = normalizePhone(userData.phone || userData.phoneNumber || '').local10;
        if (!stored || provided !== stored) {
            return NextResponse.json({ message: "Phone number does not match our records." }, { status: 400 });
        }

        const newForgotPassword = await ForgotPasswordService.addForgotPassword({ name, email, phone, status });

        return NextResponse.json({ success: true, data: newForgotPassword }, { status: 201 });
    } catch (error) {
        consoleManager.error("Error in POST /api/forgotPassword:", error);
        return NextResponse.json({ success: false, message: "Failed to create forgot password" }, { status: 500 });
    }
}
