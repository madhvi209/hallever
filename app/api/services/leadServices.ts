import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";

class LeadService {
    static leads = [];
    static isInitialized = false;

    // Initialize Firestore real-time listener (runs once)
    static initLeads() {
        if (this.isInitialized) return;

        consoleManager.log("Initializing Firestore listener for leads...");
        const leadsCollection = db.collection("leads");

        leadsCollection.onSnapshot((snapshot) => {
            this.leads = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            consoleManager.log("🔥 Firestore Read: Leads updated, count:", this.leads.length);
        });

        this.isInitialized = true;
    }

    // Get all leads (Uses cache unless forceRefresh is true)
    static async getAllLeads(forceRefresh = false) {
        if (forceRefresh || !this.isInitialized) {
            consoleManager.log("Force refreshing leads from Firestore...");
            const snapshot = await db.collection("leads").orderBy("createdOn", "desc").get();
            this.leads = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
            this.isInitialized = true;
        } else {
            consoleManager.log("Returning cached leads. No Firestore read.");
        }
        return this.leads;
    }

    // Add a new lead with createdOn timestamp
    static async addLead(leadData) {
        try {
            const timestamp = admin.firestore.FieldValue.serverTimestamp();
            const newLeadRef = await db.collection("leads").add({
                ...leadData,
                createdOn: timestamp,
            });

            consoleManager.log("✅ New lead added with ID:", newLeadRef.id);

            // Force refresh the cache after adding a new lead
            await this.getAllLeads(true);

            return { id: newLeadRef.id, ...leadData, createdOn: timestamp };
        } catch (error) {
            consoleManager.error("Error adding lead:", error);
            throw new Error("Failed to add lead");
        }
    }

    // Get lead by ID (fetches from cache first)
    static async getLeadById(leadId: string) {
        try {
            // Check if lead exists in cache
            const cachedLead = this.leads.find((lead) => lead.id === leadId);
            if (cachedLead) {
                consoleManager.log("✅ Lead fetched from cache:", leadId);
                return cachedLead;
            }

            // Fetch from Firestore if not in cache
            const leadRef = db.collection("leads").doc(leadId);
            const doc = await leadRef.get();

            if (!doc.exists) {
                consoleManager.warn("⚠️ Lead not found:", leadId);
                return null;
            }

            consoleManager.log("✅ Lead fetched from Firestore:", leadId);
            return { id: doc.id, ...doc.data() };
        } catch (error) {
            consoleManager.error("Error fetching lead by ID:", error);
            throw new Error("Failed to fetch lead");
        }
    }

    // Update lead with updatedOn timestamp
    static async updateLead(leadId: string, updatedData) {
        try {
            const timestamp = admin.firestore.FieldValue.serverTimestamp();
            const leadRef = db.collection("leads").doc(leadId);
            await leadRef.update({
                ...updatedData,
                updatedOn: timestamp,
            });

            consoleManager.log("✅ Lead updated:", leadId);

            // Force refresh the cache after updating a lead
            await this.getAllLeads(true);

            return { id: leadId, ...updatedData, updatedOn: timestamp };
        } catch (error) {
            consoleManager.error("Error updating lead:", error);
            throw new Error("Failed to update lead");
        }
    }

    // Delete lead
    static async deleteLead(leadId: string) {
        try {
            await db.collection("leads").doc(leadId).delete();
            consoleManager.log("Lead deleted:", leadId);

            // Force refresh the cache after deleting a lead
            await this.getAllLeads(true);

            return { success: true, message: "Lead deleted successfully" };
        } catch (error) {
            consoleManager.error("Error deleting lead:", error);
            throw new Error("Failed to delete lead");
        }
    }
}

export default LeadService;
