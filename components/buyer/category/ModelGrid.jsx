"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Car } from "lucide-react";

export function ModelGrid({ models, brandId, selectedModelName }) {
    if (!models || models.length === 0) return null;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {models.map((model, idx) => {
                const isSelected = selectedModelName === model.name;

                return (
                    <Link
                        key={idx} // Grouped by name, no ID yet
                        href={`?brandId=${brandId}&modelName=${encodeURIComponent(model.name)}`}
                        scroll={false}
                        className={cn(
                            "group flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-300 bg-white hover:shadow-lg cursor-pointer",
                            isSelected
                                ? "border-primary ring-2 ring-primary/20 shadow-md transform scale-105"
                                : "border-gray-100 hover:border-primary/50"
                        )}
                    >
                        <div className={cn(
                            "p-3 rounded-full mb-3 transition-colors",
                            isSelected ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary"
                        )}>
                            <Car className="w-6 h-6" />
                        </div>
                        <h3 className={cn(
                            "text-sm font-semibold text-center transition-colors",
                            isSelected ? "text-primary" : "text-gray-700 group-hover:text-primary"
                        )}>
                            {model.name}
                        </h3>
                    </Link>
                );
            })}
        </div>
    );
}
