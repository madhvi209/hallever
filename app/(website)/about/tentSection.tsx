"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, Crown, Heart, Sparkles } from "lucide-react";
import Image from "next/image";
import { useLanguage } from "@/context/language-context";

const TentSection = () => {
    const { t } = useLanguage();

    const themes = [
        {
            name: t("tent.themes.royal.name"),
            description: t("tent.themes.royal.description"),
            features: [
                t("tent.themes.royal.features.0"),
                t("tent.themes.royal.features.1"),
                t("tent.themes.royal.features.2")
            ]
        },
        {
            name: t("tent.themes.boho.name"),
            description: t("tent.themes.boho.description"),
            features: [
                t("tent.themes.boho.features.0"),
                t("tent.themes.boho.features.1"),
                t("tent.themes.boho.features.2")
            ]
        },
        {
            name: t("tent.themes.garden.name"),
            description: t("tent.themes.garden.description"),
            features: [
                t("tent.themes.garden.features.0"),
                t("tent.themes.garden.features.1"),
                t("tent.themes.garden.features.2")
            ]
        }
    ];


    return (
        <section className="py-20 bg-[#FFE8EE]">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Content Side */}
                    <div className="space-y-8">
                        {/* Section Header */}
                        <div>
                            <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-6 mt-3 pt-4">
                                <span className="block">
                                    {t("tent.heading.part1")}
                                </span>
                                <span className="block text-transparent bg-clip-text bg-[var(--primary-red)] mt-3 pt-3 pb-1.5">
                                    {t("tent.heading.part2")}
                                </span>
                            </h2>

                            <p className="text-xl text-muted-foreground leading-relaxed">
                                {t("tent.description")}
                            </p>
                        </div>

                        {/* Features */}
                        <div className="space-y-6">
                            {/* Royal Experience */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-[var(--primary-red)] box-shadow rounded-full flex items-center justify-center flex-shrink-0 glow-primary">
                                    <Crown className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-card-foreground mb-2">
                                        {t("tent.features.royal.title")}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {t("tent.features.royal.description")}
                                    </p>
                                </div>
                            </div>

                            {/* LED Integration */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-[var(--primary-gold)] rounded-full flex items-center justify-center flex-shrink-0 glow-accent">
                                    <Sparkles className="w-6 h-6 text-accent-foreground" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-card-foreground mb-2">
                                        {t("tent.features.led.title")}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {t("tent.features.led.description")}
                                    </p>
                                </div>
                            </div>

                            {/* Custom Themes */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-[var(--primary-red)] box-shadow rounded-full flex items-center justify-center flex-shrink-0 glow-primary">
                                    <Heart className="w-6 h-6 text-primary-foreground" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-lg text-card-foreground mb-2">
                                        {t("tent.features.custom.title")}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {t("tent.features.custom.description")}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* CTA */}
                        <Button className="bg-[var(--primary-red)] hover:bg-[var(--primary-pink)] group mt-4">
                            {t("tent.button.explore")}
                            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                        </Button>
                    </div>

                    {/* Image & Themes */}
                    <div className="space-y-8">
                        {/* Main Image */}
                        <div className="relative overflow-hidden rounded-2xl shadow-elegant">
                            <Image
                                src="/images/about/tent.jpeg"
                                alt={t("tent.image.alt")}
                                width={1200}
                                height={600}
                                className="w-full h-80 object-cover hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                            <div className="absolute bottom-6 left-6 text-white">
                                <h3 className="font-heading text-2xl font-semibold mb-2">
                                    {t("tent.image.title")}
                                </h3>
                                <p className="text-white/80">{t("tent.image.subtitle")}</p>
                            </div>
                        </div>

                        {/* Theme Cards */}
                        <div className="grid grid-cols-1 gap-4">
                            {themes.map((theme, index) => (
                                <div
                                    key={theme.name}
                                    className={`p-6 bg-card rounded-xl border border-border hover-glow transition-all duration-300 cursor-pointer fade-in-up delay-${index + 1}`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <h4 className="font-heading text-lg font-semibold text-card-foreground">
                                            {theme.name}
                                        </h4>
                                    </div>
                                    <p className="text-muted-foreground text-sm mb-3">
                                        {theme.description}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {theme.features.map((feature) => (
                                            <span
                                                key={feature}
                                                className="text-xs bg-[#FFE8EE] text-secondary-foreground px-2 py-1 rounded-full"
                                            >
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TentSection;
