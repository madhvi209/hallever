"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
    fetchProducts,
    selectProducts,
    selectIsLoading,
    ProductItem,
} from "@/lib/redux/slice/productSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import { useLanguage } from "@/context/language-context";
import { useCart } from "@/context/cart-context";
import { Loader2, ShoppingCart, Check } from "lucide-react";
import Link from "next/link";
import { generateSlug } from "@/lib/utils";

const categories = ["Indoor", "Outdoor", "Tent Decoration", "Raw Materials", "Machinery", "Solar Lights"];

const categoryKeys = {
    "Indoor": "indoor",
    "Outdoor": "outdoor",
    "Tent Decoration": "tent",
    "Raw Materials": "raw",
    "Machinery": "machinery",
    "Solar Lights": "solar",
};

const categoryImages: Record<string, string> = {
    indoor: "/images/indoor.jpeg",
    outdoor: "/images/outdoor.jpeg",
    tent: "/images/tent.jpeg",
    raw: "/images/raw-materials.jpeg",
    machinery: "/images/machinery.png",
    solar: "/images/solar.jpeg",
};

const subCategories: Record<string, string[]> = {
    indoor: ["LED Bulb", "Tube Light", "Concal Light", "Panel Light"],
    outdoor: ["Flood Light", "Street Light", "Gate Light"],
    tent: [
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
    raw: ["Driver", "LED MPCB", "SMPS", "Pixel Controller", "Repairing Iron", "Iron Shoulder"],
    machinery: ["Machinery Iron"],
    solar: ["Garden Light", "Solar Flood Light", "Solar Street Light", "Solar Roof Panel"],
};

export default function ProductSection() {
    const dispatch = useDispatch<AppDispatch>();
    const { t } = useLanguage();
    const { addToCart, isInCart } = useCart();

    const products = useSelector(selectProducts);
    const isLoading = useSelector(selectIsLoading);

    const [selectedImageIndices, setSelectedImageIndices] = useState<Record<string, number>>({});
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
    const [addedToCart, setAddedToCart] = useState<Record<string, boolean>>({});

    useEffect(() => {
        dispatch(fetchProducts());
    }, [dispatch]);

    const handleAddToCart = (product: ProductItem) => {
        addToCart(product);
        
        // Show success feedback
        setAddedToCart(prev => ({ ...prev, [String(product.id)]: true }));
        setTimeout(() => {
            setAddedToCart(prev => ({ ...prev, [String(product.id)]: false }));
        }, 2000);
    };

    const handleImageSelect = (productId: string | number, index: number) => {
        setSelectedImageIndices((prev) => ({
            ...prev,
            [String(productId)]: index,
        }));
    };

    const filteredProducts = products.filter((product) => {
        const matchCategory = selectedCategory
            ? product.category === selectedCategory
            : true;

        const matchSubCategory = selectedSubCategory
            ? product.subCategory?.toLowerCase() === selectedSubCategory.toLowerCase()
            : true;

        return matchCategory && matchSubCategory;
    });

    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
                    {t("products.titleFirst")} <span className="text-[var(--primary-red)]">{t("products.titleSecond")}</span>
                </h2>

                {/* Category List */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
                    {categories.map((cat) => {
                        const key = categoryKeys[cat];
                        return (
                            <div
                                key={cat}
                                onClick={() => {
                                    setSelectedCategory((prev) => (prev === cat ? null : cat));
                                    setSelectedSubCategory(null);
                                }}
                                className={`text-center group cursor-pointer transform hover:scale-105 transition-all duration-300 ${selectedCategory === cat ? "scale-105" : ""}`}
                            >
                                <div className="relative w-32 h-32 rounded-full overflow-hidden mx-auto mb-4 bg-[#a8e6ff]/10 group-hover:bg-[#a8e6ff]/20 transition-colors">
                                    <Image
                                        src={categoryImages[key]}
                                        alt={t(`products.categories.${key}.name`)}
                                        fill
                                        className="object-contain"
                                    />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {t(`products.categories.${key}.name`)}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                    {t(`products.categories.${key}.summary`)}
                                </p>
                            </div>
                        );
                    })}
                </div>

                {/* Subcategories */}
                {selectedCategory && subCategories[categoryKeys[selectedCategory]] && (
                    <div className="flex flex-wrap gap-2 justify-center mb-10">
                        {subCategories[categoryKeys[selectedCategory]].map((sub, idx) => (
                            <button
                                key={idx}
                                onClick={() =>
                                    setSelectedSubCategory((prev) => (prev === sub ? null : sub))
                                }
                                className={`px-3 py-1 text-xs rounded-full border transition ${selectedSubCategory === sub
                                    ? "bg-[var(--primary-red)] text-white border-[var(--primary-red)]"
                                    : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-gray-200"}`}
                            >
                                {sub}
                            </button>
                        ))}
                    </div>
                )}

                {/* Filtered Heading */}
                <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
                    {t("products.titleFirst")} <span className="text-[var(--primary-red)]">
                        {selectedSubCategory
                            ? selectedSubCategory
                            : selectedCategory
                                ? t(`products.categories.${categoryKeys[selectedCategory]}.name`)
                                : ""} {t("products.titleSecond")}
                    </span>
                </h2>

                {/* Products Grid */}
                {isLoading ? (
                    <div className="text-center text-gray-500 py-12">
                        <Loader2 className="w-10 h-10 animate-spin mx-auto" />
                    </div>
                ) : (
                    <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
                        {filteredProducts.map((product) => {
                            const currentImageIndex = selectedImageIndices[product.id!] || 0;
                            const productSlug = generateSlug(product.name);
                            const showAddedFeedback = addedToCart[String(product.id)];
                            
                            return (
                                <div
                                    key={product.id}
                                    className="border border-gray-200 rounded-xl shadow-md transition-all hover:shadow-xl bg-white"
                                >
                                    <div className="relative w-full h-52 mb-4 overflow-hidden rounded-md">
                                        <Image
                                            src={product.images[currentImageIndex] || "/placeholder.svg"}
                                            alt={product.name}
                                            fill
                                            className="object-cover w-full h-full transition-transform duration-300"
                                        />
                                        {product.images.length > 1 && (
                                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
                                                {product.images.map((_, imgIndex) => (
                                                    <button
                                                        key={imgIndex}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleImageSelect(product.id!, imgIndex);
                                                        }}
                                                        className={`w-2 h-2 rounded-full border border-white ${currentImageIndex === imgIndex
                                                            ? "bg-[var(--primary-red)]"
                                                            : "bg-gray-300"}`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-4">
                                        <h3 className="text-xl font-semibold text-gray-800 mb-1">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-gray-600 mb-2">₹{product.price}</p>

                                        <ul className="text-xs text-gray-500 space-y-1 mb-4">
                                            <li><strong>Wattage:</strong> {product.wattage}</li>
                                            <li><strong>Dimension:</strong> {product.specifications?.dimensions}</li>
                                            <li><strong>Efficiency:</strong> {product.specifications?.efficiency}</li>
                                            {product.subCategory && (
                                                <li><strong>Subcategory:</strong> {product.subCategory}</li>
                                            )}
                                        </ul>

                                        <div className="flex justify-between gap-2">
                                            <button
                                                onClick={() => handleAddToCart(product)}
                                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 text-sm rounded transition-all duration-300 ${showAddedFeedback ? "bg-green-600 hover:bg-green-700" : "bg-[var(--primary-red)] hover:bg-red-700"} text-white hover:scale-105`}
                                                style={{ minHeight: "38px" }}
                                            >
                                                {showAddedFeedback ? (
                                                    <>
                                                        <Check className="w-4 h-4" />
                                                        Added!
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCart className="w-4 h-4" />
                                                        Add to Cart
                                                    </>
                                                )}
                                            </button>

                                            <Link href={`/products/${productSlug}`}>
                                                <button
                                                    className="flex-1 text-center border border-[var(--primary-red)] text-[var(--primary-red)] px-4 py-2 text-sm rounded hover:bg-[var(--primary-red)] hover:text-white transition hover:scale-105"
                                                    style={{ minHeight: "38px" }}
                                                >
                                                    {t("button.knowMore")}
                                                </button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
    );
}
