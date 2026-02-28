"use server"

import { prisma } from "@/lib/prisma"
import { getAdminSession } from "@/lib/auth"
import { revalidatePath } from "next/cache"

async function verifyAdmin() {
    const session = await getAdminSession()
    if (!session) throw new Error("Unauthorized")
    return session
}

// ==========================================
// Dashboard Stats
// ==========================================
export async function getAdminStats() {
    await verifyAdmin()

    const [
        totalBuyers,
        totalSellers,
        totalProducts,
        totalOrders,
        pendingReports,
        totalGross
    ] = await Promise.all([
        prisma.buyer_details.count({ where: { deleted_at: null } }),
        prisma.seller_details.count({ where: { deleted_at: null } }),
        prisma.seller_products.count({ where: { deleted_at: null } }),
        prisma.orders.count(),
        prisma.user_reports.count({ where: { status: "pending" } }),
        prisma.seller_payments.aggregate({
            _sum: { amount: true },
            where: { status_ref: { status: "Completed" } }
        })
    ])

    return {
        totalBuyers,
        totalSellers,
        totalProducts,
        totalOrders,
        pendingReports,
        revenue: totalGross._sum.amount || 0
    }
}

// ==========================================
// Buyers
// ==========================================
export async function getBuyers() {
    await verifyAdmin()
    return prisma.buyer_details.findMany({
        where: { deleted_at: null },
        include: { cities: true, districts: true },
        orderBy: { created_at: "desc" }
    })
}

export async function toggleBuyerVerify(id: number, currentStatus: number) {
    await verifyAdmin()
    await prisma.buyer_details.update({
        where: { id },
        data: { verified: currentStatus === 1 ? 0 : 1 }
    })
    revalidatePath("/admin/buyers")
}

export async function deleteBuyer(id: number) {
    await verifyAdmin()
    await prisma.buyer_details.update({
        where: { id },
        data: { deleted_at: new Date() }
    })
    revalidatePath("/admin/buyers")
}

export async function getBuyerFullDetails(id: number) {
    await verifyAdmin()
    const buyer = await prisma.buyer_details.findUnique({
        where: { id },
        include: {
            cities: true,
            districts: true,
            orders: {
                include: {
                    seller_products: {
                        include: { p_name_ref: true, v_model_ref: true }
                    }
                },
                orderBy: { created_at: "desc" }
            },
            buyer_payments: {
                include: { buyer_amounts: true, payment_status: true },
                orderBy: { created_at: "desc" }
            },
            buyer_order_token: {
                include: { orders: true, buyer_payments: true },
                orderBy: { created_at: "desc" }
            }
        }
    })

    if (!buyer) return null;

    const ratings = await prisma.user_ratings.findMany({
        where: { rated_id: id, rated_type: 0 },
        orderBy: { created_at: "desc" }
    })

    const reports = await prisma.user_reports.findMany({
        where: { reported_id: id, reported_type: 0 },
        orderBy: { created_at: "desc" }
    })

    return { ...buyer, ratings, reports }
}

// ==========================================
// Sellers
// ==========================================
export async function getSellers() {
    await verifyAdmin()
    return prisma.seller_details.findMany({
        where: { deleted_at: null },
        include: { cities: true, seller_types: true },
        orderBy: { created_at: "desc" }
    })
}

export async function toggleSellerVerify(id: number, currentStatus: number) {
    await verifyAdmin()
    await prisma.seller_details.update({
        where: { id },
        data: { verified: currentStatus === 1 ? 0 : 1 }
    })
    revalidatePath("/admin/sellers")
}

export async function deleteSeller(id: number) {
    await verifyAdmin()
    await prisma.seller_details.update({
        where: { id },
        data: { deleted_at: new Date() }
    })
    revalidatePath("/admin/sellers")
}

// ==========================================
// Vehicle Brands
// ==========================================
export async function getVehicleBrands() {
    await verifyAdmin()
    return prisma.v_brands.findMany({ orderBy: { name: "asc" } })
}

export async function createVehicleBrand(formData: FormData) {
    await verifyAdmin()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    await prisma.v_brands.create({ data: { name, description } })
    revalidatePath("/admin/v-brands")
}

export async function updateVehicleBrand(id: number, formData: FormData) {
    await verifyAdmin()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    await prisma.v_brands.update({ where: { id }, data: { name, description } })
    revalidatePath("/admin/v-brands")
}

export async function deleteVehicleBrand(id: number) {
    await verifyAdmin()
    await prisma.v_brands.delete({ where: { id } })
    revalidatePath("/admin/v-brands")
}

// ==========================================
// Vehicle Models
// ==========================================
export async function getVehicleModels() {
    await verifyAdmin()
    return prisma.v_models.findMany({
        include: { v_brands: true, v_years: true },
        orderBy: { name: "asc" }
    })
}

export async function createVehicleModel(formData: FormData) {
    await verifyAdmin()
    const name = formData.get("name") as string
    const v_brand = parseInt(formData.get("v_brand") as string)
    const year = formData.get("year") ? parseInt(formData.get("year") as string) : null
    const description = formData.get("description") as string
    await prisma.v_models.create({ data: { name, v_brand, year, description } })
    revalidatePath("/admin/v-models")
}

export async function updateVehicleModel(id: number, formData: FormData) {
    await verifyAdmin()
    const name = formData.get("name") as string
    const v_brand = parseInt(formData.get("v_brand") as string)
    const year = formData.get("year") ? parseInt(formData.get("year") as string) : null
    const description = formData.get("description") as string
    await prisma.v_models.update({ where: { id }, data: { name, v_brand, year, description } })
    revalidatePath("/admin/v-models")
}

export async function deleteVehicleModel(id: number) {
    await verifyAdmin()
    await prisma.v_models.delete({ where: { id } })
    revalidatePath("/admin/v-models")
}

// ==========================================
// Part Brands
// ==========================================
export async function getPartBrands() {
    await verifyAdmin()
    return prisma.p_brands.findMany({ orderBy: { name: "asc" } })
}

export async function createPartBrand(formData: FormData) {
    await verifyAdmin()
    const name = formData.get("name") as string
    const logo_url = formData.get("logo_url") as string || "placeholder.png"
    const description = formData.get("description") as string
    await prisma.p_brands.create({ data: { name, logo_url, description } })
    revalidatePath("/admin/p-brands")
}

export async function updatePartBrand(id: number, formData: FormData) {
    await verifyAdmin()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    await prisma.p_brands.update({ where: { id }, data: { name, description } })
    revalidatePath("/admin/p-brands")
}

export async function deletePartBrand(id: number) {
    await verifyAdmin()
    await prisma.p_brands.delete({ where: { id } })
    revalidatePath("/admin/p-brands")
}

// ==========================================
// Part Names (Models)
// ==========================================
export async function getPartNames() {
    await verifyAdmin()
    return prisma.p_names.findMany({
        include: { p_brands: true },
        orderBy: { name: "asc" }
    })
}

export async function createPartName(formData: FormData) {
    await verifyAdmin()
    const name = formData.get("name") as string
    const part_brand = parseInt(formData.get("part_brand") as string)
    await prisma.p_names.create({ data: { name, part_brand } })
    revalidatePath("/admin/p-models")
}

export async function updatePartName(id: number, formData: FormData) {
    await verifyAdmin()
    const name = formData.get("name") as string
    const part_brand = parseInt(formData.get("part_brand") as string)
    await prisma.p_names.update({ where: { id }, data: { name, part_brand } })
    revalidatePath("/admin/p-models")
}

export async function deletePartName(id: number) {
    await verifyAdmin()
    await prisma.p_names.delete({ where: { id } })
    revalidatePath("/admin/p-models")
}

// ==========================================
// Hash Tags
// ==========================================
export async function getHashTags() {
    await verifyAdmin()
    return prisma.hash_tags.findMany({ orderBy: { name: "asc" } })
}

export async function createHashTag(formData: FormData) {
    await verifyAdmin()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    await prisma.hash_tags.create({ data: { name, description } })
    revalidatePath("/admin/hash-tags")
}

export async function updateHashTag(id: number, formData: FormData) {
    await verifyAdmin()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    await prisma.hash_tags.update({ where: { id }, data: { name, description } })
    revalidatePath("/admin/hash-tags")
}

export async function deleteHashTag(id: number) {
    await verifyAdmin()
    await prisma.hash_tags.delete({ where: { id } })
    revalidatePath("/admin/hash-tags")
}

// ==========================================
// Conditions
// ==========================================
export async function getConditions() {
    await verifyAdmin()
    return prisma.conditions.findMany({ orderBy: { status: "asc" } })
}

export async function createCondition(formData: FormData) {
    await verifyAdmin()
    const status = formData.get("status") as string
    const description = formData.get("description") as string
    await prisma.conditions.create({ data: { status, description } })
    revalidatePath("/admin/conditions")
}

export async function updateCondition(id: number, formData: FormData) {
    await verifyAdmin()
    const status = formData.get("status") as string
    const description = formData.get("description") as string
    await prisma.conditions.update({ where: { id }, data: { status, description } })
    revalidatePath("/admin/conditions")
}

export async function deleteCondition(id: number) {
    await verifyAdmin()
    await prisma.conditions.delete({ where: { id } })
    revalidatePath("/admin/conditions")
}

// ==========================================
// Seller Types
// ==========================================
export async function getSellerTypes() {
    await verifyAdmin()
    return prisma.seller_types.findMany({ orderBy: { type: "asc" } })
}

export async function createSellerType(formData: FormData) {
    await verifyAdmin()
    const type = formData.get("type") as string
    const description = formData.get("description") as string
    await prisma.seller_types.create({ data: { type, description } })
    revalidatePath("/admin/seller-types")
}

export async function updateSellerType(id: number, formData: FormData) {
    await verifyAdmin()
    const type = formData.get("type") as string
    const description = formData.get("description") as string
    await prisma.seller_types.update({ where: { id }, data: { type, description } })
    revalidatePath("/admin/seller-types")
}

export async function deleteSellerType(id: number) {
    await verifyAdmin()
    await prisma.seller_types.delete({ where: { id } })
    revalidatePath("/admin/seller-types")
}

// ==========================================
// Admin Departments
// ==========================================
export async function getDepartments() {
    await verifyAdmin()
    return prisma.app_departments.findMany({ orderBy: { name: "asc" } })
}

export async function createDepartment(formData: FormData) {
    await verifyAdmin()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    await prisma.app_departments.create({ data: { name, description } })
    revalidatePath("/admin/departments")
}

export async function updateDepartment(id: number, formData: FormData) {
    await verifyAdmin()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    await prisma.app_departments.update({ where: { id }, data: { name, description } })
    revalidatePath("/admin/departments")
}

export async function deleteDepartment(id: number) {
    await verifyAdmin()
    await prisma.app_departments.delete({ where: { id } })
    revalidatePath("/admin/departments")
}

// ==========================================
// Admin Roles
// ==========================================
export async function getRoles() {
    await verifyAdmin()
    return prisma.app_admin_roles.findMany({ orderBy: { role: "asc" } })
}

export async function createRole(formData: FormData) {
    await verifyAdmin()
    const role = formData.get("role") as string
    const description = formData.get("description") as string
    await prisma.app_admin_roles.create({ data: { role, description } })
    revalidatePath("/admin/roles")
}

export async function updateRole(id: number, formData: FormData) {
    await verifyAdmin()
    const role = formData.get("role") as string
    const description = formData.get("description") as string
    await prisma.app_admin_roles.update({ where: { id }, data: { role, description } })
    revalidatePath("/admin/roles")
}

export async function deleteRole(id: number) {
    await verifyAdmin()
    await prisma.app_admin_roles.delete({ where: { id } })
    revalidatePath("/admin/roles")
}

// ==========================================
// Admin Accounts
// ==========================================
import bcrypt from "bcryptjs"

export async function getAdmins() {
    await verifyAdmin()
    return prisma.app_admins.findMany({
        include: {
            app_admin_roles: true,
            app_departments: true
        },
        orderBy: { full_name: "asc" }
    })
}

export async function createAdmin(formData: FormData) {
    await verifyAdmin()
    const full_name = formData.get("full_name") as string
    const user_name = formData.get("user_name") as string
    const email = formData.get("email") as string
    const rawPassword = formData.get("password") as string

    // Hash password
    const password = await bcrypt.hash(rawPassword, 10)

    const department = formData.get("department") ? parseInt(formData.get("department") as string) : null
    const role = formData.get("role") ? parseInt(formData.get("role") as string) : null

    await prisma.app_admins.create({
        data: { full_name, user_name, email, password, department, role }
    })
    revalidatePath("/admin/admins")
}

export async function updateAdmin(id: number, formData: FormData) {
    await verifyAdmin()
    const full_name = formData.get("full_name") as string
    const user_name = formData.get("user_name") as string
    const email = formData.get("email") as string
    const rawPassword = formData.get("password") as string

    const data: any = { full_name, user_name, email }

    if (rawPassword) {
        data.password = await bcrypt.hash(rawPassword, 10)
    }

    const departmentRaw = formData.get("department") as string
    if (departmentRaw) data.department = parseInt(departmentRaw)

    const roleRaw = formData.get("role") as string
    if (roleRaw) data.role = parseInt(roleRaw)

    await prisma.app_admins.update({ where: { id }, data })
    revalidatePath("/admin/admins")
}

export async function deleteAdmin(id: number) {
    await verifyAdmin()
    await prisma.app_admins.delete({ where: { id } })
    revalidatePath("/admin/admins")
}

// ==========================================
// User Reports
// ==========================================
export async function getReports() {
    await verifyAdmin()
    return prisma.user_reports.findMany({ orderBy: { created_at: "desc" } })
}

export async function updateReportStatus(id: number, status: string) {
    await verifyAdmin()
    await prisma.user_reports.update({ where: { id }, data: { status } })
    revalidatePath("/admin/reports")
}

export async function deleteReport(id: number) {
    await verifyAdmin()
    await prisma.user_reports.delete({ where: { id } })
    revalidatePath("/admin/reports")
}

// ==========================================
// User Ratings
// ==========================================
export async function getRatings() {
    await verifyAdmin()
    return prisma.user_ratings.findMany({ orderBy: { created_at: "desc" } })
}

export async function deleteRating(id: number) {
    await verifyAdmin()
    await prisma.user_ratings.delete({ where: { id } })
    revalidatePath("/admin/ratings")
}

// ==========================================
// Districts & Cities
// ==========================================
export async function getDistricts() {
    await verifyAdmin()
    return prisma.districts.findMany({ orderBy: { name: "asc" } })
}

export async function createDistrict(formData: FormData) {
    await verifyAdmin()
    const name = formData.get("name") as string

    const existing = await prisma.districts.findFirst({ where: { name } })
    if (existing) return { error: "A district with this name already exists" }

    await prisma.districts.create({ data: { name } })
    revalidatePath("/admin/districts")
    return { success: true }
}

export async function updateDistrict(id: number, formData: FormData) {
    await verifyAdmin()
    const name = formData.get("name") as string

    const existing = await prisma.districts.findFirst({ where: { name, id: { not: id } } })
    if (existing) return { error: "A district with this name already exists" }

    await prisma.districts.update({ where: { id }, data: { name } })
    revalidatePath("/admin/districts")
    return { success: true }
}

export async function deleteDistrict(id: number) {
    await verifyAdmin()
    await prisma.districts.delete({ where: { id } })
    revalidatePath("/admin/districts")
}

export async function getCities() {
    await verifyAdmin()
    return prisma.cities.findMany({ include: { districts: true }, orderBy: { name: "asc" } })
}

export async function createCity(formData: FormData) {
    await verifyAdmin()
    const name = formData.get("name") as string
    const district_id = parseInt(formData.get("district_id") as string)

    const existing = await prisma.cities.findFirst({ where: { name } })
    if (existing) return { error: "A city with this name already exists" }

    await prisma.cities.create({ data: { name, district_id } })
    revalidatePath("/admin/cities")
    return { success: true }
}

export async function updateCity(id: number, formData: FormData) {
    await verifyAdmin()
    const name = formData.get("name") as string
    const district_id = parseInt(formData.get("district_id") as string)

    const existing = await prisma.cities.findFirst({ where: { name, id: { not: id } } })
    if (existing) return { error: "A city with this name already exists" }

    await prisma.cities.update({ where: { id }, data: { name, district_id } })
    revalidatePath("/admin/cities")
    return { success: true }
}

export async function deleteCity(id: number) {
    await verifyAdmin()
    await prisma.cities.delete({ where: { id } })
    revalidatePath("/admin/cities")
}

// ==========================================
// Payment Methods
// ==========================================
export async function getPaymentMethods() {
    await verifyAdmin()
    return prisma.payment_methods.findMany({ orderBy: { method: "asc" } })
}

export async function createPaymentMethod(formData: FormData) {
    await verifyAdmin()
    const method = formData.get("method") as string
    const definition = formData.get("definition") as string
    await prisma.payment_methods.create({ data: { method, definition } })
    revalidatePath("/admin/payment-methods")
}

export async function updatePaymentMethod(id: number, formData: FormData) {
    await verifyAdmin()
    const method = formData.get("method") as string
    const definition = formData.get("definition") as string
    await prisma.payment_methods.update({ where: { id }, data: { method, definition } })
    revalidatePath("/admin/payment-methods")
}

export async function deletePaymentMethod(id: number) {
    await verifyAdmin()
    await prisma.payment_methods.delete({ where: { id } })
    revalidatePath("/admin/payment-methods")
}

// ==========================================
// Payment Status
// ==========================================
export async function getPaymentStatuses() {
    await verifyAdmin()
    return prisma.payment_status.findMany({ orderBy: { status: "asc" } })
}

export async function createPaymentStatus(formData: FormData) {
    await verifyAdmin()
    const status = formData.get("status") as string
    const definition = formData.get("definition") as string
    await prisma.payment_status.create({ data: { status, definition } })
    revalidatePath("/admin/payment-status")
}

export async function updatePaymentStatus(id: number, formData: FormData) {
    await verifyAdmin()
    const status = formData.get("status") as string
    const definition = formData.get("definition") as string
    await prisma.payment_status.update({ where: { id }, data: { status, definition } })
    revalidatePath("/admin/payment-status")
}

export async function deletePaymentStatus(id: number) {
    await verifyAdmin()
    await prisma.payment_status.delete({ where: { id } })
    revalidatePath("/admin/payment-status")
}

// ==========================================
// Finance: Token Packages (Buyer Amounts)
// ==========================================
export async function getTokenPackages() {
    await verifyAdmin()
    return prisma.buyer_amounts.findMany({ orderBy: { amount: "asc" } })
}

export async function createTokenPackage(formData: FormData) {
    await verifyAdmin()
    const amount = parseFloat(formData.get("amount") as string)
    const token_count = parseInt(formData.get("token_count") as string)
    const validity_period = parseInt(formData.get("validity_period") as string)
    await prisma.buyer_amounts.create({ data: { amount, token_count, validity_period } })
    revalidatePath("/admin/token-packages")
}

export async function updateTokenPackage(id: number, formData: FormData) {
    await verifyAdmin()
    const amount = parseFloat(formData.get("amount") as string)
    const token_count = parseInt(formData.get("token_count") as string)
    const validity_period = parseInt(formData.get("validity_period") as string)
    await prisma.buyer_amounts.update({ where: { id }, data: { amount, token_count, validity_period } })
    revalidatePath("/admin/token-packages")
}

export async function deleteTokenPackage(id: number) {
    await verifyAdmin()
    await prisma.buyer_amounts.delete({ where: { id } })
    revalidatePath("/admin/token-packages")
}

// ==========================================
// Finance: Promotions
// ==========================================
export async function getPromotions() {
    await verifyAdmin()
    return prisma.promotions.findMany({ orderBy: { created_at: "desc" } })
}

export async function createPromotion(formData: FormData) {
    await verifyAdmin()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const start_at = formData.get("start_at") ? new Date(formData.get("start_at") as string) : null
    const end_at = formData.get("end_at") ? new Date(formData.get("end_at") as string) : null
    await prisma.promotions.create({ data: { name, description, start_at, end_at } })
    revalidatePath("/admin/promotions")
}

export async function updatePromotion(id: number, formData: FormData) {
    await verifyAdmin()
    const name = formData.get("name") as string
    const description = formData.get("description") as string
    const start_at = formData.get("start_at") ? new Date(formData.get("start_at") as string) : null
    const end_at = formData.get("end_at") ? new Date(formData.get("end_at") as string) : null
    await prisma.promotions.update({ where: { id }, data: { name, description, start_at, end_at } })
    revalidatePath("/admin/promotions")
}

export async function deletePromotion(id: number) {
    await verifyAdmin()
    await prisma.promotions.delete({ where: { id } })
    revalidatePath("/admin/promotions")
}

// ==========================================
// Finance: Buyer Payments
// ==========================================
export async function getBuyerPayments() {
    await verifyAdmin()
    return prisma.buyer_payments.findMany({
        include: {
            buyer_details: { select: { id: true, full_name: true } },
            buyer_amounts: true,
            payment_status: true
        },
        orderBy: { created_at: "desc" }
    })
}

// ==========================================
// Finance: Seller Payments
// ==========================================
export async function getSellerPayments() {
    await verifyAdmin()
    return prisma.seller_payments.findMany({
        include: {
            seller_details: { select: { id: true, name: true } },
            status_ref: true,
            method_ref: true
        },
        orderBy: { created_at: "desc" }
    })
}

// ==========================================
// Products
// ==========================================
export async function getProducts() {
    await verifyAdmin()
    return prisma.seller_products.findMany({
        where: { deleted_at: null },
        include: {
            p_name_ref: true,
            v_model_ref: { include: { v_brands: true } },
            seller_details: { select: { id: true, name: true, user_name: true } },
        },
        orderBy: { created_at: "desc" }
    })
}

export async function toggleProductFeatured(id: number, currentStatus: number) {
    await verifyAdmin()
    await prisma.seller_products.update({
        where: { id },
        data: { is_featured: currentStatus === 1 ? 0 : 1 }
    })
    revalidatePath("/admin/products")
}

export async function deleteProduct(id: number) {
    await verifyAdmin()
    await prisma.seller_products.update({
        where: { id },
        data: { deleted_at: new Date() }
    })
    revalidatePath("/admin/products")
}

// ==========================================
// Orders
// ==========================================
export async function getOrders() {
    await verifyAdmin()
    return prisma.orders.findMany({
        include: {
            buyer_details: { select: { id: true, full_name: true } },
            seller_products: { select: { id: true, p_name_ref: true } }
        },
        orderBy: { created_at: "desc" }
    })
}

// ==========================================
// Apps Details (Settings)
// ==========================================
export async function getAppDetails() {
    await verifyAdmin()
    return prisma.app_details.findFirst()
}

export async function updateAppDetails(id: number | undefined, data: any) {
    await verifyAdmin()
    if (id) {
        await prisma.app_details.update({ where: { id }, data })
    } else {
        await prisma.app_details.create({ data })
    }
    revalidatePath("/admin/settings")
}
