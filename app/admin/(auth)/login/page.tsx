'use client';

import { useActionState, useEffect } from 'react';
import { adminLogin } from '@/app/actions/admin-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lock, User, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

const initialState = {
    message: '',
};

export default function AdminLoginPage() {
    const [state, dispatch, isPending] = useActionState(adminLogin, initialState);
    const router = useRouter();

    useEffect(() => {
        if (state?.message?.startsWith('success:')) {
            router.push('/admin');
        }
    }, [state, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg border border-gray-100">
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900">Admin Login</h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Please sign in to access the administration panel
                    </p>
                </div>
                <form className="mt-8 space-y-6" action={dispatch}>
                    {state?.message && !state.message.startsWith('success:') && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                            {state.message}
                        </div>
                    )}
                    <div className="space-y-4 rounded-md shadow-sm">
                        <div className="relative">
                            <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="pl-10 h-12"
                                placeholder="Username"
                            />
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                            <Input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="pl-10 h-12"
                                placeholder="Password"
                            />
                        </div>
                    </div>

                    <div>
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="w-full h-12 text-base font-bold"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                'Sign In'
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}

