"use client";

import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

export function BrandGrid({ brands, selectedBrandId }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
            {brands.map((brand) => {
                const isSelected = selectedBrandId === brand.id;
                return (
                    <Link
                        key={brand.id}
                        href={`?brandId=${brand.id}`}
                        scroll={false}
                        className={cn(
                            "group relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 bg-white hover:shadow-lg",
                            isSelected
                                ? "border-primary ring-2 ring-primary/20 shadow-md"
                                : "border-gray-100 hover:border-primary/50"
                        )}
                    >
                        <div className="relative w-16 h-16 mb-3">
                            {brand.logo_url ? (
                                <Image
                                    src={brand.logo_url}
                                    alt={brand.name}
                                    fill
                                    className="object-contain p-1"
                                />
                            ) : (
                                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-gray-400 font-bold text-xl">
                                    {brand.name.charAt(0)}
                                </div>
                            )}
                        </div>
                        <h3 className={cn(
                            "text-sm font-semibold text-center transition-colors",
                            isSelected ? "text-primary" : "text-gray-700 group-hover:text-primary"
                        )}>
                            {brand.name}
                        </h3>
                    </Link>
                );
            })}
        </div>
    );
}
