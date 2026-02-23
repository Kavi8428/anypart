"use server"

import { getBuyerSession, getSellerSession } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// Types
type TargetRole = "buyer" | "seller"
type CurrentRole = "buyer" | "seller"

// Helper to check auth
async function verifySession(currentRole: CurrentRole) {
    if (currentRole === "buyer") {
        const session = await getBuyerSession()
        if (!session) return null
        return { type: 0, id: session.buyer_id }
    } else {
        const session = await getSellerSession()
        if (!session) return null
        return { type: 1, id: session.seller_id }
    }
}

// ─── Rate User ────────────────────────────────────────────────────────────────
export async function rateUser(
    targetId: number,
    targetRole: TargetRole,
    rating: number,
    comment: string,
    currentRole: CurrentRole
) {
    try {
        const userScope = await verifySession(currentRole)
        if (!userScope) return { error: "Not authenticated" }

        if (rating < 1 || rating > 5) return { error: "Rating must be between 1 and 5" }

        // Determine target type ID
        const targetTypeId = targetRole === "buyer" ? 0 : 1

        // Check if rating already exists to update it, or create a new one
        const existingRating = await prisma.user_ratings.findFirst({
            where: {
                rater_id: userScope.id,
                rater_type: userScope.type,
                rated_id: targetId,
                rated_type: targetTypeId,
            }
        })

        if (existingRating) {
            await prisma.user_ratings.update({
                where: { id: existingRating.id },
                data: {
                    rating: rating,
                    comment: comment.trim() || null,
                }
            })
        } else {
            await prisma.user_ratings.create({
                data: {
                    rater_id: userScope.id,
                    rater_type: userScope.type,
                    rated_id: targetId,
                    rated_type: targetTypeId,
                    rating: rating,
                    comment: comment.trim() || null,
                }
            })
        }

        return { success: true }
    } catch (error) {
        console.error("Error rating user:", error)
        return { error: "Failed to submit rating" }
    }
}

// ─── Report User ──────────────────────────────────────────────────────────────
export async function reportUser(
    targetId: number,
    targetRole: TargetRole,
    reason: string,
    currentRole: CurrentRole
) {
    try {
        const userScope = await verifySession(currentRole)
        if (!userScope) return { error: "Not authenticated" }

        if (!reason.trim()) return { error: "A valid reason is required" }

        const targetTypeId = targetRole === "buyer" ? 0 : 1

        await prisma.user_reports.create({
            data: {
                reporter_id: userScope.id,
                reporter_type: userScope.type,
                reported_id: targetId,
                reported_type: targetTypeId,
                reason: reason.trim(),
                status: "pending"
            }
        })

        return { success: true }
    } catch (error) {
        console.error("Error reporting user:", error)
        return { error: "Failed to submit report" }
    }
}

// ─── Get User Ratings Stats ───────────────────────────────────────────────────
export async function getUserRatingStats(targetId: number, targetRole: TargetRole) {
    try {
        const targetTypeId = targetRole === "buyer" ? 0 : 1

        const aggregations = await prisma.user_ratings.aggregate({
            _avg: {
                rating: true,
            },
            _count: {
                rating: true,
            },
            where: {
                rated_id: targetId,
                rated_type: targetTypeId,
            },
        })

        return {
            average: aggregations._avg.rating || 0,
            count: aggregations._count.rating || 0,
        }
    } catch (error) {
        console.error("Error fetching user rating stats:", error)
        return { average: 0, count: 0 }
    }
}
