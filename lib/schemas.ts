import { z } from 'zod';
import { validateProductDescription } from './validation';

// --- Utility Regex ---
const phoneRegex = /^(?:\+94|0)?7[0-9]{8}$/;
// const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\W]{8,}$/;

// --- Seller Authentication Schemas ---

export const SellerLoginSchema = z.object({
    phone: z.string().min(1, 'Phone number is required'),
    password: z.string().min(1, 'Password is required'),
});

export const SellerRegistrationSchema = z.object({
    name: z.string().min(2, 'Business name must be at least 2 characters'),
    br_number: z.string().optional().nullable(),
    address: z.string().min(5, 'Address must be at least 5 characters'),
    city: z.coerce.number().optional().nullable(),
    district: z.coerce.number().optional().nullable(),
    tel1: z.string().regex(phoneRegex, 'Invalid phone number format (e.g., 0771234567)'),
    tel2: z.string().optional().nullable().or(z.literal('')),
    seller_type: z.coerce.number().optional().nullable(),
    password: z.string().regex(/^\d{4}$/, 'Password must be exactly 4 digits'),
    confirm_password: z.string(),
}).refine((data) => data.password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
});

// --- Product Schemas ---

const optionalNumberFn = (val: unknown) => {
    if (!val || val === '0' || val === 'none' || val === 'undefined' || val === '') return null;
    const num = Number(val);
    return isNaN(num) ? null : num;
};

const optionalNumberSchema = z.preprocess(optionalNumberFn, z.number().nullable());

export const ProductSchema = z.object({
    p_name: z.coerce.number().min(1, "Part Name is required"),
    v_model: z.coerce.number().min(1, "Model is required"),
    v_year: optionalNumberSchema,
    price: z.coerce.number().min(0, "Price must be a positive number"),
    condition: optionalNumberSchema,
    description: z.string().optional().nullable().refine((val) => {
        if (!val) return true;
        return validateProductDescription(val) === null;
    }, {
        message: "Contact details (phone, email, etc.) are not allowed in description"
    }),
    hash_tag_1: z.coerce.number().min(1, "Tag 1 is required"),
    hash_tag_2: optionalNumberSchema,
    hash_tag_3: optionalNumberSchema,
    is_featured: z.preprocess((val) => {
        if (val === 'on' || val === '1' || val === 1) return 1;
        return 0;
    }, z.number()),
    // Handling images effectively in Zod for FormData is complex;
    // usually better to validate presence manually if strictly required,
    // or assume they are File objects if present.
    // We will handle files separately in the action for now to keep schema simple.
});

export type SellerRegistrationInput = z.infer<typeof SellerRegistrationSchema>;
export type ProductInput = z.infer<typeof ProductSchema>;
