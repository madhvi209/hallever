import { NextRequest, NextResponse } from "next/server";
import AuthService from "@/app/api/services/authServices";
import consoleManager from "@/app/api/utils/consoleManager";

// GET user by ID
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const user = await AuthService.getUserById(id);
        
        if (!user) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "USER_NOT_FOUND",
                errorMessage: "User not found",
            }, { status: 404 });
        }

        return NextResponse.json({
            statusCode: 200,
            message: "User fetched successfully",
            data: user,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });

    } catch (error: unknown) {
        const message = typeof error === "object" && error && "message" in error
            ? (error as { message?: string }).message
            : String(error);
        consoleManager.error("Error in GET /api/auth/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: message || "Internal Server Error",
        }, { status: 500 });
    }
}

// PUT - Update user profile
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await req.json();
        const { fullName, phoneNumber } = body;

        // Validate input
        if (!fullName && !phoneNumber) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "INVALID_INPUT",
                errorMessage: "At least one field (fullName or phoneNumber) is required.",
            }, { status: 400 });
        }

        const updateData: { fullName?: string; phoneNumber?: string } = {};
        if (fullName !== undefined) updateData.fullName = fullName;
        if (phoneNumber !== undefined) updateData.phoneNumber = phoneNumber;

        // updateUser may return void, so we can't check for falsy value
        await AuthService.updateUser(id, updateData);

        // After update, fetch the user to check if it exists and return updated data
        const updatedUser = await AuthService.getUserById(id);

        if (!updatedUser) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "USER_NOT_FOUND",
                errorMessage: "User not found",
            }, { status: 404 });
        }

        consoleManager.log("User updated:", id);
        return NextResponse.json({
            statusCode: 200,
            message: "User updated successfully",
            data: updatedUser,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });

    } catch (error: unknown) {
        const message = typeof error === "object" && error && "message" in error
            ? (error as { message?: string }).message
            : String(error);
        consoleManager.error("Error in PUT /api/auth/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: message || "Internal Server Error",
        }, { status: 500 });
    }
}

// DELETE user by ID
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        // deleteUserByUid may return void, so we can't check for result.success
        await AuthService.deleteUserByUid(id);

        // After deletion, try to fetch the user to confirm deletion
        const user = await AuthService.getUserById(id);
        if (user) {
            // User still exists, so deletion failed
            return NextResponse.json({
                statusCode: 404,
                errorCode: "USER_NOT_FOUND",
                errorMessage: "User not found",
            }, { status: 404 });
        }

        consoleManager.log("User deleted:", id);
        return NextResponse.json({
            statusCode: 200,
            message: "User deleted successfully",
            data: { id },
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });

    } catch (error: unknown) {
        const message = typeof error === "object" && error && "message" in error
            ? (error as { message?: string }).message
            : String(error);
        consoleManager.error("Error in DELETE /api/auth/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: message || "Internal Server Error",
        }, { status: 500 });
    }
}
