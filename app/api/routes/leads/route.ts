import { NextRequest, NextResponse } from "next/server";
import LeadService from "@/app/api/services/leadServices";
import consoleManager from "@/app/api/utils/consoleManager";

// GET all leads
export async function GET() {
    try {
        const leads = await LeadService.getAllLeads();
        return NextResponse.json({ success: true, data: leads }, { status: 200 });
    } catch (error) {
        consoleManager.error("Error in GET /api/leads:", error);
        return NextResponse.json({ success: false, message: "Failed to fetch leads" }, { status: 500 });
    }
}

// POST new lead
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, email, phone, message, city, role } = body;

        if (!name || !email || !message) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const newLead = await LeadService.addLead({ name, email, phone, message, city, role });

        return NextResponse.json({ success: true, data: newLead }, { status: 201 });
    } catch (error) {
        consoleManager.error("Error in POST /api/leads:", error);
        return NextResponse.json({ success: false, message: "Failed to create lead" }, { status: 500 });
    }
}
