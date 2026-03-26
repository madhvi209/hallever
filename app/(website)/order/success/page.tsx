"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, ReceiptText } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OrderSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const paymentId = searchParams.get("paymentId") || "";

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <div className="bg-white border rounded-xl p-8 text-center shadow-sm">
        <CheckCircle2 className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Successful</h1>
        <p className="text-gray-600 mb-6">
          Your order is confirmed and is now being processed.
        </p>

        <div className="bg-gray-50 border rounded-lg p-4 text-left text-sm mb-6">
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <ReceiptText className="w-4 h-4" />
            <span className="font-medium">Transaction Details</span>
          </div>
          <p className="text-gray-700">
            <strong>Order ID:</strong> {orderId || "N/A"}
          </p>
          <p className="text-gray-700">
            <strong>Payment ID:</strong> {paymentId || "N/A"}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/products">
            <Button className="bg-[#E10600] hover:bg-[#C10500] text-white">
              Continue Shopping
            </Button>
          </Link>
          <Link href="/users">
            <Button variant="outline">Go to Dashboard</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
