import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import OrderService from "@/app/api/services/orderServices";

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    if (!RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { message: "Razorpay key secret is not configured" },
        { status: 500 }
      );
    }

    const {
      internalOrderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    if (
      !internalOrderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return NextResponse.json(
        { message: "Missing Razorpay verification payload" },
        { status: 400 }
      );
    }

    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expected = crypto
      .createHmac("sha256", RAZORPAY_KEY_SECRET)
      .update(payload)
      .digest("hex");

    const internalOrder = await OrderService.getOrderById(internalOrderId);
    if (!internalOrder) {
      return NextResponse.json({ success: false, message: "Order not found" }, { status: 404 });
    }

    // Guard against mismatched/malicious Razorpay order linkage.
    if (
      internalOrder.razorpayOrderId &&
      internalOrder.razorpayOrderId !== razorpay_order_id
    ) {
      return NextResponse.json(
        { success: false, message: "Razorpay order id mismatch" },
        { status: 409 }
      );
    }

    // Idempotent success: already marked paid with same payment id.
    if (
      internalOrder.paymentStatus === "paid" &&
      internalOrder.razorpayPaymentId === razorpay_payment_id
    ) {
      return NextResponse.json({
        success: true,
        data: internalOrder,
        message: "Payment already verified",
      });
    }

    // Refuse conflicting duplicate verifies if already paid with different payment id.
    if (
      internalOrder.paymentStatus === "paid" &&
      internalOrder.razorpayPaymentId &&
      internalOrder.razorpayPaymentId !== razorpay_payment_id
    ) {
      return NextResponse.json(
        { success: false, message: "Order already paid with a different payment id" },
        { status: 409 }
      );
    }

    if (expected !== razorpay_signature) {
      // Don't downgrade an already paid order.
      if (internalOrder.paymentStatus !== "paid") {
        await OrderService.updateOrder(internalOrderId, {
          paymentStatus: "failed",
          status: "pending_payment",
        });
      }
      return NextResponse.json(
        { success: false, message: "Invalid signature" },
        { status: 400 }
      );
    }

    const updatedOrder = await OrderService.updateOrder(internalOrderId, {
      paymentMethod: "razorpay",
      paymentStatus: "paid",
      status: "processing",
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    return NextResponse.json({
      success: true,
      data: updatedOrder,
      message: "Payment verified successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Verification failed" },
      { status: 500 }
    );
  }
}
