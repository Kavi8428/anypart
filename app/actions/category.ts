'use server';

import { prisma } from '@/lib/prisma';
import { unstable_cache } from 'next/cache';

// Cache configuration
const CACHE_TAGS = {
    BRANDS: 'brands',
    MODELS: 'models',
    YEARS: 'years',
    PARTS: 'parts'
};

const REVALIDATE_TIME = 3600; // 1 hour

export const getBrands = unstable_cache(
    async () => {
        try {
            const brands = await prisma.v_brands.findMany({
                orderBy: { name: 'asc' },
            });
            return brands;
        } catch (error) {
            console.error('Error fetching brands:', error);
            return [];
        }
    },
    ['get-brands'],
    {
        tags: [CACHE_TAGS.BRANDS],
        revalidate: REVALIDATE_TIME
    }
);

export async function getBrandDetails(brandId: number) {
    try {
        const brand = await prisma.v_brands.findUnique({
            where: { id: brandId },
        });
        return brand;
    } catch (error) {
        console.error(`Error fetching brand details for ID ${brandId}:`, error);
        return null;
    }
}

export const getModelsByBrand = unstable_cache(
    async (brandId: number) => {
        try {
            // Group by name to show unique model names
            const models = await prisma.v_models.groupBy({
                by: ['name'],
                where: {
                    v_brand: brandId,
                },
                orderBy: {
                    name: 'asc',
                },
                _count: {
                    _all: true
                }
            });

            // We might want to fetch one example to get a description if needed, 
            // but groupBy results only contain the grouped fields.
            return models;
        } catch (error) {
            console.error('Error fetching models:', error);
            return [];
        }
    },
    ['get-models-by-brand'],
    {
        tags: [CACHE_TAGS.MODELS],
        revalidate: REVALIDATE_TIME
    }
);

export const getYearsByModelName = unstable_cache(
    async (brandId: number, modelName: string) => {
        try {
            // Find all 'v_models' entries that match the brand and name
            // effectively finding all year variants for this model
            const variants = await prisma.v_models.findMany({
                where: {
                    v_brand: brandId,
                    name: modelName,
                },
                include: {
                    v_years: true,
                },
                orderBy: {
                    v_years: {
                        year: 'desc',
                    },
                },
            });

            // Map to a cleaner structure: { vModelId, year, yearId }
            return variants
                .filter(v => v.v_years) // Ensure v_years exists
                .map(v => ({
                    vModelId: v.id,
                    year: v.v_years!.year,
                    yearId: v.v_years!.id
                }));
        } catch (error) {
            console.error('Error fetching years for model:', error);
            return [];
        }
    },
    ['get-years-by-model'],
    {
        tags: [CACHE_TAGS.YEARS],
        revalidate: REVALIDATE_TIME
    }
);

export async function getVModelDetails(vModelId: number) {
    try {
        const vModel = await prisma.v_models.findUnique({
            where: { id: vModelId },
            include: {
                v_years: true,
                v_brands: true
            }
        });
        return vModel;
    } catch (error) {
        console.error('Error fetching v_model details:', error);
        return null;
    }
}

export async function getPartNamesByVModel(vModelId: number, yearId?: number) {
    try {
        // Find products for this specific vehicle model and optinally specific year
        const products = await prisma.seller_products.findMany({
            where: {
                v_model: vModelId,
                deleted_at: null,
                ...(yearId && { v_year: yearId })
            },
            include: {
                p_name_ref: {
                    include: {
                        p_brands: true
                    }
                }
            },
            distinct: ['p_name'], // Distinct by p_name ID
        });

        return products.map(p => p.p_name_ref);
    } catch (error) {
        console.error('Error fetching part names:', error);
        return [];
    }
}

export async function getPartDetails(partId: number) {
    try {
        const part = await prisma.p_names.findUnique({
            where: { id: partId }
        });
        return part;
    } catch (error) {
        console.error('Error fetching part details:', error);
        return null;
    }
}


export async function getProductsByVModelAndPart(vModelId: number, pNameId: number, yearId?: number) {
    try {
        const products = await prisma.seller_products.findMany({
            where: {
                v_model: vModelId,
                p_name: pNameId,
                deleted_at: null,
                ...(yearId && { v_year: yearId })
            },
            include: {
                p_name_ref: true,
                v_model_ref: {
                    include: {
                        v_brands: true,
                        v_years: true
                    }
                },
                v_year_ref: true,
                condition_ref: true,
                seller_details: {
                    select: {
                        id: true,
                        name: true,
                        logo_url: true,
                    }
                },
            },
            orderBy: {
                created_at: 'desc',
            },
        });
        return products;
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}
export async function searchProducts(query: string, brandId?: number) {
    try {
        const products = await prisma.seller_products.findMany({
            where: {
                deleted_at: null,
                AND: [
                    brandId ? { v_model_ref: { v_brand: brandId } } : {},
                    {
                        OR: [
                            { p_name_ref: { name: { contains: query } } },
                            { hash_tag_1_ref: { name: { contains: query } } },
                            { hash_tag_2_ref: { name: { contains: query } } },
                            { hash_tag_3_ref: { name: { contains: query } } },
                            { v_model_ref: { name: { contains: query } } },
                            { description: { contains: query } },
                        ],
                    },
                ],
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
                seller_details: {
                    select: {
                        id: true,
                        name: true,
                        logo_url: true,
                    }
                },
            },
            orderBy: {
                created_at: "desc",
            },
        })
        return products
    } catch (error) {
        console.error("Error searching products:", error)
        return []
    }
}
