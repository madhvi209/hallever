"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const reasonLabel: Record<string, string> = {
  checkout_dismissed: "Payment popup was closed before completion.",
  verification_failed: "Payment could not be verified securely.",
  unknown: "Payment was not completed.",
};

export default function OrderFailurePage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("orderId") || "";
  const reason = searchParams.get("reason") || "unknown";

  return (
    <main className="max-w-3xl mx-auto px-4 py-16">
      <div className="bg-white border rounded-xl p-8 text-center shadow-sm">
        <AlertTriangle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Payment Incomplete</h1>
        <p className="text-gray-600 mb-4">{reasonLabel[reason] || reasonLabel.unknown}</p>

        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-left text-sm mb-6">
          <p className="text-amber-900">
            <strong>Order ID:</strong> {orderId || "N/A"}
          </p>
          <p className="text-amber-900 mt-1">
            You can retry payment from your cart. Your items are still safe.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/cart">
            <Button className="bg-[#E10600] hover:bg-[#C10500] text-white">
              Retry Payment
            </Button>
          </Link>
          <Link href="/products">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
