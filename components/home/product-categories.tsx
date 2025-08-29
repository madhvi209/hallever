"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/language-context";

const categories = [
    { key: "indoor", image: "/images/indoor.jpeg" },
    { key: "outdoor", image: "/images/outdoor.jpeg" },
    { key: "tent", image: "/images/tent.jpeg" },
    { key: "raw", image: "/images/raw-materials.jpeg" },
    { key: "machinery", image: "/images/machinery.png" },
];

export default function ProductCategories() {
    const { t } = useLanguage();
    const router = useRouter();

    const handleCategoryClick = (category: string) => {
        router.push(`/products?category=${category}`);
    };

    return (
        <section className="w-full h-screen px-4 py-6">
            <div className="flex flex-col lg:flex-row gap-4 h-full">
                {/* Left: main category */}
                <div
                    className="w-full lg:w-1/2 h-[300px] lg:h-full relative rounded-xl overflow-hidden cursor-pointer"
                    onClick={() => handleCategoryClick(categories[0].key)}
                >
                    <Image
                        src={categories[0].image}
                        alt={t(`productCategories.${categories[0].key}.name`)}
                        fill
                        className="object-cover brightness-100"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white max-w-[80%] z-10">
                        <h2 className="text-2xl font-bold">
                            {t(`productCategories.${categories[0].key}.name`)}
                        </h2>
                        <p className="text-sm mt-1">
                            {t(`productCategories.${categories[0].key}.summary`)}
                        </p>
                        <button className="mt-3 bg-[var(--primary-red)] text-white px-5 py-2 text-sm rounded-full hover:bg-red-700 transition">
                            {t("button.shopNow")}
                        </button>
                    </div>
                </div>

                {/* Right: other categories */}
                <div className="w-full lg:w-1/2 grid grid-cols-2 gap-6">
                    {categories.slice(1, 5).map((category) => (
                        <div
                            key={category.key}
                            className="relative h-40 lg:h-full rounded-xl overflow-hidden cursor-pointer"
                            onClick={() => handleCategoryClick(category.key)}
                        >
                            <Image
                                src={category.image}
                                alt={t(`productCategories.${category.key}.name`)}
                                fill
                                className="object-cover brightness-100"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                            <div className="absolute bottom-4 left-4 text-white max-w-[85%] z-10">
                                <h3 className="text-lg font-semibold">
                                    {t(`productCategories.${category.key}.name`)}
                                </h3>
                                <p className="text-xs mt-1">
                                    {t(`productCategories.${category.key}.summary`)}
                                </p>
                                <button className="mt-2 bg-[var(--primary-red)] text-white px-4 py-1 text-xs rounded-full hover:bg-red-700 transition">
                                    {t("button.shopNow")}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
