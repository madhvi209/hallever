import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";

// Team member type
export interface TeamItem {
    id: string;
    name: string;
    position: string;
    bio?: string;
    image?: string;
    createdOn?: FirebaseFirestore.Timestamp | null;
    updatedOn?: FirebaseFirestore.Timestamp | null;
}

class TeamService {
    static teamMembers: TeamItem[] = [];
    static isInitialized = false;

    // ✅ Initialize Firestore real-time listener (runs once)
    static initTeamMembers() {
        if (this.isInitialized) return;

        consoleManager.log("Initializing Firestore listener for team members...");
        const teamCollection = db.collection("team");

        teamCollection.onSnapshot((snapshot) => {
            this.teamMembers = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as TeamItem[];
            consoleManager.log("🔥 Firestore Read: Team members updated, count:", this.teamMembers.length);
        });

        this.isInitialized = true;
    }

    // ✅ Get all team members (Uses cache unless forceRefresh is true)
    static async getAllTeamMembers(forceRefresh = false): Promise<TeamItem[]> {
        if (forceRefresh || !this.isInitialized) {
            consoleManager.log("Force refreshing team members from Firestore...");
            const snapshot = await db.collection("team").orderBy("createdOn", "desc").get();
            this.teamMembers = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as TeamItem[];
            this.isInitialized = true;
        } else {
            consoleManager.log("Returning cached team members. No Firestore read.");
        }
        return this.teamMembers;
    }

    // ✅ Add a new team member with createdOn/updatedOn timestamp
    static async addTeamMember(teamData: Omit<TeamItem, "id" | "createdOn" | "updatedOn">): Promise<TeamItem> {
        try {
            const timestamp = admin.firestore.FieldValue.serverTimestamp();
            const newTeamRef = await db.collection("team").add({
                ...teamData,
                createdOn: timestamp,
                updatedOn: timestamp,
            });

            consoleManager.log("✅ New team member added with ID:", newTeamRef.id);

            // Force refresh the cache after adding
            await this.getAllTeamMembers(true);

            return { id: newTeamRef.id, ...teamData };
        } catch (error) {
            consoleManager.error("Error adding team member:", error);
            throw new Error("Failed to add team member");
        }
    }

    // ✅ Get team member by ID (cache first)
    static async getTeamMemberById(teamId: string): Promise<TeamItem | null> {
        try {
            const cached = this.teamMembers.find((t) => t.id === teamId);
            if (cached) {
                consoleManager.log("✅ Team member fetched from cache:", teamId);
                return cached;
            }

            const docRef = db.collection("team").doc(teamId);
            const doc = await docRef.get();

            if (!doc.exists) {
                consoleManager.warn("⚠️ Team member not found:", teamId);
                return null;
            }

            consoleManager.log("✅ Team member fetched from Firestore:", teamId);
            return { id: doc.id, ...doc.data() } as TeamItem;
        } catch (error) {
            consoleManager.error("Error fetching team member by ID:", error);
            throw new Error("Failed to fetch team member");
        }
    }

    // ✅ Update team member with updatedOn timestamp
    static async updateTeamMember(teamId: string, updatedData: Partial<TeamItem>): Promise<TeamItem | null> {
        try {
            const timestamp = admin.firestore.FieldValue.serverTimestamp();
            const docRef = db.collection("team").doc(teamId);

            await docRef.update({
                ...updatedData,
                updatedOn: timestamp,
            });

            consoleManager.log("✅ Team member updated:", teamId);

            // Refresh cache
            await this.getAllTeamMembers(true);

            return { id: teamId, ...updatedData, updatedOn: timestamp } as TeamItem;
        } catch (error) {
            consoleManager.error("Error updating team member:", error);
            throw new Error("Failed to update team member");
        }
    }

    // ✅ Delete team member
    static async deleteTeamMember(teamId: string): Promise<{ success: boolean; message: string }> {
        try {
            await db.collection("team").doc(teamId).delete();
            consoleManager.log("❌ Team member deleted:", teamId);

            // Refresh cache
            await this.getAllTeamMembers(true);

            return { success: true, message: "Team member deleted successfully" };
        } catch (error) {
            consoleManager.error("Error deleting team member:", error);
            throw new Error("Failed to delete team member");
        }
    }
}

export default TeamService;
