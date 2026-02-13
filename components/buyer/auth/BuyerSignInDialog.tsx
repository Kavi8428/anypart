"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useActionState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { User, Lock, Globe } from "lucide-react"
import { buyerLogin } from "@/app/actions/buyer-auth"
import { BuyerRegisterDialog } from "./BuyerRegisterDialog"

// Helper to simulate Google Login (mock)
const handleGoogleLogin = () => {
    alert("Google Login is not configured yet. This would redirect to Google OAuth.")
}

export function BuyerSignInDialog({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [view, setView] = useState<"signin" | "register">("signin")
    const router = useRouter()

    // --- Sign In Action ---
    const initialLoginState = { message: "", errors: {} }
    const [loginState, loginAction, isLoginPending] = useActionState(buyerLogin, initialLoginState)

    // Handle Success / Redirect
    useEffect(() => {
        if (loginState.message?.startsWith("success")) {
            // Using setTimeout to avoid react-hooks/set-state-in-effect warning
            const timer = setTimeout(() => {
                setIsOpen(false)
                router.push("/buyer/profile")
                router.refresh()
            }, 0)
            return () => clearTimeout(timer)
        }
    }, [loginState, router])

    // Reset view when dialog closes
    useEffect(() => {
        if (!isOpen) {
            // Small delay to prevent jitter during close animation
            const timer = setTimeout(() => setView("signin"), 200)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] overflow-y-auto max-h-[90vh]">

                {view === "signin" ? (
                    <div className="animate-in fade-in zoom-in-95 duration-200">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-bold text-center">
                                Welcome Back
                            </DialogTitle>
                            <DialogDescription className="text-center">
                                Enter your credentials to access your account
                            </DialogDescription>
                        </DialogHeader>

                        <form action={loginAction} className="space-y-4 mt-6">
                            <div className="space-y-2">
                                <Label htmlFor="user_name">Username</Label>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input id="user_name" name="user_name" placeholder="Enter your username" className="pl-10" required />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                    <Input id="password" name="password" type="password" placeholder="Enter your password" className="pl-10" required />
                                </div>
                            </div>

                            {loginState.message && !loginState.message.startsWith("success") && (
                                <p className="text-sm text-red-500 font-medium">{loginState.message}</p>
                            )}

                            <Button type="submit" className="w-full" disabled={isLoginPending}>
                                {isLoginPending ? "Signing In..." : "Sign In"}
                            </Button>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <Button variant="outline" type="button" className="w-full mb-6" onClick={handleGoogleLogin}>
                            <Globe className="mr-2 h-4 w-4" />
                            Google
                        </Button>

                        <DialogFooter className="sm:justify-center w-full border-t pt-4">
                            <div className="flex items-center justify-center w-full text-sm">
                                <span className="text-muted-foreground">Don&apos;t have an account? </span>
                                <button
                                    onClick={() => setView("register")}
                                    className="ml-1 font-semibold text-primary hover:underline"
                                >
                                    Just register
                                </button>
                            </div>
                        </DialogFooter>
                    </div>
                ) : (
                    <BuyerRegisterDialog
                        onSwitchToSignIn={() => setView("signin")}
                        onSuccess={() => {
                            setIsOpen(false)
                            router.refresh()
                        }}
                    />
                )}

            </DialogContent>
        </Dialog>
    )
}
