'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Package } from 'lucide-react';
import { normalizeImageUrl } from '@/lib/image-utils';

interface ProductImageGalleryProps {
    images: (string | null)[];
    partName: string;
}

export function ProductImageGallery({ images, partName }: ProductImageGalleryProps) {
    const validImages = images.filter(Boolean) as string[];
    const [mainImage, setMainImage] = useState(validImages[0] || null);

    return (
        <div className="space-y-2 sm:space-y-3">
            <div className="aspect-square relative bg-white rounded-lg sm:rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                {mainImage ? (
                    <Image
                        src={normalizeImageUrl(mainImage)}
                        alt={partName}
                        fill
                        className="object-cover"
                        unoptimized
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <Package className="w-16 h-16 sm:w-24 sm:h-24 text-gray-300" />
                    </div>
                )}
            </div>

            {/* Thumbnail Gallery */}
            {validImages.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                    {validImages.map((img, idx) => (
                        <div
                            key={idx}
                            className={`aspect-square relative bg-white rounded-md overflow-hidden border cursor-pointer transition-all ${mainImage === img ? 'border-primary ring-2 ring-primary/20' : 'border-gray-200 hover:border-gray-300'
                                }`}
                            onClick={() => setMainImage(img)}
                        >
                            <Image
                                src={normalizeImageUrl(img)}
                                alt={`${partName} thumbnail ${idx + 1}`}
                                fill
                                className="object-cover"
                                unoptimized
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
