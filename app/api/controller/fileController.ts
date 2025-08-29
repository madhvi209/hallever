
import { bucket } from "@/app/api/config/firebase";
import { v4 as uuidv4 } from 'uuid';

export async function uploadFile(file: File): Promise<string> {
    const filename = `resumes/${uuidv4()}_${file.name}`;
    const fileUpload = bucket.file(filename);

    const buffer = Buffer.from(await file.arrayBuffer());

    await fileUpload.save(buffer, {
        metadata: {
            contentType: file.type,
            cacheControl: "public, max-age=31536000",
        },
        public: true,
    });

    return `https://storage.googleapis.com/${bucket.name}/${filename}`;
}
