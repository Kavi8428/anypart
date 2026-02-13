"use client"

import React from "react"
import Image from "next/image"
import Link from "next/link"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ProductCardProps {
    id: string
    title: string
    makeModel: string
    price: number
    rating: number
    reviewsCount: number
    imageUrl?: string
}

export function ProductCard({
    id,
    title,
    makeModel,
    price,
    rating,
    reviewsCount,
    imageUrl,
}: ProductCardProps) {
    return (
        <div className="group relative bg-white border border-gray-100 rounded-xl sm:rounded-2xl overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300">
            {/* Product Image */}
            <div className="aspect-[4/3] relative bg-gray-50 overflow-hidden">
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100/50">
                        <div className="w-full h-full bg-linear-to-br from-gray-100 to-gray-200" />
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="p-2 sm:p-3 flex flex-col gap-1 sm:gap-1.5">
                <h3 className="text-xs sm:text-base font-bold text-gray-900 group-hover:text-primary transition-colors line-clamp-1 uppercase tracking-tight">
                    {title}
                </h3>

                <p className="text-[9px] sm:text-[10px] font-semibold text-gray-400 sm:text-gray-500 tracking-tight sm:tracking-widest uppercase truncate">
                    {makeModel}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-1 py-0.5">
                    <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-[10px] sm:text-xs font-bold text-gray-900">{rating}</span>
                    <span className="text-[9px] sm:text-[10px] text-gray-400">({reviewsCount})</span>
                </div>

                {/* Price */}
                <div className="pt-0.5">
                    <div className="text-sm sm:text-lg font-extrabold text-primary">
                        Rs. {price.toLocaleString()}
                    </div>
                </div>

                {/* Button */}
                <Link href={`/buyer/product_view/${id}`}>
                    <Button
                        className="mt-1 sm:mt-2 w-full bg-primary hover:bg-primary/90 text-white rounded-lg py-2 h-7 sm:h-8 text-[10px] sm:text-sm font-bold transition-all duration-300 border-none cursor-pointer"
                    >
                        View Details
                    </Button>
                </Link>
            </div>
        </div>
    )
}
