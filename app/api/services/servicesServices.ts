import { db } from "@/app/api/config/firebase";
import admin from "firebase-admin";
import { ServiceItem } from "@/lib/redux/slice/serviceSlice";

export class ServiceService {
    // Add a new service
    static async addService(serviceData: Omit<ServiceItem, "id" | "createdOn" | "updatedOn">): Promise<ServiceItem> {
        if (!serviceData.title || !serviceData.description) {
            throw new Error("Title and description are required");
        }

        try {
            const timestamp = admin.firestore.FieldValue.serverTimestamp();
            const newServiceRef = await db.collection("services").add({
                ...serviceData,
                createdOn: timestamp,
                updatedOn: timestamp,
            });

            const savedDoc = await newServiceRef.get();
            const savedData = savedDoc.data() as ServiceItem;

            return {
                ...savedData,
                id: newServiceRef.id,
            };
        } catch (error) {
            console.error("Error adding service:", error);
            throw new Error("Failed to add service");
        }
    }

    // Get all services
    static async getAllServices(): Promise<ServiceItem[]> {
        try {
            const snapshot = await db.collection("services").orderBy("createdOn", "desc").get();

            return snapshot.docs.map((doc) => ({
                ...(doc.data() as ServiceItem),
                id: doc.id,
            }));
        } catch (error) {
            console.error("Error fetching services:", error);
            throw new Error("Failed to fetch services");
        }
    }

    // Get service by ID
    static async getServiceById(id: string): Promise<ServiceItem | null> {
        try {
            const doc = await db.collection("services").doc(id).get();
            if (!doc.exists) return null;

            return {
                ...(doc.data() as ServiceItem),
                id: doc.id,
            };
        } catch (error) {
            console.error("Error fetching service by ID:", error);
            throw new Error("Failed to fetch service");
        }
    }

    // Update service by ID
    static async updateService(id: string, serviceData: Partial<ServiceItem>): Promise<ServiceItem | null> {
        try {
            const serviceRef = db.collection("services").doc(id);
            const doc = await serviceRef.get();

            if (!doc.exists) return null;

            const timestamp = admin.firestore.FieldValue.serverTimestamp();

            await serviceRef.update({
                ...serviceData,
                updatedOn: timestamp,
            });

            const updatedDoc = await serviceRef.get();
            return {
                ...(updatedDoc.data() as ServiceItem),
                id: updatedDoc.id,
            };
        } catch (error) {
            console.error("Error updating service:", error);
            throw new Error("Failed to update service");
        }
    }

    // Delete service by ID
    static async deleteService(id: string): Promise<boolean> {
        try {
            await db.collection("services").doc(id).delete();
            return true;
        } catch (error) {
            console.error("Error deleting service:", error);
            return false;
        }
    }
}

export default ServiceService;
