"use client";

import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/language-context";

const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: 0.1 * i, duration: 0.4 },
    }),
};

export default function AddressCards() {
    const { t } = useLanguage();

    const cards = [
        {
            title: t("footer.officeAddress.head"),
            value: t("footer.officeAddress.headValue"),
        },
        {
            title: t("footer.officeAddress.agency1"),
            value: t("footer.officeAddress.agency1Value"),
        },
        {
            title: t("footer.officeAddress.agency2"),
            value: t("footer.officeAddress.agency2Value"),
        },
    ];

    return (
        <section className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                {/* Heading for Offices/Agencies */}
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-12 text-center">
                    {t("footer.officeAddress.heading")}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {cards.map((card, index) => (
                        <motion.div
                            key={card.title as string}
                            custom={index}
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, amount: 0.3 }}
                            variants={cardVariants}
                            className="rounded-2xl border border-gray-200 bg-white p-8 shadow-md transition-all hover:shadow-lg hover:border-red-200 hover:-translate-y-1"
                        >
                            <div className="flex items-start gap-4">
                                <div className="p-3 rounded-lg bg-red-100 text-red-600">
                                    <MapPin className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-900">{card.title}</h3>
                                    <p className="mt-2 text-base text-gray-700 leading-7">{card.value}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
