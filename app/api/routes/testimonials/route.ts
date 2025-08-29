// /app/api/routes/testimonials/route.ts
import { NextResponse } from "next/server";
import TestimonialService from "@/app/api/services/testimonialServices";

// ✅ POST → Create a new testimonial
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { name, event, location, rating, text } = body;

        // ✅ Basic validation
        if (!name || !event || !location || !rating || !text) {
            return NextResponse.json(
                { status: "error", message: "Missing required fields" },
                { status: 400 }
            );
        }

        const testimonial = await TestimonialService.addTestimonial({
            name,
            event,
            location,
            rating,
            text,
        });

        return NextResponse.json(
            { status: "success", data: testimonial },
            { status: 201 }
        );
    } catch (error) {
        console.error("Error adding testimonial:", error);
        return NextResponse.json(
            { status: "error", message: error.message },
            { status: 500 }
        );
    }
}

// ✅ GET → Fetch all testimonials
export async function GET() {
    try {
        const testimonials = await TestimonialService.getAllTestimonials();
        return NextResponse.json(
            { status: "success", data: testimonials },
            { status: 200 }
        );
    } catch (error) {
        console.error("Error fetching testimonials:", error);
        return NextResponse.json(
            { status: "error", message: error.message },
            { status: 500 }
        );
    }
}
