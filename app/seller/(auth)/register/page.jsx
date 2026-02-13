'use client';

import AuthHeader from '@/components/auth/auth-header';
import RegisterForm from '@/components/auth/register-form';

export default function SellerRegisterPage() {
    return (
        <>
            <AuthHeader
                title="Seller Registration"
                subtitle="Create your account to start selling auto parts today."
            />
            <RegisterForm />
        </>
    );
}
