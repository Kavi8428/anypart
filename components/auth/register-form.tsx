'use client';

import { useActionState, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Building2, MapPin, Phone, FileText, Lock, Eye, EyeOff,
    Loader2, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Combobox,
    ComboboxInput,
    ComboboxContent,
    ComboboxList,
    ComboboxItem,
    ComboboxEmpty
} from '@/components/ui/combobox';
import { sellerRegister, sendSellerOTP, verifySellerOTP } from '@/app/actions/seller-auth';
import { getSellerMetadata } from '@/app/actions/seller-meta';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp"

const initialState = {
    message: '',
    errors: {},
};

export default function RegisterForm() {
    const [state, dispatch, isPending] = useActionState(sellerRegister, initialState);
    const [showPassword, setShowPassword] = useState(false);
    const [metadata, setMetadata] = useState<{
        districts: { id: number; name: string }[];
        cities: { id: number; name: string; disctrict_id: number }[];
        sellerTypes: { id: number; type: string }[];
    }>({ districts: [], cities: [], sellerTypes: [] });
    const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);
    const [selectedCity, setSelectedCity] = useState<string | null>(null);
    const [selectedSellerType, setSelectedSellerType] = useState<string | null>(null);

    const [districtQuery, setDistrictQuery] = useState('');
    const [cityQuery, setCityQuery] = useState('');
    const [sellerTypeQuery, setSellerTypeQuery] = useState('');

    const [phone, setPhone] = useState('');
    const [isVerified, setIsVerified] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [otpStep, setOtpStep] = useState<'confirm' | 'otp'>('confirm');
    const [otp, setOtp] = useState('');
    const [otpStatus, setOtpStatus] = useState<'idle' | 'sending' | 'verifying' | 'error' | 'success'>('idle');

    async function handleSendOtp() {
        setOtpStatus('sending');
        const res = await sendSellerOTP(phone);
        if (res.success) {
            setOtpStep('otp');
            setOtpStatus('idle');
        } else {
            setOtpStatus('error'); // Handle error better?
        }
    }

    async function handleVerifyOtp() {
        setOtpStatus('verifying');
        const res = await verifySellerOTP(phone, otp);
        if (res.success) {
            setIsVerified(true);
            setIsDialogOpen(false);
            setOtpStatus('success');
        } else {
            setOtpStatus('error');
        }
    }

    const handleFormSubmit = (e: React.FormEvent) => {
        if (!isVerified) {
            e.preventDefault();
            if (phone.length < 9) {
                // simple length check
                alert("Please enter a valid phone number");
                return;
            }
            setOtpStep('confirm');
            setOtp('');
            setOtpStatus('idle');
            setIsDialogOpen(true);
        }
    };

    const router = useRouter();

    useEffect(() => {
        async function fetchData() {
            try {
                const meta = await getSellerMetadata();
                setMetadata(meta);
            } catch (err) {
                console.error("Failed to fetch registration metadata:", err);
            }
        }
        fetchData();
    }, []);

    // Redirect on success
    useEffect(() => {
        if (state?.message && state.message.toLowerCase().includes('success')) {
            const timer = setTimeout(() => {
                router.push('/seller/login');
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [state, router]);

    const filteredDistricts = metadata.districts.filter((d) =>
        d.name?.toLowerCase().includes(districtQuery.toLowerCase())
    );

    const availableCities = metadata.cities?.filter(
        city => selectedDistrict && city.disctrict_id === parseInt(selectedDistrict)
    ) || [];

    const filteredCities = availableCities.filter((c) =>
        c.name?.toLowerCase().includes(cityQuery.toLowerCase())
    );

    const filteredSellerTypes = metadata.sellerTypes.filter((t) =>
        t.type?.toLowerCase().includes(sellerTypeQuery.toLowerCase())
    );

    return (
        <div className="w-full max-w-[1400px] bg-white p-6 md:p-10 rounded-3xl shadow-2xl shadow-slate-200/50 border border-slate-100 animate-in fade-in zoom-in duration-500">
            <form action={dispatch} onSubmit={handleFormSubmit} className="space-y-8">
                {/* Status Message */}
                {state?.message && (
                    <div className={`p-4 rounded-xl text-sm font-bold border animate-in fade-in zoom-in-95 ${state.message.includes('success')
                        ? 'bg-green-50 text-green-700 border-green-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                        {state.message}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-6">
                    {/* 1. Business Section */}
                    <div className="lg:col-span-4">
                        <h3 className="text-lg font-bold text-[#FF6200] mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
                            <Building2 className="h-5 w-5" />
                            Business Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 ml-1 uppercase">Business Name *</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#FF6200]">
                                        <Building2 className="h-4 w-4" />
                                    </div>
                                    <Input name="name" placeholder="E.g. Auto Zone Motors" className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#FF6200] transition-all" required />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 ml-1 uppercase">BR Number</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#FF6200]">
                                        <FileText className="h-4 w-4" />
                                    </div>
                                    <Input name="br_number" placeholder="Registration number" className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#FF6200] transition-all" />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 ml-1 uppercase">Seller Type *</label>
                                <Combobox
                                    value={metadata.sellerTypes.find(t => String(t.id) === selectedSellerType) || null}
                                    onValueChange={(val) => {
                                        if (val) {
                                            setSelectedSellerType(String(val.id));
                                            setSellerTypeQuery(val.type);
                                        } else {
                                            setSelectedSellerType('');
                                            setSellerTypeQuery('');
                                        }
                                    }}
                                >
                                    <ComboboxInput
                                        value={sellerTypeQuery}
                                        placeholder="Select Business Type"
                                        className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:border-[#FF6200] w-full pl-3"
                                        onChange={(e) => setSellerTypeQuery(e.target.value)}
                                    />
                                    <ComboboxContent>
                                        <ComboboxList>
                                            {filteredSellerTypes.length === 0 && <ComboboxEmpty>No results found.</ComboboxEmpty>}
                                            {filteredSellerTypes.map(t => (
                                                <ComboboxItem key={t.id} value={t}>
                                                    {t.type}
                                                </ComboboxItem>
                                            ))}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                                <input type="hidden" name="seller_type" value={selectedSellerType || ''} />
                            </div>
                        </div>
                    </div>

                    {/* 2. Contact Section */}
                    <div className="lg:col-span-4">
                        <h3 className="text-lg font-bold text-[#FF6200] mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
                            <Phone className="h-5 w-5" />
                            Contact Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 ml-1 uppercase">Primary Phone (Tel 1) *</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#FF6200]">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <Input
                                        name="tel1"
                                        placeholder="07XXXXXXXX"
                                        type="tel"
                                        className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#FF6200] transition-all"
                                        required
                                        value={phone}
                                        onChange={(e) => {
                                            setPhone(e.target.value);
                                            setIsVerified(false);
                                        }}
                                    />
                                    {isVerified && (
                                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-green-500 pointer-events-none">
                                            <span className="text-xs font-bold mr-1">Verified</span>
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 ml-1 uppercase">Secondary Phone (Optional)</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#FF6200]">
                                        <Phone className="h-4 w-4" />
                                    </div>
                                    <Input name="tel2" placeholder="Alternative number" type="tel" className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#FF6200] transition-all" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 3. Location Section */}
                    <div className="lg:col-span-4">
                        <h3 className="text-lg font-bold text-[#FF6200] mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
                            <MapPin className="h-5 w-5" />
                            Location
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1 lg:col-span-2">
                                <label className="text-xs font-bold text-slate-700 ml-1 uppercase">Street Address *</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#FF6200]">
                                        <MapPin className="h-4 w-4" />
                                    </div>
                                    <Input name="address" placeholder="No, Street, Area" className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#FF6200] transition-all" required />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 ml-1 uppercase">District *</label>
                                <Combobox
                                    value={metadata.districts.find(d => String(d.id) === selectedDistrict) || null}
                                    onValueChange={(val) => {
                                        if (val) {
                                            setSelectedDistrict(String(val.id));
                                            setDistrictQuery(val.name);
                                        } else {
                                            setSelectedDistrict('');
                                            setDistrictQuery('');
                                        }
                                        setSelectedCity(null);
                                        setCityQuery('');
                                    }}
                                >
                                    <ComboboxInput
                                        value={districtQuery}
                                        placeholder="Select District"
                                        className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:border-[#FF6200] w-full pl-3"
                                        onChange={(e) => setDistrictQuery(e.target.value)}
                                    />
                                    <ComboboxContent>
                                        <ComboboxList>
                                            {filteredDistricts.length === 0 && <ComboboxEmpty>No results found.</ComboboxEmpty>}
                                            {filteredDistricts.map(d => (
                                                <ComboboxItem key={d.id} value={d}>
                                                    {d.name}
                                                </ComboboxItem>
                                            ))}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                                <input type="hidden" name="district" value={selectedDistrict || ''} />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 ml-1 uppercase">City *</label>
                                <Combobox
                                    value={filteredCities.find(c => String(c.id) === selectedCity) || availableCities.find(c => String(c.id) === selectedCity) || null}
                                    onValueChange={(val) => {
                                        if (val) {
                                            setSelectedCity(String(val.id));
                                            setCityQuery(val.name);
                                        } else {
                                            setSelectedCity('');
                                            setCityQuery('');
                                        }
                                    }}
                                    disabled={!selectedDistrict}
                                >
                                    <ComboboxInput
                                        value={cityQuery}
                                        disabled={!selectedDistrict}
                                        placeholder={selectedDistrict ? "Select City" : "Select District First"}
                                        className="h-11 rounded-xl bg-slate-50 border-slate-200 focus:border-[#FF6200] w-full pl-3"
                                        onChange={(e) => setCityQuery(e.target.value)}
                                    />
                                    <ComboboxContent>
                                        <ComboboxList>
                                            {filteredCities.length === 0 && <ComboboxEmpty>No results found.</ComboboxEmpty>}
                                            {filteredCities.map(c => (
                                                <ComboboxItem key={c.id} value={c}>
                                                    {c.name}
                                                </ComboboxItem>
                                            ))}
                                        </ComboboxList>
                                    </ComboboxContent>
                                </Combobox>
                                <input type="hidden" name="city" value={selectedCity || ''} />
                            </div>
                        </div>
                    </div>

                    {/* 4. Security Section */}
                    <div className="lg:col-span-4">
                        <h3 className="text-lg font-bold text-[#FF6200] mb-4 flex items-center gap-2 border-b border-slate-50 pb-2">
                            <Lock className="h-5 w-5" />
                            Account Security
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 ml-1 uppercase">Password *</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#FF6200]">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                    <Input
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="pl-10 pr-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#FF6200] transition-all"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#FF6200] focus:outline-none"
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-700 ml-1 uppercase">Confirm Password *</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-[#FF6200]">
                                        <Lock className="h-4 w-4" />
                                    </div>
                                    <Input
                                        name="confirm_password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Re-type password"
                                        className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 focus:bg-white focus:border-[#FF6200] transition-all"
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-6 border-t border-slate-100">
                    <div className="text-sm text-slate-500 font-medium">
                        Already have a seller account?{' '}
                        <Link
                            href="/seller/login"
                            className="text-[#FF6200] font-bold hover:underline transition-all"
                        >
                            Sign In
                        </Link>
                    </div>
                    <Button
                        type="submit"
                        disabled={isPending}
                        className="w-full md:w-auto px-12 h-14 bg-[#FF6200] hover:bg-[#ff7a29] text-white text-lg font-bold rounded-2xl shadow-lg shadow-[#FF6200]/30 transition-all hover:shadow-[#FF6200]/50 hover:-translate-y-1 active:scale-[0.98]"
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="mr-3 h-5 w-5 animate-spin" />
                                Processing...
                            </>
                        ) : (
                            <>
                                Create Seller Account
                                <ArrowRight className="ml-3 h-5 w-5 opacity-90" />
                            </>
                        )}
                    </Button>
                </div>
            </form>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{otpStep === 'confirm' ? 'Verify Phone Number' : 'Enter OTP'}</DialogTitle>
                        <DialogDescription>
                            {otpStep === 'confirm'
                                ? `We will send a verification code to ${phone}. Is this correct?`
                                : `Enter the code sent to ${phone}.`
                            }
                        </DialogDescription>
                    </DialogHeader>

                    {otpStep === 'confirm' ? (
                        <DialogFooter className="sm:justify-start gap-2">
                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Edit
                            </Button>
                            <Button type="button" className="bg-[#FF6200] hover:bg-[#ff7a29]" onClick={handleSendOtp} disabled={otpStatus === 'sending'}>
                                {otpStatus === 'sending' ? <Loader2 className="animate-spin h-4 w-4" /> : 'Send OTP'}
                            </Button>
                        </DialogFooter>
                    ) : (
                        <div className="space-y-4">
                            <div className="flex justify-center py-4">
                                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
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
                            {otpStatus === 'error' && <p className="text-red-500 text-sm font-medium text-center">Invalid OTP. Please try again.</p>}
                            <DialogFooter className="sm:justify-between gap-2">
                                <Button type="button" variant="ghost" onClick={() => setOtpStep('confirm')}>Back</Button>
                                <Button type="button" className="bg-[#FF6200] hover:bg-[#ff7a29]" onClick={handleVerifyOtp} disabled={otp.length !== 6 || otpStatus === 'verifying'}>
                                    {otpStatus === 'verifying' ? <Loader2 className="animate-spin h-4 w-4" /> : 'Verify'}
                                </Button>
                            </DialogFooter>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
