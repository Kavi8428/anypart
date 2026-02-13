"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Calendar } from "lucide-react";

export function YearGrid({ years, brandId, modelName, selectedYearId }) {
    if (!years || years.length === 0) return null;

    return (
        <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {years.map((item) => {
                const isSelected = selectedYearId === item.yearId;

                return (
                    <Link
                        key={item.yearId}
                        href={`?brandId=${brandId}&modelName=${encodeURIComponent(modelName)}&yearId=${item.yearId}&vModelId=${item.vModelId}`}
                        scroll={false}
                        className={cn(
                            "group flex flex-col items-center justify-center p-3 rounded-lg border transition-all duration-300 bg-white hover:shadow-md cursor-pointer",
                            isSelected
                                ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                                : "border-gray-100 hover:border-primary/50"
                        )}
                    >
                        <div className="flex items-center gap-2 mb-1">
                            <Calendar className={cn("w-3 h-3 transition-colors", isSelected ? "text-primary" : "text-gray-400 group-hover:text-primary")} />
                        </div>
                        <h3 className={cn(
                            "text-sm font-bold text-center transition-colors",
                            isSelected ? "text-primary" : "text-gray-700 group-hover:text-primary"
                        )}>
                            {item.year}
                        </h3>
                    </Link>
                );
            })}
        </div>
    );
}
