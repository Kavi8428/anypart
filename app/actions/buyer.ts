"use server"

import { prisma } from "@/lib/prisma"

export async function getFeaturedProducts() {
    try {
        const products = await prisma.seller_products.findMany({
            where: {
                is_featured: 1,
            },
            select: {
                id: true,
                price: true,
                image_url_1: true,
                p_name_ref: {
                    select: {
                        name: true
                    }
                },
                v_model_ref: {
                    select: {
                        name: true,
                        v_brands: {
                            select: {
                                name: true
                            }
                        }
                    }
                },
                v_year_ref: {
                    select: {
                        year: true
                    }
                }
            },
            orderBy: {
                created_at: "desc",
            },
            take: 8, // Limit for homepage
        })

        if (!products) return []

        // Map to ProductCard expectations
        return products.map((product) => {
            const brand = product.v_model_ref?.v_brands?.name || "Unknown"
            const model = product.v_model_ref?.name || "Model"
            const year = product.v_year_ref?.year?.toString() || ""

            return {
                id: product.id.toString(),
                title: product.p_name_ref?.name || "Unknown Part",
                makeModel: year ? `${year} • ${brand} • ${model}`.toUpperCase() : `${brand} • ${model}`.toUpperCase(),
                price: product.price,
                rating: 0, // Not implemented yet
                reviewsCount: 0, // Not implemented yet
                imageUrl: product.image_url_1 ? `/products/${product.image_url_1}` : undefined,
            }
        })
    } catch (error) {
        console.error("Error fetching featured products:", error)
        return []
    }
}

export async function getProductDetails(productId: number) {
    try {
        // 1. Get current buyer ID (if any)
        const buyer = await getBuyerDetails()
        const buyerId = buyer?.id

        // 2. Check if buyer has unlocked this product
        let isUnlocked = false
        if (buyerId) {
            const existingOrder = await prisma.orders.findFirst({
                where: {
                    buyer_id: buyerId,
                    product_id: productId
                }
            })
            if (existingOrder) isUnlocked = true
        }

        // 3. Fetch product with seller details
        const product = await prisma.seller_products.findUnique({
            where: { id: productId },
            include: {
                p_name_ref: {
                    include: {
                        p_brands: true,
                    },
                },
                v_model_ref: {
                    include: {
                        v_brands: true,
                        v_years: true,
                    },
                },
                v_year_ref: true,
                condition_ref: true,
                hash_tag_1_ref: true,
                hash_tag_2_ref: true,
                hash_tag_3_ref: true,
                seller_details: {
                    select: {
                        id: true,
                        name: true,
                        logo_url: true,
                        address: true,
                        tel1: true,
                        tel2: true,
                        city: true,
                    },
                },
            },
        })

        if (!product) return null

        // 4. Filter sensitive data if not unlocked
        if (!isUnlocked) {
            // Create a safe version of the product object
            return {
                ...product,
                isUnlocked: false,
                seller_details: {
                    ...product.seller_details,
                    tel1: null,
                    tel2: null,
                    address: null, // Hide specific address, maybe keep city? City is separate field not in seller_details select above but in schema. schema has city field.
                    // Let's check schema again. Seller details has `city` (Int).
                    // In the select above we included city: true.
                    // We can keep city visible as it's general info.
                }
            }
        }

        return { ...product, isUnlocked: true }

    } catch (error) {
        console.error("Error fetching product details:", error)
        return null
    }
}

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

export async function getBuyerDetails() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get("buyer_session")?.value

        if (!token) return null

        const session = await prisma.buyer_sessions.findFirst({
            where: {
                token: token,
                token_expire_at: { gt: new Date() }
            },
            include: {
                buyer_details: {
                    include: {
                        cities: true,
                        disctricts: true
                    }
                }
            }
        })

        if (!session || !session.buyer_details) return null

        const { password, ...buyerWithoutPassword } = session.buyer_details
        void password // Explicitly mark as intentionally unused
        return buyerWithoutPassword
    } catch (error) {
        console.error("Error fetching buyer details:", error)
        return null
    }
}

export async function getBuyerCredits() {
    try {
        const buyer = await getBuyerDetails()
        if (!buyer) return 0

        // Count unused tokens
        // Check schema: buyer_order_token has status (0=unused?), expiry_at
        // Assuming status 0 is unused.
        const count = await prisma.buyer_order_token.count({
            where: {
                buyer_id: buyer.id,
                status: 0,
                // expiry_at: { gt: new Date() } // Optional: enforce expiry
            }
        })
        return count
    } catch {
        return 0
    }
}

export async function unlockSellerDetails(productId: number) {
    try {
        const buyer = await getBuyerDetails()
        if (!buyer) return { success: false, message: "Please log in to view seller details." }

        // 1. Check if already unlocked
        const existingOrder = await prisma.orders.findFirst({
            where: {
                buyer_id: buyer.id,
                product_id: productId
            }
        })

        if (existingOrder) {
            return { success: true, message: "Already unlocked." }
        }

        // 2. Find available token
        const token = await prisma.buyer_order_token.findFirst({
            where: {
                buyer_id: buyer.id,
                status: 0,
                // expiry_at: { gt: new Date() } // Optional
            },
            orderBy: {
                expiry_at: 'asc' // Use expiring tokens first
            }
        })

        if (!token) {
            return { success: false, message: "No credits available. Please purchase a token package." }
        }

        // 3. Consume token and create order
        await prisma.$transaction(async (tx) => {
            // Create Order
            const newOrder = await tx.orders.create({
                data: {
                    buyer_id: buyer.id,
                    product_id: productId,
                    created_at: new Date(),
                    updated_at: new Date(),
                }
            })

            // Update Token
            await tx.buyer_order_token.update({
                where: { id: token.id },
                data: {
                    status: 1, // Used
                    order_id: newOrder.id,
                    updated_at: new Date()
                }
            })
        })



        revalidatePath(`/buyer/product_view/${productId}`)
        return { success: true, message: "Seller details unlocked!" }

    } catch (error) {
        console.error("Error unlocking seller details:", error)
        return { success: false, message: "Failed to unlock. Please try again." }
    }
}

export async function getCreditPackages() {
    try {
        const packages = await prisma.buyer_amounts.findMany({
            orderBy: {
                amount: 'asc'
            }
        })
        return packages
    } catch (error) {
        console.error("Error fetching credit packages:", error)
        return []
    }
}

export async function getUnlockedProducts() {
    try {
        const buyer = await getBuyerDetails()
        if (!buyer) return []

        const orders = await prisma.orders.findMany({
            where: { buyer_id: buyer.id },
            include: {
                seller_products: {
                    select: {
                        id: true,
                        p_name_ref: true,
                        v_model_ref: {
                            select: {
                                name: true,
                                v_brands: { select: { name: true } }
                            }
                        },
                        v_year_ref: { select: { year: true } },
                        seller_details: {
                            select: {
                                id: true,
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: { created_at: 'desc' }
        })
        return orders
    } catch (error) {
        console.error("Error fetching unlocked products:", error)
        return []
    }
}

export async function getPaymentHistory() {
    try {
        const buyer = await getBuyerDetails()
        if (!buyer) return []

        const payments = await prisma.buyer_payments.findMany({
            where: { buyer_id: buyer.id },
            include: {
                buyer_amounts: true,
                payment_status: true
            },
            orderBy: { created_at: 'desc' }
        })
        return payments
    } catch (error) {
        console.error("Error fetching payment history:", error)
        return []
    }
}
