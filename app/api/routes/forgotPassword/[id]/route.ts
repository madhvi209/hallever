import { NextRequest, NextResponse } from "next/server";
import ForgotPasswordService from "@/app/api/services/forgotPassword";
import consoleManager from "@/app/api/utils/consoleManager";

// GET forgot password by id
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
        const { id } = await params;

        if (!id) {
            return NextResponse.json({ message: "Missing required id" } as const, { status: 400 });
        }

        const forgotPassword = await ForgotPasswordService.getForgotPasswordById(id);

        return NextResponse.json({ success: true, data: forgotPassword }, { status: 201 });
    } catch (error) {
        consoleManager.error("Error in GET /api/forgotPassword:", error as Error);
        return NextResponse.json({ success: false, message: "Failed to fetch forgot password" } as const, { status: 500 });
    }
}

// PUT forgot password by id
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> {
    try {
        const { id } = await params;
        const body = await req.json();
        const { name, email, phone, status } = body;

        if (!name || !email || !phone) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const updatedForgotPassword = await ForgotPasswordService.updateForgotPassword(id, { name, email, phone, status });

        return NextResponse.json({ success: true, data: updatedForgotPassword }, { status: 201 });
    } catch (error) {
        consoleManager.error("Error in PUT /api/forgotPassword:", error as Error);
        return NextResponse.json({ success: false, message: "Failed to update forgot password" } as const, { status: 500 });
    }
}
