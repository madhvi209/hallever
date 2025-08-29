"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/context/language-context";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import { addLead } from "@/lib/redux/slice/leadSlice";

export default function FloatingChat() {
    const { t } = useLanguage();
    const dispatch = useDispatch<AppDispatch>();

    const [isOpen, setIsOpen] = useState(false);
    const [showGreeting, setShowGreeting] = useState(true);
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        message: "",
    });
    const [isSubmitted, setIsSubmitted] = useState(false);

    const chatMessages = [
        t("chat.messages.0"),
        t("chat.messages.1"),
        t("chat.messages.2"),
    ];

    useEffect(() => {
        const timer = setTimeout(() => setShowGreeting(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Send form data to Redux
        dispatch(addLead(formData));
        setIsSubmitted(true);

        setTimeout(() => {
            setIsSubmitted(false);
            setIsOpen(false);
            setCurrentStep(0);
            setFormData({ name: "", email: "", phone: "", message: "" });
        }, 3000);
    };

    return (
        <>
            {/* Greeting Bubble */}
            <AnimatePresence>
                {showGreeting && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="fixed bottom-24 right-6 z-40 bg-white rounded-lg shadow-lg p-3 max-w-xs border border-gray-200"
                    >
                        <p className="text-gray-800 text-sm">{t("chat.greeting")}</p>
                        <div className="absolute -bottom-2 right-4 w-4 h-4 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Chat Widget */}
            <div className="fixed bottom-6 right-6 z-50">
                <AnimatePresence>
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.8, y: 20 }}
                            className="mb-4 bg-white rounded-xl shadow-2xl w-80 max-h-[90vh] overflow-y-auto border border-gray-200"
                        >
                            {/* Header */}
                            <div className="bg-[#E10600] text-white p-4 flex justify-between items-center">
                                <h3 className="font-semibold">{t("chat.header")}</h3>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setIsOpen(false)}
                                    className="text-white hover:bg-white/20 p-1"
                                >
                                    <X className="w-4 h-4" />
                                </Button>
                            </div>

                            {/* Content */}
                            <div className="p-4">
                                {!isSubmitted ? (
                                    <>
                                        {/* Messages */}
                                        <div className="space-y-2 mb-4">
                                            {chatMessages.slice(0, currentStep + 1).map((message, index) => (
                                                <motion.div
                                                    key={index}
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: index * 0.5 }}
                                                    className="bg-gray-100 rounded-lg p-2 text-sm text-gray-800 max-w-fit"
                                                >
                                                    {message}
                                                </motion.div>
                                            ))}
                                        </div>

                                        {/* Form */}
                                        <motion.form
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 1.5 }}
                                            onSubmit={handleSubmit}
                                            className="space-y-3"
                                        >
                                            <Input
                                                placeholder={t("chat.placeholder.name")}
                                                value={formData.name}
                                                onChange={(e) => handleInputChange("name", e.target.value)}
                                                required
                                                className="text-sm"
                                            />
                                            <Input
                                                type="email"
                                                placeholder={t("chat.placeholder.email")}
                                                value={formData.email}
                                                onChange={(e) => handleInputChange("email", e.target.value)}
                                                required
                                                className="text-sm"
                                            />
                                            <Input
                                                type="tel"
                                                placeholder={t("chat.placeholder.phone")}
                                                value={formData.phone}
                                                onChange={(e) => handleInputChange("phone", e.target.value)}
                                                required
                                                className="text-sm"
                                            />
                                            <Textarea
                                                placeholder={t("chat.placeholder.message")}
                                                value={formData.message}
                                                onChange={(e) => handleInputChange("message", e.target.value)}
                                                required
                                                className="text-sm resize-none"
                                                rows={3}
                                            />
                                            <Button
                                                type="submit"
                                                className="w-full bg-[#E10600] hover:bg-[#C10500] text-white text-sm"
                                            >
                                                <Send className="w-4 h-4 mr-2" />
                                                {t("chat.button.send")}
                                            </Button>
                                        </motion.form>
                                    </>
                                ) : (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="text-center py-8"
                                    >
                                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                transition={{ delay: 0.2 }}
                                                className="text-green-600 text-2xl"
                                            >
                                                ✓
                                            </motion.div>
                                        </div>
                                        <h4 className="font-semibold text-gray-900 mb-2">
                                            {t("chat.success.title")}
                                        </h4>
                                        <p className="text-sm text-gray-600">
                                            {t("chat.success.description")}
                                        </p>
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating Button */}
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => {
                        setIsOpen(!isOpen);
                        if (!isOpen) {
                            const interval = setInterval(() => {
                                setCurrentStep((prev) => {
                                    if (prev >= chatMessages.length - 1) {
                                        clearInterval(interval);
                                        return prev;
                                    }
                                    return prev + 1;
                                });
                            }, 800);
                        }
                    }}
                    className="w-14 h-14 bg-[#E10600] hover:bg-[#C10500] text-white rounded-full shadow-lg flex items-center justify-center transition-colors duration-300"
                >
                    <MessageCircle className="w-6 h-6" />
                </motion.button>
            </div>
        </>
    );
}
