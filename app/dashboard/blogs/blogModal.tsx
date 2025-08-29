"use client";

import React, { useRef, useState, useEffect } from "react";
import { Blog, addBlog, updateBlog, fetchBlogs } from "@/lib/redux/slice/blogSlice";
import { AppDispatch } from "@/lib/redux/store";
import { useDispatch } from "react-redux";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface BlogModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    editBlog: Blog | null;
}

const BlogModal: React.FC<BlogModalProps> = ({ open, setOpen, editBlog }) => {
    const dispatch = useDispatch<AppDispatch>();
    const [form, setForm] = useState({ title: "", summary: "", image: "" });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editBlog) {
            setForm({ title: editBlog.title, summary: editBlog.summary, image: editBlog.image || "" });
            setImagePreview(editBlog.image || null);
        } else {
            setForm({ title: "", summary: "", image: "" });
            setImagePreview(null);
        }
    }, [editBlog]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("title", form.title);
            formData.append("summary", form.summary);
            if (imageFile) {
                formData.append("image", imageFile);
            } else if (!editBlog) {
                toast.error("Image is required");
                setLoading(false);
                return;
            }

            if (editBlog) {
                await dispatch(updateBlog(formData, editBlog.id));
                toast.success("Blog updated!");
            } else {
                await dispatch(addBlog(formData));
                toast.success("Blog added!");
            }

            await dispatch(fetchBlogs());
            setOpen(false);
        } catch (error) {
            toast.error(`Failed to submit blog: ${error?.message || "Unknown error"}`);
        }
        finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <DialogHeader>
                        <DialogTitle>{editBlog ? "Edit Blog" : "Add Blog"}</DialogTitle>
                    </DialogHeader>

                    <Input
                        placeholder="Title"
                        value={form.title}
                        onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                        required
                    />

                    <textarea
                        placeholder="Summary"
                        value={form.summary}
                        onChange={(e) => setForm((f) => ({ ...f, summary: e.target.value }))}
                        className="w-full px-3 py-2 border rounded-md text-sm resize-y min-h-[100px]"
                        required
                    />

                    <div className="flex flex-col gap-2">
                        {(imagePreview || form.image) && (
                            <Image
                                src={imagePreview || form.image}
                                alt="Preview"
                                width={400}
                                height={160}
                                className="w-full h-40 object-cover rounded-lg border sm:h-48 md:h-56"
                                onError={(e) => ((e.target as HTMLImageElement).src = "/placeholder.png")}
                            />
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="block w-full text-sm file:py-2 file:px-4 file:rounded-full file:border-0 file:font-semibold file:bg-[var(--primary-red)]/10 file:text-[var(--primary-red)]"
                        />
                    </div>

                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="gap-2 bg-[var(--primary-red)] hover:bg-[var(--primary-pink)]">
                            {loading && <Loader2 className="w-4 h-4 animate-spin" />} {editBlog ? "Update" : "Add"}
                        </Button>
                        <DialogClose asChild>
                            <Button type="button" variant="ghost">
                                Cancel
                            </Button>
                        </DialogClose>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default BlogModal;
