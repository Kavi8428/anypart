import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

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
    password: string;
}

export async function createSeller(data: SellerRegistrationData) {
    try {
        // 1. Sanitize phone
        const sanitizedTel1 = data.tel1;

        // 2. Check duplicates
        const existing = await prisma.seller_details.findFirst({
            where: {
                OR: [
                    { user_name: data.user_name },
                    { tel1: sanitizedTel1 }
                ]
            }
        });

        if (existing) {
            const field = existing.user_name === data.user_name ? 'Username' : 'Phone number';
            return { error: `${field} already registered.` };
        }

        // 3. Hash Password
        const hashedPassword = await bcrypt.hash(data.password, 10);

        // 4. Create Record
        const newSeller = await prisma.seller_details.create({
            data: {
                name: data.name,
                br_number: data.br_number || null,
                address: data.address,
                city: data.city,
                district: data.district,
                tel1: sanitizedTel1,
                tel2: data.tel2 || null,
                seller_type: data.seller_type,
                user_name: data.user_name,
                password: hashedPassword,
                verified: 0,
            }
        });

        return { success: true, seller: newSeller };

    } catch (error) {
        console.error('Create Seller Error:', error);
        return { error: 'An unexpected error occurred.' };
    }
}

