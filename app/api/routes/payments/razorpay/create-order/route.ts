import { NextRequest, NextResponse } from "next/server";
import OrderService from "@/app/api/services/orderServices";

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || "";
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { message: "Razorpay env vars are not configured" },
        { status: 500 }
      );
    }

    const { orderId } = await req.json();
    if (!orderId) {
      return NextResponse.json({ message: "orderId is required" }, { status: 400 });
    }

    const internalOrder = await OrderService.getOrderById(orderId);
    if (!internalOrder) {
      return NextResponse.json({ message: "Order not found" }, { status: 404 });
    }
    if (internalOrder.paymentStatus === "paid") {
      return NextResponse.json(
        { message: "Order is already paid", data: { internalOrderId: orderId } },
        { status: 400 }
      );
    }
    if (internalOrder.status === "cancelled" || internalOrder.status === "delivered") {
      return NextResponse.json(
        { message: `Cannot create payment for order in ${internalOrder.status} state` },
        { status: 400 }
      );
    }

    const amountPaise = Math.round(Number(internalOrder.totalAmount || 0) * 100);
    if (!amountPaise || amountPaise < 100) {
      return NextResponse.json({ message: "Invalid payable amount" }, { status: 400 });
    }

    const receipt = `hallever_${orderId}`.slice(0, 40);
    const basicAuth = Buffer.from(`${RAZORPAY_KEY_ID}:${RAZORPAY_KEY_SECRET}`).toString(
      "base64"
    );

    // Idempotency: reuse existing Razorpay order if already created and unpaid.
    if (internalOrder.razorpayOrderId) {
      return NextResponse.json({
        success: true,
        data: {
          razorpayOrderId: internalOrder.razorpayOrderId,
          amount: amountPaise,
          currency: "INR",
          key: RAZORPAY_KEY_ID,
          internalOrderId: orderId,
          reused: true,
        },
      });
    }

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: amountPaise,
        currency: "INR",
        receipt,
        notes: {
          internalOrderId: orderId,
        },
      }),
    });

    const rpOrder = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { message: rpOrder?.error?.description || "Failed to create Razorpay order" },
        { status: 400 }
      );
    }

    await OrderService.updateOrder(orderId, {
      paymentMethod: "razorpay",
      paymentStatus: "pending",
      status: "pending_payment",
      razorpayOrderId: rpOrder.id,
    });

    return NextResponse.json({
      success: true,
      data: {
        razorpayOrderId: rpOrder.id,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        key: RAZORPAY_KEY_ID,
        internalOrderId: orderId,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        message: error instanceof Error ? error.message : "Create order failed",
      },
      { status: 500 }
    );
  }
}
