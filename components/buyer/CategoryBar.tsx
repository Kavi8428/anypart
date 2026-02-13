"use client"

import React from "react"
import { Button } from "@/components/ui/button"

const categories = [
    "Engine Parts",
    "Brake System",
    "Suspension",
    "Electrical",
    "Cooling System",
    "Lighting",
    "Transmission",
    "Body Parts",
]

export function CategoryBar() {
    return (
        <div className="w-full bg-white border-b overflow-x-auto no-scrollbar scroll-smooth">
            <div className="container mx-auto px-2 sm:px-4 py-1.5 sm:py-2">
                <div className="flex items-center gap-2 sm:gap-3 min-w-max">
                    <Button
                        className="bg-primary hover:bg-primary/90 text-white rounded-md px-3 sm:px-2 py-1.5 sm:py-1 h-4 sm:h-6 text-xs sm:text-sm font-medium transition-colors border-none shrink-0"
                    >
                        Shop by Vehicle
                    </Button>

                    <div className="h-6 sm:h-6 w-[1px] bg-gray-200 mx-0.5 sm:mx-1 shrink-0" />

                    {categories.map((category) => (
                        <button
                            key={category}
                            className="px-3 sm:px-4 py-1.5 sm:py-1 h-4 sm:h-6 text-[11px] sm:text-sm font-medium text-gray-600 hover:text-primary border border-gray-100 rounded-lg hover:border-primary bg-gray-50/50 transition-all cursor-pointer whitespace-nowrap shrink-0"
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    )
}
