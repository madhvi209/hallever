/* eslint-disable react/no-unescaped-entities */
"use client";

import { Calendar, MapPin, Award, Heart, Lightbulb } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/language-context";

const AboutSection = () => {
    const { t } = useLanguage();

    const stats = [
        {
            icon: Heart,
            number: "1200+",
            label: t("about.stats.events"),
            color: "text-[var(--primary-red)]",
        },
        {
            icon: Award,
            number: "300+",
            label: t("about.stats.designs"),
            color: "text-[var(--primary-gold)]",
        },
        {
            icon: MapPin,
            number: "50+",
            label: t("about.stats.cities"),
            color: "text-[var(--primary-red)]",
        },
        {
            icon: Calendar,
            number: "14+",
            label: t("about.stats.years"),
            color: "text-[var(--primary-gold)]",
        },
    ];

    return (
        <section className="py-20 bg-background">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto text-center">
                    {/* Section Header */}
                    <div className="mb-16">
                        <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-4">
                            {t("about.title")}{" "}
                            <span className="text-[var(--primary-red)]">
                                {t("about.since")}
                                <br />
                                <span className="block mt-2 text-3xl sm:text-4xl font-bold">2010</span>
                            </span>
                        </h2>
                        <div className="w-24 h-1 bg-[var(--primary-gold)] mx-auto mb-6 rounded-full"></div>
                    </div>

                    {/* Story */}
                    <div className="prose prose-lg max-w-none mb-16 text-muted-foreground">
                        <p className="text-xl leading-relaxed mb-8">{t("about.para1")}</p>
                        <p className="text-lg leading-relaxed">{t("about.para2")}</p>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                        {stats.map((stat, index) => (
                            <motion.div
                                key={stat.label}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, amount: 0.3 }}
                                custom={index}
                                className="text-center group"
                            >
                                <div className="mb-4">
                                    <div className="w-16 h-16 mx-auto box-shadow rounded-2xl bg-[var(--primary-red)] flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                                        <stat.icon className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <div className={`text-4xl font-bold font-heading mb-2 ${stat.color}`}>
                                    {stat.number}
                                </div>
                                <div className="text-muted-foreground font-medium">{stat.label}</div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Mission & Vision */}
                    <div className="flex flex-col lg:flex-row gap-16">
                        {/* Mission Card */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            custom={0}
                            viewport={{ once: true, amount: 0.3 }}
                            className="relative bg-secondary rounded-2xl p-8 lg:p-12 shadow-sm hover:shadow-[0_10px_40px_rgba(255,0,0,0.3)] transition-shadow duration-500 w-full lg:w-1/2 overflow-hidden"
                        >
                            <div className="absolute inset-0 z-0">
                                <Image
                                    src="/images/mission.jpeg"
                                    alt="Mission Background"
                                    fill
                                    priority
                                    sizes="(min-width: 1020px) 50vw, 100vw"
                                    className="object-cover will-change-transform"
                                />
                                <div className="absolute inset-0 bg-black/20" />
                            </div>

                            <div className="relative z-10">
                                <div className="mb-6">
                                    <div className="w-16 h-16 bg-[var(--primary-red)] rounded-full flex items-center justify-center mx-auto shadow-md">
                                        <Heart className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <h3 className="font-heading text-2xl lg:text-3xl font-semibold text-[#FDFDFB] mb-6">
                                    {t("about.mission.title")}
                                </h3>
                                <p className="text-lg text-[#E8E9E1] leading-relaxed max-w-3xl mx-auto">
                                    {t("about.mission.description")}
                                </p>
                                <div className="mt-8 flex justify-center">
                                    <div className="flex items-center gap-2 text-[#F4ADAD] font-semibold">
                                        <span className="w-2 h-2 bg-[#F4ADAD] rounded-full"></span>
                                        <span>{t("about.mission.highlight")}</span>
                                        <span className="w-2 h-2 bg-[#F4ADAD] rounded-full"></span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>

                        {/* Vision Card */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            custom={1}
                            viewport={{ once: true, amount: 0.3 }}
                            className="relative bg-secondary rounded-2xl p-8 lg:p-12 shadow-sm hover:shadow-[0_10px_40px_rgba(255,215,0,0.3)] transition-shadow duration-500 w-full lg:w-1/2 overflow-hidden"
                        >
                            <div className="absolute inset-0 z-0">
                                <Image
                                    src="/images/vision.jpeg"
                                    alt="Vision Background"
                                    fill
                                    priority
                                    sizes="(min-width: 1020px) 50vw, 100vw"
                                    className="object-cover will-change-transform"
                                />
                                <div className="absolute inset-0 bg-black/20" />
                            </div>

                            <div className="relative z-10">
                                <div className="mb-6">
                                    <div className="w-16 h-16 bg-[var(--primary-gold)] rounded-full flex items-center justify-center mx-auto shadow-md">
                                        <Lightbulb className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <h3 className="font-heading text-2xl lg:text-3xl font-semibold text-[#FDFDFB] mb-6">
                                    {t("about.vision.title")}
                                </h3>
                                <p className="text-lg text-[#E8E9E1] leading-relaxed max-w-3xl mx-auto mb-10">
                                    {t("about.vision.description")}
                                </p>
                                <div className="mt-8 flex justify-center">
                                    <div className="flex items-center gap-2 text-[#F4ADAD] font-semibold">
                                        <span className="w-2 h-2 bg-[#F4ADAD] rounded-full"></span>
                                        <span>{t("about.vision.highlight")}</span>
                                        <span className="w-2 h-2 bg-[#F4ADAD] rounded-full"></span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutSection;
