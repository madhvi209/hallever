/* eslint-disable react/no-unescaped-entities */
"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { RootState, AppDispatch } from "@/lib/redux/store"
import { fetchProducts } from "@/lib/redux/slice/productSlice"
import { addOrder, SelectedProduct, OrderFormData, resetOrderForm } from "@/lib/redux/slice/orderSlice"

// Category & SubCategory options
const categoryOptions = [
    "Indoor", "Outdoor", "Tent Decoration", "Raw Materials", "Machinery", "Solar Lights", "Others",
]

const subCategoryMap: Record<string, string[]> = {
    Indoor: ["LED Bulb", "Tube Light", "Concal Light", "Panel Light"],
    Outdoor: ["Flood Light", "Street Light", "Gate Light"],
    "Tent Decoration": [
        "Hight Lights Choka", "Side Flood Light", "Street Lights", "Cob Lights", "Pixel Light",
        "DOM Light", "Chakri Board", "Suraj", "Ladi", "Rope Light", "Gallery Iron Stand",
    ],
    "Raw Materials": ["Driver", "LED MPCB", "SMPS", "Pixel Controller", "Repairing Iron", "Iron Shoulder"],
    Machinery: ["Machinery Iron"],
    "Solar Lights": ["Garden Light", "Solar Flood Light", "Solar Street Light", "Solar Roof Panel"],
    Others: ["Miscellaneous"],
}

export function OrderForm() {
    const dispatch = useDispatch<AppDispatch>()
    const { products, isLoading } = useSelector((state: RootState) => state.products)

    const [formData, setFormData] = useState<OrderFormData>({
        fullName: "",
        email: "",
        phone: "",
        message: "",
        searchQuery: "",
        selectedCategory: "",
        selectedSubCategory: "",
    })

    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([])

    // Fetch products on mount
    useEffect(() => {
        dispatch(fetchProducts())
    }, [dispatch])

    const handleInputChange = (field: keyof OrderFormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
    }

    const handleAddProduct = (productId: string) => {
        const product = products.find((p) => p.id === productId)
        if (product && !selectedProducts.find((p) => p.id === productId)) {
            const newProduct: SelectedProduct = {
                id: String(product.id),
                name: product.name,
                image: Array.isArray(product.images) ? product.images[0] || "/placeholder.svg" : product.images || "/placeholder.svg",
                price: product.price || 0,
                quantity: 1,
                wattage: "",
            }
            setSelectedProducts((prev) => [...prev, newProduct])
        }
    }

    const updateSelectedProduct = (productId: string, field: keyof SelectedProduct, value: string | number) => {
        setSelectedProducts((prev) =>
            prev.map((p) => (p.id === productId ? { ...p, [field]: value } : p))
        )
    }

    const removeSelectedProduct = (productId: string) => {
        setSelectedProducts((prev) => prev.filter((p) => p.id !== productId))
    }

    const totalAmount = selectedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (selectedProducts.length === 0) {
            alert("Please add at least one product to submit an enquiry.")
            return
        }

        // Payload for API
        const orderPayload = {
            formData: {
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                message: formData.message,
            },
            selectedProducts: selectedProducts.map((p) => ({
                id: p.id,
                name: p.name,
                price: p.price,
                quantity: p.quantity,
                wattage: p.wattage,
                image: p.image,
            })),
            totalAmount,
        }

        try {
            await dispatch(addOrder(orderPayload))
            alert("Enquiry submitted successfully!")
            setFormData({
                fullName: "",
                email: "",
                phone: "",
                message: "",
                searchQuery: "",
                selectedCategory: "",
                selectedSubCategory: "",
            })
            setSelectedProducts([])
            dispatch(resetOrderForm())
        } catch (err) {
            console.error(err)
            alert("Failed to submit enquiry.")
        }
    }

    return (
        <Card className="bg-white shadow-sm border border-gray-200">
            <CardContent className="p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-serif text-gray-900 mb-2">Order From Us</h1>
                    <p className="text-blue-600 text-sm">Fill out the form below and we'll get back to you.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Contact Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input placeholder="Full Name" value={formData.fullName} onChange={(e) => handleInputChange("fullName", e.target.value)} />
                        <Input placeholder="Email" type="email" value={formData.email} onChange={(e) => handleInputChange("email", e.target.value)} />
                    </div>
                    <Input placeholder="Phone" value={formData.phone} onChange={(e) => handleInputChange("phone", e.target.value)} />
                    <Textarea placeholder="Message" value={formData.message} onChange={(e) => handleInputChange("message", e.target.value)} className="min-h-[100px]" />

                    {/* Category & SubCategory for filtering only */}
                    <Select value={formData.selectedCategory} onValueChange={(val) => { handleInputChange("selectedCategory", val); handleInputChange("selectedSubCategory", ""); }}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                            {categoryOptions.map((cat) => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    <Select value={formData.selectedSubCategory} onValueChange={(val) => handleInputChange("selectedSubCategory", val)} disabled={!formData.selectedCategory}>
                        <SelectTrigger><SelectValue placeholder="Select subcategory" /></SelectTrigger>
                        <SelectContent>
                            {formData.selectedCategory && subCategoryMap[formData.selectedCategory]?.map((sub) => <SelectItem key={sub} value={sub}>{sub}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    {/* Search Products */}
                    <Input placeholder="Search by name..." value={formData.searchQuery} onChange={(e) => handleInputChange("searchQuery", e.target.value)} />

                    {/* Product Suggestions */}
                    {isLoading && <p>Loading...</p>}
                    {products
                        .filter((p) => p.name.toLowerCase().includes(formData.searchQuery.toLowerCase()))
                        .slice(0, 5)
                        .map((product) => (
                            <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                    <img src={(Array.isArray(product.images) ? product.images[0] : undefined) || "/placeholder.svg"} alt={product.name} className="w-12 h-12 rounded object-cover" />
                                    <span>{product.name}</span>
                                </div>
                                <Button type="button" onClick={() => handleAddProduct(String(product.id))} disabled={selectedProducts.some((p) => p.id === product.id)}>
                                    {selectedProducts.some((p) => p.id === product.id) ? "Added" : "Add"}
                                </Button>
                            </div>
                        ))}

                    {/* Selected Products */}
                    {selectedProducts.length > 0 && (
                        <div>
                            <h3>Selected Products:</h3>
                            {selectedProducts.map((p) => (
                                <div key={p.id} className="border p-4 rounded-lg mb-2">
                                    <div className="flex justify-between items-center">
                                        <span>{p.name} - ₹{p.price}</span>
                                        <Button type="button" onClick={() => removeSelectedProduct(p.id)}>Remove</Button>
                                    </div>
                                    <div className="flex gap-3 items-center">
                                        <div className="flex flex-col w-28">
                                            <label className="text-xs text-muted-foreground mb-1" htmlFor={`quantity-${p.id}`}>Quantity</label>
                                            <Input
                                                id={`quantity-${p.id}`}
                                                type="number"
                                                min={1}
                                                value={p.quantity}
                                                onChange={(e) => updateSelectedProduct(p.id, "quantity", Number(e.target.value))}
                                                className="w-full"
                                                placeholder="Qty"
                                            />
                                        </div>
                                        <div className="flex flex-col w-36">
                                            <label className="text-xs text-muted-foreground mb-1" htmlFor={`wattage-${p.id}`}>Wattage</label>
                                            <Input
                                                id={`wattage-${p.id}`}
                                                placeholder="Wattage"
                                                value={p.wattage}
                                                onChange={(e) => updateSelectedProduct(p.id, "wattage", e.target.value)}
                                                className="w-full"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <p className="text-right font-semibold">Total: ₹{totalAmount}</p>
                        </div>
                    )}

                    <Button type="submit" className="w-full bg-red-600 hover:bg-red-700 text-white py-3">
                        Submit Inquiry
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}
