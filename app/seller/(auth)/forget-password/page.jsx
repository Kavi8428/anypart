'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Smartphone,
    KeyRound,
    Lock,
    Eye,
    EyeOff,
    Loader2,
    ArrowRight,
    ChevronLeft
} from 'lucide-react';
import AuthHeader from '@/components/auth/auth-header';
import { sendPasswordResetOTP, verifySellerOTP, resetSellerPassword } from '@/app/actions/seller-auth';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

export default function SellerForgotPasswordPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    // Form Data
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    // Step 1: Send OTP
    const handleSendOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            const result = await sendPasswordResetOTP(phone);
            if (result.success) {
                setSuccessMessage(result.message);
                setStep(2);
            } else {
                setError(result.message);
            }
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP
    const handleVerifyOTP = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        try {
            if (otp.length !== 6) {
                setError('Please enter a valid 6-digit OTP');
                setLoading(false);
                return;
            }

            const result = await verifySellerOTP(phone, otp);
            if (result.success) {
                setSuccessMessage('OTP Verified Successfully');
                setStep(3);
            } else {
                setError(result.message);
            }
        } catch {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Step 3: Reset Password
    const handleResetPassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccessMessage('');

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        // Check for exactly 4 digits
        if (!/^\d{4}$/.test(password)) {
            setError('Password must be exactly 4 numbers');
            setLoading(false);
            return;
        }

        try {
            const result = await resetSellerPassword(phone, password, otp);
            if (result.success) {
                setSuccessMessage(result.message);
                // Redirect to login with success message
                router.push('/seller/login?message=Password reset successful. Please login.');
            } else {
                setError(result.message);
            }
        } catch {
            setError('Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Helper step renderers to keep return clean
    const renderStep1 = () => (
        <form onSubmit={handleSendOTP} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-1">
                    <label htmlFor="phone" className="text-sm font-semibold text-black ml-1">
                        Phone Number
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#FF6200]">
                            <Smartphone className="h-5 w-5 text-slate-400 group-focus-within:text-[#FF6200]" />
                        </div>
                        <Input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="07XXXXXXXX"
                            className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#FF6200] focus:ring-[#FF6200]/20 transition-all rounded-xl"
                            required
                            autoFocus
                        />
                    </div>
                    <p className="text-xs text-slate-500 ml-1">
                        Enter the phone number associated with your seller account.
                    </p>
                </div>
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#FF6200] hover:bg-[#ff7a29] text-white font-bold rounded-xl shadow-lg shadow-[#FF6200]/20 transition-all"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Sending...
                    </>
                ) : (
                    <>
                        Send OTP
                        <ArrowRight className="ml-2 h-5 w-5 opacity-90" />
                    </>
                )}
            </Button>
        </form>
    );

    const renderStep2 = () => (
        <form onSubmit={handleVerifyOTP} className="space-y-6">
            <div className="space-y-4 text-center">
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-black">
                        Enter OTP Code
                    </label>
                    <p className="text-xs text-slate-500">
                        We sent a 6-digit code to <span className="font-bold text-slate-700">{phone}</span>
                    </p>
                </div>

                <div className="flex justify-center py-2">
                    <InputOTP
                        maxLength={6}
                        value={otp}
                        onChange={(value) => setOtp(value)}
                    >
                        <InputOTPGroup>
                            <InputOTPSlot index={0} />
                            <InputOTPSlot index={1} />
                            <InputOTPSlot index={2} />
                            <InputOTPSlot index={3} />
                            <InputOTPSlot index={4} />
                            <InputOTPSlot index={5} />
                        </InputOTPGroup>
                    </InputOTP>
                </div>

                <div className="text-xs text-slate-500">
                    Didn&apos;t receive code?{' '}
                    <button
                        type="button"
                        onClick={handleSendOTP}
                        className="text-[#FF6200] hover:underline font-medium"
                        disabled={loading}
                    >
                        Resend
                    </button>
                </div>
            </div>

            <Button
                type="submit"
                disabled={loading || otp.length < 6}
                className="w-full h-12 bg-[#FF6200] hover:bg-[#ff7a29] text-white font-bold rounded-xl shadow-lg shadow-[#FF6200]/20 transition-all"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Verifying...
                    </>
                ) : (
                    'Verify Code'
                )}
            </Button>
        </form>
    );

    const renderStep3 = () => (
        <form onSubmit={handleResetPassword} className="space-y-6">
            <div className="space-y-4">
                <div className="space-y-1">
                    <label className="text-sm font-semibold text-black ml-1">
                        New Password
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#FF6200]">
                            <Lock className="h-5 w-5 text-slate-400 group-focus-within:text-[#FF6200]" />
                        </div>
                        <Input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className="pl-10 pr-10 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#FF6200] focus:ring-[#FF6200]/20 transition-all rounded-xl"
                            placeholder="0000"
                            maxLength={4}
                            inputMode="numeric"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-sm font-semibold text-black ml-1">
                        Confirm New Password
                    </label>
                    <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none transition-colors group-focus-within:text-[#FF6200]">
                            <KeyRound className="h-5 w-5 text-slate-400 group-focus-within:text-[#FF6200]" />
                        </div>
                        <Input
                            type={showPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            className="pl-10 h-12 bg-slate-50 border-slate-200 focus:bg-white focus:border-[#FF6200] focus:ring-[#FF6200]/20 transition-all rounded-xl"
                            placeholder="0000"
                            maxLength={4}
                            inputMode="numeric"
                            required
                        />
                    </div>
                </div>
            </div>

            <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-[#FF6200] hover:bg-[#ff7a29] text-white font-bold rounded-xl shadow-lg shadow-[#FF6200]/20 transition-all"
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Updating...
                    </>
                ) : (
                    'Reset Password'
                )}
            </Button>
        </form>
    );



    return (
        <>
            <AuthHeader
                title="Reset Password"
                subtitle="Don't worry! It follows a simple process."
            />

            <div className="w-full max-w-sm bg-white p-6 sm:p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-100 relative">

                {step > 1 && (
                    <button
                        onClick={() => {
                            setStep(step - 1);
                            setError('');
                            setSuccessMessage('');
                        }}
                        className="absolute top-4 left-4 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                )}

                {/* Error/Success Messages */}
                {error && (
                    <div className="mb-6 p-3 rounded-lg text-sm font-medium border bg-red-50 text-red-700 border-red-200 animate-in fade-in zoom-in-95">
                        {error}
                    </div>
                )}
                {successMessage && (
                    <div className="mb-6 p-3 rounded-lg text-sm font-medium border bg-green-50 text-green-700 border-green-200 animate-in fade-in zoom-in-95">
                        {successMessage}
                    </div>
                )}

                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}

                <div className="mt-6 text-center text-sm text-slate-500 border-t border-slate-100 pt-6">
                    Remember your password?{' '}
                    <Link
                        href="/seller/login"
                        className="text-blue-600 font-bold hover:text-[#FF6200] hover:underline transition-colors"
                    >
                        Sign In
                    </Link>
                </div>
            </div>
        </>
    );
}
