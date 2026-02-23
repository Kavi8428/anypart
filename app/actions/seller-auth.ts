'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSeller } from '@/lib/seller';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { rateLimit } from '@/lib/rate-limit';
import { APP_CONFIG } from '@/lib/config';
import { SellerLoginSchema, SellerRegistrationSchema } from '@/lib/schemas';

interface FormState {
    message: string;
    errors: Record<string, string[]>;
}

export async function sellerLogin(prevState: FormState | null, formData: FormData) {
    const head = await headers();
    const ip = head.get('x-forwarded-for') || 'unknown';
    const origin = head.get('origin');
    const host = head.get('host');

    // Basic CSRF Protection: Check if origin matches host
    if (origin && !origin.includes(host || '')) {
        return { message: 'Invalid request origin.', errors: {} };
    }

    // Rate Limiting
    const limitResult = rateLimit(`login_${ip}`, APP_CONFIG.RATE_LIMIT.LOGIN_ATTEMPTS, APP_CONFIG.RATE_LIMIT.LOGIN_WINDOW_MINUTES * 60 * 1000);
    if (limitResult.isLimited) {
        return { message: `Too many login attempts. Please try again in ${Math.ceil((limitResult.resetTime - Date.now()) / 60000)} minutes.`, errors: {} };
    }

    const rawData = Object.fromEntries(formData.entries());
    const validation = SellerLoginSchema.safeParse(rawData);

    if (!validation.success) {
        return { message: 'Please enter both phone number and password.', errors: {} };
    }

    const { phone, password } = validation.data;

    try {
        const seller = await prisma.seller_details.findUnique({
            where: { user_name: phone },
        });

        if (!seller || !seller.password) {
            return { message: 'Invalid phone number or password.', errors: {} };
        }

        const passwordMatch = await bcrypt.compare(password, seller.password);

        if (!passwordMatch) {
            return { message: 'Invalid phone number or password.', errors: {} };
        }

        // Create session
        const token = randomBytes(32).toString('hex');
        const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

        await prisma.seller_sessions.create({
            data: {
                seller_id: seller.id,
                token: token,
                token_expire_at: expiresAt,
                last_visit_page: '/seller',
            },
        });

        // Set cookie on the server side (Server Action)
        const cookieStore = await cookies();
        cookieStore.set('seller_session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            expires: expiresAt,
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

        if (token) {
            // Remove session from DB
            await prisma.seller_sessions.deleteMany({
                where: { token: token },
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
    const rawData = Object.fromEntries(formData.entries());
    const validation = SellerRegistrationSchema.safeParse(rawData);

    if (!validation.success) {
        const errors: Record<string, string[]> = {};
        validation.error.issues.forEach(issue => {
            const path = issue.path[0] as string;
            if (!errors[path]) errors[path] = [];
            errors[path].push(issue.message);
        });
        return { message: 'Please fix the errors below.', errors };
    }

    const { name, br_number, address, city, district, tel1, tel2, seller_type, password } = validation.data;

    try {
        // 1. Verify Phone Number (Security Check)
        const verification = await prisma.otp_verifications.findFirst({
            where: {
                phone: tel1,
                verified: 1,
            },
            orderBy: { created_at: 'desc' }
        });

        if (!verification) {
            return { message: 'Phone number not verified. Please verify your phone number first.', errors: {} };
        }

        // 2. Create Seller
        // Here we call the "API Endpoint Logic" (Service) directly
        // This avoids fetch() but keeps the DB logic centralized
        const result = await createSeller({
            name,
            br_number: br_number || null,
            address,
            city: city || null,
            district: district || null,
            tel1,
            tel2: tel2 || null,
            seller_type: seller_type || null,
            user_name: tel1, // Use phone number as username
            password
        });


        if (result.error) {
            return { message: result.error, errors: {} };
        }

        // Consume the verification (prevent reuse)
        try {
            await prisma.otp_verifications.delete({ where: { id: verification.id } });
        } catch (e) {
            console.warn("Failed to delete used OTP record", e);
        }

        return { message: 'success: Registration successful! Redirecting to login...', errors: {} };

    } catch (error) {
        console.error('Seller registration error:', error);
        return { message: 'Something went wrong. Please try again.', errors: {} };
    }
}


export async function sendSellerOTP(phone: string) {
    try {
        // Check if phone number is already registered
        const existingSeller = await prisma.seller_details.findFirst({
            where: {
                OR: [
                    { user_name: phone },
                    { tel1: phone }
                ]
            }
        });

        if (existingSeller) {
            return { success: false, message: 'This phone number is already registered. Please login.' };
        }

        // Generate 6 digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store in DB (delete existing first to avoid clutter)
        await prisma.otp_verifications.deleteMany({
            where: { phone: phone }
        });

        await prisma.otp_verifications.create({
            data: {
                phone: phone,
                code: otp,
                expires_at: expiresAt,
                verified: 0 // Explicitly set as unverified
            }
        });

        // Send SMS via QuickSend Gateway
        const sent = await sendQuickSendSMS(phone, otp);

        if (!sent) {
            // Fallback logging for dev/error
            console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
        }

        return { success: true, message: 'OTP sent successfully' };
    } catch (error) {
        console.error('Send OTP Error:', error);
        return { success: false, message: 'Failed to send OTP' };
    }
}

// Helper for SMS Gateway
async function sendQuickSendSMS(phone: string, otp: string) {
    const apiToken = process.env.SMS_GATEWAY_API_TOKEN;
    const apiUser = process.env.SMS_GATEWAY_EMAIL;
    const senderID = process.env.SMS_GATEWAY_SENDER_ID || "QKSendDemo";

    if (!apiToken || !apiUser) {
        console.warn("SMS_GATEWAY_API_TOKEN or SMS_GATEWAY_EMAIL is missing in .env");
        return false;
    }

    try {
        const url = 'https://quicksend.lk/Client/api.php?FUN=SEND_SINGLE';

        // Basic Auth: base64(email:apiKey)
        const credentials = Buffer.from(`${apiUser}:${apiToken}`).toString('base64');

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${credentials}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                senderID: senderID,
                to: phone,
                msg: `Your AnyPart verification code is: ${otp}`
            })
        });

        if (!response.ok) {
            console.error("SMS Gateway Response Error:", response.statusText);
            try {
                // const text = await response.text();
                // console.error("SMS Gateway Response Body:", text);
            } catch {
                // Ignore text read error
            }
            return false;
        }

        const data = await response.json();
        /*
           QuickSend usually returns JSON. 
           We verify success if possible.
        */
        console.log("SMS Gateway Response:", data);

        return true;

    } catch (error) {
        console.error("SMS Gateway Error:", error);
        return false;
    }
}

export async function verifySellerOTP(phone: string, otp: string) {
    try {
        const record = await prisma.otp_verifications.findFirst({
            where: {
                phone: phone,
                code: otp,
                expires_at: {
                    gt: new Date()
                }
            }
        });

        if (record) {
            // Valid OTP - Mark as Verified instead of deleting
            await prisma.otp_verifications.update({
                where: { id: record.id },
                data: { verified: 1 }
            });
            return { success: true, message: 'OTP verified' };
        }

        return { success: false, message: 'Invalid or expired OTP' };
    } catch (error) {
        console.error('Verify OTP Error:', error);
        return { success: false, message: 'Verification failed' };
    }
}

export async function sendPasswordResetOTP(phone: string) {
    try {
        // 1. Check if the user exists (opposite of registration logic)
        const existingSeller = await prisma.seller_details.findFirst({
            where: {
                OR: [
                    { user_name: phone },
                    { tel1: phone }
                ]
            }
        });

        if (!existingSeller) {
            return { success: false, message: 'No account found with this phone number.' };
        }

        // Check Rate Limit (1 password reset per day)
        if (existingSeller.last_password_reset_at) {
            const lastReset = new Date(existingSeller.last_password_reset_at);
            const now = new Date();

            // Check if same day, month, and year (using local time logic effectively via server time)
            if (
                lastReset.getDate() === now.getDate() &&
                lastReset.getMonth() === now.getMonth() &&
                lastReset.getFullYear() === now.getFullYear()
            ) {
                return { success: false, message: 'You can only reset your password once per day.' };
            }
        }

        // 2. Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // 3. Store in DB (delete existing first)
        await prisma.otp_verifications.deleteMany({
            where: { phone: phone }
        });

        await prisma.otp_verifications.create({
            data: {
                phone: phone,
                code: otp,
                expires_at: expiresAt,
                verified: 0
            }
        });

        // 4. Send SMS
        const sent = await sendQuickSendSMS(phone, otp);

        if (!sent) {
            console.log(`[DEV MODE] Password Reset OTP for ${phone}: ${otp}`);
        }

        return { success: true, message: 'OTP sent successfully' };

    } catch (error) {
        console.error('Send Reset OTP Error:', error);
        return { success: false, message: 'Failed to send OTP' };
    }
}

export async function resetSellerPassword(phone: string, newPassword: string, otp: string) {
    try {
        // Validate Password Format (4 digits)
        if (!/^\d{4}$/.test(newPassword)) {
            return { success: false, message: 'Password must be exactly 4 numbers.' };
        }

        // 1. Verify OTP again (Critical for security)
        const verification = await prisma.otp_verifications.findFirst({
            where: {
                phone: phone,
                code: otp,
                expires_at: { gt: new Date() },
                verified: 1 // Must have been verified in step 2
            }
        });

        if (!verification) {
            return { success: false, message: 'Invalid or expired verification session.' };
        }

        // 2. Hash New Password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // 3. Update Seller Password
        await prisma.seller_details.updateMany({
            where: {
                OR: [
                    { user_name: phone },
                    { tel1: phone }
                ]
            },
            data: {
                password: hashedPassword,
                last_password_reset_at: new Date()
            }
        });

        // 4. Clean up OTP
        await prisma.otp_verifications.delete({ where: { id: verification.id } });

        return { success: true, message: 'Password reset successfully' };

    } catch (error) {
        console.error('Reset Password Error:', error);
        return { success: false, message: 'Failed to reset password' };
    }
}
