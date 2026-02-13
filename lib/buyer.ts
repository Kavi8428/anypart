"use server"

import { prisma } from "@/lib/prisma"

export async function getVehicleBrands() {
    try {
        return await prisma.v_brands.findMany({
            orderBy: { name: "asc" },
            select: { id: true, name: true },
        })
    } catch (error) {
        console.error("Fetch brands error:", error)
        return []
    }
}

export async function getSearchSuggestions(query: string, brandId?: string) {
    if (!query || query.length < 1) return []

    const isBrandFilterActive = brandId && brandId !== "all"

    try {
        const products = await prisma.seller_products.findMany({
            where: {
                AND: [
                    // If brand filter is active, filter by brand
                    isBrandFilterActive
                        ? { v_model_ref: { v_brand: parseInt(brandId) } }
                        : {},
                    {
                        OR: [
                            // 1. Part Name / Product Name
                            { p_name_ref: { name: { contains: query } } },
                            // 2. Hash Tags
                            { hash_tag_1_ref: { name: { contains: query } } },
                            { hash_tag_2_ref: { name: { contains: query } } },
                            { hash_tag_3_ref: { name: { contains: query } } },
                            // 3. Part Brands (Manufacturers of the part itself)
                            { p_name_ref: { p_brands: { name: { contains: query } } } },
                            // 4. Vehicle Models
                            { v_model_ref: { name: { contains: query } } },
                            // 5. Vehicle Brands
                            { v_model_ref: { v_brands: { name: { contains: query } } } },
                            // 6. Finally Description
                            { description: { contains: query } },
                        ],
                    },
                ],
            },
            select: {
                id: true,
                p_name: true,
                v_model: true,
                v_year: true,
                p_name_ref: {
                    select: {
                        id: true,
                        name: true,
                        p_brands: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
                v_model_ref: {
                    select: {
                        id: true,
                        name: true,
                        v_brand: true,
                        year: true,
                        v_brands: {
                            select: {
                                id: true,
                                name: true,
                            },
                        },
                    },
                },
            },
            take: 8,
        })

        // Map and format suggestions
        return products.map((product) => {
            const partName = product.p_name_ref?.name || "Unknown Part"
            const brandName = product.v_model_ref?.v_brands?.name || ""
            const modelName = product.v_model_ref?.name || ""

            return {
                id: product.id,
                label: `${partName}${brandName || modelName ? ` - ${brandName} ${modelName}`.trim() : ""}`,
                // Include navigation data
                brandId: product.v_model_ref?.v_brands?.id,
                modelName: product.v_model_ref?.name,
                vModelId: product.v_model,
                yearId: product.v_model_ref?.year,
                partId: product.p_name,
            }
        })
    } catch (error) {
        console.error("Search error:", error)
        return []
    }
}
