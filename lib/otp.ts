import { prisma } from './prisma';
import { randomInt } from 'crypto';
import { APP_CONFIG } from './config';

/**
 * OTP Service
 * Handles generation, sending, and verification of one-time passwords
 */

/**
 * Generates and saves a new OTP for the given phone number
 * @param phone - Recipient's phone number
 * @returns The generated OTP code
 */
export async function sendOTP(phone: string): Promise<string> {
    const code = randomInt(100000, 999999).toString();
    const expiresAt = new Date(Date.now() + APP_CONFIG.OTP.EXPIRY_MINUTES * 60 * 1000);

    await prisma.otp_verifications.create({
        data: {
            phone,
            code,
            expires_at: expiresAt,
        },
    });

    // In a real app, you would integrate with an SMS gateway here (e.g., Twilio, Notify.lk)
    console.log(`[OTP] Sent to ${phone}: ${code} (Expires at ${expiresAt.toISOString()})`);

    return code;
}

/**
 * Verifies the provided OTP code
 * @param phone - Requester's phone number
 * @param code - Code to verify
 * @returns True if verification is successful
 */
export async function verifyOTP(phone: string, code: string): Promise<boolean> {
    const now = new Date();

    const verification = await prisma.otp_verifications.findFirst({
        where: {
            phone,
            code,
            expires_at: { gt: now },
        },
        orderBy: {
            created_at: 'desc',
        },
    });

    if (verification) {
        // Optional: Delete the verification record after successful use
        // await (prisma as any).otp_verifications.delete({ where: { id: verification.id } });
        return true;
    }

    return false;
}

/**
 * Cleans up expired OTP records from the database
 */
export async function cleanupOTP() {
    await prisma.otp_verifications.deleteMany({
        where: {
            expires_at: { lt: new Date() },
        },
    });
}
