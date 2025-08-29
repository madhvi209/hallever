import { auth, db } from "@/app/api/config/firebase";
import consoleManager from "@/app/api/utils/consoleManager";
import { generateTLCUserId } from "@/lib/utils";
import { UserRecord } from "firebase-admin/auth";

// Add typing for the extra user data
interface ExtraUserData {
    fullName?: string;
    phoneNumber?: string;
    role?: string;
}

class AuthService {
    //  Register new user
    static async registerUser(email: string, password: string, extraData: ExtraUserData = {}) {
        try {
            // 1. Generate TLC ID
            const now = new Date();
            const month = (now.getMonth() + 1).toString().padStart(2, "0");

            const snapshot = await db
                .collection("users")
                .where("tlcId", ">=", `TLC${month}`)
                .where("tlcId", "<", `TLC${month}99`)
                .orderBy("tlcId", "desc")
                .limit(1)
                .get();

            const lastTlcId = snapshot.empty ? undefined : snapshot.docs[0].data().tlcId;
            const newTlcId = generateTLCUserId(lastTlcId);

            // 2. Create Firebase Auth user
            const userRecord: UserRecord = await auth.createUser({
                email,
                password,
                displayName: extraData.fullName || "",
                phoneNumber: extraData.phoneNumber,
            });


            // 3. Save to Firestore
            await db.collection("users").doc(userRecord.uid).set({
                uid: userRecord.uid,
                email: userRecord.email,
                fullName: extraData.fullName || "",
                role: extraData.role || "user",
                phoneNumber: extraData.phoneNumber || "",
                tlcId: newTlcId,
                createdOn: new Date().toISOString(),
            });
            consoleManager.log("✅ User saved in Firestore:", userRecord);
            consoleManager.log("User registered:", userRecord.uid, "TLC ID:", newTlcId);

            return {
                uid: userRecord.uid,
                email: userRecord.email,
                fullName: extraData.fullName || "",
                tlcId: newTlcId,
                role: extraData.role || "user",
            };
        } catch (error: unknown) {
            let errorMessage = "Registration failed.";

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            consoleManager.error("registerUser error:", errorMessage);
            throw new Error(errorMessage);
        }

    }

    //  Login
    static async loginUser(email: string, password: string) {
        try {
            const userRecord = await auth.getUserByEmail(email);
            if (!userRecord) throw new Error("User not found");

            const userDoc = await db.collection("users").doc(userRecord.uid).get();
            if (!userDoc.exists) throw new Error("User profile not found");

            return {
                uid: userRecord.uid,
                email: userRecord.email,
                ...userDoc.data(),
            };
        } catch (error: unknown) {
            let errorMessage = "Registration failed.";

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            consoleManager.error("registerUser error:", errorMessage);
            throw new Error(errorMessage);
        }

    }

    //  Delete user
    static async deleteUserByUid(uid: string) {
        try {
            await auth.deleteUser(uid);
            await db.collection("users").doc(uid).delete();
            consoleManager.log("User deleted:", uid);
        } catch (error: unknown) {
            let errorMessage = "Registration failed.";

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            consoleManager.error("registerUser error:", errorMessage);
            throw new Error(errorMessage);
        }

    }

    //  Update Firebase Auth fields
    static async updateUser(uid: string, updates: ExtraUserData & { email?: string; password?: string; disabled?: boolean; }) {
        try {
            const fields: Record<string, unknown> = {};


            if (updates.email) fields.email = updates.email;
            if (updates.password) fields.password = updates.password;
            if (updates.fullName) fields.displayName = updates.fullName;
            if (updates.phoneNumber) fields.phoneNumber = updates.phoneNumber;
            if (updates.disabled !== undefined) fields.disabled = updates.disabled;
            if (updates.role) fields.customClaims = { role: updates.role };

            if (Object.keys(fields).length > 0) {
                await auth.updateUser(uid, fields);
                consoleManager.log("Firebase Auth user updated:", uid);
            }
        } catch (error: unknown) {
            let errorMessage = "Registration failed.";

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            consoleManager.error("registerUser error:", errorMessage);
            throw new Error(errorMessage);
        }

    }

    //  Update Firestore profile fields
    static async updateUserInFirestore(uid: string, updateData: Record<string, unknown>) {
        try {
            consoleManager.log("Updating Firestore user:", uid, "Data keys:", Object.keys(updateData));
            
            // Handle cart data specifically
            if (updateData.cart) {
                consoleManager.log("Cart update detected:", {
                    uid,
                    cartItems: Array.isArray(updateData.cart) ? updateData.cart.length : 'not array'
                });
            }

            await db.collection("users").doc(uid).update({
                ...updateData,
                updatedOn: new Date().toISOString(),
            });
            consoleManager.log("✅ Firestore user updated successfully:", uid);
        } catch (error: unknown) {
            let errorMessage = "Failed to update user in Firestore.";

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            consoleManager.error("❌ updateUserInFirestore error:", errorMessage);
            throw new Error(errorMessage);
        }
    }

    //  Get user by UID
    static async getUserById(uid: string) {
        try {
            const doc = await db.collection("users").doc(uid).get();
            if (!doc.exists) return null;
            return { uid: doc.id, ...doc.data() };
        } catch (error: unknown) {
            let errorMessage = "Registration failed.";

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            consoleManager.error("registerUser error:", errorMessage);
            throw new Error(errorMessage);
        }

    }

    //  Get user by email
    static async getUserByEmail(email: string) {
        try {
            const snapshot = await db.collection("users").where("email", "==", email).get();
            if (snapshot.empty) return null;
            const doc = snapshot.docs[0];
            return { uid: doc.id, ...doc.data() };
        } catch (error: unknown) {
            let errorMessage = "Registration failed.";

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            consoleManager.error(" registerUser error:", errorMessage);
            throw new Error(errorMessage);
        }

    }

    //  Get all users
    static async getAllUsers() {
        try {
            const snapshot = await db.collection("users").get();
            return snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
        } catch (error: unknown) {
            let errorMessage = "Registration failed.";

            if (error instanceof Error) {
                errorMessage = error.message;
            }

            consoleManager.error(" registerUser error:", errorMessage);
            throw new Error(errorMessage);
        }

    }
}

export default AuthService;
