import { NextResponse } from "next/server";
import { UploadImage } from "@/app/api/controller/imageController"; 
import OfferService from "@/app/api/services/offersBannerServices"; 
import consoleManager from "@/app/api/utils/consoleManager";

// ✅ GET → Fetch all offers
export async function GET() {
    try {
        const offers = await OfferService.getAllOffers();
        return NextResponse.json({ status: "success", data: offers }, { status: 200 });
    } catch (error) {
        consoleManager.error("GET /offersBanner:", error);
        return NextResponse.json(
            { status: "error", message: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}

// ✅ POST → Create new offer
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const title = formData.get("title") as string | null;
        const subtitle = formData.get("subtitle") as string | null;
        const imageFile = formData.get("image") as File | null;

        if (!title || !subtitle) {
            return NextResponse.json({ status: "error", message: "Title and subtitle are required" }, { status: 400 });
        }

        let imageUrl: string | undefined;
        if (imageFile instanceof File) {
            imageUrl = await UploadImage(imageFile);
        }

        const newOffer = await OfferService.addOffer({
            title,
            subtitle,
            image: imageUrl || "/offers/offer1.jpg", // fallback image
        });

        return NextResponse.json({ status: "success", data: newOffer }, { status: 201 });
    } catch (error) {
        consoleManager.error("POST /offersBanner:", error);
        return NextResponse.json(
            { status: "error", message: error instanceof Error ? error.message : "Unknown error" },
            { status: 500 }
        );
    }
}
