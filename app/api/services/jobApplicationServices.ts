import { db } from "@/app/api/config/firebase";
import admin from "firebase-admin";

export type JobApplicationStatus = "Pending" | "Selected" | "Rejected";

export interface JobApplication {
    id?: string;
    jobId: string;
    name: string;
    email: string;
    phone: string;
    resumeUrl?: string;
    coverLetter?: string;
    status: JobApplicationStatus;
    createdOn?: string;
    updatedOn?: string;
}

export class JobApplicationService {
    // Add a new job application
    static async addApplication(application: Omit<JobApplication, "id" | "updatedOn" >): Promise<JobApplication> {
        try {
            const timestamp = admin.firestore.FieldValue.serverTimestamp();
            const newAppRef = await db.collection("jobApplications").add({
                ...application,
                status: "Pending",
                createdOn: timestamp,
                updatedOn: timestamp,
            });
            const savedDoc = await newAppRef.get();
            const savedData = savedDoc.data() as JobApplication;
            return {
                ...savedData,
                id: newAppRef.id,
            };
        } catch (error) {
            console.error("Error adding job application:", error);
            throw new Error("Failed to add job application");
        }
    }

    // Get all job applications
    static async getAllApplications(): Promise<JobApplication[]> {
        try {
            const snapshot = await db.collection("jobApplications").orderBy("createdOn", "desc").get();
            return snapshot.docs.map((doc) => ({
                ...(doc.data() as JobApplication),
                id: doc.id,
            }));
        } catch (error) {
            console.error("Error fetching job applications:", error);
            throw new Error("Failed to fetch job applications");
        }
    }

    // Get application by ID
    static async getApplicationById(id: string): Promise<JobApplication | null> {
        try {
            const doc = await db.collection("jobApplications").doc(id).get();
            if (!doc.exists) return null;
            return {
                ...(doc.data() as JobApplication),
                id: doc.id,
            };
        } catch (error) {
            console.error("Error fetching job application by ID:", error);
            throw new Error("Failed to fetch job application");
        }
    }

    // Update application status
    static async updateApplicationStatus(id: string, status: JobApplicationStatus): Promise<JobApplication | null> {
        try {
            const appRef = db.collection("jobApplications").doc(id);
            const doc = await appRef.get();
            if (!doc.exists) return null;
            const timestamp = admin.firestore.FieldValue.serverTimestamp();
            await appRef.update({
                status,
                updatedOn: timestamp,
            });
            const updatedDoc = await appRef.get();
            return {
                ...(updatedDoc.data() as JobApplication),
                id: updatedDoc.id,
            };
        } catch (error) {
            console.error("Error updating job application status:", error);
            throw new Error("Failed to update job application status");
        }
    }

    // Delete application
    static async deleteApplication(id: string): Promise<boolean> {
        try {
            await db.collection("jobApplications").doc(id).delete();
            return true;
        } catch (error) {
            console.error("Error deleting job application:", error);
            return false;
        }
    }
}

export default JobApplicationService; 