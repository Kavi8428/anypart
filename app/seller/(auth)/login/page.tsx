'use client';

import { useActionState, useState, useEffect } from 'react';
import { sellerLogin } from '@/app/actions/seller-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Smartphone, Lock, Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

import AuthHeader from '@/components/auth/auth-header';

const initialState = {
    message: '',
    errors: {},
};

export default function SellerLoginPage() {
    const [state, dispatch, isPending] = useActionState(sellerLogin, initialState);
    const [showPassword, setShowPassword] = useState(false);

    return (
        <>
            <AuthHeader
                title="Seller Center"
                subtitle="Welcome back! Please sign in to continue."
            />

            {/* 2. Login Form */}
            <div className="w-full max-w-sm bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100">
                <form action={dispatch} className="space-y-6">

                    {/* Error/Success Message */}
                    {state?.message && (
                        <div className={`p-3 rounded-lg text-sm font-medium border animate-in fade-in zoom-in-95 ${state.message.includes('success')
                            ? 'bg-green-50 text-green-700 border-green-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                            {state.message}
                        </div>
                    )}

                    <div className="space-y-4">
                        {/* Phone Number Field */}
                        <div className="space-y-1">
                            <label
                                htmlFor="phone"
                                className="text-sm font-semibold text-black ml-1"
                            >
                                Phone Number
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#FF6200]">
                                    <Smartphone className="h-5 w-5 text-slate-400 group-focus-within:text-[#FF6200]" />
                                </div>
                                <Input
                                    id="phone"
                                    name="phone"
                                    type="tel"
                                    placeholder="07XXXXXXXX"
                                    className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#FF6200] focus:ring-[#FF6200]/20 transition-all rounded-xl"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1">
                            <div className="flex items-center justify-between ml-1">
                                <label
                                    htmlFor="password"
                                    className="text-sm font-semibold text-black"
                                >
                                    Password
                                </label>
                                <Link
                                    href="#"
                                    className="text-xs text-blue-600 hover:text-[#FF6200] font-medium transition-colors"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#FF6200]">
                                    <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#FF6200]" />
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••••••"
                                    className="pl-10 pr-10 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#FF6200] focus:ring-[#FF6200]/20 transition-all rounded-xl"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full h-12 bg-[#FF6200] hover:bg-[#ff7a29] text-white font-bold rounded-xl shadow-lg shadow-[#FF6200]/20 transition-all hover:shadow-[#FF6200]/40 hover:-translate-y-0.5"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Signing in...
                            </>
                        ) : (
                            <>
                                Sign In
                                <ArrowRight className="ml-2 h-5 w-5 opacity-90" />
                            </>
                        )}
                    </Button>

                    <div className="text-center text-sm text-slate-500">
                        Don&apos;t have a seller account?{' '}
                        <Link
                            href="/seller/register"
                            className="text-blue-600 font-bold hover:text-[#FF6200] hover:underline transition-colors"
                        >
                            Register Now . its free
                        </Link>
                    </div>
                </form>
            </div>
        </>
    );
}
