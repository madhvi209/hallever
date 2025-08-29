"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { ProductItem } from "@/lib/redux/slice/productSlice";
import { useSelector, useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import { fetchProducts, selectProducts } from "@/lib/redux/slice/productSlice";
import { findProductBySlug } from "@/lib/utils";
import { useCart } from "@/context/cart-context";
import { ShoppingCart, Check } from "lucide-react";

export default function ProductDetailsPage() {
    const { slug } = useParams();
    const dispatch = useDispatch<AppDispatch>();
    const products = useSelector(selectProducts);
    const { addToCart } = useCart();
    const [product, setProduct] = useState<ProductItem | null>(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [addedToCart, setAddedToCart] = useState(false);

    // Fetch products and find the one by slug
    useEffect(() => {
        const loadProduct = async () => {
            try {
                // Fetch products if not already loaded
                if (products.length === 0) {
                    await dispatch(fetchProducts());
                }
                
                // Find product by slug
                const foundProduct = findProductBySlug(products, slug as string);
                if (foundProduct) {
                    setProduct(foundProduct);
                } else {
                    console.error("Product not found for slug:", slug);
                }
            } catch (error) {
                console.error("Error loading product:", error);
            } finally {
                setLoading(false);
            }
        };

        loadProduct();
    }, [slug, dispatch, products]);

    if (loading) return <p className="text-center py-20">Loading...</p>;
    if (!product) return <p className="text-center py-20">Product not found</p>;

    return (
        <>
            {/* Hero Section */}
            <div className="relative w-full h-[50vh] lg:h-[60vh] flex items-center justify-center">
                <Image
                    src={"/images/about/hero.jpeg"}
                    alt={product.name}
                    fill
                    className="object-cover brightness-75"
                />
                <h1 className="absolute text-4xl lg:text-6xl font-bold text-white text-center px-4">
                    {product.name}
                </h1>
            </div>

            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 max-w-7xl mx-auto"
                >
                    {/* Product Info */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                        {/* Images Section */}
                        <div className="space-y-4">
                            <div className="aspect-square rounded-lg overflow-hidden">
                                <Image
                                    src={product.images[selectedImageIndex] || "/placeholder.svg"}
                                    alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                                    width={500}
                                    height={500}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                            <div className="grid grid-cols-4 gap-2">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImageIndex(index)}
                                        className={`aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${selectedImageIndex === index
                                                ? "border-[#E10600]"
                                                : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <Image
                                            src={image || "/placeholder.svg"}
                                            alt={`${product.name} - Thumbnail ${index + 1}`}
                                            width={100}
                                            height={100}
                                            className="w-full h-full object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Product Details Section */}
                        <div className="space-y-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
                                <p className="text-gray-600 text-lg mb-4">{product.summary}</p>
                                <div className="flex items-center gap-4 mb-4">
                                    <span className="text-3xl font-bold text-[#E10600]">{product.price}</span>
                                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                                        {product.wattage}
                                    </span>
                                </div>
                            </div>

                            {/* Specifications */}
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">Specifications</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="text-sm text-gray-500">Dimensions</span>
                                        <p className="font-semibold">{product.specifications?.dimensions}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="text-sm text-gray-500">Voltage</span>
                                        <p className="font-semibold">{product.specifications?.voltage}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="text-sm text-gray-500">Efficiency</span>
                                        <p className="font-semibold">{product.specifications?.efficiency}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="text-sm text-gray-500">Warranty</span>
                                        <p className="font-semibold">{product.specifications?.warranty}</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <span className="text-sm text-gray-500">Link</span>
                                        <p className="font-semibold">{product.link}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Add to Cart Button */}
                            <div className="pt-4">
                                <button
                                    onClick={() => {
                                        addToCart(product);
                                        setAddedToCart(true);
                                        setTimeout(() => setAddedToCart(false), 2000);
                                    }}
                                    className={`w-full text-white py-3 px-6 rounded-lg font-semibold transition-colors duration-200 flex items-center justify-center gap-2 ${addedToCart ? 'bg-green-600 hover:bg-green-700' : 'bg-[#E10600] hover:bg-red-700'}`}
                                >
                                    {addedToCart ? (
                                        <>
                                            <Check className="w-5 h-5" />
                                            Added to Cart!
                                        </>
                                    ) : (
                                        <>
                                            <ShoppingCart className="w-5 h-5" />
                                            Add to Cart
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </>
    );
}
