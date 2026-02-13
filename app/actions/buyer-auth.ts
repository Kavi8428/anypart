"use server"

import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function buyerLogin(prevState: any, formData: FormData) {
    const userName = formData.get("user_name") as string
    const password = formData.get("password") as string

    if (!userName || !password) {
        return { message: "Please enter both username and password.", errors: {} }
    }

    try {
        // Authenticate (using findFirst similar to seller logic)
        const buyer = await prisma.buyer_details.findFirst({
            where: {
                user_name: userName,
                password: password, // In production, use bcrypt.compare
            },
        })

        if (!buyer) {
            return { message: "Invalid username or password.", errors: {} }
        }

        // Create Session Token (using random simple token for demo purposes, use crypto in prod)
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36)
        const expiry = new Date()
        expiry.setDate(expiry.getDate() + 7) // 7 days

        await prisma.buyer_sessions.create({
            data: {
                buyer_id: buyer.id,
                token: token,
                token_expire_at: expiry,
                last_visit_page: "/buyer", // Default
            },
        })

        const cookieStore = await cookies()
        cookieStore.set("buyer_session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            expires: expiry,
            path: "/",
            sameSite: "lax",
        })

        return { message: "success: Login successful!", errors: {} }
    } catch (error) {
        console.error("Buyer login error:", error)
        return { message: "Something went wrong. Please try again.", errors: {} }
    }
}

export async function buyerRegister(prevState: any, formData: FormData) {
    const fullName = formData.get("full_name") as string
    const email = formData.get("email") as string
    const address = formData.get("address") as string
    const tel = formData.get("tel") as string
    const cityId = formData.get("city") as string
    const districtId = formData.get("district") as string
    const userName = formData.get("user_name") as string
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm_password") as string

    // Validation
    if (!fullName || !email || !address || !tel || !cityId || !districtId || !userName || !password) {
        return { message: "Please fill in all required fields.", errors: {} }
    }

    if (password !== confirmPassword) {
        return { message: "Passwords do not match.", errors: {} }
    }

    try {
        // Check for existing user
        const existing = await prisma.buyer_details.findFirst({
            where: {
                OR: [{ user_name: userName }, { email: email }],
            },
        })

        if (existing) {
            return { message: "Username or Email already taken.", errors: {} }
        }

        // Create Buyer
        const newBuyer = await prisma.buyer_details.create({
            data: {
                full_name: fullName,
                email: email,
                address: address,
                tel: parseInt(tel),
                city: parseInt(cityId),
                district: parseInt(districtId),
                user_name: userName,
                password: password, // In production, hash this
                verified: 0,
            },
        })

        // Auto Login after Register
        const token = Math.random().toString(36).substring(2) + Date.now().toString(36)
        const expiry = new Date()
        expiry.setDate(expiry.getDate() + 7)

        await prisma.buyer_sessions.create({
            data: {
                buyer_id: newBuyer.id,
                token: token,
                token_expire_at: expiry,
                last_visit_page: "/buyer",
            },
        })

        const cookieStore = await cookies()
        cookieStore.set("buyer_session", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            expires: expiry,
            path: "/",
            sameSite: "lax",
        })

        return { message: "success: Registration successful!", errors: {} }
    } catch (error) {
        console.error("Buyer registration error:", error)
        return { message: "Something went wrong. Please try again.", errors: {} }
    }
}

export async function buyerLogout() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("buyer_session")?.value

        if (token) {
            // Invalidate session in DB
            await prisma.buyer_sessions.deleteMany({
                where: { token: token },
            })
        }

        cookieStore.delete("buyer_session")
    } catch (error) {
        console.error("Logout error:", error)
    }
}

