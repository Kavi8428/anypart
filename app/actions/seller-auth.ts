'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSeller } from '@/lib/seller';

interface FormState {
    message: string;
    errors: Record<string, string[]>;
}

export async function sellerLogin(prevState: FormState | null, formData: FormData) {
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;

    if (!phone || !password) {
        return { message: 'Please enter both phone number and password.', errors: {} };
    }

    try {
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        const response = await fetch(`${baseUrl}/api/seller/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ phone, password }),
        });

        const data = await response.json();

        if (!response.ok) {
            return { message: data.message || 'Login failed.', errors: {} };
        }

        // Set cookie on the server side (Server Action)
        const cookieStore = await cookies();
        cookieStore.set('seller_session', data.token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires: new Date(data.expiry),
            path: '/',
            sameSite: 'lax',
        });

    } catch (error) {
        console.error('Seller login action error:', error);
        return { message: 'Something went wrong. Please try again.', errors: {} };
    }

    // Redirect on success
    redirect('/seller');
}

export async function sellerLogout() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('seller_session')?.value;
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

        if (token) {
            // Call API to remove session
            await fetch(`${baseUrl}/api/seller/auth/logout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token }),
            });
        }

        // Clear cookie
        cookieStore.delete('seller_session');
    } catch (error) {
        console.error('Logout error:', error);
    } finally {
        redirect('/seller/login');
    }
}

export async function sellerRegister(prevState: FormState | null, formData: FormData) {
    const name = formData.get('name') as string;
    const br_number = formData.get('br_number') as string;
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const disctrict = formData.get('district') as string;
    const tel1 = formData.get('tel1') as string;
    const tel2 = formData.get('tel2') as string;
    const seller_type = formData.get('seller_type') as string;
    const password = formData.get('password') as string;
    const confirm_password = formData.get('confirm_password') as string;

    // 1. Basic Validation
    if (!name || !address || !tel1 || !password) {
        return { message: 'Please fill in all required fields.', errors: {} };
    }

    if (password !== confirm_password) {
        return { message: 'Passwords do not match.', errors: {} };
    }

    try {
        // Here we call the "API Endpoint Logic" (Service) directly
        // This avoids fetch() but keeps the DB logic centralized
        const result = await createSeller({
            name,
            br_number: br_number || null,
            address,
            city: city ? parseInt(city) : null,
            district: disctrict ? parseInt(disctrict) : null,
            tel1,
            tel2,
            seller_type: seller_type ? parseInt(seller_type) : null,
            user_name: tel1, // Use phone number as username
            password
        });

        if (result.error) {
            return { message: result.error, errors: {} };
        }

        return { message: 'success: Registration successful! Redirecting to login...', errors: {} };

    } catch (error) {
        console.error('Seller registration error:', error);
        return { message: 'Something went wrong. Please try again.', errors: {} };
    }
}

export async function sendSellerOTP(phone: string) {
    // Mock OTP sending
    console.log(`Sending OTP to ${phone}`);
    // In production, integrate with SMS gateway here
    return { success: true, message: 'OTP sent successfully' };
}

export async function verifySellerOTP(phone: string, otp: string) {
    // Mock OTP verification (123456)
    if (otp === '123456') {
        return { success: true, message: 'OTP verified' };
    }
    return { success: false, message: 'Invalid OTP' };
}
