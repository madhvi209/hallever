// app/api/orders/route.ts
import { NextRequest, NextResponse } from "next/server";
import OrderService from "@/app/api/services/orderServices";
import consoleManager from "@/app/api/utils/consoleManager";

// GET all orders
export async function GET() {
    try {
        const orders = await OrderService.getAllOrders();
        return NextResponse.json({ success: true, data: orders }, { status: 200 });
    } catch (error) {
        consoleManager.error("Error in GET /api/orders:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch orders" }, { status: 500 });
    }
}

// POST new order
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { formData, selectedProducts, status, totalAmount } = body;

        // Validate required fields
        if (!formData?.fullName || !formData?.email || !formData?.message || !selectedProducts?.length) {
            return NextResponse.json({ message: "Missing required fields or no products selected" }, { status: 400 });
        }

        const newOrder = await OrderService.addOrder({ formData, selectedProducts, totalAmount, status: status || 'processing' });

        return NextResponse.json({ success: true, data: newOrder }, { status: 201 });

    } catch (error) {
        consoleManager.error("Error in POST /api/orders:", error);
        return NextResponse.json({ success: false, message: "Failed to create order" }, { status: 500 });
    }
}
