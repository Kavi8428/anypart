"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Search, ShoppingCart, User, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { getSearchSuggestions, getVehicleBrands } from "@/lib/buyer"
import { BuyerSignInDialog } from "./auth/BuyerSignInDialog"

export function BuyerHeader({ user }: { user?: { id: number; full_name: string } | null }) {
    const router = useRouter()
    const [query, setQuery] = useState("")
    const [selectedBrand, setSelectedBrand] = useState("all")
    const [brands, setBrands] = useState<{ id: number; name: string }[]>([])
    const [suggestions, setSuggestions] = useState<{
        id: number
        label: string
        brandId?: number
        modelName?: string
        vModelId?: number
        yearId?: number | null
        partId?: number
    }[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    // Fetch real brands on mount
    useEffect(() => {
        async function fetchBrands() {
            const data = await getVehicleBrands()
            setBrands(data)
        }
        fetchBrands()
    }, [])

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length > 0) {
                setIsLoading(true)
                const results = await getSearchSuggestions(query, selectedBrand)
                setSuggestions(results)
                setIsOpen(results.length > 0)
                setIsLoading(false)
            } else {
                setSuggestions([])
                setIsOpen(false)
            }
        }, 300)

        return () => clearTimeout(timer)
    }, [query, selectedBrand])

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const handleSearch = (overrideQuery?: string) => {
        const searchTerms = overrideQuery || query
        if (!searchTerms.trim() && selectedBrand === "all") return

        setIsOpen(false)
        const params = new URLSearchParams()
        if (searchTerms.trim()) params.append("q", searchTerms.trim())
        if (selectedBrand !== "all") params.append("brandId", selectedBrand)

        router.push(`/buyer/categories?${params.toString()}`)
    }

    const handleSuggestionClick = (suggestion: typeof suggestions[0]) => {
        setIsOpen(false)
        setQuery("")

        // Build the proper category URL with all navigation data
        const params = new URLSearchParams()
        if (suggestion.brandId) params.append("brandId", suggestion.brandId.toString())
        if (suggestion.modelName) params.append("modelName", encodeURIComponent(suggestion.modelName))
        if (suggestion.yearId) params.append("yearId", suggestion.yearId.toString())
        if (suggestion.vModelId) params.append("vModelId", suggestion.vModelId.toString())
        if (suggestion.partId) params.append("partId", suggestion.partId.toString())

        router.push(`/buyer/categories?${params.toString()}`)
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") {
            handleSearch()
        }
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white shadow-xs">
            <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-3">
                {/* Top Row: Logo & Actions */}
                <div className="flex items-center justify-between gap-2 sm:gap-4 mb-2 sm:mb-0">
                    {/* Logo */}
                    <Link href="/buyer" className="flex items-center">
                        <span className="text-xl sm:text-2xl font-bold text-black tracking-tight">anypart</span>
                        <span className="text-xl sm:text-2xl font-bold text-primary">.lk</span>
                    </Link>

                    {/* Desktop Search Bar (Hidden on Mobile) */}
                    <div ref={dropdownRef} className="hidden sm:flex relative flex-1 items-center max-w-2xl gap-0 border rounded-lg bg-white shadow-sm focus-within:ring-1 focus-within:ring-primary border-gray-200">
                        <div className="hidden md:block">
                            <Select
                                value={selectedBrand}
                                onValueChange={(val) => setSelectedBrand(val)}
                            >
                                <SelectTrigger className="w-[120px] border-none shadow-none focus:ring-0 rounded-none border-r">
                                    <SelectValue placeholder="Brand" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Brands</SelectItem>
                                    {brands.map((brand) => (
                                        <SelectItem key={brand.id} value={brand.id.toString()}>
                                            {brand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="relative flex-1">
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => query.length > 0 && suggestions.length > 0 && setIsOpen(true)}
                                placeholder="Search for auto parts..."
                                className="w-full border-none shadow-none focus-visible:ring-0 pl-10 h-10 rounded-none px-4"
                            />
                            <button
                                onClick={() => handleSearch()}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                ) : (
                                    <Search className="h-4 w-4" />
                                )}
                            </button>
                        </div>

                        {/* Suggestions Dropdown (Desktop) */}
                        {isOpen && (
                            <div className="absolute top-[calc(100%+8px)] left-0 right-0 bg-white border border-gray-100 rounded-xl shadow-2xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                                <div className="py-2">
                                    {suggestions.map((suggestion) => (
                                        <button
                                            key={suggestion.id}
                                            onClick={() => handleSuggestionClick(suggestion)}
                                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-left group"
                                        >
                                            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-gray-50 group-hover:bg-white transition-colors">
                                                <Search className="h-4 w-4 text-gray-400 group-hover:text-primary transition-colors" />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700 group-hover:text-gray-900 truncate">
                                                {suggestion.label}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 sm:gap-4">
                        <Link href="/buyer/cart" className="relative p-2 text-gray-700 hover:text-primary transition-colors">
                            <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
                            <span className="absolute top-1 right-1 flex h-3.5 w-3.5 sm:h-4 sm:w-4 items-center justify-center rounded-full bg-primary text-[8px] sm:text-[10px] font-bold text-white">
                                3
                            </span>
                        </Link>
                        {user ? (
                            <Link href="/buyer/profile" className="p-2 text-gray-700 hover:text-primary transition-colors">
                                <User className="h-5 w-5 sm:h-6 sm:w-6" />
                            </Link>
                        ) : (
                            <BuyerSignInDialog>
                                <button className="p-2 text-gray-700 hover:text-primary transition-colors">
                                    <User className="h-5 w-5 sm:h-6 sm:w-6" />
                                </button>
                            </BuyerSignInDialog>
                        )}
                    </div>
                </div>

                {/* Mobile Search Bar (Only visible on small screens) */}
                <div className="sm:hidden relative flex flex-col gap-2">
                    <div className="flex gap-2 h-10">
                        <div className="flex-1 relative flex items-center border border-gray-200 rounded-lg bg-white shadow-sm focus-within:ring-1 focus-within:ring-primary overflow-hidden">
                            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground z-10">
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                ) : (
                                    <button onClick={() => handleSearch()}>
                                        <Search className="h-4 w-4 hover:text-primary transition-colors" />
                                    </button>
                                )}
                            </div>
                            <Input
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                onFocus={() => query.length > 0 && suggestions.length > 0 && setIsOpen(true)}
                                placeholder="Search auto parts..."
                                className="w-full border-none shadow-none focus-visible:ring-0 pl-9 h-full text-sm py-2"
                            />
                        </div>

                        <div className="w-24">
                            <Select
                                value={selectedBrand}
                                onValueChange={(val) => setSelectedBrand(val)}
                            >
                                <SelectTrigger className="w-full h-full border-gray-200 shadow-sm focus:ring-1 focus:ring-primary text-xs px-2 py-0">
                                    <SelectValue placeholder="Brand" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Brands</SelectItem>
                                    {brands.map((brand) => (
                                        <SelectItem key={brand.id} value={brand.id.toString()}>
                                            {brand.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Suggestions Dropdown (Mobile) */}
                    {isOpen && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-lg shadow-xl overflow-hidden z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
                            <div className="py-1 max-h-[60vh] overflow-y-auto">
                                {suggestions.map((suggestion) => (
                                    <button
                                        key={suggestion.id}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-none"
                                    >
                                        <div className="flex items-center justify-center shrink-0 h-7 w-7 rounded bg-gray-50">
                                            <Search className="h-3.5 w-3.5 text-gray-400" />
                                        </div>
                                        <span className="text-xs font-medium text-gray-700 truncate">
                                            {suggestion.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
