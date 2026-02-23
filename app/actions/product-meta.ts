'use server';

import { prisma } from '@/lib/prisma';

export async function getProductMetaData() {
    try {
        const [pNames, vModels, conditions, tags, vYears, featuredPriceRecord] = await Promise.all([
            prisma.p_names.findMany({
                orderBy: { name: 'asc' },
                select: {
                    id: true,
                    name: true,
                    part_brand: true,
                    p_brands: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
            }),
            prisma.v_models.findMany({
                include: { v_brands: true },
                orderBy: { name: 'asc' },
            }),
            prisma.conditions.findMany({
                orderBy: { status: 'asc' },
            }),
            prisma.hash_tags.findMany({
                orderBy: { name: 'asc' },
            }),
            prisma.v_years.findMany({
                orderBy: { year: 'desc' },
            }),
            prisma.promotion_price_list.findFirst({
                where: {
                    OR: [
                        {
                            promotions: {
                                name: {
                                    contains: 'Featured',
                                }
                            }
                        },
                        {
                            description: {
                                contains: 'Featured',
                            }
                        }
                    ]
                },
                orderBy: {
                    created_at: 'desc'
                },
                select: {
                    price: true
                }
            })
        ]);

        return {
            pNames,
            vModels,
            conditions,
            tags,
            vYears,
            featuredPrice: featuredPriceRecord?.price || 5000,
        };
    } catch (error) {
        console.error('Error fetching product meta data:', error);
        return {
            pNames: [],
            vModels: [],
            conditions: [],
            tags: [],
            vYears: [],
            featuredPrice: 5000,
        };
    }
}
