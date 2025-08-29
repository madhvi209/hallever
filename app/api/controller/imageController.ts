import sharp from "sharp";
import { adminStorage } from "../config/firebase";


const UploadImage = async (file: File): Promise<string> => {
    try {
        // Removed file size limit check
        const arrayBuffer = await file.arrayBuffer(); // Convert Blob to ArrayBuffer
        const buffer = Buffer.from(arrayBuffer); // Convert to Buffer

        const bucket = adminStorage.bucket();
        const filePath = `hallever/${Date.now()}_${file.name}`;
        const firebaseFile = bucket.file(filePath);


        const resizedBuffer = await sharp(buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer();

        const blobStream = firebaseFile.createWriteStream({
            metadata: { contentType: file.type },
        });

        return new Promise((resolve, reject) => {
            blobStream.on("error", reject);
            blobStream.on("finish", async () => {
                const [url] = await firebaseFile.getSignedUrl({ action: "read", expires: "03-09-2491" });
                resolve(url);
            });
            blobStream.end(resizedBuffer);
        });
    } catch (error) {
        throw new Error("Error uploading image: " + error.message);
    }
};


const ReplaceImage = async (newFile: File, oldImageUrl: string): Promise<string> => {
    try {
        const bucket = adminStorage.bucket();
        const baseUrl = `https://storage.googleapis.com/${bucket.name}/`;

        // Step 1: Delete old image
        if (oldImageUrl?.startsWith(baseUrl)) {
            const filePath = oldImageUrl.replace(baseUrl, "");
            await bucket.file(filePath).delete().catch(() => { });
        }

        // ✅ Use arrayBuffer for File object (from formData)
        const arrayBuffer = await newFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const resizedBuffer = await sharp(buffer)
            .resize({ width: 1200, withoutEnlargement: true })
            .jpeg({ quality: 80 })
            .toBuffer();

        const filePath = `hallever/${Date.now()}_${newFile.name}`;
        const firebaseFile = bucket.file(filePath);

        const blobStream = firebaseFile.createWriteStream({
            metadata: { contentType: newFile.type },
        });

        return new Promise((resolve, reject) => {
            blobStream.on("error", reject);
            blobStream.on("finish", async () => {
                const [url] = await firebaseFile.getSignedUrl({
                    action: "read",
                    expires: "03-09-2491",
                });
                resolve(url);
            });
            blobStream.end(resizedBuffer);
        });

    } catch (error) {
        console.error("ReplaceImage Error:", error);
        throw new Error("Error replacing image: " + error.message);
    }
};

const DeleteImage = async (imageUrl: string): Promise<void> => {
    try {
        if (!imageUrl) return;
        const bucket = adminStorage.bucket();
        const baseUrl = `https://storage.googleapis.com/${bucket.name}/`;

        if (imageUrl.startsWith(baseUrl)) {
            const filePath = imageUrl.replace(baseUrl, "");
            await bucket.file(filePath).delete().catch(() => { });
        }
    } catch (error) {
        console.error("DeleteImage Error:", error);
    }
};

export { UploadImage, ReplaceImage, DeleteImage };  