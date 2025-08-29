import { NextRequest, NextResponse } from "next/server";
import { normalizeField, parseFormData } from "@/lib/utils/parserForm";
import { UploadMultipleImages, replaceImages } from "@/lib/utils/imageController";
import ProductService from "@/app/api/services/productServices";
import { ProductItem } from "@/lib/redux/slice/productSlice";

// ✅ Allowed categories
const VALID_CATEGORIES = [
    "Indoor",
    "Outdoor",
    "Tent Decoration",
    "Raw Materials",
    "Machinery",
    "Solar Lights",
    "Others",
] as const;
type Category = typeof VALID_CATEGORIES[number];

function isValidCategory(value: string): value is Category {
    return VALID_CATEGORIES.includes(value as Category);
}

// ✅ GET product by ID
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const product = await ProductService.getProductById(id);

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product, { status: 200 });
    } catch (error) {
        console.error("GET product error:", error);
        return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
    }
}

// ✅ PUT - Update product by ID
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const { fields, files } = await parseFormData(req);

        const name = normalizeField(fields.name);
        const summary = normalizeField(fields.summary);
        const price = normalizeField(fields.price);
        const wattage = normalizeField(fields.wattage);
        const link = normalizeField(fields.link);
        const dimensions = normalizeField(fields.dimensions);
        const voltage = normalizeField(fields.voltage);
        const efficiency = normalizeField(fields.efficiency);
        const warranty = normalizeField(fields.warranty);
        const categoryInput = normalizeField(fields.category);
        const subCategory = normalizeField(fields.subCategory); // ✅ New field

        // ✅ Validate category
        if (!isValidCategory(categoryInput)) {
            return NextResponse.json({ error: "Invalid category" }, { status: 400 });
        }

        const updatedFields: Partial<ProductItem> = {
            name,
            summary,
            price: price ? parseFloat(price) : undefined,
            wattage,
            link,
            category: categoryInput,
            subCategory, // ✅ Include subCategory in update
            specifications: {
                dimensions,
                voltage,
                efficiency,
                warranty,
            },
            updatedOn: Date.now(),
        };

        // 🔁 Handle image deletion and replacement
        const existingImagesRaw = fields.existingImages;
        const imagesToDeleteRaw = fields.imagesToDelete;

        let finalImages: string[] = Array.isArray(existingImagesRaw)
            ? existingImagesRaw
            : JSON.parse(existingImagesRaw || "[]");

        const toDelete: string[] = Array.isArray(imagesToDeleteRaw)
            ? imagesToDeleteRaw
            : JSON.parse(imagesToDeleteRaw || "[]");

        finalImages = await replaceImages(finalImages, toDelete);

        const newFiles = files?.images;
        if (newFiles) {
            const newImageUrls = await UploadMultipleImages(Array.isArray(newFiles) ? newFiles : [newFiles]);
            finalImages = [...finalImages, ...newImageUrls];
        }

        updatedFields.images = finalImages;

        await ProductService.updateProduct(id, updatedFields);

        return NextResponse.json({ message: "Product updated successfully" }, { status: 200 });
    } catch (error) {
        console.error("PUT product error:", error);
        return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
    }
}

// ✅ DELETE product by ID
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const product = await ProductService.getProductById(id);

        if (!product) {
            return NextResponse.json({ error: "Product not found" }, { status: 404 });
        }

        // 🔥 Delete all associated images
        await replaceImages(product.images || [], product.images || []);
        await ProductService.deleteProduct(id);

        return NextResponse.json({ message: "Product deleted successfully" }, { status: 200 });
    } catch (error) {
        console.error("DELETE product error:", error);
        return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
}
