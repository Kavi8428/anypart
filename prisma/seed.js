/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding...');

    // 1. Admin Roles
    const adminRole = await prisma.app_admin_roles.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            role: 'Super Admin',
            description: 'Full system access',
        },
    });

    // 2. Departments
    const dept = await prisma.app_departments.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: 'Management',
            description: 'Main management department',
        },
    });

    // 3. Admin User
    await prisma.app_admins.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            full_name: 'System Admin',
            user_name: 'admin',
            password: 'password123', // In real app, this should be hashed
            email: 'admin@anypart.lk',
            role: adminRole.id,
            department: dept.id,
        },
    });

    // 4. Districts & Cities
    const district = await prisma.disctricts.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: 'Colombo',
        },
    });

    const city = await prisma.cities.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: 'Colombo 01',
            disctrict_id: district.id,
        },
    });

    // 5. Buyer Details
    const buyer = await prisma.buyer_details.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            full_name: 'John Doe',
            address: '123 Buyer St, Colombo',
            city: city.id,
            district: district.id,
            tel: 771234567,
            email: 'john@example.com',
            user_name: 'johndoe',
            password: 'password123',
            verified: 1,
        },
    });

    // 6. Seller Types & Seller Details
    const sellerType = await prisma.seller_types.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            type: 'Individual',
            description: 'Private individual seller',
        },
    });

    const seller = await prisma.seller_details.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: 'Anypart Shop',
            address: '456 Seller Rd, Colombo',
            city: city.id,
            disctrict: district.id,
            tel1: 711234567,
            user_name: 'anypart_seller',
            password: 'password123',
            seller_type: sellerType.id,
            verified: 1,
        },
    });

    // 7. Vehicle Brands, Years, Models
    const vBrand = await prisma.v_brands.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: 'Toyota',
            logo_url: 'https://example.com/toyota.png',
        },
    });

    const vYear = await prisma.v_years.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            year: 2022,
        },
    });

    const vModel = await prisma.v_models.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: 'Corolla',
            v_brand: vBrand.id,
            year: vYear.id,
        },
    });

    // 8. Part Brands & Names
    const pBrand = await prisma.p_brands.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: 'Toyota Genuine',
            logo_url: 'https://example.com/pbrand.png',
        },
    });

    const pName = await prisma.p_names.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: 'Oil Filter',
            part_brand: pBrand.id,
        },
    });

    // 9. Conditions & Hash Tags
    const condition = await prisma.conditions.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            status: 'Brand New',
            description: 'Never used item',
        },
    });

    const tag = await prisma.hash_tags.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: 'Toyota',
            description: 'Toyota spare parts',
        },
    });

    // 10. Seller Products
    const product = await prisma.seller_products.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            seller_id: seller.id,
            p_name: pName.id,
            v_model: vModel.id,
            hash_tag_1: tag.id,
            image_url_1: 'product1.jpg',
            price: 1500.0,
            condition: condition.id,
            description: 'Genuine Toyota Oil Filter for Corolla 2022',
        },
    });

    // 11. Order Status & Orders
    const orderStatus = await prisma.order_status.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            status: 'Pending',
            definition: 'Order waiting for processing',
        },
    });

    const order = await prisma.orders.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            buyer_id: buyer.id,
            product_id: product.id,
        },
    });

    await prisma.order_tracking.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            order_id: order.id,
            status: orderStatus.id,
        },
    });

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
