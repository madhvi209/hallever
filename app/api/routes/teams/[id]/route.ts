import { NextRequest, NextResponse } from "next/server";
import TeamService, { TeamItem } from "@/app/api/services/teamServices";
import { DeleteImage, ReplaceImage } from "@/app/api/controller/imageController";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const formData = await req.formData();

    const name = formData.get("name") as string | null;
    const position = formData.get("position") as string | null;
    const bio = formData.get("bio") as string | null;
    const newImage = formData.get("image") as File | null;

    // Fetch existing team member
    const existingMember = await TeamService.getTeamMemberById(id);
    if (!existingMember) {
      return NextResponse.json({ message: "Team member not found." }, { status: 404 });
    }

    let imageUrl = existingMember.image;

    // Replace image if new one is uploaded
    if (newImage && newImage instanceof File) {
      const replacedUrl = await ReplaceImage(newImage, existingMember.image);
      if (replacedUrl) imageUrl = replacedUrl;
    }

    const updatedData: Partial<TeamItem> = {
      name: name ?? existingMember.name,
      position: position ?? existingMember.position,
      bio: bio ?? existingMember.bio,
      image: imageUrl,
    };

    const updatedMember = await TeamService.updateTeamMember(id, updatedData);

    return NextResponse.json({
      message: "Team member updated successfully",
      data: updatedMember,
    });
  } catch (error) {
    console.error("PUT /api/team/[id]:", error);
    return NextResponse.json({ message: "Failed to update team member" }, { status: 500 });
  }
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const member = await TeamService.getTeamMemberById(id);

    if (!member) {
      return NextResponse.json({ data: null, message: "Team member not found" }, { status: 404 });
    }

    return NextResponse.json({ data: member, message: "Fetched team member successfully" });
  } catch (error) {
    console.error("GET /api/team/[id]:", error);
    return NextResponse.json({ data: null, message: "Failed to fetch team member" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const member = await TeamService.getTeamMemberById(id);

    if (member?.image) {
      await DeleteImage(member.image);
    }

    await TeamService.deleteTeamMember(id);

    return NextResponse.json({ data: null, message: "Team member deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/team/[id]:", error);
    return NextResponse.json({ data: null, message: "Failed to delete team member" }, { status: 500 });
  }
}
