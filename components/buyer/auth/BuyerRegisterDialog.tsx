"use client"

import React, { useState, useEffect } from "react"
import { useActionState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Lock, Mail, Phone, MapPin } from "lucide-react"
import { buyerRegister } from "@/app/actions/buyer-auth"
import { getDistricts, getCities } from "@/app/actions/location"
import { DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

interface BuyerRegisterDialogProps {
    onSwitchToSignIn: () => void
    onSuccess: () => void
}

export function BuyerRegisterDialog({ onSwitchToSignIn, onSuccess }: BuyerRegisterDialogProps) {
    // Location State
    const [districts, setDistricts] = useState<{ id: number; name: string }[]>([])
    const [cities, setCities] = useState<{ id: number; name: string }[]>([])
    const [selectedDistrict, setSelectedDistrict] = useState<string>("")

    // Fetch locations on mount
    useEffect(() => {
        getDistricts().then(setDistricts)
    }, [])

    // Fetch cities when district changes
    useEffect(() => {
        if (selectedDistrict) {
            getCities(parseInt(selectedDistrict)).then(setCities)
        } else {
            setCities([])
        }
    }, [selectedDistrict])

    // --- Register Action ---
    const initialRegisterState = { message: "", errors: {} }
    const [registerState, registerAction, isRegisterPending] = useActionState(buyerRegister, initialRegisterState)

    // Handle Success
    useEffect(() => {
        if (registerState.message?.startsWith("success")) {
            onSuccess()
            window.location.href = "/buyer/profile" // Force full reload to ensure session pick-up
        }
    }, [registerState, onSuccess])

    return (
        <div className="animate-in fade-in zoom-in-95 duration-200">
            <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-center">Create Account</DialogTitle>
                <DialogDescription className="text-center">
                    Join anypart.lk for free and start buying parts
                </DialogDescription>
            </DialogHeader>

            <form action={registerAction} className="space-y-3 mt-4">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                        <Label htmlFor="full_name">Full Name *</Label>
                        <Input id="full_name" name="full_name" placeholder="John Doe" required />
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="user_name_reg">Username *</Label>
                        <Input id="user_name_reg" name="user_name" placeholder="johndoe123" required />
                    </div>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="email">Email *</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="email" name="email" type="email" placeholder="john@example.com" className="pl-10" required />
                    </div>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="tel">Phone Number *</Label>
                    <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="tel" name="tel" type="tel" placeholder="0771234567" className="pl-10" required />
                    </div>
                </div>

                <div className="space-y-1">
                    <Label htmlFor="address">Address *</Label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input id="address" name="address" placeholder="123 Main St" className="pl-10" required />
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                        <Label htmlFor="district">District *</Label>
                        <select
                            id="district"
                            name="district"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            required
                        >
                            <option value="">Select District</option>
                            {districts.map(d => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="city">City *</Label>
                        <select
                            id="city"
                            name="city"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            required
                            disabled={!selectedDistrict}
                        >
                            <option value="">Select City</option>
                            {cities.map(c => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                        <Label htmlFor="password_reg">Password *</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input id="password_reg" name="password" type="password" placeholder="******" className="pl-10" required />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <Label htmlFor="confirm_password">Confirm *</Label>
                        <Input id="confirm_password" name="confirm_password" type="password" placeholder="******" required />
                    </div>
                </div>

                {registerState.message && !registerState.message.startsWith("success") && (
                    <p className="text-sm text-red-500 font-medium">{registerState.message}</p>
                )}

                <Button type="submit" className="w-full mt-2" disabled={isRegisterPending}>
                    {isRegisterPending ? "Registering..." : "Create Account"}
                </Button>
            </form>

            <DialogFooter className="mr-auto w-full pt-4">
                <div className="flex items-center justify-center w-full text-sm">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <button
                        onClick={onSwitchToSignIn}
                        className="ml-1 font-semibold text-primary hover:underline"
                    >
                        Sign In
                    </button>
                </div>
            </DialogFooter>
        </div>
    )
}
