import { NextResponse } from "next/server";
import { UploadImage } from "@/app/api/controller/imageController";
import { ServiceItem } from "@/lib/redux/slice/serviceSlice";
import { ServiceService } from "@/app/api/services/servicesServices";
import consoleManager from "@/app/api/utils/consoleManager";

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const title = formData.get("title") as string | null;
        const description = formData.get("description") as string | null;

        if (!title || !description) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Title and description are required.",
            }, { status: 400 });
        }

        // Optional fields
        const category = formData.get("category") as string | null;
        const features = formData.getAll("features") as string[];
        const imageFiles = formData.getAll("images") as File[];

        const imageUrls: string[] = [];
        for (const file of imageFiles) {
            if (file instanceof File) {
                const url = await UploadImage(file);
                if (url) imageUrls.push(url);
            }
        }

        const newService: Omit<ServiceItem, "id" | "createdOn" | "updatedOn"> = {
            title,
            description,
            category: category || undefined,
            features: features.length ? features : undefined,
            images: imageUrls.length ? imageUrls : undefined,
        };

        const createdService = await ServiceService.addService(newService);

        return NextResponse.json({
            statusCode: 201,
            message: "Service added successfully",
            data: createdService,
        }, { status: 201 });

    } catch (error) {
        consoleManager.error("POST /api/routes/services:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        const services = await ServiceService.getAllServices();
        return NextResponse.json({
            statusCode: 200,
            message: "Services fetched successfully",
            data: services,
        }, { status: 200 });
    } catch (error) {
        consoleManager.error("GET /api/routes/services:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}
