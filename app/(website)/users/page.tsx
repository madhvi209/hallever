"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Mail,
  Phone,
  Calendar,
  Edit,
  ShoppingBag,
  Camera,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Eye,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface UserData {
  uid: string;
  email: string;
  fullName?: string;
  name?: string;
  phoneNumber?: string;
  phone?: string;
  tlcId: string;
  role: string;
  createdOn: string;
}

interface OrderData {
  id: string;
  formData: {
    fullName: string;
    email: string;
    phone: string;
    message: string;
  };
  selectedProducts: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    wattage: string;
    image: string;
  }>;
  totalAmount: number;
  createdAt: string; // normalized ISO string
  status?: 'processing' | 'in_transit' | 'delivered' | 'cancelled' | 'pending';
}

const UsersPage = () => {
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isOrderDetailsModalOpen, setIsOrderDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [user, setUser] = useState<UserData | null>(null);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [editForm, setEditForm] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get user from localStorage
        const userStr = localStorage.getItem("user");
        if (!userStr) {
          router.push("/login");
          return;
        }

        const userData = JSON.parse(userStr);
        setUser(userData);
        setEditForm({
          fullName: userData.fullName || userData.name || "",
          email: userData.email || "",
          phoneNumber: userData.phoneNumber || userData.phone || "",
        });

        // Fetch user's orders
        await fetchUserOrders(userData.uid, userData.email);
      } catch (error) {
        console.error("Error fetching user data:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  const fetchUserOrders = async (userId: string, userEmail: string) => {
    try {
      const response = await fetch("/api/routes/orders");
      if (response.ok) {
        const data = await response.json();
        // Normalize and filter for current user
        const normalized: OrderData[] = (data.data || []).map((order: any) => {
          // createdOn may be Firestore Timestamp; handle {seconds} or {_seconds}
          let createdAtISO = '';
          const createdOn = order.createdOn;
          const sec = createdOn && typeof createdOn === 'object' ? (createdOn.seconds ?? createdOn._seconds) : undefined;
          if (typeof sec === 'number') {
            createdAtISO = new Date(sec * 1000).toISOString();
          } else if (order.createdAt) {
            const d = new Date(order.createdAt);
            createdAtISO = isNaN(d.getTime()) ? '' : d.toISOString();
          }
          return {
            id: order.id,
            formData: order.formData,
            selectedProducts: order.selectedProducts || [],
            totalAmount: order.totalAmount || 0,
            createdAt: createdAtISO,
            status: order.status,
          } as OrderData;
        }).filter((order: OrderData) => order.formData?.email === userEmail);

        // sort newest first
        normalized.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setOrders(normalized);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };

  const handleLogout = () => {

    localStorage.removeItem("user");
    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT";

    // Redirect
    router.push("/login");
  };

  const normalizePhone = (raw: string) => {
    const digits = (raw || '').replace(/\D/g, '');
    const local10 = digits.length >= 10 ? digits.slice(-10) : digits;
    const country = digits.length > 10 ? digits.slice(0, digits.length - 10) : '91';
    return {
      local10,
      e164: `+${country}${local10}`
    };
  };

  const handleEditSubmit = async () => {
    if (!user) return;

    setUpdating(true);
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(editForm.email)) {
        alert('Please enter a valid email address');
        setUpdating(false);
        return;
      }
      const { local10, e164 } = normalizePhone(editForm.phoneNumber);
      if (editForm.phoneNumber && local10.length !== 10) {
        alert('Phone number must be exactly 10 digits');
        setUpdating(false);
        return;
      }
      // Use PATCH method to match your Redux slice
      const response = await fetch(`/api/routes/auth`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uid: user.uid, // Include the uid in the request body
          name: editForm.fullName, // Use 'name' field to match your User interface
          email: editForm.email,
          phone: editForm.phoneNumber ? e164 : '', // Use 'phone' field to match your User interface
        }),
      });

      if (response.ok) {

        // Update the user object with the correct field names
        const updatedUser = {
          ...user,
          name: editForm.fullName, // Update 'name' field
          email: editForm.email,
          phone: editForm.phoneNumber ? e164 : '', // Update 'phone' field
          // Keep both field names for backward compatibility
          fullName: editForm.fullName,
          phoneNumber: editForm.phoneNumber,
        };

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setIsEditModalOpen(false);

        // Show success message
        alert("Profile updated successfully!");
      } else {
        const errorData = await response.json();
        console.error("Update error:", errorData);
        alert(`Failed to update profile: ${errorData.errorMessage || errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleViewOrderDetails = (order: OrderData) => {
    setSelectedOrder(order);
    setIsOrderDetailsModalOpen(true);
  };

  const getStatusIcon = (order: OrderData) => {
    const status = (order.status || '').toLowerCase();
    if (status === 'delivered') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'in_transit') return <Truck className="w-4 h-4 text-blue-500" />;
    if (status === 'processing' || status === 'pending') return <Clock className="w-4 h-4 text-yellow-500" />;
    // Fallback based on date if no status
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const daysDiff = isNaN(orderDate.getTime()) ? 0 : Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 7) return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (daysDiff > 3) return <Truck className="w-4 h-4 text-blue-500" />;
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusText = (order: OrderData) => {
    if (order.status) {
      const map: Record<string, string> = {
        delivered: 'Delivered',
        in_transit: 'In Transit',
        processing: 'Processing',
        pending: 'Pending',
        cancelled: 'Cancelled',
      };
      return map[(order.status as string).toLowerCase()] || 'Processing';
    }
    // Fallback based on date
    const orderDate = new Date(order.createdAt);
    const now = new Date();
    const daysDiff = isNaN(orderDate.getTime()) ? 0 : Math.floor((now.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff > 7) return 'Delivered';
    if (daysDiff > 3) return 'In Transit';
    return 'Processing';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'In Transit':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Processing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Helper function to get user display name
  const getUserDisplayName = () => {
    return user?.fullName || user?.name || 'User';
  };

  // Helper function to get user phone number
  const getUserPhone = () => {
    return user?.phoneNumber || user?.phone || 'Not provided';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary-red)] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Left Side - Profile Section */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-white shadow-lg border-0">
                <CardContent className="p-6">
                  {/* Profile Header */}
                  <div className="text-center mb-6">
                    <div className="relative inline-block mb-4">
                      <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
                        <AvatarImage src="/images/logo.png" alt={getUserDisplayName()} />
                        <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-red-400 to-red-600 text-white">
                          {getUserDisplayName().split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full p-0 bg-white shadow-md hover:bg-gray-50"
                      >
                        <Camera className="w-4 h-4" />
                      </Button>
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-1">{getUserDisplayName()}</h2>
                    <p className="text-gray-600 text-sm mb-3">Member since {new Date(user.createdOn).toLocaleDateString()}</p>

                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                      {user.role === 'admin' ? 'Administrator' : 'Premium Member'}
                    </Badge>
                  </div>

                  {/* Profile Actions */}
                  <div className="space-y-3 mb-6">
                    <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-[#E10600] hover:bg-[#C10500] text-white">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                          <DialogTitle>Edit Profile</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div>
                            <Label htmlFor="fullName">Full Name</Label>
                            <Input
                              id="fullName"
                              value={editForm.fullName}
                              onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                              placeholder="Enter your full name"
                            />
                          </div>
                          <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                              id="email"
                              type="email"
                              value={editForm.email}
                              onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                              placeholder="Enter your email"
                            />
                          </div>
                          <div>
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                              id="phoneNumber"
                              value={editForm.phoneNumber}
                              onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                              placeholder="Enter your phone number"
                              type="tel"
                              maxLength={14}
                            />
                          </div>
                          <div className="flex gap-3 pt-4">
                            <Button
                              onClick={handleEditSubmit}
                              className="flex-1 bg-[#E10600] hover:bg-[#C10500]"
                              disabled={updating}
                            >
                              {updating ? "Updating..." : "Save Changes"}
                            </Button>
                            <Button
                              variant="outline"
                              onClick={() => setIsEditModalOpen(false)}
                              className="flex-1"
                              disabled={updating}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Button
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={handleLogout}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </Button>
                  </div>

                  {/* Profile Details */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3 text-sm">
                      <Mail className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{user.email}</span>
                    </div>

                    <div className="flex items-center space-x-3 text-sm">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">{getUserPhone()}</span>
                    </div>

                    <div className="flex items-center space-x-3 text-sm">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="text-gray-700">Joined {new Date(user.createdOn).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
                        <p className="text-sm text-gray-600">Total Orders</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-gray-900">₹{totalSpent.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Total Spent</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right Side - Orders Section */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <Card className="bg-white shadow-lg border-0">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ShoppingBag className="w-5 h-5 text-[#E10600]" />
                    <span>My Orders</span>
                    <Badge variant="secondary" className="ml-2">
                      {orders.length} orders
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-8">
                      <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
                      <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
                      <Button onClick={() => router.push('/products')} className="bg-[#E10600] hover:bg-[#C10500]">
                        Browse Products
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order, index) => {
                        const status = getStatusText(order);
                        return (
                          <motion.div
                            key={order.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-2">
                                  {getStatusIcon(order)}
                                  <h3 className="font-semibold text-gray-900">
                                    {order.selectedProducts.length} Product{order.selectedProducts.length > 1 ? 's' : ''}
                                  </h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                  <div>
                                    <span className="font-medium">Date:</span> {(() => { const d = new Date(order.createdAt); return isNaN(d.getTime()) ? '-' : d.toLocaleDateString(); })()}
                                  </div>
                                  <div>
                                    <span className="font-medium">Amount:</span>
                                    <span className="font-semibold text-gray-900 ml-1">₹{order.totalAmount}</span>
                                  </div>
                                </div>
                                <div className="mt-2 text-sm text-gray-600">
                                  <span className="font-medium">Products:</span> {order.selectedProducts.map(p => p.name).join(', ')}
                                </div>
                              </div>
                              <div className="flex flex-col items-end space-y-2">
                                <Badge className={getStatusColor(status)}>
                                  {status}
                                </Badge>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleViewOrderDetails(order)}
                                >
                                  <Eye className="w-4 h-4 mr-1" />
                                  View Details
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Order Details Modal */}
      <Dialog open={isOrderDetailsModalOpen} onOpenChange={setIsOrderDetailsModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-[#E10600]" />
              <span>Order Details</span>
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-6 py-4">
              {/* Order Header */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Order #{selectedOrder.id.slice(-8)}
                  </h3>
                  <Badge className={getStatusColor(getStatusText(selectedOrder))}>
                    {getStatusText(selectedOrder)}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Order Date:</span>
                    <p className="text-gray-900">{new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Amount:</span>
                    <p className="text-gray-900 font-semibold">₹{selectedOrder.totalAmount}</p>
                  </div>
                </div>
              </div>

              {/* Customer Information */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Customer Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Name:</span>
                    <p className="text-gray-900">{selectedOrder.formData.fullName}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Email:</span>
                    <p className="text-gray-900">{selectedOrder.formData.email}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Phone:</span>
                    <p className="text-gray-900">{selectedOrder.formData.phone}</p>
                  </div>
                </div>
                {selectedOrder.formData.message && (
                  <div>
                    <span className="font-medium text-gray-600">Message:</span>
                    <p className="text-gray-900 mt-1">{selectedOrder.formData.message}</p>
                  </div>
                )}
              </div>

              {/* Products */}
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900">Products</h4>
                <div className="space-y-3">
                  {selectedOrder.selectedProducts.map((product, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                      <img
                        src={product.image || "/images/logo.png"}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h5 className="font-medium text-gray-900">{product.name}</h5>
                        <p className="text-sm text-gray-600">
                          Quantity: {product.quantity} | Price: ₹{product.price}
                        </p>
                        {product.wattage && (
                          <p className="text-sm text-gray-600">Wattage: {product.wattage}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">₹{product.price * product.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Close Button */}
              <div className="flex justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsOrderDetailsModalOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsersPage;