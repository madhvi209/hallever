import { db } from "@/app/api/config/firebase";
import admin from "firebase-admin";
import { Job } from "@/lib/redux/slice/careerSlice";

type JobInput = Omit<Job, "id" | "createdOn" | "updatedOn">;

export class JobService {
    // ✅ Add a new job
    static async addJob(jobData: JobInput): Promise<Job> {
        try {
            const timestamp = admin.firestore.FieldValue.serverTimestamp();

            // Filter out undefined or null fields before saving
            const cleanedJobData: Record<string, unknown> = Object.fromEntries(
                Object.entries(jobData).filter(
                    ([value]) => value !== undefined && value !== null
                )
            );

            const newJobRef = await db.collection("jobs").add({
                ...cleanedJobData,
                createdOn: timestamp,
                updatedOn: timestamp,
            });

            const savedDoc = await newJobRef.get();
            const savedData = savedDoc.data();

            if (!savedData) {
                throw new Error("Failed to retrieve saved job data");
            }

            return {
                ...(savedData as Job),
                id: newJobRef.id,
            };
        } catch (error: unknown) {
            console.error("🔥 Error adding job:", error);
            throw new Error("Failed to add job");
        }
    }

    // ✅ Get all jobs ordered by created date
    static async getAllJobs(): Promise<Job[]> {
        try {
            const snapshot = await db.collection("jobs").orderBy("createdOn", "desc").get();
            return snapshot.docs.map((doc) => ({
                ...(doc.data() as Job),
                id: doc.id,
            }));
        } catch (error: unknown) {
            console.error("Error fetching jobs:", error);
            throw new Error("Failed to fetch jobs");
        }
    }

    // ✅ Get a job by ID
    static async getJobById(id: string): Promise<Job | null> {
        try {
            const doc = await db.collection("jobs").doc(id).get();
            if (!doc.exists) return null;

            return {
                ...(doc.data() as Job),
                id: doc.id,
            };
        } catch (error: unknown) {
            console.error("Error fetching job by ID:", error);
            throw new Error("Failed to fetch job");
        }
    }

    // ✅ Update a job by ID
    static async updateJob(id: string, jobData: Partial<Job>): Promise<Job | null> {
        try {
            const jobRef = db.collection("jobs").doc(id);
            const doc = await jobRef.get();
            if (!doc.exists) return null;

            const timestamp = admin.firestore.FieldValue.serverTimestamp();

            const cleanedUpdateData: Record<string, unknown> = Object.fromEntries(
                Object.entries(jobData).filter(
                    ([value]) => value !== undefined && value !== null
                )
            );

            await jobRef.update({
                ...cleanedUpdateData,
                updatedOn: timestamp,
            });

            const updatedDoc = await jobRef.get();
            const updatedData = updatedDoc.data();

            if (!updatedData) {
                throw new Error("Failed to retrieve updated job data");
            }

            return {
                ...(updatedData as Job),
                id: updatedDoc.id,
            };
        } catch (error: unknown) {
            console.error("Error updating job:", error);
            throw new Error("Failed to update job");
        }
    }

    // ✅ Delete a job by ID
    static async deleteJob(id: string): Promise<boolean> {
        try {
            await db.collection("jobs").doc(id).delete();
            return true;
        } catch (error: unknown) {
            console.error("Error deleting job:", error);
            return false;
        }
    }
}

export default JobService;
