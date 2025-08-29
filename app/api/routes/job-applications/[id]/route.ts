import { NextRequest, NextResponse } from "next/server";
import { JobApplicationService, JobApplicationStatus } from "@/app/api/services/jobApplicationServices";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const application = await JobApplicationService.getApplicationById(id);
        if (!application) {
            return NextResponse.json({ message: "Application not found" }, { status: 404 });
        }
        return NextResponse.json(application, { status: 200 });
    } catch (error) {
        console.error("Error getting application:", error);
        return NextResponse.json({ message: "Failed to fetch application" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const { status } = await req.json();
        if (!status || !["Pending", "Selected", "Rejected"].includes(status)) {
            return NextResponse.json({ message: "Invalid status" }, { status: 400 });
        }
        const updated = await JobApplicationService.updateApplicationStatus(id, status as JobApplicationStatus);
        if (!updated) {
            return NextResponse.json({ message: "Application not found" }, { status: 404 });
        }
        return NextResponse.json(updated, { status: 200 });
    } catch (error) {
        console.error("Error updating application status:", error);
        return NextResponse.json({ message: "Failed to update application status" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    try {
        const success = await JobApplicationService.deleteApplication(id);
        if (!success) {
            return NextResponse.json({ message: "Failed to delete application" }, { status: 400 });
        }
        return NextResponse.json({ message: "Application deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting application:", error);
        return NextResponse.json({ message: "Failed to delete application" }, { status: 500 });
    }
} 