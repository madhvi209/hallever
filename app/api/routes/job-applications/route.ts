import { NextRequest, NextResponse } from 'next/server';
import { JobApplicationService } from '@/app/api/services/jobApplicationServices';
import { uploadFile } from '@/app/api/controller/fileController';

export const config = {
    api: {
        bodyParser: false,
    },
};

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const jobId = formData.get('jobId')?.toString();
        const name = formData.get('name')?.toString();
        const email = formData.get('email')?.toString();
        const phone = formData.get('phone')?.toString();
        const resumeFile = formData.get('resume') as File | null;

        if (!jobId || !name || !email || !phone || !resumeFile) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

     
        const resumeUrl = await uploadFile(resumeFile);
        const newApplication = await JobApplicationService.addApplication({
            jobId,
            name,
            email,
            phone,
            resumeUrl,
            status: 'Pending',
            createdOn: new Date().toISOString(),
        });

        return NextResponse.json(newApplication, { status: 201 });
    } catch (error) {
        console.error('Error applying for job:', error);
        return NextResponse.json({ message: 'Failed to apply for job', error }, { status: 500 });
    }
}
import { Timestamp } from "firebase-admin/firestore";

export async function GET() {
    try {
        const rawApplications = await JobApplicationService.getAllApplications();

        const applications = rawApplications.map((app) => ({
            ...app,
            createdOn: isTimestamp(app.createdOn)
                ? app.createdOn.toDate().toISOString()
                : typeof app.createdOn === "string"
                    ? app.createdOn
                    : null,
            updatedOn: isTimestamp(app.updatedOn)
                ? app.updatedOn.toDate().toISOString()
                : typeof app.updatedOn === "string"
                    ? app.updatedOn
                    : null,
        }));

        return NextResponse.json(applications, { status: 200 });
    } catch (error) {
        console.error("Error fetching job applications:", error);
        return NextResponse.json(
            { message: "Failed to fetch job applications" },
            { status: 500 }
        );
    }
}

// Helper to check if a value is a Firestore Timestamp
function isTimestamp(value): value is Timestamp {
    return value && typeof value.toDate === "function";
}


