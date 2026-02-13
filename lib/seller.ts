import { prisma } from '@/lib/prisma';

export interface SellerRegistrationData {
    name: string;
    br_number: string | null;
    address: string;
    city: number | null;
    district: number | null;
    tel1: string;
    tel2: string | null;
    seller_type: number | null;
    user_name: string;
    password: string; // Should be hashed in production
}

export async function createSeller(data: SellerRegistrationData) {
    try {
        // 1. Sanitize phone
        const sanitizedTel1 = data.tel1.replace(/^0/, '');
        const phoneInt = parseInt(sanitizedTel1, 10);

        if (isNaN(phoneInt)) {
            return { error: 'Invalid phone number format.' };
        }

        // 2. Check duplicates
        const existing = await prisma.seller_details.findFirst({
            where: {
                OR: [
                    { user_name: data.user_name },
                    { tel1: phoneInt }
                ]
            }
        });

        if (existing) {
            const field = existing.user_name === data.user_name ? 'Username' : 'Phone number';
            return { error: `${field} already registered.` };
        }

        // 3. ID Generation
        const lastSeller = await prisma.seller_details.findFirst({
            orderBy: { id: 'desc' },
            select: { id: true }
        });
        const nextId = (lastSeller?.id || 0) + 1;

        // 4. Create Record
        const newSeller = await prisma.seller_details.create({
            data: {
                id: nextId,
                name: data.name,
                br_number: data.br_number || null,
                address: data.address,
                city: data.city,
                disctrict: data.district,
                tel1: phoneInt,
                tel2: data.tel2 ? parseInt(data.tel2) : null,
                seller_type: data.seller_type,
                user_name: data.user_name,
                password: data.password,
                verified: 0,
            }
        });

        return { success: true, seller: newSeller };

    } catch (error) {
        console.error('Create Seller Error:', error);
        return { error: 'An unexpected error occurred.' };
    }
}
