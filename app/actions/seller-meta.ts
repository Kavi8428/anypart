'use server';
import { prisma } from '@/lib/prisma';

export async function getSellerMetadata() {
    try {
        const [districts, cities, sellerTypes] = await Promise.all([
            prisma.disctricts.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
            prisma.cities.findMany({ select: { id: true, name: true, disctrict_id: true }, orderBy: { name: 'asc' } }),
            prisma.seller_types.findMany({ select: { id: true, type: true }, orderBy: { type: 'asc' } }),
        ]);
        return { districts, cities, sellerTypes };
    } catch (error) {
        console.error('Error fetching seller metadata:', error);
        return { districts: [], cities: [], sellerTypes: [] };
    }
}
