'use server';

import { prisma } from '@/lib/prisma';
import { getSellerSession } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function updateSellerProfile(prevState: unknown, formData: FormData) {
    const session = await getSellerSession();
    if (!session) {
        return { message: 'Unauthorized', type: 'error' };
    }

    // Get form fields
    const name = formData.get('name') as string;
    const br_number = formData.get('br_number') as string;
    const address = formData.get('address') as string;
    const tel1 = formData.get('tel1') as string;
    const tel2 = formData.get('tel2') as string;
    const city = formData.get('city') as string;
    const district = formData.get('district') as string;

    if (!name || !address || !tel1) {
        return { message: 'Name, Address, and Primary Phone are required.', type: 'error' };
    }

    try {
        await prisma.seller_details.update({
            where: { id: session.seller_details.id },
            data: {
                name,
                br_number: br_number || null,
                address,
                tel1,
                tel2: tel2 || null,
                city: city ? parseInt(city, 10) : null,
                district: district ? parseInt(district, 10) : null,
            },
        });

        revalidatePath('/seller/settings/profile');
        return { message: 'Profile updated successfully!', type: 'success' };
    } catch (error) {
        console.error('Error updating profile:', error);
        return { message: 'Failed to update profile. Please try again.', type: 'error' };
    }
}
