// /services/TestimonialService.ts
import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";

class TestimonialService {
    static testimonials = [];
    static isInitialized = false;

    // ✅ Initialize Firestore real-time listener (runs once)
    static initTestimonials() {
        if (this.isInitialized) return;

        consoleManager.log("Initializing Firestore listener for testimonials...");
        const testimonialsCollection = db.collection("testimonials");

        testimonialsCollection.onSnapshot((snapshot) => {
            this.testimonials = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            }));
            consoleManager.log("🔥 Firestore Read: Testimonials updated, count:", this.testimonials.length);
        });

        this.isInitialized = true;
    }

    // ✅ Get all testimonials (Uses cache unless forceRefresh is true)
    static async getAllTestimonials(forceRefresh = false) {
        if (forceRefresh || !this.isInitialized) {
            consoleManager.log("Force refreshing testimonials from Firestore...");
            const snapshot = await db.collection("testimonials").orderBy("createdOn", "desc").get();
            this.testimonials = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            this.isInitialized = true;
        } else {
            consoleManager.log("Returning cached testimonials. No Firestore read.");
        }
        return this.testimonials;
    }

    // ✅ Add a new testimonial with createdOn timestamp
    static async addTestimonial(testimonialData: {
        name: string;
        event: string;
        location: string;
        rating: number;
        text: string;
    }) {
        try {
            const timestamp = admin.firestore.FieldValue.serverTimestamp();
            const newTestimonialRef = await db.collection("testimonials").add({
                ...testimonialData,
                createdOn: timestamp,
                status: "active",
            });

            consoleManager.log("✅ New testimonial added with ID:", newTestimonialRef.id);

            // Force refresh the cache after adding
            await this.getAllTestimonials(true);

            return { id: newTestimonialRef.id, ...testimonialData, createdOn: timestamp, status: "active" };
        } catch (error) {
            consoleManager.error("Error adding testimonial:", error);
            throw new Error("Failed to add testimonial");
        }
    }

    // ✅ Get testimonial by ID (cache first)
    static async getTestimonialById(testimonialId: string) {
        try {
            const cached = this.testimonials.find((t) => t.id === testimonialId);
            if (cached) {
                consoleManager.log("✅ Testimonial fetched from cache:", testimonialId);
                return cached;
            }

            const docRef = db.collection("testimonials").doc(testimonialId);
            const doc = await docRef.get();

            if (!doc.exists) {
                consoleManager.warn("⚠️ Testimonial not found:", testimonialId);
                return null;
            }

            consoleManager.log("✅ Testimonial fetched from Firestore:", testimonialId);
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            consoleManager.error("Error fetching testimonial by ID:", error);
            throw new Error("Failed to fetch testimonial");
        }
    }

    // ✅ Update testimonial with updatedOn timestamp
    static async updateTestimonial(testimonialId: string, updatedData) {
        try {
            const timestamp = admin.firestore.FieldValue.serverTimestamp();
            const docRef = db.collection("testimonials").doc(testimonialId);

            await docRef.update({
                ...updatedData,
                updatedOn: timestamp,
            });

            consoleManager.log("✅ Testimonial updated:", testimonialId);

            // Refresh cache
            await this.getAllTestimonials(true);

            return { id: testimonialId, ...updatedData, updatedOn: timestamp };
        } catch (error) {
            consoleManager.error("Error updating testimonial:", error);
            throw new Error("Failed to update testimonial");
        }
    }

    // ✅ Delete testimonial
    static async deleteTestimonial(testimonialId: string) {
        try {
            await db.collection("testimonials").doc(testimonialId).delete();
            consoleManager.log("❌ Testimonial deleted:", testimonialId);

            // Refresh cache
            await this.getAllTestimonials(true);

            return { success: true, message: "Testimonial deleted successfully" };
        } catch (error) {
            consoleManager.error("Error deleting testimonial:", error);
            throw new Error("Failed to delete testimonial");
        }
    }
}

export default TestimonialService;
