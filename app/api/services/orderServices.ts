// app/api/services/orderService.ts
import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";
import { OrderFormData, SelectedProduct } from "@/lib/redux/slice/orderSlice";

export type PaymentStatus = "pending" | "paid" | "failed";
export type OrderStatus =
    | "pending"
    | "pending_payment"
    | "processing"
    | "in_transit"
    | "delivered"
    | "cancelled";

export interface ShippingInfo {
    method: "standard" | "express";
    cost: number;
    estimatedDays: number;
}

export interface AddressInfo {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
}

export interface Order {
    id: string;
    userId?: string;
    isGuest?: boolean;
    formData: OrderFormData;
    selectedProducts: SelectedProduct[];
    totalAmount: number;
    shippingInfo?: ShippingInfo;
    addressInfo?: AddressInfo;
    paymentMethod?: "cod" | "razorpay";
    paymentStatus?: PaymentStatus;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    status?: OrderStatus;
    createdOn?: FirebaseFirestore.Timestamp;
    updatedOn?: FirebaseFirestore.Timestamp;
}

class OrderService {
    private static applySafeStateTransition(
        current: Order,
        incoming: Partial<{
            formData: OrderFormData;
            selectedProducts: SelectedProduct[];
            totalAmount: number;
            shippingInfo?: ShippingInfo;
            addressInfo?: AddressInfo;
            paymentMethod?: "cod" | "razorpay";
            paymentStatus?: PaymentStatus;
            razorpayOrderId?: string;
            razorpayPaymentId?: string;
            razorpaySignature?: string;
            status?: Order["status"];
        }>
    ) {
        const next = { ...incoming };

        // Never allow paid orders to be downgraded.
        if (current.paymentStatus === "paid") {
            if (next.paymentStatus && next.paymentStatus !== "paid") {
                next.paymentStatus = "paid";
            }
            if (next.status === "pending_payment") {
                next.status = current.status || "processing";
            }
        }

        // Terminal delivery state cannot be rolled back.
        if (current.status === "delivered" && next.status && next.status !== "delivered") {
            throw new Error("Invalid state transition: delivered order cannot be downgraded");
        }

        // Cancelled orders should not be moved back to payment pending.
        if (current.status === "cancelled" && next.status === "pending_payment") {
            throw new Error("Invalid state transition: cancelled order cannot move to pending_payment");
        }

        // Prevent overriding payment id for already-paid order with a conflicting id.
        if (
            current.paymentStatus === "paid" &&
            current.razorpayPaymentId &&
            next.razorpayPaymentId &&
            next.razorpayPaymentId !== current.razorpayPaymentId
        ) {
            throw new Error("Conflicting payment id for already paid order");
        }

        return next;
    }

    static orders: Order[] = [];
    static isInitialized = false;

    // Initialize Firestore listener (runs once)
    static initOrders(): void {
        if (this.isInitialized) return;

        consoleManager.log("Initializing Firestore listener for orders...");
        const ordersCollection = db.collection("orders");

        ordersCollection.onSnapshot((snapshot) => {
            this.orders = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Order, "id">),
            }));
            consoleManager.log("🔥 Firestore Read: Orders updated, count:", this.orders.length);
        });

        this.isInitialized = true;
    }

    // Get all orders (uses cache unless forceRefresh is true)
    static async getAllOrders(forceRefresh = false): Promise<Order[]> {
        if (forceRefresh || !this.isInitialized) {
            consoleManager.log("Force refreshing orders from Firestore...");
            const snapshot = await db.collection("orders").orderBy("createdOn", "desc").get();
            this.orders = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...(doc.data() as Omit<Order, "id">),
            }));
            this.isInitialized = true;
        } else {
            consoleManager.log("Returning cached orders. No Firestore read.");
        }
        return this.orders;
    }

    // Get order by ID
    static async getOrderById(orderId: string): Promise<Order | null> {
        const cachedOrder = this.orders.find((order) => order.id === orderId);
        if (cachedOrder) {
            consoleManager.log("✅ Order fetched from cache:", orderId);
            return cachedOrder;
        }

        const docRef = db.collection("orders").doc(orderId);
        const doc = await docRef.get();

        if (!doc.exists) {
            consoleManager.warn("⚠️ Order not found:", orderId);
            return null;
        }

        const order = { id: doc.id, ...(doc.data() as Omit<Order, "id">) };
        consoleManager.log("✅ Order fetched from Firestore:", orderId);
        return order;
    }

    // Add new order
    static async addOrder(data: {
        userId?: string;
        isGuest?: boolean;
        formData: OrderFormData;
        selectedProducts: SelectedProduct[];
        totalAmount: number;
        shippingInfo?: ShippingInfo;
        addressInfo?: AddressInfo;
        paymentMethod?: "cod" | "razorpay";
        paymentStatus?: PaymentStatus;
        razorpayOrderId?: string;
        razorpayPaymentId?: string;
        razorpaySignature?: string;
        status?: Order["status"];
    }): Promise<Order> {
        let createdOrderId = "";
        await db.runTransaction(async (tx) => {
            // Atomic stock deduction to prevent overselling.
            for (const line of data.selectedProducts) {
                const productId = String(line.id || "").trim();
                if (!productId) continue;
                const qty = Math.max(Number(line.quantity || 0), 0);
                if (qty <= 0) continue;

                const productRef = db.collection("products").doc(productId);
                const productDoc = await tx.get(productRef);
                if (!productDoc.exists) {
                    throw new Error(`Product not found: ${productId}`);
                }

                const productData = productDoc.data() as { stock?: number };
                if (typeof productData.stock === "number") {
                    if (productData.stock < qty) {
                        throw new Error(`Insufficient stock for product ${productId}`);
                    }
                    tx.update(productRef, {
                        stock: productData.stock - qty,
                        updatedOn: admin.firestore.FieldValue.serverTimestamp(),
                    });
                }
            }

            const newOrderRef = db.collection("orders").doc();
            createdOrderId = newOrderRef.id;
            tx.set(newOrderRef, {
                ...data,
                isGuest: data.userId ? false : true,
                status: data.status || "pending",
                paymentStatus: data.paymentStatus || "pending",
                createdOn: admin.firestore.FieldValue.serverTimestamp(),
            });
        });

        const doc = await db.collection("orders").doc(createdOrderId).get();
        const orderData = doc.data();

        const newOrder = {
            id: createdOrderId,
            userId: orderData?.userId,
            isGuest: orderData?.isGuest,
            formData: orderData?.formData,
            selectedProducts: orderData?.selectedProducts,
            totalAmount: orderData?.totalAmount,
            shippingInfo: orderData?.shippingInfo,
            addressInfo: orderData?.addressInfo,
            paymentMethod: orderData?.paymentMethod,
            paymentStatus: orderData?.paymentStatus,
            razorpayOrderId: orderData?.razorpayOrderId,
            razorpayPaymentId: orderData?.razorpayPaymentId,
            razorpaySignature: orderData?.razorpaySignature,
            status: orderData?.status,
            createdOn: orderData?.createdOn,
        } as Order;

        // Refresh cache to avoid duplicates
        await this.getAllOrders(true);

        return newOrder;
    }


    // Update order
    static async updateOrder(
        orderId: string,
        updatedData: Partial<{
            formData: OrderFormData;
            selectedProducts: SelectedProduct[];
            totalAmount: number;
            shippingInfo?: ShippingInfo;
            addressInfo?: AddressInfo;
            paymentMethod?: "cod" | "razorpay";
            paymentStatus?: PaymentStatus;
            razorpayOrderId?: string;
            razorpayPaymentId?: string;
            razorpaySignature?: string;
            status?: Order["status"];
        }>
    ): Promise<Order> {
        const orderRef = db.collection("orders").doc(orderId);
        const existingDoc = await orderRef.get();
        if (!existingDoc.exists) {
            throw new Error("Order not found");
        }
        const existingOrder = { id: existingDoc.id, ...(existingDoc.data() as Omit<Order, "id">) } as Order;
        const safeUpdateData = this.applySafeStateTransition(existingOrder, updatedData);

        await orderRef.update({
            ...safeUpdateData,
            updatedOn: admin.firestore.FieldValue.serverTimestamp(),
        });

        const doc = await orderRef.get();
        const orderData = doc.data();

        const updatedOrder = {
            id: doc.id,
            userId: orderData?.userId,
            isGuest: orderData?.isGuest,
            formData: orderData?.formData,
            selectedProducts: orderData?.selectedProducts,
            totalAmount: orderData?.totalAmount,
            shippingInfo: orderData?.shippingInfo,
            addressInfo: orderData?.addressInfo,
            paymentMethod: orderData?.paymentMethod,
            paymentStatus: orderData?.paymentStatus,
            razorpayOrderId: orderData?.razorpayOrderId,
            razorpayPaymentId: orderData?.razorpayPaymentId,
            razorpaySignature: orderData?.razorpaySignature,
            status: orderData?.status,
            createdOn: orderData?.createdOn,
            updatedOn: orderData?.updatedOn,
        } as Order;

        // Refresh cache to avoid inconsistencies
        await this.getAllOrders(true);

        return updatedOrder;
    }


    // Delete order
    static async deleteOrder(orderId: string): Promise<{ success: boolean; message: string }> {
        await db.collection("orders").doc(orderId).delete();
        consoleManager.log("✅ Order deleted:", orderId);

        await this.getAllOrders(true);
        return { success: true, message: "Order deleted successfully" };
    }

    static async getOrderByRazorpayOrderId(razorpayOrderId: string): Promise<Order | null> {
        const snapshot = await db
            .collection("orders")
            .where("razorpayOrderId", "==", razorpayOrderId)
            .limit(1)
            .get();

        if (snapshot.empty) return null;
        const doc = snapshot.docs[0];
        return { id: doc.id, ...(doc.data() as Omit<Order, "id">) };
    }
}

export default OrderService;
