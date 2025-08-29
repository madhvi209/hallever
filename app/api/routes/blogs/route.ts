import { NextResponse } from "next/server";
import { UploadImage } from "@/app/api/controller/imageController";
import { BlogService } from "@/app/api/services/blogServices";
import consoleManager  from "@/app/api/utils/consoleManager";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const title = formData.get("title") as string | null;
        const summary = formData.get("summary") as string | null;
        const file = formData.get("image") as File | null;

        if (!title || !summary || !file) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Title, summary, and image are required.",
            }, { status: 400 });
        }

        // Upload blog image
        const imageUrl = await UploadImage(file);
        if (!imageUrl) {
            throw new Error("Image upload failed");
        }

        // Generate slug
        // Generate slug and normalized title
        const slug = title.toLowerCase().replace(/[^\w\s]/gi, "").replace(/\s+/g, "-");
        const titleLower = title.toLowerCase().replace(/\s+/g, " ").trim();


        // Add blog using the required fields
        const newBlog = await BlogService.addBlog({
            title,
            summary,
            image: imageUrl,
            slug,
            titleLower,
        });

        return NextResponse.json({
            statusCode: 201,
            message: "Blog added successfully",
            data: newBlog,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 201 });

    } catch (error) {
        const err = error as Error;
        consoleManager.error("POST /api/blogs:", err.message);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: err.message || "Internal Server Error",
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        const blogs = await BlogService.getAllBlogs();
        consoleManager.log("Fetched all blogs:", blogs.length);
        return NextResponse.json(
            {
                statusCode: 200,
                message: "Blogs fetched successfully",
                data: blogs,
                errorCode: "NO",
                errorMessage: "",
            },
            { status: 200 }
        );
    } catch (error) {
        consoleManager.error("Error in GET /api/blogs:", error);
        return NextResponse.json(
            {
                statusCode: 500,
                errorCode: "INTERNAL_ERROR",
                errorMessage: error.message || "Internal Server Error",
            },
            { status: 500 }
        );
    }
}
