// lib/utils/formParser.ts
import { Readable } from "stream";
import { IncomingMessage } from "http";
import formidable, { Fields, Files } from "formidable";
import { NextRequest } from "next/server";

// Parse multipart form-data from NextRequest
export async function parseFormData(req: NextRequest): Promise<{ fields: Fields; files: Files }> {
    const form = formidable({ multiples: true, keepExtensions: true });

    // Convert request body to stream
    const buffer = await req.arrayBuffer();
    const stream = Readable.from(Buffer.from(buffer));

    // 🔧 Fake IncomingMessage by attaching headers/method/url
    const fakeReq = Object.assign(stream, {
        headers: Object.fromEntries(req.headers.entries()),
        method: req.method,
        url: "", // optional
    }) as unknown as IncomingMessage;

    return new Promise((resolve, reject) => {
        form.parse(fakeReq, (err, fields, files) => {
            if (err) return reject(err);
            resolve({ fields, files });
        });
    });
}

// Normalize form field to string
export function normalizeField(field?: string | string[]): string {
    return Array.isArray(field) ? field[0] : field || "";
}
