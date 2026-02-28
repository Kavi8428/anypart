import validator from 'validator';

/**
 * Validates and sanitizes email address
 * @param email - Email to validate
 * @returns Sanitized email or null if invalid
 */
export function validateEmail(email: string): string | null {
    if (!email) return null;

    const sanitized = validator.normalizeEmail(email);
    if (!sanitized || !validator.isEmail(sanitized)) {
        return null;
    }

    return sanitized;
}

/**
 * Validates and sanitizes phone number
 * @param phone - Phone number to validate
 * @returns Sanitized phone or null if invalid
 */
export function validatePhone(phone: string): string | null {
    if (!phone) return null;

    // Remove all non-numeric characters except +
    const sanitized = phone.replace(/[^0-9+]/g, '');

    // Basic validation - should have at least 10 digits
    const digitsOnly = sanitized.replace(/\+/g, '');
    if (digitsOnly.length < 10) {
        return null;
    }

    return sanitized;
}

/**
 * Validates password strength
 * @param password - Password to validate
 * @returns Object with validation result and message
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
    if (!password) {
        return { valid: false, message: 'Password is required' };
    }

    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters' };
    }

    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }

    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }

    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }

    // Optional: Check for special characters
    // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    //     return { valid: false, message: 'Password must contain at least one special character' };
    // }

    return { valid: true };
}

/**
 * Sanitizes text input to prevent XSS
 * @param input - Text to sanitize
 * @returns Sanitized text
 */
export function sanitizeText(input: string): string {
    if (!input) return '';

    // Escape HTML special characters
    return validator.escape(input);
}

/**
 * Validates business registration number format
 * @param brNumber - BR number to validate
 * @returns True if valid format
 */
export function validateBRNumber(brNumber: string): boolean {
    if (!brNumber) return false;

    // Basic format check - adjust based on your country's BR number format
    // Example: BR-001, BR-12345, etc.
    const brPattern = /^BR-\d{3,10}$/i;
    return brPattern.test(brNumber);
}

/**
 * Validates NIC (National Identity Card) number
 * @param nic - NIC to validate
 * @returns True if valid format
 */
export function validateNIC(nic: string): boolean {
    if (!nic) return false;

    // Sri Lankan NIC format: 9 digits + V/X or 12 digits
    const oldFormat = /^\d{9}[VvXx]$/;
    const newFormat = /^\d{12}$/;

    return oldFormat.test(nic) || newFormat.test(nic);
}

/**
 * Validates product description to prevent inclusion of contact details
 * @param text - Description text to validate
 * @returns Error message if forbidden patterns are found, null otherwise
 */
export function validateProductDescription(text: string): string | null {
    if (!text) return null;

    const forbiddenPatterns = [
        { pattern: /(?:\+94|0094|0)?[7][0-9]\d{7}/g, label: 'phone number' },
        { pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, label: 'email address' },
        { pattern: /\b\d{1,4}\s[\w\s]{1,20}(?:road|street|lane|avenue|mawatha|rd|st|lane|ln|ave|place|no\.?)\b/gi, label: 'address' },
        { pattern: /\b\d{5}\b/g, label: 'postal code' },
    ];

    const normalize = (t: string) =>
        t
            .replace(/[\s\-().]/g, '')     // remove spaces, dashes, dots, brackets
            .replace(/\[at\]/gi, '@')      // catch [at] tricks
            .replace(/\(at\)/gi, '@')      // catch (at) tricks
            .replace(/zero/gi, '0')        // catch word substitutions
            .replace(/one/gi, '1')
            .replace(/two/gi, '2')
            .replace(/three/gi, '3')
            .replace(/four/gi, '4')
            .replace(/five/gi, '5')
            .replace(/six/gi, '6')
            .replace(/seven/gi, '7')
            .replace(/eight/gi, '8')
            .replace(/nine/gi, '9')
            .toLowerCase();

    const normalized = normalize(text);

    for (const { pattern, label } of forbiddenPatterns) {
        // Reset regex index because of 'g' flag
        pattern.lastIndex = 0;
        if (pattern.test(text) || pattern.test(normalized)) {
            return `Contact details are not allowed (${label} detected).`;
        }
    }

    return null;
}
