"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Phone, MessageSquare, Mail, Send } from "lucide-react";
import { useLanguage } from "@/context/language-context";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/redux/store";
import { addLead } from "@/lib/redux/slice/leadSlice";

type Role = "dealer" | "customer" | "agency" | "distributor";

interface ContactFormData {
    name: string;
    email: string;
    phone: string;
    role?: Role;
    city: string;
    message: string;
}

const ContactSection = () => {
    const { t } = useLanguage();
    const dispatch = useDispatch<AppDispatch>();
    const [formData, setFormData] = useState<ContactFormData>({
        name: "",
        email: "",
        phone: "",
        role: undefined,
        city: "",
        message: "",
    });
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // Helper to check if all required fields are filled
    const isFormValid = () => {
        return (
            formData.name.trim() !== "" &&
            formData.email.trim() !== "" &&
            formData.phone.trim() !== "" &&
            !!formData.role &&
            formData.city.trim() !== ""
        );
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccess(false);
        setError(null);

        // Validate required fields
        if (!isFormValid()) {
            setError("Please fill in all required fields.");
            return;
        }

        setLoading(true);

        try {
            const { role, ...rest } = formData;
            const payload = { ...rest, status: "new", ...(role ? { role } : {}) };
            await dispatch(addLead(payload as any));
            setSuccess(true);
            setFormData({ name: "", email: "", phone: "", role: undefined, city: "", message: "" });
        } catch (error) {
            setError((error as any)?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    const handleRedirect = (type: "phone" | "whatsapp" | "email") => {
        if (type === "whatsapp") {
            window.open("https://wa.me/919468909306", "_blank");
        } else if (type === "email") {
            window.open("mailto:customercare@halleverindia.com", "_blank");
        } else if (type === "phone") {
            window.open("tel:+919468909306", "_self");
        }
    };

    return (
        <section className="py-20 bg-gray-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-16">
                    <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground mb-6">
                        {t("contact.heading")}{" "}
                        <span className="text-[var(--primary-red)]">{t("contact.highlight")}</span>
                    </h2>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        {t("contact.subheading")}
                    </p>
                </div>

                {/* Contact Cards & Form */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 max-w-6xl mx-auto">
                    {/* Contact Methods */}
                    <div className="space-y-8">
                        <h3 className="font-heading text-2xl font-semibold text-foreground mb-14">
                            {t("contact.getInTouch")}
                        </h3>

                        <div className="space-y-6">
                            {["phone", "whatsapp", "email"].map((key, index) => {
                                const iconMap = [Phone, MessageSquare, Mail];
                                const bgColorMap = [
                                    "bg-[var(--primary-red)]",
                                    "bg-green-600",
                                    "bg-blue-600",
                                ];
                                const Icon = iconMap[index];
                                return (
                                    <div
                                        key={key}
                                        className="p-4 sm:p-5 md:p-6 bg-card rounded-2xl border border-border hover:shadow-md transition duration-300"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                                            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${bgColorMap[index]}`}>
                                                <Icon className="w-7 h-7 text-white" />
                                            </div>

                                            <div className="flex-1 text-center sm:text-left">
                                                <h4 className="font-semibold text-lg text-card-foreground mb-1">
                                                    {t(`contact.methods.${key}.title`)}
                                                </h4>
                                                <p className="text-muted-foreground text-sm mb-2">
                                                    {t(`contact.methods.${key}.description`)}
                                                </p>
                                                <p className="text-[var(--primary-pink)] font-medium">
                                                    {t(`contact.methods.${key}.value`)}
                                                </p>
                                            </div>

                                            <div className="text-center sm:text-right">
                                                <Button
                                                    type="button"
                                                    onClick={() => handleRedirect(key as "phone" | "whatsapp" | "email")}
                                                    className="w-full sm:w-auto rounded-full bg-[var(--primary-red)] text-white hover:bg-red-700"
                                                >
                                                    {t(`contact.methods.${key}.action`)}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-card p-8 h-auto rounded-xl border border-border mt-14 shadow-sm max-w-xl mx-auto">
                        <h3 className="font-heading text-2xl font-semibold text-card-foreground mb-2">
                            {t("contact.form.heading")}
                        </h3>
                        <p className="text-muted-foreground mb-6 text-sm">
                            {t("contact.form.note")}
                        </p>

                        <form className="space-y-4" onSubmit={handleSubmit} noValidate>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-1">
                                        {t("contact.form.name")} <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        name="name"
                                        placeholder={t("contact.form.name")}
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-1">
                                        {t("contact.form.email")} <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="email"
                                        name="email"
                                        placeholder={t("contact.form.email")}
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-1">
                                        {t("contact.form.roleLabel")} <span className="text-red-500">*</span>
                                    </label>
                                    <Select value={formData.role} onValueChange={(v: Role) => setFormData({ ...formData, role: v })} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("contact.form.roleLabel")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="dealer">{t("contact.form.role.dealer")}</SelectItem>
                                            <SelectItem value="customer">{t("contact.form.role.customer")}</SelectItem>
                                            <SelectItem value="agency">{t("contact.form.role.agency")}</SelectItem>
                                            <SelectItem value="distributor">{t("contact.form.role.distributor")}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-card-foreground mb-1">
                                        {t("contact.form.city")} <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        name="city"
                                        placeholder={t("contact.form.city")}
                                        value={formData.city}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-card-foreground mb-1">
                                    {t("contact.form.phone")} <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="tel"
                                    name="phone"
                                    placeholder={t("contact.form.phone")}
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-card-foreground mb-1">
                                    {t("contact.form.message")}
                                </label>
                                <Textarea
                                    name="message"
                                    className="w-full border border-border rounded-md px-4 py-2 text-sm text-card-foreground resize-none"
                                    rows={3}
                                    placeholder={t("contact.form.placeholder")}
                                    value={formData.message}
                                    onChange={handleChange}
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full rounded-full bg-[var(--primary-red)] text-white text-sm py-2.5 hover:bg-red-700 group"
                            >
                                <Send className="w-4 h-4 mr-1 group-hover:translate-x-1 transition-transform duration-300" />
                                {loading ? "Sending..." : t("button.send")}
                            </Button>

                            {success && (
                                <p className="text-green-600 text-sm pt-2">
                                    {t("contact.form.successMessage") || "Your message has been sent!"}
                                </p>
                            )}
                            {error && (
                                <p className="text-red-600 text-sm pt-2">
                                    {error}
                                </p>
                            )}
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactSection;
