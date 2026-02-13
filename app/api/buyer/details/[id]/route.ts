import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { cookies } from "next/headers"

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const id = parseInt(params.id)
        if (isNaN(id)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 })
        }

        // Authenticate
        const cookieStore = await cookies()
        const token = cookieStore.get("buyer_session")?.value

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const session = await prisma.buyer_sessions.findFirst({
            where: {
                token: token,
                token_expire_at: { gt: new Date() }
            },
            select: {
                buyer_id: true
            }
        })

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        // Check ownership
        if (session.buyer_id !== id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 })
        }

        const buyer = await prisma.buyer_details.findUnique({
            where: { id: id },
            include: {
                cities: true,
                disctricts: true
            }
        })

        if (!buyer) {
            return NextResponse.json({ error: "Buyer not found" }, { status: 404 })
        }

        const { password, ...buyerWithoutPassword } = buyer
        return NextResponse.json(buyerWithoutPassword)

    } catch (error) {
        console.error("API Error:", error)
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
    }
}
