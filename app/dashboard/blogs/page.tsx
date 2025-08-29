"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { fetchBlogs, deleteBlog, selectBlogs, selectIsLoading, Blog,} from "@/lib/redux/slice/blogSlice";
import { AppDispatch } from "@/lib/redux/store";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, Search, Loader2, Image as ImageIcon } from "lucide-react";
import Image from "next/image";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import BlogModal from "./blogModal";  

export default function BlogPage() {
  const dispatch = useDispatch<AppDispatch>();
  const blogs = useSelector(selectBlogs);
  const isLoading = useSelector(selectIsLoading);

  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editBlog, setEditBlog] = useState<Blog | null>(null);
  const [deleteBlogItem, setDeleteBlogItem] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchBlogs());
  }, [dispatch]);

  const filteredBlogs = useMemo(
    () => (Array.isArray(blogs) ? blogs.filter((b) => b.title.toLowerCase().includes(search.toLowerCase())) : []),
    [blogs, search]
  );

  const handleDelete = async () => {
    if (!deleteBlogItem) return;
    setLoading(true);
    await dispatch(deleteBlog(deleteBlogItem.id));
    await dispatch(fetchBlogs());
    setDeleteBlogItem(null);
    setLoading(false);
    toast.success("Blog deleted!");
  };

  return (
    <div className="mx-auto p-0 flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-2 mb-1 flex-wrap">
        <h2 className="text-xl font-bold text-[var(--primary-red)]" style={{ fontFamily: "var(--font-main)" }}>
          Blogs
        </h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto items-stretch sm:items-center justify-end">
          <div className="relative w-full sm:w-72">
            <Input
              placeholder="Search blogs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          </div>
          <Button
            onClick={() => {
              setEditBlog(null);
              setModalOpen(true);
            }}
            className="gap-2 w-full sm:w-auto bg-[var(--primary-red)] hover:bg-[var(--primary-pink)]"
          >
            <Plus className="w-4 h-4" /> Add Blog
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center text-gray-400 py-12">
            <Loader2 className="w-10 h-10 animate-spin" />
          </div>
        ) : filteredBlogs.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-12">No blogs found.</div>
        ) : (
          filteredBlogs.map((blog) => (
            <div key={blog.id} className="bg-white rounded-2xl shadow-md border border-gray-100 flex flex-col overflow-hidden">
              <div className="relative w-full h-48 bg-gray-100">
                {blog.image ? (
                  <Image src={blog.image} alt={blog.title} fill className="object-cover" />
                ) : (
                  <ImageIcon className="w-16 h-16 text-gray-300 mx-auto" />
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-lg font-bold mb-1" style={{ fontFamily: "var(--font-main)" }}>
                    {blog.title}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-3">{blog.summary}</p>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditBlog(blog);
                      setModalOpen(true);
                    }}
                    className="cursor-pointer text-[var(--primary-red)]"
                  >
                    <Edit className="w-4 h-4 mr-1" /> Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleteBlogItem(blog)}
                    className="text-destructive cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <BlogModal open={modalOpen} setOpen={setModalOpen} editBlog={editBlog} />

      <Dialog open={!!deleteBlogItem} onOpenChange={(open) => !open && setDeleteBlogItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog</DialogTitle>
          </DialogHeader>
          <div>
            Are you sure you want to delete{" "}
            <span className="font-semibold text-[var(--primary-red)]">{deleteBlogItem?.title}</span>?
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDelete} disabled={loading} className="gap-2 cursor-pointer">
              {loading && <Loader2 className="w-4 h-4 animate-spin" />} Delete
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="ghost" disabled={loading}>
                Cancel
              </Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
