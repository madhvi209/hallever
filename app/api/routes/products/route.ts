import { NextRequest, NextResponse } from "next/server";
import { parseFormData, normalizeField } from "@/lib/utils/parserForm";
import { UploadMultipleImages } from "@/lib/utils/imageController";
import ProductService from "@/app/api/services/productServices";
import consoleManager from "@/app/api/utils/consoleManager";
import { ProductItem } from "@/lib/redux/slice/productSlice";

export const config = {
    api: {
        bodyParser: false,
    },
};

// Define valid category options
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

// Type guard
function isValidCategory(value: string): value is Category {
    return VALID_CATEGORIES.includes(value as Category);
}

// ✅ POST: Add a new product
export async function POST(req: NextRequest) {
    try {
        const { fields, files } = await parseFormData(req);

        const name = normalizeField(fields.name);
        const summary = normalizeField(fields.summary);
        const wattage = normalizeField(fields.wattage);
        const price = normalizeField(fields.price);
        const categoryInput = normalizeField(fields.category);
        const subCategory = normalizeField(fields.subCategory); // ✅ New sub-category field
        const link = normalizeField(fields.link);

        // Validate required fields
        if (!name || !summary || !wattage || !price || !categoryInput) {
            return NextResponse.json(
                {
                    statusCode: 400,
                    errorCode: "MISSING_FIELDS",
                    errorMessage: "name, summary, wattage, price, and category are required",
                },
                { status: 400 }
            );
        }

        // Validate category
        if (!isValidCategory(categoryInput)) {
            return NextResponse.json(
                {
                    statusCode: 400,
                    errorCode: "INVALID_CATEGORY",
                    errorMessage: `Invalid category: ${categoryInput}`,
                },
                { status: 400 }
            );
        }

        // Handle image uploads
        const imageFiles = Array.isArray(files.images)
            ? files.images
            : files.images
                ? [files.images]
                : [];

        const uploadedImageUrls =
            imageFiles.length > 0 ? await UploadMultipleImages(imageFiles) : [];

        // ✅ Build product object
        const product: Omit<ProductItem, "id" | "createdOn" | "updatedOn"> = {
            name,
            summary,
            wattage,
            price: parseFloat(price),
            link,
            images: uploadedImageUrls,
            category: categoryInput,
            subCategory, // ✅ Store sub-category
            specifications: {
                dimensions: normalizeField(fields.dimensions),
                voltage: normalizeField(fields.voltage),
                efficiency: normalizeField(fields.efficiency),
                warranty: normalizeField(fields.warranty),
            },
        };

        // Save and return
        await ProductService.addProduct(product);
        const allProducts = await ProductService.getAllProducts();

        return NextResponse.json({
            statusCode: 200,
            message: "Product added successfully",
            data: allProducts,
            errorCode: "NO",
            errorMessage: "",
        });
    } catch (error) {
        consoleManager.error("PRODUCT_POST_ERROR", error);
        return NextResponse.json(
            {
                statusCode: 500,
                errorCode: "INTERNAL_ERROR",
                errorMessage: error instanceof Error ? error.message : "Internal Server Error",
            },
            { status: 500 }
        );
    }
}

// ✅ GET: Get all products
export async function GET() {
    try {
        const products = await ProductService.getAllProducts();
        return NextResponse.json({
            statusCode: 200,
            message: "Products fetched successfully",
            data: products,
            errorCode: "NO",
            errorMessage: "",
        });
    } catch (error) {
        consoleManager.error("PRODUCT_GET_ERROR", error);
        return NextResponse.json(
            {
                statusCode: 500,
                errorCode: "INTERNAL_ERROR",
                errorMessage: error instanceof Error ? error.message : "Internal Server Error",
            },
            { status: 500 }
        );
    }
}
