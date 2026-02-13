"use server"

import { prisma } from "@/lib/prisma"

export async function getDistricts() {
    try {
        return await prisma.disctricts.findMany({
            orderBy: { name: "asc" },
            select: { id: true, name: true },
        })
    } catch (error) {
        console.error("Fetch districts error:", error)
        return []
    }
}

export async function getCities(districtId?: number) {
    try {
        return await prisma.cities.findMany({
            where: districtId ? { disctrict_id: districtId } : {},
            orderBy: { name: "asc" },
            select: { id: true, name: true },
        })
    } catch (error) {
        console.error("Fetch cities error:", error)
        return []
    }
}
