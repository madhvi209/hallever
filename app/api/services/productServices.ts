import { db } from "@/app/api/config/firebase";
import admin from "firebase-admin";
import { ProductItem } from "@/lib/redux/slice/productSlice";

export class ProductService {
    // Add new product
    static async addProduct(productData: Omit<ProductItem, "id" | "createdOn" | "updatedOn">): Promise<ProductItem> {
        try {
            const timestamp = admin.firestore.FieldValue.serverTimestamp();

            const newProductRef = await db.collection("products").add({
                ...productData,
                createdOn: timestamp,
                updatedOn: timestamp,
            });

            const savedDoc = await newProductRef.get();
            const savedData = savedDoc.data() as ProductItem;

            return {
                ...savedData,
                id: newProductRef.id,
            };
        } catch (error) {
            console.error("Error adding product:", error);
            throw new Error("Failed to add product");
        }
    }

    // Get all products
    static async getAllProducts(): Promise<ProductItem[]> {
        try {
            const snapshot = await db.collection("products").orderBy("createdOn", "desc").get();
            return snapshot.docs.map((doc) => ({
                ...(doc.data() as ProductItem),
                id: doc.id,
            }));
        } catch (error) {
            console.error("Error fetching products:", error);
            throw new Error("Failed to fetch products");
        }
    }

    // Get product by ID
    static async getProductById(id: string): Promise<ProductItem | null> {
        try {
            const doc = await db.collection("products").doc(id).get();
            if (!doc.exists) return null;

            return {
                ...(doc.data() as ProductItem),
                id: doc.id,
            };
        } catch (error) {
            console.error("Error fetching product:", error);
            throw new Error("Failed to fetch product by ID");
        }
    }

    // Update a product
    static async updateProduct(id: string, productData: Partial<ProductItem>): Promise<ProductItem | null> {
        try {
            const productRef = db.collection("products").doc(id);
            const doc = await productRef.get();
            if (!doc.exists) return null;

            const timestamp = admin.firestore.FieldValue.serverTimestamp();

            await productRef.update({
                ...productData,
                updatedOn: timestamp,
            });

            const updatedDoc = await productRef.get();
            return {
                ...(updatedDoc.data() as ProductItem),
                id: updatedDoc.id,
            };
        } catch (error) {
            console.error("Error updating product:", error);
            throw new Error("Failed to update product");
        }
    }

    // Delete a product
    static async deleteProduct(id: string): Promise<boolean> {
        try {
            await db.collection("products").doc(id).delete();
            return true;
        } catch (error) {
            console.error("Error deleting product:", error);
            return false;
        }
    }
}

export default ProductService;
