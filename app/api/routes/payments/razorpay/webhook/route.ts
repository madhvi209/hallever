import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import OrderService from "@/app/api/services/orderServices";
import { db } from "@/app/api/config/firebase";
import admin from "firebase-admin";

const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

export async function POST(req: NextRequest) {
  try {
    if (!RAZORPAY_WEBHOOK_SECRET) {
      return NextResponse.json(
        { message: "Razorpay webhook secret is not configured" },
        { status: 500 }
      );
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const eventId = req.headers.get("x-razorpay-event-id") || "";

    const expected = crypto
      .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    if (expected !== signature) {
      return NextResponse.json({ message: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventName = event?.event as string | undefined;
    const paymentEntity = event?.payload?.payment?.entity;
    const rpOrderId = paymentEntity?.order_id as string | undefined;
    const rpPaymentId = paymentEntity?.id as string | undefined;

    if (!rpOrderId) {
      return NextResponse.json({ success: true, message: "No order id in event" });
    }

    const internalOrder = await OrderService.getOrderByRazorpayOrderId(rpOrderId);
    if (!internalOrder) {
      return NextResponse.json({ success: true, message: "Order mapping not found" });
    }

    // Idempotency for duplicate webhook deliveries.
    if (eventId) {
      const eventRef = db.collection("payment_webhook_events").doc(eventId);
      const eventDoc = await eventRef.get();
      if (eventDoc.exists) {
        return NextResponse.json({ success: true, message: "Webhook already processed" });
      }
      await eventRef.set({
        eventId,
        eventName,
        razorpayOrderId: rpOrderId,
        internalOrderId: internalOrder.id,
        createdOn: admin.firestore.FieldValue.serverTimestamp(),
      });
    }

    if (eventName === "payment.captured") {
      // Idempotent: don't reprocess if already paid with same payment id.
      if (
        internalOrder.paymentStatus === "paid" &&
        internalOrder.razorpayPaymentId === rpPaymentId
      ) {
        return NextResponse.json({ success: true, message: "Payment already captured" });
      }
      // Conflict guard: already paid with different payment id.
      if (
        internalOrder.paymentStatus === "paid" &&
        internalOrder.razorpayPaymentId &&
        internalOrder.razorpayPaymentId !== rpPaymentId
      ) {
        return NextResponse.json(
          { success: true, message: "Ignoring conflicting captured event for already-paid order" }
        );
      }
      await OrderService.updateOrder(internalOrder.id, {
        paymentStatus: "paid",
        status: "processing",
        razorpayPaymentId: rpPaymentId,
      });
    } else if (eventName === "payment.failed") {
      // Never downgrade a paid order.
      if (internalOrder.paymentStatus !== "paid") {
        await OrderService.updateOrder(internalOrder.id, {
          paymentStatus: "failed",
          status: "pending_payment",
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { message: error instanceof Error ? error.message : "Webhook handling failed" },
      { status: 500 }
    );
  }
}
