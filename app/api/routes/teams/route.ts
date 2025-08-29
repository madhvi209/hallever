import { NextResponse } from "next/server";
import { UploadImage } from "@/app/api/controller/imageController";
import { TeamMember } from "@/lib/redux/slice/teamSlice"; 
import  TeamService from "@/app/api/services/teamServices";
import consoleManager from "@/app/api/utils/consoleManager";

// ----------------- POST: Add Team Member -----------------
export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const name = formData.get("name") as string | null;
        const position = formData.get("position") as string | null;
        const bio = formData.get("bio") as string | null;

        if (!name || !position) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Name and position are required.",
            }, { status: 400 });
        }

        // ✅ Handle image (optional)
        const imageFile = formData.get("image") as File | null;
        let imageUrl: string | undefined;
        if (imageFile instanceof File) {
            imageUrl = await UploadImage(imageFile);
        }

        const newTeamMember: Omit<TeamMember, "id" | "createdOn" | "updatedOn"> = {
            name,
            position,
            bio,
            image: imageUrl,
        };

        const createdTeamMember = await TeamService.addTeamMember(newTeamMember);

        return NextResponse.json({
            statusCode: 201,
            message: "Team member added successfully",
            data: createdTeamMember,
        }, { status: 201 });

    } catch (error) {
        consoleManager.error("POST /api/routes/teams:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}

// ----------------- GET: Fetch All Team Members -----------------
export async function GET() {
    try {
        const teamMembers = await TeamService.getAllTeamMembers();
        return NextResponse.json({
            statusCode: 200,
            message: "Team members fetched successfully",
            data: teamMembers,
        }, { status: 200 });
    } catch (error) {
        consoleManager.error("GET /api/routes/teams:", error);
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error instanceof Error ? error.message : "Unknown error",
        }, { status: 500 });
    }
}
