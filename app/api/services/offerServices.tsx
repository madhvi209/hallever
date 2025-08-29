import { db } from "@/app/api/config/firebase";

const OFFER_DOC_ID = "current-offer";

export interface Offer {
    title: string;
    code: string;
    description?: string;
}

export class OfferService {
    static async getOffer() {
        const docRef = db.collection("offers").doc(OFFER_DOC_ID);
        const docSnap = await docRef.get();
        if (!docSnap.exists) throw new Error("Offer not found");
        return { id: docSnap.id, ...docSnap.data() };
    }

    static async addOffer(data: Offer) {
        const docRef = db.collection("offers").doc(OFFER_DOC_ID);
        const docSnap = await docRef.get();

        if (docSnap.exists) throw new Error("Offer already exists. Use update instead.");

        await docRef.set(data);
        return { id: OFFER_DOC_ID, ...data };
    }

    static async updateOffer(data: Offer) {
        const docRef = db.collection("offers").doc(OFFER_DOC_ID);
        await docRef.set(data);
        return { id: OFFER_DOC_ID, ...data };
    }

    static async deleteOffer() {
        const docRef = db.collection("offers").doc(OFFER_DOC_ID);
        await docRef.delete();
        return { message: "Offer deleted successfully" };
    }
}
