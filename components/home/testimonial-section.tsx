"use client";

import { useEffect } from "react";
import { Star, Quote } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { useDispatch, useSelector } from "react-redux";
import {
    fetchTestimonials,
    selectTestimonials,
    selectIsLoading,
} from "@/lib/redux/slice/testimonialsSlice";
import { motion } from "framer-motion";
import type { AppDispatch } from "@/lib/redux/store"; // import typed dispatch

// Local fallback testimonials
const fallbackTestimonials = [
    {
        id: 1,
        name: "Jaipur Event",
        event: "Wedding Ceremony",
        location: "Jaipur, Rajasthan",
        rating: 5,
        text: "Our wedding looked like a fairytale! The lighting was absolutely magical and created the perfect ambiance for our special day. Thank you Hallever team for making our dreams come true.",
    },
];

const TestimonialsSection = () => {
    const { t } = useLanguage();
    const dispatch = useDispatch<AppDispatch>(); // ✅ typed dispatch

    // Redux state
    const testimonials = useSelector(selectTestimonials);
    const isLoading = useSelector(selectIsLoading);

    // Fetch from backend on mount
    useEffect(() => {
        dispatch(fetchTestimonials()); // no `as any` needed
    }, [dispatch]);

    // Use fallback if no API data
    const testimonialsToRender =
        !isLoading && testimonials.length > 0 ? testimonials : fallbackTestimonials;

    // Duplicate list to create infinite loop effect
    const loopTestimonials = [...testimonialsToRender, ...testimonialsToRender];

    return (
        <section className="py-20 bg-background overflow-hidden">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16 mt-5 pt-4">
                    <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-6 pt-3">
                        {t("testimonials.heading.part1")}{" "}
                        <span className="text-transparent bg-clip-text bg-[var(--primary-red)] pt-3">
                            {t("testimonials.heading.part2")}
                        </span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        {t("testimonials.subheading")}
                    </p>
                </div>

                {/* Auto Scrolling Testimonials */}
                <motion.div
                    className="flex gap-8"
                    animate={{ x: ["0%", "-50%"] }}
                    transition={{
                        repeat: Infinity,
                        duration: 25,
                        ease: "linear",
                    }}
                >
                    {loopTestimonials.map((testimonial, index) => (
                        <div
                            key={index}
                            className="bg-card min-w-[350px] max-w-[350px] p-8 rounded-2xl shadow-lg relative"
                        >
                            <div className="absolute -top-4 left-8">
                                <div className="w-8 h-8 bg-[var(--primary-red)] rounded-full flex items-center justify-center glow-primary">
                                    <Quote className="w-4 h-4 text-primary-foreground" />
                                </div>
                            </div>

                            <div className="flex items-center mb-6 pt-4">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <Star
                                        key={i}
                                        className="w-5 h-5 text-accent fill-current"
                                        style={{ color: "#FEDC01" }}
                                    />
                                ))}
                            </div>

                            <p className="text-card-foreground text-lg leading-relaxed mb-8 italic">
                                {testimonial.text}
                            </p>

                            <div>
                                <h4 className="font-semibold text-card-foreground text-lg">
                                    {testimonial.name}
                                </h4>
                                <p className="text-muted-foreground text-sm">
                                    {testimonial.event}
                                </p>
                                <p className="text-[var(--primary-red)] text-sm font-medium">
                                    {testimonial.location}
                                </p>
                            </div>

                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--primary-gold)] rounded-b-2xl opacity-60"></div>
                        </div>
                    ))}
                </motion.div>

                {/* Trust Badges */}
                <div className="text-center mt-16">
                    <div className="inline-flex items-center gap-8 text-muted-foreground flex-wrap justify-center">
                        <div className="flex items-center gap-2">
                            <Star
                                className="w-5 h-5 text-accent fill-current"
                                style={{ color: "#FEDC01" }}
                            />
                            <span className="font-semibold">{t("testimonials.trust.rating")}</span>
                        </div>
                        <div className="w-1 h-6 bg-border hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">{t("testimonials.trust.customers")}</span>
                        </div>
                        <div className="w-1 h-6 bg-border hidden sm:block"></div>
                        <div className="flex items-center gap-2">
                            <span className="font-semibold">{t("testimonials.trust.guarantee")}</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default TestimonialsSection;
