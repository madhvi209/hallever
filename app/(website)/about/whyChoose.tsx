"use client";
/* eslint-disable react/no-unescaped-entities */

import { Sparkles, Users, Clock, MapPinned, ShieldCheck, Shapes } from "lucide-react";
import { useLanguage } from "@/context/language-context";

const WhyChooseSection = () => {
    const { t } = useLanguage();

    const features = [
        {
            icon: MapPinned,
            title: t("why.features.custom.title"),
            description: t("why.features.custom.description"),
        },
        {
            icon: Sparkles,
            title: t("why.features.lights.title"),
            description: t("why.features.lights.description"),
        },
        {
            icon: Users,
            title: t("why.features.team.title"),
            description: t("why.features.team.description"),
        },
        {
            icon: ShieldCheck,
            title: t("why.features.delivery.title"),
            description: t("why.features.delivery.description"),
        },
        {
            icon: Shapes,
            title: t("why.features.consultation.title"),
            description: t("why.features.consultation.description"),
        },
        {
            icon: Clock,
            title: t("why.features.verstaile.title"),
            description: t("why.features.verstaile.description"),
        }
    ];

    return (
        <section className="py-20 bg-secondary">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-6 pt-3 mt-3">
                        {t("why.heading.part1")}{" "}
                        <span className="text-transparent bg-clip-text bg-[var(--primary-red)] pt-3 mt-3">
                            {t("why.heading.part2")}
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto pt-3 mt-3">
                        {t("why.subheading")}
                    </p>
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`group p-8 bg-card rounded-2xl card-glow transition-all duration-500 fade-in-up delay-${index + 1}`}
                        >
                            {/* Icon */}
                            <div className="mb-6">
                                <div className="w-16 h-16 bg-[var(--primary-red)] box-shadow  rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 glow-primary">
                                    <feature.icon className="w-8 h-8 text-white " />
                                </div>
                            </div>

                            {/* Content */}
                            <h3 className="font-heading text-2xl font-semibold text-foreground  mb-4 group-hover:text-[var(--primary-red)] transition-colors duration-300">
                                {feature.title}
                            </h3>
                            <p className="text-muted-foreground leading-relaxed">
                                {feature.description}
                            </p>

                            {/* Decorative line */}
                            <div className="mt-6 w-12 h-1 bg-[var(--primary-gold)] rounded-full opacity-60 group-hover:opacity-100 group-hover:w-16 transition-all duration-300" />
                        </div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <div className="text-center mt-16">
                    <div className="inline-flex items-center gap-2 text-[var(--primary-red)] font-semibold">
                        <Sparkles className="w-5 h-5" />
                        <span>{t("why.bottomCta")}</span>
                        <Sparkles className="w-5 h-5" />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseSection;
