import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSellerSession } from "@/lib/auth";

// GET /api/products/[id] - Get a specific product
export async function GET(request, { params }) {
    const { id } = await params;
    const session = await getSellerSession();

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const product = await prisma.seller_products.findUnique({
            where: {
                id: parseInt(id),
                seller_id: session.seller_id,
            },
            include: {
                p_name_ref: true,
                v_model_ref: {
                    include: {
                        v_brands: true,
                    },
                },
                v_year_ref: true,
                condition_ref: true,
            },
        });

        if (!product) {
            return NextResponse.json({ message: "Product not found" }, { status: 404 });
        }

        return NextResponse.json(product);
    } catch (error) {
        console.error("Error fetching product:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// PUT /api/products/[id] - Update a product
export async function PUT(request, { params }) {
    const { id } = await params;
    const session = await getSellerSession();
    const body = await request.json();

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const product = await prisma.seller_products.updateMany({
            where: {
                id: parseInt(id),
                seller_id: session.seller_id,
            },
            data: {
                ...body,
                updated_at: new Date(),
            },
        });

        if (product.count === 0) {
            return NextResponse.json({ message: "Product not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ message: "Product updated successfully" });
    } catch (error) {
        console.error("Error updating product:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

// DELETE /api/products/[id] - Delete a product
export async function DELETE(request, { params }) {
    const { id } = await params;
    const session = await getSellerSession();

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const product = await prisma.seller_products.deleteMany({
            where: {
                id: parseInt(id),
                seller_id: session.seller_id,
            },
        });

        if (product.count === 0) {
            return NextResponse.json({ message: "Product not found or unauthorized" }, { status: 404 });
        }

        return NextResponse.json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}
