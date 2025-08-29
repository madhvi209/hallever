import { NextRequest, NextResponse } from "next/server";
import { BlogService } from "@/app/api/services/blogServices";
import { DeleteImage, ReplaceImage } from "@/app/api/controller/imageController";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const formData = await req.formData();
        const title = formData.get("title") as string | null;
        const summary = formData.get("summary") as string | null;
        const newImage = formData.get("image") as File | null;

        // Fetch existing blog
        const existingBlog = await BlogService.getBlogById(id);
        if (!existingBlog) {
            return NextResponse.json({ message: "Blog not found." }, { status: 404 });
        }

        let imageUrl = existingBlog.image;

        // Replace image if a new one is provided
        if (newImage && newImage instanceof File) {
            const replacedUrl = await ReplaceImage(newImage, existingBlog.image);
            if (replacedUrl) imageUrl = replacedUrl;
        }

        const updatedBlog = {
            title: title ?? existingBlog.title,
            summary: summary ?? existingBlog.summary,
            image: imageUrl,
            updatedOn: new Date().toISOString(),
        };

        await BlogService.updateBlog(id, updatedBlog);

        return NextResponse.json({
            message: "Blog updated successfully",
            data: updatedBlog,
        });
    } catch (error) {
        console.error("PUT /api/blogs/[id]:", error);
        return NextResponse.json(
            { message: "Failed to update blog" },
            { status: 500 }
        );
    }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const decodedTitle = decodeURIComponent(id).toLowerCase().replace(/\s+/g, " ").trim();
        const blog = await BlogService.getBlogByTitle(decodedTitle);

        if (!blog) {
            return NextResponse.json(
                { data: null, message: "Blog not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({
            data: blog,
            message: "Fetched blog successfully",
        });
    } catch (error) {
        console.error("GET /api/blogs/[id]:", error);
        return NextResponse.json(
            { data: null, message: "Failed to fetch blog" },
            { status: 500 }
        );
    }
}


export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const blog = await BlogService.getBlogById(id);
        if (blog?.image) {
            await DeleteImage(blog.image);
        }

        await BlogService.deleteBlog(id);

        return NextResponse.json({ data: null, message: "Blog deleted successfully" });
    } catch (error) {
        console.error("Error in deleting the blogs:", error);
        return NextResponse.json({ data: null, message: "Failed to delete blog" }, { status: 500 });
    }
}
