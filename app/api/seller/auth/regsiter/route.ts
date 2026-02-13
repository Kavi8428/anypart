import { NextResponse } from 'next/server';
import { createSeller } from '@/lib/seller';

export async function POST(request: Request) {
    try {
        const body = await request.json();

        // This keeps data base calls away (it is inside lib/seller.ts)
        const result = await createSeller({
            name: body.name,
            br_number: body.br_number,
            address: body.address,
            city: body.city,
            district: body.disctrict,
            tel1: body.tel1,
            tel2: body.tel2,
            seller_type: body.seller_type,
            user_name: body.user_name,
            password: body.password // Would verify hash here
        });

        if (result.error) {
            return NextResponse.json({ message: result.error }, { status: 400 });
        }

        return NextResponse.json({
            message: 'Registration successful!',
            seller: { id: result.seller?.id, name: result.seller?.name }
        }, { status: 201 });

    } catch {
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
}
