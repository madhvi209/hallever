"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import type { ServiceItem } from "@/lib/redux/slice/serviceSlice";

interface ServiceModalProps {
    open: boolean;
    onClose: () => void;
    editItem?: ServiceItem | null;
    onSave?: () => void; // optional if needed later
}

const ServiceModal: React.FC<ServiceModalProps> = ({ open, onClose, editItem }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    useEffect(() => {
        if (editItem) {
            setTitle(editItem.title);
            setDescription(editItem.description);
            setImagePreviews(editItem.images || []);
        } else {
            resetForm();
        }
    }, [editItem]);

    useEffect(() => {
        return () => {
            imagePreviews.forEach((url) => {
                if (url.startsWith("blob:")) URL.revokeObjectURL(url);
            });
        };
    }, [imagePreviews]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        const selectedFiles = Array.from(files);
        const previews = selectedFiles.map((file) => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Save or dispatch logic here (you can lift this up via `onSave`)
        onClose();
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setImagePreviews([]);
    };

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-lg w-full">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-gray-800">
                        {editItem ? "Edit Service" : "Add Service"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            required
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Images</label>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={handleImageChange}
                            className="block w-full text-sm text-gray-500"
                        />
                        <div className="grid grid-cols-2 gap-2 mt-2">
                            {imagePreviews.map((src, idx) => (
                                <div key={idx} className="relative w-full h-32">
                                    <Image src={src} alt="Preview" fill className="object-cover rounded" />
                                </div>
                            ))}
                        </div>
                    </div>

                    <DialogFooter className="pt-4">
                        <DialogClose asChild>
                            <Button type="button" variant="outline" onClick={onClose}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button type="submit" className="bg-[var(--primary-red)] text-white">
                            {editItem ? "Update" : "Add"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default ServiceModal;
