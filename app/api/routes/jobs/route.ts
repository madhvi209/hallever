import { NextRequest, NextResponse } from "next/server";
import { JobService } from "@/app/api/services/careerServices";
import { Job } from "@/lib/redux/slice/careerSlice";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { title, department, location, type, skills, responsibilities, salaryRange, description, experience, education, status } = body;

        
        if (!title || !department || !location || !type || !skills || !responsibilities) {
            return NextResponse.json({ message: "Missing required fields" }, { status: 400 });
        }

        const jobData: Omit<Job, "id" | "createdOn" | "updatedOn"> = {
            title,
            department,
            location,
            type,
            skills,
            responsibilities,
            salaryRange,
            description,
            experience,
            education,
            status,
        };

        const newJob = await JobService.addJob(jobData);
        return NextResponse.json(newJob, { status: 201 });
    } catch (error: unknown) {
        console.error("Error posting job:", error);

        const message =
            error instanceof Error ? error.message : "Unexpected error occurred";

        return NextResponse.json({ message: "Failed to post job", error: message }, { status: 500 });
    }

}

export async function GET() {
    try {
        const jobs = await JobService.getAllJobs();
        return NextResponse.json(jobs, { status: 200 });
    } catch (error) {
        console.error("Error fetching jobs:", error);
        return NextResponse.json({ message: "Failed to fetch jobs" }, { status: 500 });
    }
}
