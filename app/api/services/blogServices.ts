import { db } from "@/app/api/config/firebase";
import admin from "firebase-admin";
import { Blog } from "@/lib/redux/slice/blogSlice";

export class BlogService {
    // Add a new blog post
    static async addBlog(blogData: Omit<Blog, "id" | "createdOn" | "updatedOn">): Promise<Blog> {
        try {
            const timestamp = admin.firestore.FieldValue.serverTimestamp();
            const normalizedTitle = blogData.title.toLowerCase().replace(/\s+/g, " ").trim();
            const slug = blogData.title.toLowerCase().replace(/\s+/g, "-").trim();

            const newBlogRef = await db.collection("blogs").add({
                ...blogData,
                titleLower: normalizedTitle,
                slug,
                createdOn: timestamp,
                updatedOn: timestamp,
            });

            const savedDoc = await newBlogRef.get();
            const savedData = savedDoc.data() as Blog;

            return {
                ...savedData,
                id: newBlogRef.id,
            };
        } catch (error) {
            console.error("Error adding blog:", error);
            throw new Error("Failed to add blog");
        }
    }

    // Get all blogs ordered by created date
    static async getAllBlogs(): Promise<Blog[]> {
        try {
            const snapshot = await db.collection("blogs").orderBy("createdOn", "desc").get();
            return snapshot.docs.map((doc) => ({
                ...(doc.data() as Blog),
                id: doc.id,
            }));
        } catch (error) {
            console.error("Error fetching blogs:", error);
            throw new Error("Failed to fetch blogs");
        }
    }

    // Update a blog by ID
    static async updateBlog(id: string, blogData: Partial<Blog>): Promise<Blog | null> {
        try {
            const blogRef = db.collection("blogs").doc(id);
            const doc = await blogRef.get();

            if (!doc.exists) return null;

            const timestamp = admin.firestore.FieldValue.serverTimestamp();
            const updatedData: Partial<Blog> = {
                ...blogData,
                updatedOn: timestamp,
            };

            if (blogData.title) {
                updatedData.titleLower = blogData.title.toLowerCase().replace(/\s+/g, " ").trim();
                updatedData.slug = blogData.title.toLowerCase().replace(/\s+/g, "-").trim();
            }

            await blogRef.update(updatedData);
            const updatedDoc = await blogRef.get();

            return {
                ...(updatedDoc.data() as Blog),
                id: updatedDoc.id,
            };
        } catch (error) {
            console.error("Error updating blog:", error);
            throw new Error("Failed to update blog");
        }
    }

    // Get a single blog by its lowercase title (legacy fallback)
    static async getBlogByTitle(title: string): Promise<Blog | null> {
        try {
            const normalizedTitle = title.toLowerCase().replace(/\s+/g, " ").trim();
            const snapshot = await db.collection("blogs").where("titleLower", "==", normalizedTitle).limit(1).get();

            if (snapshot.empty) return null;

            const doc = snapshot.docs[0];
            return {
                ...(doc.data() as Blog),
                id: doc.id,
            };
        } catch (error) {
            console.error("Error fetching blog by title:", error);
            throw new Error("Failed to fetch blog by title");
        }
    }

    // ✅ New: Get blog by slug (used for public URLs)
    static async getBlogBySlug(slug: string): Promise<Blog | null> {
        try {
            const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "-").trim();
            const snapshot = await db.collection("blogs").where("slug", "==", normalizedSlug).limit(1).get();

            if (snapshot.empty) return null;

            const doc = snapshot.docs[0];
            return {
                ...(doc.data() as Blog),
                id: doc.id,
            };
        } catch (error) {
            console.error("Error fetching blog by slug:", error);
            throw new Error("Failed to fetch blog by slug");
        }
    }

    // Get blog by document ID
    static async getBlogById(id: string): Promise<Blog | null> {
        try {
            const doc = await db.collection("blogs").doc(id).get();
            if (!doc.exists) return null;

            return {
                ...(doc.data() as Blog),
                id: doc.id,
            };
        } catch (error) {
            console.error("Error fetching blog by ID:", error);
            throw new Error("Failed to fetch blog by ID");
        }
    }

    // Delete a blog by its ID
    static async deleteBlog(id: string): Promise<boolean> {
        try {
            await db.collection("blogs").doc(id).delete();
            return true;
        } catch (error) {
            console.error("Error deleting blog:", error);
            return false;
        }
    }
}

export default BlogService;
