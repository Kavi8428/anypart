'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getAppLogo } from '@/app/actions/app-details';

interface AuthHeaderProps {
    title: string;
    subtitle: string;
}

export default function AuthHeader({ title, subtitle }: AuthHeaderProps) {
    const [logoUrl, setLogoUrl] = useState<string | null>(null);

    useEffect(() => {
        async function fetchLogo() {
            try {
                const url = await getAppLogo();
                setLogoUrl(url);
            } catch (err) {
                console.error("Failed to fetch logo:", err);
            }
        }
        fetchLogo();
    }, []);

    return (
        <div className="mb-8 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="relative h-20 w-48 mb-2">
                <Image
                    src={logoUrl || "/company/static-logo.png"}
                    alt="AnyPart.lk Logo"
                    fill
                    className="object-contain"
                    priority
                />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-black tracking-tight mt-2 text-center">
                {title}
            </h2>
            <p className="text-slate-500 text-sm mt-1 text-center max-w-sm">
                {subtitle}
            </p>
        </div>
    );
}
