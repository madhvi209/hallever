// app/api/routes/offersBanner/[id].ts
import { NextResponse } from "next/server";
import OfferBannerService, { OfferBannerItem } from "@/app/api/services/offersBannerServices";
import { ReplaceImage } from "@/app/api/controller/imageController";
import consoleManager from "@/app/api/utils/consoleManager";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const formData = await req.formData();
        const title = formData.get("title") as string | null;
        const subtitle = formData.get("subtitle") as string | null;
        const imageFile = formData.get("image") as File | null;

        // 1️⃣ Fetch existing offer
        const existingOffer = await OfferBannerService.getOfferById(id);
        if (!existingOffer) {
            return NextResponse.json({ status: "error", message: "Offer not found" }, { status: 404 });
        }

        // 2️⃣ Prepare updated data
        const updatedData: Partial<OfferBannerItem> = {};
        if (title) updatedData.title = title;
        if (subtitle) updatedData.subtitle = subtitle;

        // 3️⃣ Replace image only if new file is provided
        if (imageFile instanceof File) {
            updatedData.image = await ReplaceImage(imageFile, existingOffer.image);
        }

        // 4️⃣ Update Firestore
        const updatedOffer = await OfferBannerService.updateOffer(id, updatedData);

        return NextResponse.json({ status: "success", data: updatedOffer }, { status: 200 });
    } catch (error) {
        consoleManager.error("PUT /offersBanner/[id] failed:", error);
        return NextResponse.json(
            { status: "error", message: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        await OfferBannerService.deleteOffer(id);
        return NextResponse.json({ status: "success", message: "Offer deleted successfully" }, { status: 200 });
    } catch (error) {
        consoleManager.error("DELETE /offersBanner/[id] failed:", error);
        return NextResponse.json(
            { status: "error", message: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
