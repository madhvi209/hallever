"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
    ImageIcon,
} from "lucide-react";
import { ProductItem } from "@/lib/redux/slice/productSlice";

interface ProductCardProps {
    product: ProductItem;
    onEdit: (product: ProductItem) => void;
    onDelete: (product: ProductItem) => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onEdit,
    onDelete,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = () => {
        setCurrentImageIndex((prev) =>
            prev === product.images.length - 1 ? 0 : prev + 1
        );
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) =>
            prev === 0 ? product.images.length - 1 : prev - 1
        );
    };

    return (
        <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white border-0 shadow-md">
            <CardContent className="p-0 relative">

                {/* 🔴 Category and Subcategory Badges */}
                {product.category && (
                    <div className="absolute top-2 left-2 z-10 flex flex-col space-y-1">
                        <div className="bg-[var(--primary-red)] text-white text-xs font-semibold px-3 py-1 rounded-full shadow-sm">
                            {product.category}
                        </div>
                        {product.subCategory && (
                            <div className="bg-[var(--primary-pink)] text-white text-xs font-medium px-2 py-0.5 rounded-full shadow-sm">
                                {product.subCategory}
                            </div>
                        )}
                    </div>
                )}

                {/* Image Section */}
                <div className="relative h-48 bg-gradient-to-br from-gray-100 to-gray-200 rounded-t-lg overflow-hidden">
                    {product.images.length > 0 ? (
                        <>
                            <Image
                                src={product.images[currentImageIndex]}
                                alt={product.name}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                            {product.images.length > 1 && (
                                <>
                                    <button
                                        onClick={prevImage}
                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={nextImage}
                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                    <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
                                        {product.images.map((_, index) => (
                                            <div
                                                key={index}
                                                className={`w-2 h-2 rounded-full transition-colors duration-200 ${index === currentImageIndex
                                                    ? "bg-white"
                                                    : "bg-white/50"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <ImageIcon className="w-16 h-16 text-gray-400" />
                        </div>
                    )}
                </div>

                {/* Content Section */}
                <div className="p-4 space-y-3">
                    <div>
                        <h3 className="font-semibold text-lg text-[var(--primary-red)] line-clamp-1">
                            {product.name}
                        </h3>

                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {product.summary}
                        </p>
                    </div>

                    {/* Wattage & Date */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-[var(--primary-red)] bg-[var(--primary-pink)] px-2 py-1 rounded">
                            Wattage: {product.wattage}
                        </span>
                        <span className="text-xs text-gray-500">
                            {product.createdOn
                                ? new Date(product.createdOn).toLocaleDateString()
                                : "Unknown date"}
                        </span>
                    </div>

                    {/* Price */}
                    {product.price !== undefined && (
                        <div className="text-base font-semibold text-green-700">
                            ₹{product.price.toLocaleString("en-IN")}
                        </div>
                    )}

                    {/* Specifications */}
                    {product.specifications && (
                        <ul className="text-xs text-gray-500 space-y-1 mt-1">
                            {product.specifications.dimensions && (
                                <li>Dimensions: {product.specifications.dimensions}</li>
                            )}
                            {product.specifications.weight && (
                                <li>Weight: {product.specifications.weight}</li>
                            )}
                            {product.specifications.voltage && (
                                <li>Voltage: {product.specifications.voltage}</li>
                            )}
                            {product.specifications.efficiency && (
                                <li>Efficiency: {product.specifications.efficiency}</li>
                            )}
                            {product.specifications.useCase && (
                                <li>Use Case: {product.specifications.useCase}</li>
                            )}
                            {product.specifications.warranty && (
                                <li>Warranty: {product.specifications.warranty}</li>
                            )}
                        </ul>
                    )}

                    {/* Product Link */}
                    {product.link && (
                        <div className="text-xs mt-2">
                            <span className="font-medium text-gray-500">Link: </span>
                            <a
                                href={product.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--primary-red)] underline break-all hover:text-[var(--primary-red-dark)]"
                            >
                                {product.link}
                            </a>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onEdit(product)}
                            className="flex-1 border-[var(--primary-red)] text-[var(--primary-red)] hover:bg-[var(--primary-pink)]"
                        >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onDelete(product)}
                            className="flex-1 border-red-300 text-red-600 hover:bg-red-100"
                        >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Delete
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default ProductCard;
