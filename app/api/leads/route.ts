import { NextRequest, NextResponse } from "next/server";
import LeadService from "@/app/api/services/leadServices";

// GET all leads
export async function GET() {
    try {
        const leads = await LeadService.getAllLeads();
        return NextResponse.json({ success: true, data: leads }, { status: 200 });
    } catch (error) {
        console.error("Error fetching leads:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch leads" }, { status: 500 });
    }
}

// POST new lead
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, phone, message } = body;

        if (!name || !email || !message) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const newLead = await LeadService.addLead({ name, email, phone, message });

        return NextResponse.json({ success: true, data: newLead }, { status: 201 });
    } catch (error) {
        console.error("Error posting leads:", error);
        return NextResponse.json({ success: false, message: "Failed to create lead" }, { status: 500 });
    }
}
