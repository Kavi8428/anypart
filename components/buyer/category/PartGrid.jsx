"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Wrench } from "lucide-react";

export function PartGrid({ parts, selectedPartId, brandId, modelName, yearId, vModelId }) {
    if (!parts || parts.length === 0) return null;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {parts.map((part) => {
                const isSelected = selectedPartId === part.id;

                return (
                    <Link
                        key={part.id}
                        href={`?brandId=${brandId}&modelName=${encodeURIComponent(modelName)}&yearId=${yearId}&vModelId=${vModelId}&partId=${part.id}`}
                        scroll={false}
                        className={cn(
                            "group relative flex flex-col items-start justify-between p-4 rounded-xl border transition-all duration-300 bg-white hover:shadow-lg cursor-pointer h-full min-h-[100px]",
                            isSelected
                                ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                                : "border-gray-100 hover:border-primary/50"
                        )}
                    >
                        <div className="w-full flex justify-between items-start mb-2">
                            <Wrench className={cn("w-5 h-5 transition-colors", isSelected ? "text-primary" : "text-gray-400 group-hover:text-primary")} />
                            {/* Placeholder for Part Brand if needed */}
                        </div>

                        <h3 className={cn(
                            "text-sm font-semibold transition-colors mt-auto w-full",
                            isSelected ? "text-primary" : "text-gray-700 group-hover:text-primary"
                        )}>
                            <span className="block text-xs font-normal text-gray-500 mb-1">
                                {part.p_brands?.name}
                            </span>
                            {part.name}
                        </h3>
                    </Link>
                );
            })}
        </div>
    );
}
