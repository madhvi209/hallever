// /app/api/routes/testimonials/[id]/route.ts
import { NextResponse } from "next/server";
import TestimonialService from "@/app/api/services/testimonialServices";
import consoleManager from "@/app/api/utils/consoleManager";

// ✅ GET → Fetch testimonial by ID
export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> } 
) {
    const { id } = await params; 

    try {
        const testimonial = await TestimonialService.getTestimonialById(id);

        if (!testimonial) {
            return NextResponse.json(
                { status: "error", message: "Testimonial not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { status: "success", data: testimonial },
            { status: 200 }
        );
    } catch (error) {
        consoleManager.error("GET /api/routes/testimonials/[id]:", error);
        return NextResponse.json(
            { status: "error", message: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

// ✅ PUT → Update testimonial by ID
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        const body = await req.json();
        const updatedTestimonial = await TestimonialService.updateTestimonial(id, body);

        return NextResponse.json(
            {
                status: "success",
                message: "Testimonial updated successfully",
                data: updatedTestimonial,
            },
            { status: 200 }
        );
    } catch (error) {
        consoleManager.error("PUT /api/routes/testimonials/[id]:", error);
        return NextResponse.json(
            { status: "error", message: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

// ✅ DELETE → Delete testimonial by ID
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    try {
        await TestimonialService.deleteTestimonial(id);

        return NextResponse.json(
            { status: "success", message: "Testimonial deleted successfully" },
            { status: 200 }
        );
    } catch (error) {
        consoleManager.error("DELETE /api/routes/testimonials/[id]:", error);
        return NextResponse.json(
            { status: "error", message: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
