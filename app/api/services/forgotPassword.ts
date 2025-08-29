import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";

class ForgotPasswordService {
    static forgotPassword = [];
    static isInitialized = false;

    // Initialize Firestore real-time listener (runs once)
    static initForgotPassword() {
        if (this.isInitialized) return;

        consoleManager.log("Initializing Firestore listener for forgot password...");
        const forgotPasswordCollection = db.collection("forgotPassword");

        forgotPasswordCollection.onSnapshot((snapshot) => {
            this.forgotPassword = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            consoleManager.log("🔥 Firestore Read: Forgot password updated, count:", this.forgotPassword.length);
        });

        this.isInitialized = true;
    }

    // Get all forgot password (Uses cache unless forceRefresh is true)
    static async getAllForgotPassword(forceRefresh = false) {
        if (forceRefresh || !this.isInitialized) {
            consoleManager.log("Force refreshing forgot password from Firestore...");
            const snapshot = await db.collection("forgotPassword").orderBy("createdOn", "desc").get();
            this.forgotPassword = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            this.isInitialized = true;
        } else {
            consoleManager.log("Returning cached forgot password. No Firestore read.");
        }
        return this.forgotPassword;
    }

    // Add a new forgot password with createdOn timestamp
    static async addForgotPassword(forgotPasswordData) {
        try {
            const timestamp = admin.firestore.FieldValue.serverTimestamp();
            const newForgotPasswordRef = await db.collection("forgotPassword").add({
                ...forgotPasswordData,
                createdOn: timestamp,
            });

            consoleManager.log("✅ New forgot password added with ID:", newForgotPasswordRef.id);

            // Force refresh the cache after adding a new forgot password
            await this.getAllForgotPassword(true);

            return { id: newForgotPasswordRef.id, ...forgotPasswordData, createdOn: timestamp };
        } catch (error) {
            consoleManager.error("Error adding forgot password:", error);
            throw new Error("Failed to add forgot password");
        }
    }

    // Get forgot password by ID (fetches from cache first)
    static async getForgotPasswordById(forgotPasswordId: string) {
        try {
            // Check if forgot password exists in cache
            const cachedForgotPassword = this.forgotPassword.find((forgotPassword) => forgotPassword.id === forgotPasswordId);
            if (cachedForgotPassword) {
                    consoleManager.log("✅ Forgot password fetched from cache:", forgotPasswordId);
                return cachedForgotPassword;
            }

            // Fetch from Firestore if not in cache
            const forgotPasswordRef = db.collection("forgotPasswords").doc(forgotPasswordId);
            const doc = await forgotPasswordRef.get();

            if (!doc.exists) {
                consoleManager.warn("⚠️ Forgot password not found:", forgotPasswordId);
                return null;
            }

            consoleManager.log("✅ Forgot password fetched from Firestore:", forgotPasswordId);
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            consoleManager.error("Error fetching forgot password by ID:", error);
            throw new Error("Failed to fetch forgot password");
        }
    }

    // Update forgot password with updatedOn timestamp
    static async updateForgotPassword(forgotPasswordId: string, updatedData) {
        try {
            const timestamp = admin.firestore.FieldValue.serverTimestamp();
            const forgotPasswordRef = db.collection("forgotPassword").doc(forgotPasswordId);
            await forgotPasswordRef.update({
                ...updatedData, updatedOn: timestamp
            });

            consoleManager.log("✅ Forgot password updated:", forgotPasswordId);

            // Force refresh the cache after updating a forgot password
            await this.getAllForgotPassword(true);

            return { id: forgotPasswordId, ...updatedData, updatedOn: timestamp };
        } catch (error) {
            consoleManager.error("Error updating forgot password:", error);
            throw new Error("Failed to update forgot password");
        }
    }

    // Delete forgot password
    static async deleteForgotPassword(forgotPasswordId: string) {
        try {
            await db.collection("forgotPassword").doc(forgotPasswordId).delete();
            consoleManager.log("Forgot password deleted:", forgotPasswordId);

            // Force refresh the cache after deleting a forgot password
            await this.getAllForgotPassword(true);

            return { success: true, message: "Forgot password deleted successfully" };
        } catch (error) {
            consoleManager.error("Error deleting forgot password:", error);
            throw new Error("Failed to delete forgot password");
        }
            }
}

export default ForgotPasswordService;
