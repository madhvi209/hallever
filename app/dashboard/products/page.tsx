"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchProducts,
  selectProducts,
  selectIsLoading,
  addProduct,
  updateProduct,
  deleteProduct,
  ProductItem,
} from "@/lib/redux/slice/productSlice";
import { AppDispatch } from "@/lib/redux/store";
import { toast } from "sonner";
import ProductCard from "./productCard";
import ProductModal from "./productModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const CATEGORY_OPTIONS = [
  "Indoor",
  "Outdoor",
  "Tent Decoration",
  "Raw Materials",
  "Machinery",
  "Solar Lights",
  "Others",
];

const SUB_CATEGORY_OPTIONS: Record<string, string[]> = {
  Indoor: ["LED Bulb", "Tube Light", "Concal Light", "Panel Light"],
  Outdoor: ["Flood Light", "Street Light", "Gate Light"],
  "Tent Decoration": [
    "Hight Lights Choka",
    "Side Flood Light",
    "Street Lights",
    "Cob Lights",
    "Pixel Light",
    "DOM Light",
    "Chakri Board",
    "Suraj",
    "Ladi",
    "Rope Light",
    "Gallery Iron Stand",
  ],
  "Raw Materials": [
    "Driver",
    "LED MPCB",
    "SMPS",
    "Pixel Controller",
    "Repairing Iron",
    "Iron Shoulder",
  ],
  Machinery: ["Machinery Iron"],
  "Solar Lights": [
    "Garden Light",
    "Solar Flood Light",
    "Solar Street Light",
    "Solar Roof Panel",
  ],
};

export default function ProductsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const products = useSelector(selectProducts);
  const isLoading = useSelector(selectIsLoading);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [subCategory, setSubCategory] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [deleteProductData, setDeleteProductData] = useState<ProductItem | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch]);

  const filteredProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    return list.filter((p) => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = category === "all" ? true : p.category === category;
      const matchesSubCategory = subCategory ? p.subCategory === subCategory : true;
      return matchesSearch && matchesCategory && matchesSubCategory;
    });
  }, [products, search, category, subCategory]);

  const openAddModal = () => {
    setSelectedProduct(null);
    setSubCategory(null);
    setModalOpen(true);
  };

  const openEditModal = (product: ProductItem) => {
    setSelectedProduct(product);
    setSubCategory(product.subCategory || null);
    setModalOpen(true);
  };

  const handleSave = async (
    formData: Omit<ProductItem, "id" | "createdOn">,
    newImages: File[],
    deletedImages: string[]
  ) => {
    try {
      const formPayload = new FormData();
      formPayload.append("name", formData.name);
      formPayload.append("summary", formData.summary);
      formPayload.append("wattage", formData.wattage);
      formPayload.append("price", formData.price.toString());
      formPayload.append("category", formData.category);
      formPayload.append("subCategory", formData.subCategory || "");
      formPayload.append("link", formData.link || "");
      formPayload.append("dimensions", formData.specifications?.dimensions || "");
      formPayload.append("voltage", formData.specifications?.voltage || "");
      formPayload.append("efficiency", formData.specifications?.efficiency || "");
      formPayload.append("warranty", formData.specifications?.warranty || "");

      newImages.forEach((file) => formPayload.append("images", file));
      formPayload.append("deletedImages", JSON.stringify(deletedImages));

      if (selectedProduct?.images?.length) {
        const retained = selectedProduct.images.filter((img) => !deletedImages.includes(img));
        retained.forEach((url) => formPayload.append("existingImages", url));
      }

      if (selectedProduct) {
        await dispatch(updateProduct(formPayload, selectedProduct.id as string));
        toast.success("Product updated!");
      } else {
        await dispatch(addProduct(formPayload));
        toast.success("Product added!");
      }

      await dispatch(fetchProducts());
      setModalOpen(false);
    } catch (error) {
      console.error("Save error:", error);
      toast.error(`Failed to save product`);
    }
  };

  const handleDelete = async () => {
    if (!deleteProductData) return;
    setLoading(true);
    await dispatch(deleteProduct(deleteProductData.id as string));
    await dispatch(fetchProducts());
    setLoading(false);
    setDeleteProductData(null);
    toast.success("Product deleted!");
  };

  return (
    <div className="mx-auto p-0 flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2 mb-1 flex-wrap">
        <h2 className="text-xl font-bold text-[var(--primary-red)]">Products</h2>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center justify-end">
          <div className="relative w-full sm:w-64">
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>

          <Select
            value={category}
            onValueChange={(val) => {
              setCategory(val);
              setSubCategory(null);
            }}
          >
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Filter by Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {CATEGORY_OPTIONS.map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {category !== "all" && SUB_CATEGORY_OPTIONS[category] && (
            <Select value={subCategory ?? ""} onValueChange={setSubCategory}>
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="Select Sub Category" />
              </SelectTrigger>
              <SelectContent>
                {SUB_CATEGORY_OPTIONS[category]?.map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Button
            onClick={openAddModal}
            className="gap-2 w-full sm:w-auto bg-[var(--primary-red)] hover:bg-[var(--primary-pink)]"
          >
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center text-gray-400 py-12">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-12">
            No products found.
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={openEditModal}
              onDelete={setDeleteProductData}
            />
          ))
        )}
      </div>

      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        product={selectedProduct ?? undefined}
      />

      <Dialog
        open={!!deleteProductData}
        onOpenChange={(open) => !open && setDeleteProductData(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
          </DialogHeader>
          <div>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-[var(--primary-green)]">
              {deleteProductData?.name}
            </span>
            ?
          </div>
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={loading}
              className="gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Delete
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
