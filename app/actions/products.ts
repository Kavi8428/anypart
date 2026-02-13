'use server';

import { prisma } from '@/lib/prisma';
import { getSellerSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { existsSync } from 'node:fs';

async function saveImage(file: File | null): Promise<string | null> {
    if (!file || !(file instanceof File) || file.size === 0) return null;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const uniqueId = Math.random().toString(36).substring(2, 10);
    const filename = `${Date.now()}_${uniqueId}_${file.name.replace(/\s+/g, '_')}`;

    const uploadDir = join(process.cwd(), 'public', 'products');

    // Ensure directory exists
    if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true });
    }

    const path = join(uploadDir, filename);
    await writeFile(path, buffer);

    return filename;
}

export async function getProducts() {
    const session = await getSellerSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    try {
        const products = await prisma.seller_products.findMany({
            where: {
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
                hash_tag_1_ref: true,
                hash_tag_2_ref: true,
                hash_tag_3_ref: true,
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        throw new Error('Failed to fetch products');
    }
}

export async function saveProduct(formData: FormData) {
    const session = await getSellerSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    const parseOptionalInt = (val: string | null) => {
        if (!val || val === "" || val === "undefined" || val === "none") return null;
        const parsed = parseInt(val);
        return isNaN(parsed) ? null : parsed;
    };

    const p_name = parseInt(formData.get('p_name') as string);
    const v_model = parseInt(formData.get('v_model') as string);
    const v_year = parseInt(formData.get('v_year') as string);
    const price = parseFloat(formData.get('price') as string);
    const condition = parseOptionalInt(formData.get('condition') as string);
    const description = formData.get('description') as string;

    // Handle File uploads
    const img1 = formData.get('image_url_1') as File | null;
    const img2 = formData.get('image_url_2') as File | null;
    const img3 = formData.get('image_url_3') as File | null;

    const image_url_1 = await saveImage(img1) || "placeholder.jpg";
    const image_url_2 = await saveImage(img2);
    const image_url_3 = await saveImage(img3);

    const hash_tag_1 = parseInt(formData.get('hash_tag_1') as string);
    const hash_tag_2 = parseOptionalInt(formData.get('hash_tag_2') as string);
    const hash_tag_3 = parseOptionalInt(formData.get('hash_tag_3') as string);
    const is_featured = formData.get('is_featured') === 'on' ? 1 : (formData.get('is_featured') === '1' ? 1 : 0);
    const order_id = formData.get('order_id') as string;

    let payment_id: number | null = null;
    if (order_id) {
        const payment = await prisma.seller_payments.findFirst({
            where: { order_id }
        });
        if (payment) payment_id = payment.id;
    }

    try {
        await prisma.seller_products.create({
            data: {
                seller_id: session.seller_id,
                p_name,
                v_model,
                v_year,
                price,
                condition,
                description,
                image_url_1,
                image_url_2,
                image_url_3,
                hash_tag_1,
                hash_tag_2,
                hash_tag_3,
                is_featured,
                payment_id,
            },
        });
        revalidatePath('/seller/products');
        return { success: true };
    } catch (error) {
        console.error('Error saving product:', error);
        throw new Error('Failed to save product');
    }
}

export async function updateProduct(id: number, formData: FormData) {
    const session = await getSellerSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    const parseOptionalInt = (val: string | null) => {
        if (!val || val === "" || val === "undefined" || val === "none") return null;
        const parsed = parseInt(val);
        return isNaN(parsed) ? null : parsed;
    };

    const p_name = parseInt(formData.get('p_name') as string);
    const v_model = parseInt(formData.get('v_model') as string);
    const v_year = parseInt(formData.get('v_year') as string);
    const price = parseFloat(formData.get('price') as string);
    const condition = parseOptionalInt(formData.get('condition') as string);
    const description = formData.get('description') as string;

    // Handle File uploads
    const img1 = formData.get('image_url_1') as File | null;
    const img2 = formData.get('image_url_2') as File | null;
    const img3 = formData.get('image_url_3') as File | null;

    const new_image_url_1 = await saveImage(img1);
    const new_image_url_2 = await saveImage(img2);
    const new_image_url_3 = await saveImage(img3);

    const order_id = formData.get('order_id') as string;
    let payment_id: number | null = null;
    if (order_id) {
        const payment = await prisma.seller_payments.findFirst({
            where: { order_id }
        });
        if (payment) payment_id = payment.id;
    }

    interface ProductUpdateData {
        p_name: number;
        v_model: number;
        v_year: number;
        price: number;
        condition: number | null;
        description: string;
        hash_tag_1: number;
        hash_tag_2: number | null;
        hash_tag_3: number | null;
        is_featured: number;
        image_url_1?: string;
        image_url_2?: string | null;
        image_url_3?: string | null;
        payment_id?: number | null;
    }

    const data: ProductUpdateData = {
        p_name,
        v_model,
        v_year,
        price,
        condition,
        description,
        hash_tag_1: parseInt(formData.get('hash_tag_1') as string),
        hash_tag_2: parseOptionalInt(formData.get('hash_tag_2') as string),
        hash_tag_3: parseOptionalInt(formData.get('hash_tag_3') as string),
        is_featured: formData.get('is_featured') === 'on' ? 1 : (formData.get('is_featured') === '1' ? 1 : 0),
    };

    if (new_image_url_1) data.image_url_1 = new_image_url_1;
    if (new_image_url_2) data.image_url_2 = new_image_url_2;
    if (new_image_url_3) data.image_url_3 = new_image_url_3;
    if (payment_id) data.payment_id = payment_id;

    try {
        await prisma.seller_products.update({
            where: {
                id,
                seller_id: session.seller_id,
            },
            data,
        });
        revalidatePath('/seller/products');
        return { success: true };
    } catch (error) {
        console.error('Error updating product:', error);
        throw new Error('Failed to update product');
    }
}

export async function deleteProduct(id: number) {
    const session = await getSellerSession();
    if (!session) {
        throw new Error('Unauthorized');
    }

    try {
        await prisma.seller_products.delete({
            where: {
                id,
                seller_id: session.seller_id,
            },
        });
        revalidatePath('/seller/products');
        return { success: true };
    } catch (error) {
        console.error('Error deleting product:', error);
        throw new Error('Failed to delete product');
    }
}
