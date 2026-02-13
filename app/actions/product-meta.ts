'use server';

import { prisma } from '@/lib/prisma';

export async function getProductMetaData() {
    try {
        const [pNames, vModels, conditions, tags, vYears] = await Promise.all([
            prisma.p_names.findMany({
                orderBy: { name: 'asc' },
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
        ]);

        return {
            pNames,
            vModels,
            conditions,
            tags,
            vYears,
        };
    } catch (error) {
        console.error('Error fetching product meta data:', error);
        return {
            pNames: [],
            vModels: [],
            conditions: [],
            tags: [],
            vYears: [],
        };
    }
}
