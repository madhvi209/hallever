
import { NextRequest, NextResponse } from "next/server";
import { OfferService } from "@/app/api/services/offerServices";

export async function GET() {
    try {
        const offer = await OfferService.getOffer();
        return NextResponse.json({ success: true, data: offer });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: (error as Error).message },
            { status: 404 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, code, description } = body;

        if (!title || !code || !description) {
            return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
        }

        const offer = await OfferService.addOffer({ title, code, description });
        return NextResponse.json({ success: true, data: offer }, { status: 201 });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: (error as Error).message },
            { status: 400 }
        );
    }
}

export async function PUT(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, code, description } = body;

        if (!title || !code || !description) {
            return NextResponse.json({ success: false, message: "Missing fields" }, { status: 400 });
        }

        const offer = await OfferService.updateOffer({ title, code, description });
        return NextResponse.json({ success: true, data: offer });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: (error as Error).message },
            { status: 500 }
        );
    }
}

export async function DELETE() {
    try {
        const res = await OfferService.deleteOffer();
        return NextResponse.json({ success: true, ...res });
    } catch (error) {
        return NextResponse.json(
            { success: false, message: (error as Error).message },
            { status: 500 }
        );
    }
}
