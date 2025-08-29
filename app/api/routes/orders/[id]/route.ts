// app/api/orders/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import OrderService from "@/app/api/services/orderServices";
import consoleManager from "@/app/api/utils/consoleManager";

// GET order by ID
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const order = await OrderService.getOrderById(id);

        if (!order) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Order not found",
            }, { status: 404 });
        }

        consoleManager.log("Order fetched:", order);
        return NextResponse.json({
            statusCode: 200,
            message: "Order fetched successfully",
            data: order,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });

    } catch (error: unknown) {
        const message = typeof error === "object" && error && "message" in error
            ? (error as { message?: string }).message
            : String(error);
        consoleManager.error("Error in GET /api/orders/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: message || "Internal Server Error",
        }, { status: 500 });
    }
}

// PUT order by ID
export async function PUT(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const body = await _req.json();

        // Update order and read back full data
        const updatedOrder = await OrderService.updateOrder(id, body);

        if (!updatedOrder) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Order not found",
            }, { status: 404 });
        }

        consoleManager.log("Order updated:", updatedOrder);
        return NextResponse.json({
            statusCode: 200,
            message: "Order updated successfully",
            data: updatedOrder,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });

    } catch (error: unknown) {
        const message = typeof error === "object" && error && "message" in error
            ? (error as { message?: string }).message
            : String(error);
        consoleManager.error("Error in PUT /api/orders/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: message || "Internal Server Error",
        }, { status: 500 });
    }
}

// DELETE order by ID
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        // Optional: fetch order before deleting to return its data
        const deletedOrder = await OrderService.getOrderById(id);

        const isDeleted = await OrderService.deleteOrder(id);

        if (!isDeleted.success) {
            return NextResponse.json({
                statusCode: 404,
                errorCode: "NOT_FOUND",
                errorMessage: "Order not found",
            }, { status: 404 });
        }

        consoleManager.log("Order deleted:", id);
        return NextResponse.json({
            statusCode: 200,
            message: "Order deleted successfully",
            data: deletedOrder || null,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });

    } catch (error: unknown) {
        const message = typeof error === "object" && error && "message" in error
            ? (error as { message?: string }).message
            : String(error);
        consoleManager.error("Error in DELETE /api/orders/[id]:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: message || "Internal Server Error",
        }, { status: 500 });
    }
}
