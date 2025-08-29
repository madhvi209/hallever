"use client";

import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import {
  fetchOrders,
  addOrder,
  updateOrder,
  deleteOrder,
  selectAllOrders,
  Order,
  OrderFormData,
  SelectedProduct,
} from "@/lib/redux/slice/orderSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pencil, Trash, Plus, Loader2 } from "lucide-react";

// --- Loader selector (add this if not already in your slice) ---
import { useSelector as useReduxSelector } from "react-redux";

// You may need to adjust this selector based on your slice's state shape
const selectOrdersLoading = (state: any) =>
  state.orders?.loading || state.order?.loading || false;

const OrdersPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const orders = useSelector(selectAllOrders);
  const ordersLoading = useReduxSelector(selectOrdersLoading);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [form, setForm] = useState<OrderFormData>({
    fullName: "",
    email: "",
    phone: "",
    message: "",
  } as OrderFormData);
  const [status, setStatus] = useState<'processing' | 'in_transit' | 'delivered' | 'cancelled' | 'pending'>('processing');
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [editOrderId, setEditOrderId] = useState<string | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [manualTotalAmount, setManualTotalAmount] = useState<number>(0);
  const [useManualTotal, setUseManualTotal] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch all orders on mount using the slice thunk
  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  // When editing, populate form and selectedProducts from the order
  const openEditModal = (order: Order) => {
    setForm({
      fullName: order.formData.fullName || "",
      email: order.formData.email || "",
      phone: order.formData.phone || "",
      message: order.formData.message || "",
    });
    setSelectedProducts(order.selectedProducts || []);
    setManualTotalAmount(order.totalAmount || 0);
    setUseManualTotal(false);
    setEditOrderId(order.id || null);
    setStatus((order.status as any) || 'processing');
    setModalOpen(true);
  };

  // When adding, reset form and selectedProducts
  const openAddModal = () => {
    setForm({
      fullName: "",
      email: "",
      phone: "",
      message: "",
    });
    setSelectedProducts([]);
    setManualTotalAmount(0);
    setUseManualTotal(false);
    setEditOrderId(null);
    setStatus('processing');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditOrderId(null);
    setForm({
      fullName: "",
      email: "",
      phone: "",
      message: "",
    });
    setSelectedProducts([]);
    setManualTotalAmount(0);
    setUseManualTotal(false);
  };

  const normalizePhone = (raw: string) => {
    const digits = (raw || '').replace(/\D/g, '');
    const local10 = digits.length >= 10 ? digits.slice(-10) : digits;
    const country = digits.length > 10 ? digits.slice(0, digits.length - 10) : '91';
    return { local10, e164: `+${country}${local10}` };
  };

  // Add or update order using the slice thunks
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Basic validations
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      alert('Please enter a valid email address');
      setIsLoading(false);
      return;
    }
    const { local10, e164 } = normalizePhone(form.phone);
    if (local10.length !== 10) {
      alert('Phone must be exactly 10 digits');
      setIsLoading(false);
      return;
    }

    // Calculate total from selected products
    const calculatedTotal = selectedProducts.reduce(
      (sum, p) => sum + (p.price || 0) * (p.quantity || 1),
      0
    );

    // Use manual total if enabled, otherwise use calculated total
    const finalTotalAmount = useManualTotal ? manualTotalAmount : calculatedTotal;

    const orderPayload = {
      formData: { ...form, phone: e164 },
      selectedProducts: [...selectedProducts],
      totalAmount: finalTotalAmount,
      status,
    };

    if (editOrderId) {
      await dispatch(
        updateOrder({
          id: editOrderId,
          ...orderPayload,
        } as Order)
      );
    } else {
      await dispatch(addOrder(orderPayload));
    }

    await dispatch(fetchOrders());
    closeModal();
    setIsLoading(false);
  };

  // Delete order using the slice thunk
  const handleDelete = async () => {
    if (orderToDelete) {
      setIsDeleting(true);
      await dispatch(deleteOrder(orderToDelete));
      await dispatch(fetchOrders());
      setOrderToDelete(null);
      setDeleteModalOpen(false);
      setIsDeleting(false);
    }
  };

  // For demo: show selected products in the order card and in the modal
  const renderSelectedProducts = (products: SelectedProduct[]) => (
    <div className="mt-2">
      {products.length > 0 && (
        <div className="space-y-2">
          <div className="font-semibold text-xs text-gray-500">Selected Products:</div>
          {products.map((prod) => (
            <div key={prod.id} className="flex items-center gap-2 border rounded p-2 bg-gray-50">
              <img src={prod.image} alt={prod.name} className="w-10 h-10 object-cover rounded" />
              <div className="flex-1">
                <div className="font-medium text-sm">{prod.name}</div>
                <div className="text-xs text-gray-500">
                  Price: ₹{prod.price} &nbsp;|&nbsp; Qty: {prod.quantity}
                </div>
              </div>
              {prod.wattage && (
                <span className="text-xs text-gray-400">Wattage: {prod.wattage}</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );

  // For demo: allow adding a hardcoded product to the order in the modal
  const handleAddDemoProduct = () => {
    const demoProduct: SelectedProduct = {
      id: "GDAUFC9KRtBqivWNKUOw",
      name: "outdoor light",
      image:
        "https://storage.googleapis.com/hallever-ca644.firebasestorage.app/products/1753861571444_solar.jpeg?GoogleAccessId=firebase-adminsdk-fbsvc%40hallever-ca644.iam.gserviceaccount.com&Expires=16446997800&Signature=k%2F5jk4yFsIgPLYaAbF0PIwMLPahgdMRLC%2FsUmbbLGZ1QE%2BQZ87TD2654qv%2FmH367wzKsjpSIMg4YfmV92f%2BCPpooXfoq5tvdg%2BgBAJm9fULyqacgkWi05Jdo%2Bk9VzESMfLjIF3twepjFTr3ZVuyJOrBekMBlvIIEh7%2FLtNOZrcYG0eF8cLtgGuWvrHbSz7GdqyhOOTgMLgewExa3kRY2E6gF7uUgPVnSqFcgwYP%2Bl6wM65PBSb5MJ2L7U8jV45UZOBCcCWvwz%2FwAYLPk4JRp2QTITJ2MvqnVJJjwyCN5TStUSXpSbtpdEz7uXpmB9zq699mwbTSl95mALjhcPgIWXA%3D%3D",
      price: 3799,
      quantity: 1,
      wattage: "",
    };
    if (!selectedProducts.some((p) => p.id === demoProduct.id)) {
      setSelectedProducts((prev) => [...prev, demoProduct]);
    }
  };

  const handleRemoveProduct = (id: string) => {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  };

  // New: handle quantity change for a product
  const handleProductQuantityChange = (id: string, newQuantity: number) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, quantity: newQuantity > 0 ? newQuantity : 1 }
          : p
      )
    );
  };

  // Calculate total from selectedProducts
  const calculatedTotalAmount = selectedProducts.reduce(
    (sum, p) => sum + (p.price || 0) * (p.quantity || 1),
    0
  );

  // Handle manual total amount change
  const handleManualTotalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setManualTotalAmount(value);
  };

  return (
    <div className="p-4 space-y-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h2 className="text-xl font-bold text-[var(--primary-red)]">Order List</h2>
        <Button
          onClick={openAddModal}
          className="gap-2 w-full sm:w-auto bg-[var(--primary-red)] hover:bg-[var(--primary-pink)] text-white"
        >
          <Plus className="w-4 h-4" />
          Add Order
        </Button>
      </div>

      {/* Loader for orders */}
      {ordersLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-red)]" />
          <span className="ml-3 text-[var(--primary-red)] font-medium">Loading orders...</span>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.isArray(orders) &&
            orders.map((order) => (
              <div
                key={order.id}
                className="border border-gray-200 rounded-xl p-4 space-y-2 shadow-sm bg-white"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-[var(--primary-red)]">
                    {order.formData.fullName}
                  </h3>
                  <div className="flex gap-2">
                    <Pencil
                      className="w-4 h-4 cursor-pointer text-[var(--primary-red)] hover:opacity-70"
                      onClick={() => openEditModal(order)}
                    />
                    <Trash
                      className="w-4 h-4 cursor-pointer text-[var(--primary-red)] hover:text-[var(--primary-pink)]"
                      onClick={() => {
                        setOrderToDelete(order.id || null);
                        setDeleteModalOpen(true);
                      }}
                    />
                  </div>
                </div>
                <p className="text-sm">{order.formData.email}</p>
                <p className="text-sm">{order.formData.phone}</p>
                {order.status && (
                  <span className="inline-block mt-1 text-xs px-2 py-1 rounded-full bg-gray-100">
                    {order.status.replace(/_/g, ' ')}
                  </span>
                )}
                {order.formData.message && (
                  <p className="text-sm text-gray-600">{order.formData.message}</p>
                )}
                {/* Remove category/subcategory badges */}
                {/* Show selected products */}
                {renderSelectedProducts(order.selectedProducts || [])}
                <div>
                  <span className="text-xs text-gray-400">
                    Created:{" "}
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : ""}
                  </span>
                </div>
                {/* Show total amount */}
                <div className="text-xs font-semibold text-[var(--primary-red)]">
                  Total Amount: ₹{order.totalAmount || 0}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog open={modalOpen} onOpenChange={closeModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[var(--primary-red)]">
              {editOrderId ? "Edit Order" : "Add Order"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="text"
              placeholder="Full Name"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              required
            />
            <Input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              type="tel"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              required
            />
            <div className="flex items-center gap-2">
              <span className="text-sm">Status</span>
              <select
                className="border rounded px-2 py-1 text-sm"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
              >
                <option value="processing">Processing</option>
                <option value="in_transit">In Transit</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <Textarea
              placeholder="Message"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
            />

            {/* Removed Search Query, Selected Category, Selected SubCategory fields */}

            {/* Selected Products Section */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-sm">Selected Products</span>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="gap-1 text-xs"
                  onClick={handleAddDemoProduct}
                >
                  <Plus className="w-3 h-3" />
                  Add Demo Product
                </Button>
              </div>
              {selectedProducts.length === 0 && (
                <div className="text-xs text-gray-400">No products selected.</div>
              )}
              {selectedProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="flex items-center gap-2 border rounded p-2 mb-2 bg-gray-50"
                >
                  <img
                    src={prod.image}
                    alt={prod.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-xs">{prod.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      Price: ₹{prod.price}
                      <span>|</span>
                      Qty:{" "}
                      <Input
                        type="number"
                        min={1}
                        value={prod.quantity}
                        onChange={(e) =>
                          handleProductQuantityChange(
                            prod.id,
                            Math.max(1, parseInt(e.target.value) || 1)
                          )
                        }
                        className="w-16 h-7 px-2 py-0 text-xs"
                        style={{ fontSize: "12px" }}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    size="icon"
                    variant="ghost"
                    onClick={() => handleRemoveProduct(prod.id)}
                  >
                    <Trash className="w-3 h-3 text-[var(--primary-red)]" />
                  </Button>
                </div>
              ))}
            </div>

            {/* Total Amount Section with Manual Override */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[var(--primary-red)]">Total Amount</span>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="manualTotal"
                    checked={useManualTotal}
                    onChange={(e) => setUseManualTotal(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label htmlFor="manualTotal" className="text-xs text-gray-600">
                    Manual Override
                  </label>
                </div>
              </div>
              
              {useManualTotal ? (
                <div className="flex items-center gap-2">
                  <span className="text-sm">₹</span>
                  <Input
                    type="number"
                    min={0}
                    step={0.01}
                    value={manualTotalAmount}
                    onChange={handleManualTotalChange}
                    className="flex-1"
                    placeholder="Enter total amount"
                  />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm">₹</span>
                  <span className="text-lg font-semibold text-[var(--primary-red)]">
                    {calculatedTotalAmount}
                  </span>
                  <span className="text-xs text-gray-500">(Calculated)</span>
                </div>
              )}
              
              {useManualTotal && calculatedTotalAmount !== manualTotalAmount && (
                <div className="text-xs text-gray-500">
                  Calculated total: ₹{calculatedTotalAmount} | Difference: ₹{manualTotalAmount - calculatedTotalAmount}
                </div>
              )}
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="gap-2 bg-[var(--primary-red)] hover:bg-[var(--primary-pink)] text-white"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {editOrderId ? "Update" : "Add"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteModalOpen} onOpenChange={() => setDeleteModalOpen(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-[var(--primary-red)]">Delete Order</DialogTitle>
          </DialogHeader>
          <p>
            Are you sure you want to delete this order?
          </p>
          {/* Order ID is intentionally not shown here */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)} disabled={isDeleting}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-[var(--primary-red)] hover:bg-[var(--primary-pink)] text-white"
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage;
