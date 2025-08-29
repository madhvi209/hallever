import { NextRequest, NextResponse } from "next/server";
import { ServiceService } from "@/app/api/services/servicesServices";
import consoleManager from "@/app/api/utils/consoleManager";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        const service = await ServiceService.getServiceById(id);
        if (!service) {
            return NextResponse.json({ message: "Service not found" }, { status: 404 });
        }
        return NextResponse.json(service, { status: 200 });
    } catch (error) {
        consoleManager.error(`GET /api/routes/services/${id}:`, error);
        return NextResponse.json({ message: "Failed to fetch service" }, { status: 500 });
    }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const body = await req.json();

    try {
        const updatedService = await ServiceService.updateService(id, body);
        if (!updatedService) {
            return NextResponse.json({ message: "Service not found" }, { status: 404 });
        }
        return NextResponse.json(updatedService, { status: 200 });
    } catch (error) {
        consoleManager.error(`PUT /api/routes/services/${id}:`, error);
        return NextResponse.json({ message: "Failed to update service" }, { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    try {
        await ServiceService.deleteService(id);
        return NextResponse.json({ message: "Service deleted successfully" }, { status: 200 });
    } catch (error) {
        consoleManager.error(`DELETE /api/routes/services/${id}:`, error);
        return NextResponse.json({ message: "Failed to delete service" }, { status: 500 });
    }
}
