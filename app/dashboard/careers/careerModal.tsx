"use client";

import React, { useEffect, useState, FormEvent, ChangeEvent } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Loader2 } from "lucide-react";
import { Job } from "@/lib/redux/slice/careerSlice";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onSave: (job: Job) => void;
    editItem: Job | null;
}

const defaultJob = (overrides: Partial<Job> = {}): Job => ({
    id: "",
    title: "",
    department: "",
    location: "",
    type: "Full-time",
    description: "",
    skills: [""],
    responsibilities: [""],
    salaryRange: "",
    education: "",
    status: "open",
    createdOn: new Date().toISOString(),
    updatedOn: new Date().toISOString(),
    ...overrides,
});

export default function CareerModal({
    isOpen,
    onClose,
    onSave,
    editItem,
}: Props) {
    const [form, setForm] = useState<Job>(defaultJob());
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setForm(defaultJob(editItem || {}));
            setError("");
            setLoading(false);
        }
    }, [isOpen, editItem]);

    const handleChange = (
        e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleListChange = (
        field: "skills" | "responsibilities",
        index: number,
        value: string
    ) => {
        const updated = [...form[field]];
        updated[index] = value;
        setForm((prev) => ({ ...prev, [field]: updated }));
    };

    const addListItem = (field: "skills" | "responsibilities") => {
        setForm((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
    };

    const removeListItem = (field: "skills" | "responsibilities", index: number) => {
        if (form[field].length <= 1) return;
        setForm((prev) => ({
            ...prev,
            [field]: prev[field].filter((_, i) => i !== index),
        }));
    };

    const validateForm = (): boolean => {
        const requiredFields: (keyof Job)[] = [
            "title",
            "department",
            "location",
            "type",
            "salaryRange",
        ];
        return requiredFields.every((key) => form[key]?.toString().trim()) &&
            form.skills.some((s) => s.trim()) &&
            form.responsibilities.some((r) => r.trim());
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            setError("Please fill all required fields.");
            return;
        }
        setLoading(true);
        try {
            await Promise.resolve(
                onSave({
                    ...form,
                    updatedOn: new Date().toISOString(),
                    createdOn: form.createdOn || new Date().toISOString(),
                })
            );
            onClose();
        } finally {
            setLoading(false);
        }
    };

    const renderListInput = (field: "skills" | "responsibilities", label: string) => (
        <div>
            <label className="font-medium">{label} <span className="text-red-500">*</span></label>
            {form[field].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 mt-2">
                    <Input
                        value={item}
                        onChange={(e) => handleListChange(field, idx, e.target.value)}
                        required={idx === 0}
                    />
                    {form[field].length > 1 && (
                        <button type="button" onClick={() => removeListItem(field, idx)}>
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    )}
                </div>
            ))}
            <Button
                type="button"
                variant="outline"
                className="mt-2"
                onClick={() => addListItem(field)}
            >
                + Add {label}
            </Button>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto px-4 py-6">
                <DialogHeader>
                    <DialogTitle>{editItem ? "Edit Job" : "Post Job"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="font-medium">Job Title <span className="text-red-500">*</span></label>
                        <Input name="title" value={form.title} onChange={handleChange} required />
                    </div>

                    <div>
                        <label className="font-medium">Department <span className="text-red-500">*</span></label>
                        <Input name="department" value={form.department} onChange={handleChange} required />
                    </div>

                    <div>
                        <label className="font-medium">Location <span className="text-red-500">*</span></label>
                        <Input name="location" value={form.location} onChange={handleChange} required />
                    </div>

                    <div>
                        <label className="font-medium">Job Type <span className="text-red-500">*</span></label>
                        <select
                            name="type"
                            value={form.type}
                            onChange={handleChange}
                            className="w-full mt-1 px-3 py-2 border rounded-lg"
                            required
                        >
                            <option value="">Select</option>
                            <option value="Full-time">Full Time</option>
                            <option value="Part-time">Part Time</option>
                            <option value="Internship">Internship</option>
                            <option value="Remote">Remote</option>
                        </select>
                    </div>

                    <div>
                        <label className="font-medium">Job Description</label>
                        <Textarea
                            name="description"
                            value={form.description}
                            onChange={handleChange}
                            rows={4}
                        />
                    </div>

                    {renderListInput("skills", "Skills")}
                    {renderListInput("responsibilities", "Responsibilities")}

                    <div>
                        <label className="font-medium">Salary Range <span className="text-red-500">*</span></label>
                        <Input name="salaryRange" value={form.salaryRange} onChange={handleChange} required />
                    </div>

                    <div>
                        <label className="font-medium">Education</label>
                        <Input name="education" value={form.education} onChange={handleChange} />
                    </div>
                    <div>
                        <label className="font-medium">Status <span className="text-red-500">*</span></label>
                        <select
                            name="status"
                            value={form.status}
                            onChange={handleChange}
                            className="w-full mt-1 px-3 py-2 border rounded-lg"
                            required
                        >
                            <option value="open">Open</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>


                    {error && <p className="text-red-500 text-sm">{error}</p>}

                    <div className="pt-2">
                        <Button
                            type="submit"
                            className="w-full bg-[var(--primary-red)] text-white"
                            disabled={loading}
                        >
                            {loading && (
                                <Loader2 className="w-4 h-4 animate-spin mr-2 inline-block" />
                            )}
                            {editItem ? "Update Job" : "Post Job"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
