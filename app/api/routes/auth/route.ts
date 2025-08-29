import { NextResponse } from "next/server";
import AuthService from "@/app/api/services/authServices";
import consoleManager from "@/app/api/utils/consoleManager";
import { db } from "@/app/api/config/firebase";

// LOGIN
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { email, password } = body;


        // Validate input
        if (!email || !password) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "INVALID_INPUT",
                errorMessage: "Email and password are required.",
            }, { status: 400 });
        }

        

        // Authenticate user
        await AuthService.loginUser(email, password);
        consoleManager.log("User logged in");

        // Create response
        const response = NextResponse.json({
            statusCode: 201,
            message: "User logged in successfully",
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });

        response.headers.append("Set-Cookie", `isAuth=true; Path=/; Secure; SameSite=Strict; Max-Age=86400`);

        return response;
    } catch (error) {
        consoleManager.error("Error in POST /api/auth/login:", error.message);

        const statusCode = 401;
        let errorMessage = "Invalid email or password.";
        if (error.message.includes("User not found")) {
            errorMessage = "User not found. Please check your email.";
        } else if (error.message.includes("Incorrect password")) {
            errorMessage = "Incorrect password. Please try again.";
        }

        return NextResponse.json({
            statusCode,
            errorCode: "AUTH_FAILED",
            errorMessage,
        }, { status: statusCode });
    }
}

// REGISTER
export async function PUT(req: Request) {
    try {
        const body = await req.json();
        const { email, password, ...extraData } = body;

        if (!email || !password) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "INVALID_INPUT",
                errorMessage: "Email and password are required.",
            }, { status: 400 });
        }

        // Register user
        const user = await AuthService.registerUser(email, password, extraData);
        consoleManager.log("✅ User registered:", user.uid);
        

        // Create response
        const response = NextResponse.json({
            statusCode: 201,
            message: "User registered successfully",
            data: user,
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });

        response.headers.append("Set-Cookie", `isAuth=true; Path=/; Secure; SameSite=Strict; Max-Age=86400`);

        return response;
    } catch (error) {
        consoleManager.error("❌ Error in PUT /api/auth/register:", error.message);
        return NextResponse.json({
            statusCode: 400,
            errorCode: "REGISTER_FAILED",
            errorMessage: error.message || "Registration failed.",
        }, { status: 400 });
    }
}

// DELETE (self-delete)
export async function DELETE(req: Request) {
    try {
        const body = await req.json();
        const { uid } = body;
        if (!uid) {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "INVALID_INPUT",
                errorMessage: "User ID is required.",
            }, { status: 400 });
        }
        await AuthService.deleteUserByUid(uid);
        return NextResponse.json({
            statusCode: 200,
            message: "User deleted successfully",
            errorCode: "NO",
            errorMessage: "",
        }, { status: 200 });
    } catch (error) {
        consoleManager.error("❌ Error in DELETE /api/auth:", error.message);
        return NextResponse.json({
            statusCode: 400,
            errorCode: "DELETE_FAILED",
            errorMessage: error.message || "Delete failed.",
        }, { status: 400 });
    }
}

// PATCH (update user)
export async function PATCH(req: Request) {
    try {
        const body = await req.json();
        const { uid, password, email, phoneNumber, cart, ...updateData } = body;
        
        consoleManager.log("PATCH request received:", { uid, hasCart: !!cart, updateDataKeys: Object.keys(updateData) });
        
        if (!uid) {
            return NextResponse.json({ 
                statusCode: 400, 
                errorCode: "INVALID_INPUT",
                errorMessage: "User ID is required." 
            }, { status: 400 });
        }

        // Validate user exists
        const userDoc = await db.collection("users").doc(uid).get();
        if (!userDoc.exists) {
            return NextResponse.json({ 
                statusCode: 404, 
                errorCode: "USER_NOT_FOUND",
                errorMessage: "User not found." 
            }, { status: 404 });
        }

        // Only update Auth if Auth fields are present
        if (password || email || phoneNumber) {
            await AuthService.updateUser(uid, { 
                ...(password && { password }), 
                ...(email && { email }), 
                ...(phoneNumber && { phoneNumber }) 
            });
        }

        // Prepare Firestore update data
        const firestoreUpdateData = { ...updateData };
        if (cart !== undefined) {
            firestoreUpdateData.cart = cart;
            consoleManager.log("🛒 Updating cart for user:", uid, "Cart items:", Array.isArray(cart) ? cart.length : 'invalid cart data');
        }

        // Always update Firestore (profile fields)
        await AuthService.updateUserInFirestore(uid, firestoreUpdateData);
        
        consoleManager.log("✅ User updated successfully:", uid);
        
        return NextResponse.json({ 
            statusCode: 200, 
            message: "User updated successfully",
            errorCode: "NO",
            errorMessage: "",
            data: { uid, updated: true }
        }, { status: 200 });
    } catch (error) {
        consoleManager.error("❌ Error in PATCH /api/auth:", error.message);
        return NextResponse.json({ 
            statusCode: 500, 
            errorCode: "UPDATE_FAILED",
            errorMessage: error.message || "Failed to update user" 
        }, { status: 500 });
    }
}

// GET (fetch users)
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const all = searchParams.get("all");
        const uid = searchParams.get("uid");
        const email = searchParams.get("email");

        if (all) {
            // Fetch all users from Firestore
            const snapshot = await db.collection("users").get();
            const users = snapshot.docs.map((doc) => ({ uid: doc.id, ...doc.data() }));
            return NextResponse.json({
                statusCode: 200,
                data: users,
                errorCode: "NO",
                errorMessage: "",
            }, { status: 200 });
        } else if (uid) {
            // Fetch single user by uid
            const doc = await db.collection("users").doc(uid).get();
            if (!doc.exists) {
                return NextResponse.json({
                    statusCode: 404,
                    errorCode: "NOT_FOUND",
                    errorMessage: "User not found",
                }, { status: 404 });
            }
            return NextResponse.json({
                statusCode: 200,
                data: { uid: doc.id, ...doc.data() },
                errorCode: "NO",
                errorMessage: "",
            }, { status: 200 });
        } else if (email) {
            // Fetch single user by email
            const snapshot = await db.collection("users").where("email", "==", email).get();
            if (snapshot.empty) {
                return NextResponse.json({
                    statusCode: 404,
                    errorCode: "NOT_FOUND",
                    errorMessage: "User not found",
                }, { status: 404 });
            }
            const doc = snapshot.docs[0];
            return NextResponse.json({
                statusCode: 200,
                data: { uid: doc.id, ...doc.data() },
                errorCode: "NO",
                errorMessage: "",
            }, { status: 200 });
        } else {
            return NextResponse.json({
                statusCode: 400,
                errorCode: "BAD_REQUEST",
                errorMessage: "Missing query parameter",
            }, { status: 400 });
        }
    } catch (error) {
        return NextResponse.json({
            statusCode: 500,
            errorCode: "INTERNAL_ERROR",
            errorMessage: error.message || "Internal Server Error",
        }, { status: 500 });
    }
}