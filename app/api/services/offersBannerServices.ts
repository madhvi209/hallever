// app/api/services/offerBannerService.ts
import { db } from "../config/firebase";
import consoleManager from "../utils/consoleManager";
import admin from "firebase-admin";
import { UploadImage } from "../controller/imageController";

// Offer type
export interface OfferBannerItem {
    id: string;
    image: string;
    title: string;
    subtitle: string;
    createdOn?: FirebaseFirestore.Timestamp | null;
    updatedOn?: FirebaseFirestore.Timestamp | null;
}

class OfferBannerService {
    static offers: OfferBannerItem[] = [];
    static isInitialized = false;

    // ✅ Initialize Firestore listener (runs once)
    static addOffers() {
        if (this.isInitialized) return;

        consoleManager.log("Initializing Firestore listener for offer banners...");
        const collectionRef = db.collection("offersBanner");

        collectionRef.onSnapshot((snapshot) => {
            this.offers = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as OfferBannerItem[];
            consoleManager.log("🔥 Firestore Read: Offers updated, count:", this.offers.length);
        });

        this.isInitialized = true;
    }

    // ✅ Get all offers (cache unless forceRefresh)
    static async getAllOffers(forceRefresh = false): Promise<OfferBannerItem[]> {
        if (forceRefresh || !this.isInitialized) {
            consoleManager.log("Force refreshing offers from Firestore...");
            const snapshot = await db.collection("offersBanner").orderBy("createdOn", "desc").get();
            this.offers = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as OfferBannerItem[];
            this.isInitialized = true;
        } else {
            consoleManager.log("Returning cached offers. No Firestore read.");
        }
        return this.offers;
    }

    // ✅ Get offer by ID (cache first)
    static async getOfferById(id: string): Promise<OfferBannerItem | null> {
        try {
            const cached = this.offers.find((o) => o.id === id);
            if (cached) {
                consoleManager.log("✅ Offer fetched from cache:", id);
                return cached;
            }

            const docRef = db.collection("offersBanner").doc(id);
            const docSnap = await docRef.get();

            if (!docSnap.exists) {
                consoleManager.warn("⚠️ Offer not found:", id);
                return null;
            }

            consoleManager.log("✅ Offer fetched from Firestore:", id);
            return { id: docSnap.id, ...docSnap.data() } as OfferBannerItem;
        } catch (error) {
            consoleManager.error("Error fetching offer by ID:", error);
            throw new Error("Failed to fetch offer");
        }
    }

    // ✅ Add new offer (supports image upload)
    static async addOffer(data: Omit<OfferBannerItem, "id" | "createdOn" | "updatedOn"> & { imageFile?: File }): Promise<OfferBannerItem> {
        try {
            let imageUrl = data.image;
            if (data.imageFile) {
                imageUrl = await UploadImage(data.imageFile);
            }

            const timestamp = admin.firestore.FieldValue.serverTimestamp();
            const docRef = await db.collection("offersBanner").add({
                title: data.title,
                subtitle: data.subtitle,
                image: imageUrl,
                createdOn: timestamp,
                updatedOn: timestamp,
            });

            consoleManager.log("✅ New offer added with ID:", docRef.id);

            // Refresh cache
            await this.getAllOffers(true);

            return { id: docRef.id, title: data.title, subtitle: data.subtitle, image: imageUrl };
        } catch (error) {
            consoleManager.error("Error adding offer:", error);
            throw new Error("Failed to add offer");
        }
    }

    // ✅ Update existing offer
    static async updateOffer(id: string, data: Partial<OfferBannerItem> & { imageFile?: File }): Promise<OfferBannerItem | null> {
        try {
            let imageUrl = data.image;
            if (data.imageFile) {
                imageUrl = await UploadImage(data.imageFile);
            }

            // Only include fields that are actually defined
            const updatedData: Partial<OfferBannerItem> = {};
            if (data.title !== undefined) updatedData.title = data.title;
            if (data.subtitle !== undefined) updatedData.subtitle = data.subtitle;
            if (imageUrl !== undefined) updatedData.image = imageUrl;

            const docRef = db.collection("offersBanner").doc(id);
            await docRef.update(updatedData);

            consoleManager.log("✅ Offer updated:", id);

            // Refresh cache
            await this.getAllOffers(true);

            return { id, ...updatedData } as OfferBannerItem;
        } catch (error) {
            consoleManager.error("Error updating offer:", error);
            throw new Error("Failed to update offer");
        }
    }

    // ✅ Delete offer
    static async deleteOffer(id: string): Promise<{ success: boolean; message: string }> {
        try {
            await db.collection("offersBanner").doc(id).delete();
            consoleManager.log("❌ Offer deleted:", id);

            // Refresh cache
            await this.getAllOffers(true);

            return { success: true, message: "Offer deleted successfully" };
        } catch (error) {
            consoleManager.error("Error deleting offer:", error);
            throw new Error("Failed to delete offer");
        }
    }
}

export default OfferBannerService;
