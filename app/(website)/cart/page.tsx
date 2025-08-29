"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trash2, ShoppingBag, ArrowRight, Plus, Minus } from 'lucide-react';
import { useLanguage } from '@/context/language-context';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { fetchProducts } from '@/lib/redux/slice/productSlice';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/cart-context';
// import CartHero from './cartHero';

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

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

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
    // Check if user is logged in
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      // User not logged in, redirect to login
      router.push("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (user && user.uid) {
        // User is logged in, create order
        const orderData = {
          formData: {
            fullName: user.fullName || "User",
            email: user.email,
            phone: user.phoneNumber || "",
            message: `Order placed from cart by ${user.fullName || user.email}`
          },
          selectedProducts: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            wattage: item.wattage || "",
            image: item.image
          })),
          totalAmount: totalAmount
        };

        // Create order in database
        const response = await fetch("/api/routes/orders", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        });

        if (response.ok) {
          // Order created successfully
          setShowSuccessMessage(true);
          setTimeout(() => {
            setShowSuccessMessage(false);
            // Clear cart after successful order
            clearCart();
            // Redirect to products page
            router.push("/products");
          }, 3000);
        } else {
          // Order creation failed
          const errorData = await response.json();
          alert("Failed to place order: " + (errorData.message || "Unknown error"));
        }
      } else {
        // Invalid user data, redirect to login
        router.push("/login");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  const addToCartFromSuggested = (product: any) => {
    addToCart(product);
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-20">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <ShoppingBag className="w-24 h-24 text-gray-400 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {t("cart.empty.title") || "Your cart is empty"}
            </h1>
            <p className="text-gray-600 mb-8 text-lg">
              {t("cart.empty.subtitle") || "Looks like you haven't added any products to your cart yet."}
            </p>
            <Link href="/products">
              <Button size="lg" className="bg-[#E10600] hover:bg-[#C10500] text-white px-8 py-4 text-lg">
                {t("button.startShopping") || "Start Shopping"}
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* <CartHero /> */}
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4">
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
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
                      <div className="flex justify-between text-gray-600">
                        <span>{t("cart.subtotal") || "Subtotal"}</span>
                        <span>₹{totalAmount}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>{t("cart.shipping") || "Shipping"}</span>
                        <span className="text-green-600">
                          {t("cart.free") || "Free"}
                        </span>
                      </div>
                      <div className="border-t pt-4">
                        <div className="flex justify-between text-xl font-bold text-gray-900">
                          <span>{t("cart.total") || "Total"}</span>
                          <span>₹{totalAmount}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-[#E10600] hover:bg-[#C10500] text-white py-3 text-lg font-semibold"
                      size="lg"
                      onClick={handleCheckout}
                    >
                      {t("cart.proceedToCheckout") || "Proceed to Checkout"}
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>

                    {showSuccessMessage && (
                      <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md text-center">
                        <p className="font-semibold">🎉 Your order has been placed successfully!</p>
                        <p className="text-sm mt-1">Redirecting to products page...</p>
                      </div>
                    )}

                    <div className="mt-4 text-center">
                      <Link href="/products">
                        <Button variant="outline" className="w-full">
                          {t("cart.continueShopping") || "Continue Shopping"}
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          </div>

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
    </>
  );
};

export default CartPage;