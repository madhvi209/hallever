
import { NextRequest, NextResponse } from "next/server";
import { JobService } from "@/app/api/services/careerServices";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const job = await JobService.getJobById(id);
        if (!job) {
            return NextResponse.json({ message: "Job not found" }, { status: 404 });
        }
        return NextResponse.json(job, { status: 200 });
    } catch (error) {
        console.error("Error getting job:", error);
        return NextResponse.json({ message: "Failed to fetch job" }, { status: 500 });
    }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();

    try {
        const updatedJob = await JobService.updateJob(id, body);
        if (!updatedJob) {
            return NextResponse.json({ message: "Job not found" }, { status: 404 });
        }
        return NextResponse.json(updatedJob, { status: 200 });
    } catch (error) {
        console.error("Error updating job:", error);
        return NextResponse.json({ message: "Failed to update job" }, { status: 500 });
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const success = await JobService.deleteJob(id);
        if (!success) {
            return NextResponse.json({ message: "Failed to delete job" }, { status: 400 });
        }
        return NextResponse.json({ message: "Job deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("Error deleting job:", error);
        return NextResponse.json({ message: "Failed to delete job" }, { status: 500 });
    }
}
