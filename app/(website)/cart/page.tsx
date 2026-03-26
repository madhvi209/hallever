"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus, Tag, Gift, ChevronRight, Star, CreditCard, Wallet, Landmark, Clock3 } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { fetchProducts } from '@/lib/redux/slice/productSlice';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
// import CartHero from './cartHero';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

type CheckoutStep = 1 | 2 | 3 | 4;
type AddressType = "home" | "office" | "other";

interface SavedAddress {
  id: string;
  fullName: string;
  phoneNumber: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  type: AddressType;
  isDefault?: boolean;
}

const INDIA_STATES_AND_UT = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];
const GUEST_ADDRESSES_STORAGE_KEY = "hallever-guest-addresses";

const CartPage = () => {
  const { t } = useLanguage();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { products } = useSelector((state: RootState) => state.products);
  const { 
    cartItems, 
    updateQuantity, 
    removeFromCart, 
    totalItems, 
    totalAmount,
    clearCart,
    addToCart,
    updatePricesFromProducts,
  } = useCart();

  const [suggestedItems, setSuggestedItems] = useState<any[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<CheckoutStep>(1);
  const [isPaying, setIsPaying] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<SavedAddress, "id">>({
    fullName: "",
    phoneNumber: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    type: "home",
    isDefault: false,
  });
  const [addressFormErrors, setAddressFormErrors] = useState<{
    fullName?: string;
    phoneNumber?: string;
    line1?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }>({});
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<Omit<SavedAddress, "id"> | null>(null);
  const [shippingMethod, setShippingMethod] = useState<"standard" | "express">("standard");
  const [checkoutError, setCheckoutError] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [donationAmount, setDonationAmount] = useState(0);
  const [selectedPaymentOption, setSelectedPaymentOption] = useState<"cod" | "upi" | "card" | "wallet" | "netbanking" | "paylater" | "emi">("cod");

  const shippingCost = shippingMethod === "express" ? 149 : 0;
  const platformFee = 23;
  const totalMRP = totalAmount + Math.round(totalAmount * 0.18);
  const discountOnMrp = Math.max(totalMRP - totalAmount, 0);
  const finalAmount = totalAmount + shippingCost + platformFee + donationAmount - couponDiscount;

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  useEffect(() => {
    const scriptId = "razorpay-checkout-js";
    if (document.getElementById(scriptId)) return;
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  }, []);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem("user");
      const guestAddressesRaw = localStorage.getItem(GUEST_ADDRESSES_STORAGE_KEY);
      const guestAddresses: SavedAddress[] = guestAddressesRaw ? JSON.parse(guestAddressesRaw) : [];

      let addresses: SavedAddress[] = [];
      if (userStr) {
        const user = JSON.parse(userStr);
        const userAddresses: SavedAddress[] = Array.isArray(user?.addresses) ? user.addresses : [];
        // Prefer DB/user addresses; fallback to guest addresses if user has none.
        addresses = userAddresses.length > 0 ? userAddresses : guestAddresses;
      } else {
        addresses = guestAddresses;
      }

      if (addresses.length > 0) {
        setSavedAddresses(addresses);
        const defaultAddress = addresses.find((addr) => addr.isDefault);
        setSelectedAddressId(defaultAddress?.id || addresses[0].id);
      }
    } catch {
      // ignore invalid storage state
    }
  }, []);

  const persistAddresses = async (nextAddresses: SavedAddress[]) => {
    setSavedAddresses(nextAddresses);
    const userStr = localStorage.getItem("user");
    try {
      if (!userStr) {
        // Guest user: persist addresses only in localStorage.
        localStorage.setItem(GUEST_ADDRESSES_STORAGE_KEY, JSON.stringify(nextAddresses));
        return;
      }

      const user = JSON.parse(userStr);
      const updatedUser = { ...user, addresses: nextAddresses };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      if (user?.uid) {
        await fetch("/api/routes/auth", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: user.uid, addresses: nextAddresses }),
        });
      }
      // Clear guest storage once account-backed addresses are saved.
      localStorage.removeItem(GUEST_ADDRESSES_STORAGE_KEY);
    } catch {
      // ignore persistence errors on UI path
    }
  };

  const addNewAddress = async () => {
    const errors: {
      fullName?: string;
      phoneNumber?: string;
      line1?: string;
      city?: string;
      state?: string;
      pincode?: string;
    } = {};

    if (!newAddress.fullName.trim()) errors.fullName = "Full name is required.";
    if (!newAddress.line1.trim()) errors.line1 = "Address line 1 is required.";
    if (!newAddress.city.trim()) errors.city = "City is required.";
    if (!newAddress.state.trim()) errors.state = "Please select a state/UT.";

    const phoneDigits = newAddress.phoneNumber.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      errors.phoneNumber = "Phone number must be exactly 10 digits.";
    }

    const pinDigits = newAddress.pincode.replace(/\D/g, "");
    if (pinDigits.length !== 6) {
      errors.pincode = "Pincode must be exactly 6 digits.";
    }

    setAddressFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      return;
    }

    const created: SavedAddress = {
      ...newAddress,
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      pincode: pinDigits,
      phoneNumber: phoneDigits,
    };

    const next = created.isDefault
      ? [created, ...savedAddresses.map((a) => ({ ...a, isDefault: false }))]
      : [...savedAddresses, created];

    await persistAddresses(next);
    setSelectedAddressId(created.id);
    setIsAddressModalOpen(false);
    setShowAddAddress(false);
    setCheckoutError("");
    setAddressFormErrors({});
    setNewAddress({
      fullName: "",
      phoneNumber: "",
      line1: "",
      line2: "",
      city: "",
      state: "",
      pincode: "",
      country: "India",
      type: "home",
      isDefault: false,
    });
  };

  const startEditAddress = (addressId: string) => {
    const target = savedAddresses.find((a) => a.id === addressId);
    if (!target) return;
    setEditingAddressId(addressId);
    setEditingAddress({
      fullName: target.fullName,
      phoneNumber: target.phoneNumber,
      line1: target.line1,
      line2: target.line2 || "",
      city: target.city,
      state: target.state,
      pincode: target.pincode,
      country: target.country || "India",
      type: target.type,
      isDefault: !!target.isDefault,
    });
    setAddressFormErrors({});
  };

  const cancelEditAddress = () => {
    setEditingAddressId(null);
    setEditingAddress(null);
    setAddressFormErrors({});
  };

  const saveEditedAddress = async () => {
    if (!editingAddressId || !editingAddress) return;

    const errors: {
      fullName?: string;
      phoneNumber?: string;
      line1?: string;
      city?: string;
      state?: string;
      pincode?: string;
    } = {};

    if (!editingAddress.fullName.trim()) errors.fullName = "Full name is required.";
    if (!editingAddress.line1.trim()) errors.line1 = "Address line 1 is required.";
    if (!editingAddress.city.trim()) errors.city = "City is required.";
    if (!editingAddress.state.trim()) errors.state = "Please select a state/UT.";

    const phoneDigits = editingAddress.phoneNumber.replace(/\D/g, "");
    if (phoneDigits.length !== 10) errors.phoneNumber = "Phone number must be exactly 10 digits.";

    const pinDigits = editingAddress.pincode.replace(/\D/g, "");
    if (pinDigits.length !== 6) errors.pincode = "Pincode must be exactly 6 digits.";

    setAddressFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    let nextAddresses = savedAddresses.map((addr) =>
      addr.id === editingAddressId
        ? { ...addr, ...editingAddress, phoneNumber: phoneDigits, pincode: pinDigits }
        : addr
    );

    if (editingAddress.isDefault) {
      nextAddresses = nextAddresses.map((addr) => ({
        ...addr,
        isDefault: addr.id === editingAddressId,
      }));
    }

    await persistAddresses(nextAddresses);
    setSelectedAddressId(editingAddressId);
    cancelEditAddress();
  };

  const deleteAddress = async (addressId: string) => {
    const nextAddresses = savedAddresses.filter((addr) => addr.id !== addressId);
    await persistAddresses(nextAddresses);

    if (selectedAddressId === addressId) {
      setSelectedAddressId(nextAddresses[0]?.id || "");
    }

    if (editingAddressId === addressId) {
      cancelEditAddress();
    }
  };

  const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId) || null;
  const defaultAddresses = savedAddresses.filter((a) => a.isDefault);
  const otherAddresses = savedAddresses.filter((a) => !a.isDefault);

  useEffect(() => {
    // Filter suggested items based on cart items
    if (products.length > 0) {
      // Refresh cart item prices from latest products
      updatePricesFromProducts(products);
      const suggested = products
        .filter(product => !cartItems.find(item => item.id === product.id))
        .slice(0, 4);
      setSuggestedItems(suggested);
    }
  }, [products, cartItems, updatePricesFromProducts]);

  const removeItem = (id: string) => {
    if (cartItems.length === 1 && cartItems[0]?.id === id) {
      clearCart();
    } else {
      removeFromCart(id);
    }
  };

  const handleDecrement = (id: string, quantity: number) => {
    if (quantity <= 1) {
      // If this is the last item in the cart, clear entirely
      if (cartItems.length === 1) {
        clearCart();
      } else {
        removeFromCart(id);
      }
    } else {
      updateQuantity(id, quantity - 1);
    }
  };

  const handleCheckout = async () => {
    const userStr = localStorage.getItem("user");

    try {
      const user = userStr ? JSON.parse(userStr) : null;
      const addressForOrder = savedAddresses.find((a) => a.id === selectedAddressId);
      if (!addressForOrder) {
        setCheckoutError("Please select a delivery address.");
        return;
      }
      const payableAmount = finalAmount;

      const customerName = user?.fullName || addressForOrder.fullName || "Guest User";
      const customerEmail =
        user?.email ||
        `guest-${Date.now()}@hallever.local`;
      const customerPhone = user?.phoneNumber || addressForOrder.phoneNumber || "";

      const baseOrderPayload = {
        userId: user?.uid || undefined,
        isGuest: !user?.uid,
        formData: {
          fullName: customerName,
          email: customerEmail,
          phone: customerPhone,
          message: `Order placed from cart by ${customerName}`
        },
        selectedProducts: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          wattage: item.wattage || "",
          image: item.image
        })),
        totalAmount: payableAmount,
        shippingInfo: {
          method: shippingMethod,
          cost: shippingCost,
          estimatedDays: shippingMethod === "express" ? 2 : 5,
        },
        addressInfo: {
          line1: addressForOrder.line1,
          line2: addressForOrder.line2 || "",
          city: addressForOrder.city,
          state: addressForOrder.state,
          pincode: addressForOrder.pincode,
          country: addressForOrder.country || "India",
        },
        paymentMethod: "razorpay",
        paymentStatus: "pending",
        status: "pending_payment",
      };

      const orderRes = await fetch("/api/routes/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(baseOrderPayload),
      });
      const orderJson = await orderRes.json();
      if (!orderRes.ok || !orderJson?.data?.id) {
        throw new Error(orderJson?.message || "Failed to create order");
      }
      const internalOrderId = orderJson.data.id as string;

      const rpOrderRes = await fetch("/api/routes/payments/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: internalOrderId }),
      });
      const rpOrderJson = await rpOrderRes.json();
      if (!rpOrderRes.ok) {
        throw new Error(rpOrderJson?.message || "Failed to initialize payment");
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK failed to load");
      }

      const options = {
        key: rpOrderJson.data.key,
        amount: rpOrderJson.data.amount,
        currency: rpOrderJson.data.currency,
        name: "Hallever",
        description: "Order payment",
        order_id: rpOrderJson.data.razorpayOrderId,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: { color: "#E10600" },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/routes/payments/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              internalOrderId,
              ...response,
            }),
          });
          const verifyJson = await verifyRes.json();
          if (!verifyRes.ok || !verifyJson.success) {
            router.push(`/order/failure?orderId=${encodeURIComponent(internalOrderId)}&reason=verification_failed`);
            return;
          }
          clearCart();
          router.push(
            `/order/success?orderId=${encodeURIComponent(internalOrderId)}&paymentId=${encodeURIComponent(
              response.razorpay_payment_id
            )}`
          );
        },
        modal: {
          ondismiss: () => {
            router.push(`/order/failure?orderId=${encodeURIComponent(internalOrderId)}&reason=checkout_dismissed`);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Error creating order:", error);
      setCheckoutError(
        error instanceof Error ? error.message : "Failed to place order. Please try again."
      );
    } finally {
      setIsPaying(false);
    }
  };

  const addToCartFromSuggested = (product: any) => {
    addToCart(product);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <div className="flex-1 flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <div className="relative mx-auto mb-6 w-24 h-24">
              <ShoppingBag className="w-24 h-24 text-[#E10600]" strokeWidth={1.5} />
              <div className="absolute -right-1 -top-1 w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center">
                <span className="text-[#E10600] text-xs font-bold">0</span>
              </div>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-3">Hey, it feels so light!</h1>
            <p className="text-gray-600 mb-8 text-base">
              There is nothing in your bag. Let&apos;s add some items.
            </p>

            <Link href="/wishlist">
              <Button
                variant="outline"
                className="border-[#E10600] text-[#E10600] hover:bg-red-50 font-semibold tracking-wide px-8 py-6"
              >
                ADD ITEMS FROM WISHLIST
              </Button>
            </Link>
          </motion.div>
        </div>

        <div className="border-t bg-gray-50">
          <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2 flex-wrap justify-center">
              {["256-bit SSL", "VISA", "MasterCard", "Rupay", "PayPal", "BHIM"].map((item) => (
                <span key={item} className="px-3 py-1 border rounded text-xs text-gray-600 bg-white">
                  {item}
                </span>
              ))}
            </div>
            <p className="text-gray-700 font-medium">Need Help ? Contact Us</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* <CartHero /> */}
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-3xl mx-auto mb-8"
          >
            <div className="flex items-center justify-center gap-3 text-xs md:text-sm uppercase tracking-[0.2em] text-gray-500">
              <span className={checkoutStep >= 1 ? "text-[#E10600] font-semibold" : ""}>Bag</span>
              <span className="w-14 border-t border-dashed border-gray-300" />
              <span className={checkoutStep >= 2 ? "text-[#E10600] font-semibold" : ""}>Address</span>
              <span className="w-14 border-t border-dashed border-gray-300" />
              <span className={checkoutStep >= 3 ? "text-[#E10600] font-semibold" : ""}>Payment</span>
            </div>
          </motion.div>

          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {t("cart.title") || "Shopping Cart"}
            </h1>
            <p className="text-gray-600 text-lg">
              {t("cart.subtitle").replace('{count}', totalItems.toString()) || `You have ${totalItems} items in your cart`}
            </p>
          </motion.div>

          {checkoutStep === 3 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-3">
                      <Star className="w-4 h-4 mt-1 text-gray-500" />
                      <div>
                        <p className="text-xl font-semibold text-gray-900">Bank Offer</p>
                        <p className="text-sm text-gray-600 mt-2">
                          10% Instant Discount On Kotak Mahindra Bank Credit Card on min spend of ₹3,500
                        </p>
                        <button className="text-[#E10600] text-sm font-semibold mt-2">Show More</button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardContent className="p-0">
                    <div className="p-6 border-b">
                      <h2 className="text-3xl font-semibold text-gray-900">Choose Payment Mode</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[280px_1fr]">
                      <div className="border-r bg-gray-50/60">
                        {[
                          { key: "cod", label: "Cash On Delivery", icon: <CreditCard className="w-4 h-4" />, offer: "" },
                          { key: "upi", label: "UPI (Pay via any App)", icon: <Wallet className="w-4 h-4" />, offer: "" },
                          { key: "card", label: "Credit/Debit Card", icon: <CreditCard className="w-4 h-4" />, offer: "5 Offers" },
                          { key: "wallet", label: "Wallets", icon: <Wallet className="w-4 h-4" />, offer: "1 Offer" },
                          { key: "paylater", label: "Pay Later", icon: <Clock3 className="w-4 h-4" />, offer: "" },
                          { key: "emi", label: "EMI", icon: <CreditCard className="w-4 h-4" />, offer: "1 Offer" },
                          { key: "netbanking", label: "Net Banking", icon: <Landmark className="w-4 h-4" />, offer: "" },
                        ].map((opt) => (
                          <button
                            key={opt.key}
                            className={`w-full flex items-center justify-between px-4 py-4 text-left border-b ${selectedPaymentOption === opt.key ? "bg-white border-l-4 border-l-[#E10600] font-semibold" : "hover:bg-white/60"}`}
                            onClick={() => setSelectedPaymentOption(opt.key as typeof selectedPaymentOption)}
                          >
                            <span className="flex items-center gap-2 text-gray-900">
                              {opt.icon}
                              {opt.label}
                            </span>
                            {opt.offer && <span className="text-emerald-600 text-sm">{opt.offer}</span>}
                          </button>
                        ))}
                      </div>

                      <div className="p-6">
                        <h3 className="text-2xl font-semibold text-gray-900 mb-4">Recommended Payment Options</h3>
                        <label className="flex items-start gap-3 p-4 rounded-md border border-[#E10600]/40 bg-red-50/40">
                          <input type="radio" checked readOnly className="mt-1 accent-[#E10600]" />
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">
                              {selectedPaymentOption === "cod" ? "Cash On Delivery (Cash/UPI)" : "Secure Online Payment"}
                            </p>
                            <p className="text-sm text-gray-600 mt-1">
                              {selectedPaymentOption === "cod"
                                ? "You can pay via Cash/UPI on delivery."
                                : "Complete payment securely via Razorpay."}
                            </p>
                          </div>
                        </label>
                        <Button
                          className="w-full mt-6 bg-[#E10600] hover:bg-[#C10500] text-white text-xl py-6"
                          disabled={isPaying}
                          onClick={() => {
                            setIsPaying(true);
                            handleCheckout();
                          }}
                        >
                          {isPaying ? "Processing..." : "Place Order"}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <Card className="bg-white shadow-sm border border-gray-200 sticky top-8">
                  <CardContent className="p-6">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Price Details ({totalItems} item{totalItems > 1 ? "s" : ""})</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Total MRP</span><span>₹{totalMRP}</span></div>
                      <div className="flex justify-between"><span>Discount on MRP</span><span className="text-emerald-600">- ₹{discountOnMrp}</span></div>
                      <div className="flex justify-between"><span>Platform Fee</span><span>₹{platformFee}</span></div>
                    </div>
                    <div className="border-t mt-4 pt-3 flex justify-between text-xl font-bold">
                      <span>Total Amount</span>
                      <span>₹{finalAmount}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      By placing the order, you agree to our Terms of Use and Privacy Policy.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : checkoutStep === 2 ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-3xl font-semibold text-gray-900">Select Delivery Address</h2>
                      <Button variant="outline" onClick={() => setIsAddressModalOpen(true)}>
                        Add New Address
                      </Button>
                    </div>

                    <div className="space-y-6">
                      {defaultAddresses.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Default Address</p>
                          <div className="space-y-3">
                            {defaultAddresses.map((addr) => (
                              <div key={addr.id} className={`border rounded-lg p-4 ${selectedAddressId === addr.id ? "border-[#E10600] bg-red-50/30" : ""}`}>
                                <label className="flex items-start gap-3 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="address-step-selection"
                                    checked={selectedAddressId === addr.id}
                                    onChange={() => setSelectedAddressId(addr.id)}
                                    className="mt-1 accent-[#E10600]"
                                  />
                                  <div className="flex-1">
                                    <p className="font-semibold text-lg text-gray-900">
                                      {addr.fullName}
                                      <span className="ml-2 text-xs uppercase border rounded-full px-2 py-0.5 text-emerald-700 border-emerald-500">
                                        {addr.type}
                                      </span>
                                    </p>
                                    <p className="text-gray-700 mt-2">
                                      {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} - {addr.pincode}
                                    </p>
                                    <p className="text-gray-700 mt-2">Mobile: <strong>{addr.phoneNumber}</strong></p>
                                    <p className="text-gray-700 mt-2">Pay on Delivery not available</p>
                                    <div className="mt-3 flex gap-2">
                                      <Button variant="outline" size="sm" onClick={() => void deleteAddress(addr.id)}>Remove</Button>
                                      <Button variant="outline" size="sm" onClick={() => { startEditAddress(addr.id); setIsAddressModalOpen(true); }}>Edit</Button>
                                    </div>
                                  </div>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {otherAddresses.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Other Address</p>
                          <div className="space-y-3">
                            {otherAddresses.map((addr) => (
                              <div key={addr.id} className={`border rounded-lg p-4 ${selectedAddressId === addr.id ? "border-[#E10600] bg-red-50/30" : ""}`}>
                                <label className="flex items-start gap-3 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="address-step-selection"
                                    checked={selectedAddressId === addr.id}
                                    onChange={() => setSelectedAddressId(addr.id)}
                                    className="mt-1 accent-[#E10600]"
                                  />
                                  <div className="flex-1">
                                    <p className="font-semibold text-lg text-gray-900">
                                      {addr.fullName}
                                      <span className="ml-2 text-xs uppercase border rounded-full px-2 py-0.5 text-emerald-700 border-emerald-500">
                                        {addr.type}
                                      </span>
                                    </p>
                                    <p className="text-gray-700 mt-2">
                                      {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} - {addr.pincode}
                                    </p>
                                    <p className="text-gray-700 mt-2">Mobile: <strong>{addr.phoneNumber}</strong></p>
                                  </div>
                                </label>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => setIsAddressModalOpen(true)}
                        className="w-full border border-dashed rounded-lg p-4 text-left font-semibold text-[#E10600] hover:bg-red-50"
                      >
                        + Add New Address
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="lg:col-span-1">
                <Card className="bg-white shadow-sm border border-gray-200 sticky top-8">
                  <CardContent className="p-6">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-4">Delivery Estimates</p>
                    <p className="text-sm text-gray-700 mb-6">
                      Estimated delivery by <strong>{shippingMethod === "express" ? "Tomorrow" : "2-5 days"}</strong>
                    </p>

                    <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Price Details ({totalItems} item{totalItems > 1 ? "s" : ""})</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between"><span>Total MRP</span><span>₹{totalMRP}</span></div>
                      <div className="flex justify-between"><span>Discount on MRP</span><span className="text-emerald-600">- ₹{discountOnMrp}</span></div>
                      <div className="flex justify-between"><span>Platform Fee</span><span>₹{platformFee}</span></div>
                    </div>
                    <div className="border-t mt-4 pt-3 flex justify-between text-xl font-bold">
                      <span>Total Amount</span>
                      <span>₹{finalAmount}</span>
                    </div>
                    <Button
                      className="w-full mt-4 bg-[#E10600] hover:bg-[#C10500] text-white text-lg"
                      onClick={() => {
                        if (!selectedAddressId) {
                          setCheckoutError("Please select an address.");
                          return;
                        }
                        setCheckoutError("");
                        setCheckoutStep(3);
                      }}
                    >
                      CONTINUE
                    </Button>
                    {checkoutError && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                        {checkoutError}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                {checkoutStep === 1 && (
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between border rounded-md p-3 bg-red-50/40 border-[#E10600]/30">
                      <div className="text-sm">
                        <div className="font-semibold text-gray-900">
                          {selectedAddress
                            ? `Deliver to: ${selectedAddress.fullName}, ${selectedAddress.pincode}`
                            : "Delivery Address"}
                        </div>
                        {selectedAddress ? (
                          <p className="text-gray-700 mt-1">
                            {selectedAddress.line1}
                            {selectedAddress.line2 ? `, ${selectedAddress.line2}` : ""}, {selectedAddress.city}, {selectedAddress.state}
                          </p>
                        ) : (
                          <p className="text-gray-700 mt-1">No saved address found. Click change address to add one.</p>
                        )}
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={() => setIsAddressModalOpen(true)}>
                        CHANGE ADDRESS
                      </Button>
                    </div>
                  </div>
                )}

                <Card className="bg-white shadow-sm border border-gray-200">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      {t("cart.items") || "Cart Items"}
                    </h2>

                    <div className="space-y-4">
                      {cartItems.map((item, index) => (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4, delay: index * 0.1 }}
                          className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-20 h-20 object-cover rounded-lg"
                          />

                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{item.name}</h3>
                            {item.wattage && (
                              <Badge variant="secondary" className="text-xs">
                                {item.wattage}
                              </Badge>
                            )}
                            {item.category && (
                              <Badge variant="outline" className="text-xs ml-2">
                                {item.category}
                              </Badge>
                            )}
                            <p className="text-[#E10600] font-semibold text-lg">
                              ₹{item.price}
                            </p>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDecrement(item.id, item.quantity)}
                              className="w-8 h-8 p-0"
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="w-8 h-8 p-0"
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>

                          <div className="text-right">
                            <p className="font-semibold text-gray-900 text-lg">
                              ₹{item.price * item.quantity}
                            </p>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Card className="bg-white shadow-sm border border-gray-200 sticky top-8">
                  <CardContent className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      {t("cart.orderSummary") || "Order Summary"}
                    </h2>

                    <div className="space-y-4 mb-6">
                      <div className="border-b pb-3">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Coupons</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
                            <Tag className="w-4 h-4" />
                            Apply Coupons
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 border-[#E10600] text-[#E10600] hover:bg-red-50"
                            onClick={() => {
                              if (couponCode.trim().toUpperCase() === "WELCOM50") {
                                setCouponDiscount(Math.min(50, totalAmount));
                                setCheckoutError("");
                              } else if (couponCode.trim().toUpperCase() === "FREESHIP") {
                                setCouponDiscount(shippingCost);
                                setCheckoutError("");
                              } else {
                                setCouponDiscount(0);
                                setCheckoutError("Invalid coupon code");
                              }
                            }}
                          >
                            APPLY
                          </Button>
                        </div>
                        <input
                          value={couponCode}
                          onChange={(e) => setCouponCode(e.target.value)}
                          placeholder="Enter coupon code"
                          className="w-full mt-2 border rounded-md px-3 py-2 text-sm"
                        />
                      </div>

                      <div className="border-b pb-3">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Gifting & Personalisation</p>
                        <div className="rounded-md bg-red-50 p-3 flex items-start gap-3">
                          <Gift className="w-4 h-4 text-[#E10600] mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">Buying for a loved one?</p>
                            <p className="text-xs text-gray-600">Gift Packaging and personal message on card, only for ₹35</p>
                            <button className="text-xs font-semibold text-[#E10600] mt-1">ADD GIFT PACKAGE</button>
                          </div>
                        </div>
                      </div>

                      <div className="border-b pb-3">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Support Transformative Social Work in India</p>
                        <div className="text-sm font-semibold mb-2">Donate and make a difference</div>
                        <div className="flex gap-2">
                          {[10, 20, 50, 100].map((amt) => (
                            <button
                              key={amt}
                              onClick={() => setDonationAmount((prev) => (prev === amt ? 0 : amt))}
                              className={`px-3 py-1 rounded-full border text-sm ${donationAmount === amt ? "border-[#E10600] text-[#E10600] bg-red-50" : "border-gray-300 text-gray-700"}`}
                            >
                              ₹{amt}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="border-b pb-3">
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Add GST Details</p>
                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <p className="font-semibold text-gray-900">ADD GSTIN</p>
                            <p className="text-xs text-gray-500">Claim GST credit up to 28% on your order</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-500" />
                        </div>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-gray-600 uppercase mb-2">
                          Price Details ({totalItems} item{totalItems > 1 ? "s" : ""})
                        </p>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between text-gray-700">
                            <span>Total MRP</span>
                            <span>₹{totalMRP}</span>
                          </div>
                          <div className="flex justify-between text-gray-700">
                            <span>Discount on MRP</span>
                            <span className="text-emerald-600">- ₹{discountOnMrp}</span>
                          </div>
                          <div className="flex justify-between text-gray-700">
                            <span>Coupon Discount</span>
                            <span className={couponDiscount > 0 ? "text-emerald-600" : "text-[#E10600]"}>
                              {couponDiscount > 0 ? `- ₹${couponDiscount}` : "Apply Coupon"}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-700">
                            <span>Platform Fee</span>
                            <span>₹{platformFee}</span>
                          </div>
                          <div className="flex justify-between text-gray-700">
                            <span>{t("cart.shipping") || "Shipping"}</span>
                            <span className={shippingMethod === "express" ? "text-gray-800" : "text-green-600"}>
                              {shippingMethod === "express" ? "₹149" : (t("cart.free") || "Free")}
                            </span>
                          </div>
                          {donationAmount > 0 && (
                            <div className="flex justify-between text-gray-700">
                              <span>Donation</span>
                              <span>₹{donationAmount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between text-xl font-bold text-gray-900">
                          <span>Total Amount</span>
                          <span>₹{finalAmount}</span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        By placing the order, you agree to our Terms of Use and Privacy Policy.
                      </p>
                    </div>
                    <Button
                      className="w-full bg-[#E10600] hover:bg-[#C10500] text-white py-3 text-lg font-semibold mt-1"
                      size="lg"
                      disabled={isPaying}
                      onClick={() => {
                        if (checkoutStep === 1 && !selectedAddressId) {
                          setCheckoutError("Please select an address or add a new one.");
                          return;
                        }
                        if (checkoutStep < 3) {
                          setCheckoutError("");
                          setCheckoutStep((s) => (s + 1) as CheckoutStep);
                          return;
                        }
                        setIsPaying(true);
                        handleCheckout();
                      }}
                    >
                      {isPaying ? "Processing..." : "PLACE ORDER"}
                    </Button>

                    {checkoutStep === 2 && (
                      <div className="space-y-2 mb-4">
                        <button onClick={() => setShippingMethod("standard")} className={`w-full border rounded-md p-3 text-left ${shippingMethod === "standard" ? "border-[#E10600] bg-red-50" : ""}`}>
                          Standard Shipping (3-5 days) - Free
                        </button>
                        <button onClick={() => setShippingMethod("express")} className={`w-full border rounded-md p-3 text-left ${shippingMethod === "express" ? "border-[#E10600] bg-red-50" : ""}`}>
                          Express Shipping (1-2 days) - ₹149
                        </button>
                      </div>
                    )}

                    {checkoutStep === 3 && (
                      <div className="space-y-2 mb-4 text-sm text-gray-700">
                        <p>
                          <strong>Deliver to:</strong>{" "}
                          {selectedAddress
                            ? `${selectedAddress.fullName}, ${selectedAddress.line1}${selectedAddress.line2 ? `, ${selectedAddress.line2}` : ""}, ${selectedAddress.city}, ${selectedAddress.state} - ${selectedAddress.pincode}`
                            : "No address selected"}
                        </p>
                        <p><strong>Shipping:</strong> {shippingMethod === "express" ? "Express (₹149)" : "Standard (Free)"}</p>
                        <p><strong>Amount:</strong> ₹{totalAmount + (shippingMethod === "express" ? 149 : 0)}</p>
                      </div>
                    )}

                    {checkoutStep === 4 && (
                      <div className="space-y-2 mb-4 text-sm text-gray-700">
                        <p>Pay securely with Razorpay (UPI, Cards, Netbanking, Wallets).</p>
                      </div>
                    )}

                    {checkoutError && (
                      <div className="mt-3 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
                        {checkoutError}
                      </div>
                    )}

                    {showSuccessMessage && (
                      <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md text-center">
                        <p className="font-semibold">🎉 Your order has been placed successfully!</p>
                        <p className="text-sm mt-1">Redirecting to products page...</p>
                      </div>
                    )}

                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>
          )}

          {/* Suggested Items */}
          {suggestedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-16"
            >
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  {t("cart.suggestedItems") || "You might also like"}
                </h2>
                <p className="text-gray-600 text-lg">
                  {t("cart.suggestedSubtitle") || "Discover more products that match your interests"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {suggestedItems.map((product, index) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                  >
                    <Card className="bg-white shadow-sm border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer group">
                      <CardContent className="p-4">
                        <div className="relative mb-4">
                          <img
                            src={Array.isArray(product.images) ? product.images[0] || '/images/products/hero.png' : product.images || '/images/products/hero.png'}
                            alt={product.name}
                            className="w-full h-48 object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                          />
                          <Button
                            size="sm"
                            className="absolute top-2 right-2 bg-[#E10600] hover:bg-[#C10600] text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => addToCartFromSuggested(product)}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>

                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                          {product.name}
                        </h3>

                        <div className="flex justify-between items-center">
                          <p className="text-[#E10600] font-bold text-lg">
                            ₹{product.price || 0}
                          </p>
                          <Badge variant="secondary" className="text-xs">
                            {product.category || 'Product'}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select Delivery Address</DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {savedAddresses.length > 0 ? (
              savedAddresses.map((addr) => (
                <div key={addr.id} className={`block border rounded-md p-3 transition ${selectedAddressId === addr.id ? "border-[#E10600] bg-red-50" : "hover:border-gray-300"}`}>
                  {editingAddressId === addr.id && editingAddress ? (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <input className="w-full border rounded-md px-3 py-2 text-sm" value={editingAddress.fullName} onChange={(e) => setEditingAddress((s) => (s ? { ...s, fullName: e.target.value } : s))} />
                        <input className="w-full border rounded-md px-3 py-2 text-sm" maxLength={10} value={editingAddress.phoneNumber} onChange={(e) => setEditingAddress((s) => (s ? { ...s, phoneNumber: e.target.value.replace(/\D/g, "") } : s))} />
                      </div>
                      <input className="w-full border rounded-md px-3 py-2 text-sm" value={editingAddress.line1} onChange={(e) => setEditingAddress((s) => (s ? { ...s, line1: e.target.value } : s))} />
                      <input className="w-full border rounded-md px-3 py-2 text-sm" value={editingAddress.line2 || ""} onChange={(e) => setEditingAddress((s) => (s ? { ...s, line2: e.target.value } : s))} />
                      <div className="grid grid-cols-2 gap-2">
                        <input className="w-full border rounded-md px-3 py-2 text-sm" value={editingAddress.city} onChange={(e) => setEditingAddress((s) => (s ? { ...s, city: e.target.value } : s))} />
                        <select className="w-full border rounded-md px-3 py-2 text-sm bg-white" value={editingAddress.state} onChange={(e) => setEditingAddress((s) => (s ? { ...s, state: e.target.value } : s))}>
                          <option value="">Select state / UT</option>
                          {INDIA_STATES_AND_UT.map((stateName) => (
                            <option key={stateName} value={stateName}>{stateName}</option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input className="w-full border rounded-md px-3 py-2 text-sm" maxLength={6} value={editingAddress.pincode} onChange={(e) => setEditingAddress((s) => (s ? { ...s, pincode: e.target.value.replace(/\D/g, "") } : s))} />
                        <select className="w-full border rounded-md px-3 py-2 text-sm bg-white" value={editingAddress.type} onChange={(e) => setEditingAddress((s) => (s ? { ...s, type: e.target.value as AddressType } : s))}>
                          <option value="home">Home</option>
                          <option value="office">Office</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" size="sm" className="bg-[#E10600] hover:bg-[#C10500] text-white" onClick={saveEditedAddress}>
                          Save
                        </Button>
                        <Button type="button" size="sm" variant="outline" onClick={cancelEditAddress}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2">
                      <input
                        type="radio"
                        name="modal-delivery-address"
                        checked={selectedAddressId === addr.id}
                        onChange={() => setSelectedAddressId(addr.id)}
                        className="mt-1 accent-[#E10600]"
                      />
                      <div className="flex-1 text-sm">
                        <div className="font-semibold text-gray-900">
                          {addr.fullName}
                          <span className="ml-2 text-[10px] uppercase border rounded-full px-2 py-0.5 text-emerald-700 border-emerald-500">
                            {addr.type}
                          </span>
                          {addr.isDefault && (
                            <span className="ml-2 text-[10px] uppercase border rounded-full px-2 py-0.5 text-[#E10600] border-[#E10600]">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-700 mt-1">
                          {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}, {addr.city}, {addr.state} - {addr.pincode}
                        </p>
                        <p className="text-gray-700 mt-1">Mobile: {addr.phoneNumber}</p>
                        <div className="mt-2 flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              startEditAddress(addr.id);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={(e) => {
                              e.stopPropagation();
                              void deleteAddress(addr.id);
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-600">No saved addresses yet.</p>
            )}

            <div className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowAddAddress((v) => !v)}
                className="border-[#E10600] text-[#E10600] hover:bg-red-50"
              >
                {showAddAddress ? "Cancel New Address" : "Add New Address"}
              </Button>
            </div>

            {showAddAddress && (
              <div className="border rounded-md p-3 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      className={`w-full border rounded-md px-3 py-2 text-sm ${addressFormErrors.fullName ? "border-red-400" : ""}`}
                      placeholder="Full name"
                      value={newAddress.fullName}
                      onChange={(e) => {
                        setNewAddress((s) => ({ ...s, fullName: e.target.value }));
                        setAddressFormErrors((prev) => ({ ...prev, fullName: undefined }));
                      }}
                    />
                    {addressFormErrors.fullName && (
                      <p className="text-xs text-red-600 mt-1">{addressFormErrors.fullName}</p>
                    )}
                  </div>
                  <div>
                    <input
                      className={`w-full border rounded-md px-3 py-2 text-sm ${addressFormErrors.phoneNumber ? "border-red-400" : ""}`}
                      placeholder="Phone number"
                      maxLength={10}
                      value={newAddress.phoneNumber}
                      onChange={(e) => {
                        setNewAddress((s) => ({ ...s, phoneNumber: e.target.value.replace(/\D/g, "") }));
                        setAddressFormErrors((prev) => ({ ...prev, phoneNumber: undefined }));
                      }}
                    />
                    {addressFormErrors.phoneNumber && (
                      <p className="text-xs text-red-600 mt-1">{addressFormErrors.phoneNumber}</p>
                    )}
                  </div>
                </div>
                <div>
                  <input
                    className={`w-full border rounded-md px-3 py-2 text-sm ${addressFormErrors.line1 ? "border-red-400" : ""}`}
                    placeholder="Address line 1"
                    value={newAddress.line1}
                    onChange={(e) => {
                      setNewAddress((s) => ({ ...s, line1: e.target.value }));
                      setAddressFormErrors((prev) => ({ ...prev, line1: undefined }));
                    }}
                  />
                  {addressFormErrors.line1 && (
                    <p className="text-xs text-red-600 mt-1">{addressFormErrors.line1}</p>
                  )}
                </div>
                <input className="w-full border rounded-md px-3 py-2 text-sm" placeholder="Address line 2 (optional)" value={newAddress.line2} onChange={(e) => setNewAddress((s) => ({ ...s, line2: e.target.value }))} />
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      className={`w-full border rounded-md px-3 py-2 text-sm ${addressFormErrors.city ? "border-red-400" : ""}`}
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) => {
                        setNewAddress((s) => ({ ...s, city: e.target.value }));
                        setAddressFormErrors((prev) => ({ ...prev, city: undefined }));
                      }}
                    />
                    {addressFormErrors.city && (
                      <p className="text-xs text-red-600 mt-1">{addressFormErrors.city}</p>
                    )}
                  </div>
                  <div>
                    <select
                      className={`w-full border rounded-md px-3 py-2 text-sm bg-white ${addressFormErrors.state ? "border-red-400" : ""}`}
                      value={newAddress.state}
                      onChange={(e) => {
                        setNewAddress((s) => ({ ...s, state: e.target.value }));
                        setAddressFormErrors((prev) => ({ ...prev, state: undefined }));
                      }}
                    >
                      <option value="">Select state / UT</option>
                      {INDIA_STATES_AND_UT.map((stateName) => (
                        <option key={stateName} value={stateName}>
                          {stateName}
                        </option>
                      ))}
                    </select>
                    {addressFormErrors.state && (
                      <p className="text-xs text-red-600 mt-1">{addressFormErrors.state}</p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      className={`w-full border rounded-md px-3 py-2 text-sm ${addressFormErrors.pincode ? "border-red-400" : ""}`}
                      placeholder="Pincode"
                      maxLength={6}
                      value={newAddress.pincode}
                      onChange={(e) => {
                        setNewAddress((s) => ({ ...s, pincode: e.target.value.replace(/\D/g, "") }));
                        setAddressFormErrors((prev) => ({ ...prev, pincode: undefined }));
                      }}
                    />
                    {addressFormErrors.pincode && (
                      <p className="text-xs text-red-600 mt-1">{addressFormErrors.pincode}</p>
                    )}
                  </div>
                  <select className="w-full border rounded-md px-3 py-2 text-sm bg-white" value={newAddress.type} onChange={(e) => setNewAddress((s) => ({ ...s, type: e.target.value as AddressType }))}>
                    <option value="home">Home</option>
                    <option value="office">Office</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <label className="inline-flex items-center gap-2 text-xs text-gray-700">
                  <input type="checkbox" checked={!!newAddress.isDefault} onChange={(e) => setNewAddress((s) => ({ ...s, isDefault: e.target.checked }))} />
                  Set as default address
                </label>
                <Button type="button" className="w-full bg-[#E10600] hover:bg-[#C10500] text-white" onClick={addNewAddress}>
                  Save Address
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CartPage;