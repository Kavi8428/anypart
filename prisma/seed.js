/* eslint-disable @typescript-eslint/no-require-imports */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Start seeding...\n');

    // ──────────────────────────────────────────────
    // 1. APP DETAILS
    // ──────────────────────────────────────────────
    console.log('  → Seeding app_details...');
    await prisma.app_details.upsert({
        where: { id: 1 },
        update: {},
        create: {
            id: 1,
            name: 'anypart.lk',
            address: 'No. 45, Galle Road, Colombo 03, Sri Lanka',
            logo_url: '/logo.png',
            br_number: 'BR-2024-001234',
            tel1: 704973144,
            tel2: 712345678,
            fb_link: 'https://facebook.com/anypart.lk',
            tiktok_link: 'https://tiktok.com/@anypart.lk',
            bio: 'Sri Lanka\'s leading online marketplace for vehicle spare parts. Find genuine and aftermarket parts for all vehicles.',
        },
    });

    // ──────────────────────────────────────────────
    // 2. ADMIN ROLES
    // ──────────────────────────────────────────────
    console.log('  → Seeding app_admin_roles...');
    const roles = [
        { id: 1, role: 'Super Admin', description: 'Full system access with all permissions' },
        { id: 2, role: 'Admin', description: 'Administrative access with limited permissions' },
        { id: 3, role: 'Moderator', description: 'Content moderation and user management' },
        { id: 4, role: 'Support', description: 'Customer support and order management' },
    ];
    for (const r of roles) {
        await prisma.app_admin_roles.upsert({
            where: { id: r.id },
            update: {},
            create: r,
        });
    }

    // ──────────────────────────────────────────────
    // 3. ADMIN ROLE PERMISSIONS
    // ──────────────────────────────────────────────
    console.log('  → Seeding app_admin_role_permissions...');
    const pages = ['/dashboard', '/sellers', '/buyers', '/products', '/orders', '/settings', '/reports'];
    let permId = 1;
    for (const role of roles) {
        for (const page of pages) {
            const isSuperAdmin = role.id === 1;
            const isAdmin = role.id === 2;
            await prisma.app_admin_role_permissions.upsert({
                where: { id: permId },
                update: {},
                create: {
                    id: permId,
                    role_id: role.id,
                    page_link: page,
                    can_view: true,
                    can_create: isSuperAdmin || isAdmin,
                    can_update: isSuperAdmin || isAdmin,
                    can_delete: isSuperAdmin,
                },
            });
            permId++;
        }
    }

    // ──────────────────────────────────────────────
    // 4. DEPARTMENTS
    // ──────────────────────────────────────────────
    console.log('  → Seeding app_departments...');
    const departments = [
        { id: 1, name: 'Management', description: 'Main management and administration department' },
        { id: 2, name: 'Development', description: 'Software development and IT department' },
        { id: 3, name: 'Customer Support', description: 'Customer service and support department' },
        { id: 4, name: 'Marketing', description: 'Marketing and promotions department' },
    ];
    for (const d of departments) {
        await prisma.app_departments.upsert({
            where: { id: d.id },
            update: {},
            create: d,
        });
    }

    // ──────────────────────────────────────────────
    // 5. ADMIN USERS
    // ──────────────────────────────────────────────
    console.log('  → Seeding app_admins...');
    const admins = [
        { id: 1, full_name: 'System Admin', user_name: 'admin', password: 'password123', email: 'admin@anypart.lk', tel: 704973144, address: 'Colombo, Sri Lanka', role: 1, department: 1 },
        { id: 2, full_name: 'John Manager', user_name: 'john.m', password: 'password123', email: 'john@anypart.lk', tel: 712345678, address: 'Kandy, Sri Lanka', role: 2, department: 1 },
        { id: 3, full_name: 'Sarah Moderator', user_name: 'sarah.mod', password: 'password123', email: 'sarah@anypart.lk', tel: 773456789, address: 'Galle, Sri Lanka', role: 3, department: 3 },
    ];
    for (const a of admins) {
        await prisma.app_admins.upsert({
            where: { id: a.id },
            update: {},
            create: a,
        });
    }

    // ──────────────────────────────────────────────
    // 6. DISTRICTS & CITIES
    // ──────────────────────────────────────────────
    console.log('  → Seeding disctricts & cities...');
    const districtsData = [
        { id: 1, name: 'Colombo', cities: ['Colombo 01', 'Colombo 02', 'Colombo 03', 'Dehiwala', 'Mount Lavinia', 'Moratuwa', 'Nugegoda', 'Maharagama'] },
        { id: 2, name: 'Gampaha', cities: ['Negombo', 'Gampaha', 'Kadawatha', 'Ja-Ela', 'Wattala', 'Kandana'] },
        { id: 3, name: 'Kandy', cities: ['Kandy', 'Peradeniya', 'Katugastota', 'Gampola', 'Nawalapitiya'] },
        { id: 4, name: 'Galle', cities: ['Galle', 'Hikkaduwa', 'Ambalangoda', 'Elpitiya'] },
        { id: 5, name: 'Kurunegala', cities: ['Kurunegala', 'Kuliyapitiya', 'Narammala', 'Mawathagama'] },
        { id: 6, name: 'Matara', cities: ['Matara', 'Weligama', 'Dickwella', 'Akuressa'] },
        { id: 7, name: 'Ratnapura', cities: ['Ratnapura', 'Balangoda', 'Embilipitiya', 'Pelmadulla'] },
        { id: 8, name: 'Kalutara', cities: ['Kalutara', 'Panadura', 'Horana', 'Bandaragama'] },
    ];

    let cityId = 1;
    const cityMap = {}; // store city IDs for later reference

    for (const d of districtsData) {
        await prisma.disctricts.upsert({
            where: { id: d.id },
            update: {},
            create: { id: d.id, name: d.name },
        });
        for (const cName of d.cities) {
            await prisma.cities.upsert({
                where: { id: cityId },
                update: {},
                create: { id: cityId, name: cName, disctrict_id: d.id },
            });
            cityMap[cName] = cityId;
            cityId++;
        }
    }

    // ──────────────────────────────────────────────
    // 7. SELLER TYPES
    // ──────────────────────────────────────────────
    console.log('  → Seeding seller_types...');
    const sellerTypes = [
        { id: 1, type: 'Individual', description: 'Private individual seller' },
        { id: 2, type: 'Shop', description: 'Registered spare parts shop' },
        { id: 3, type: 'Authorized Dealer', description: 'Brand authorized dealer or distributor' },
        { id: 4, type: 'Importer', description: 'Direct parts importer' },
    ];
    for (const st of sellerTypes) {
        await prisma.seller_types.upsert({
            where: { id: st.id },
            update: {},
            create: st,
        });
    }

    // ──────────────────────────────────────────────
    // 8. BUYER DETAILS
    // ──────────────────────────────────────────────
    console.log('  → Seeding buyer_details...');
    const buyers = [
        { id: 1, full_name: 'Kamal Perera', address: '123 Galle Road, Colombo', city: 1, district: 1, tel: 771234567, email: 'kamal@example.com', user_name: 'kamal_p', password: 'password123', verified: 1 },
        { id: 2, full_name: 'Nimal Silva', address: '45 Kandy Road, Kadawatha', city: 10, district: 2, tel: 772345678, email: 'nimal@example.com', user_name: 'nimal_s', password: 'password123', verified: 1 },
        { id: 3, full_name: 'Amara Fernando', address: '78 Temple Road, Kandy', city: 17, district: 3, tel: 773456789, email: 'amara@example.com', user_name: 'amara_f', password: 'password123', verified: 0 },
    ];
    for (const b of buyers) {
        await prisma.buyer_details.upsert({
            where: { id: b.id },
            update: {},
            create: b,
        });
    }

    // ──────────────────────────────────────────────
    // 9. SELLER DETAILS
    // ──────────────────────────────────────────────
    console.log('  → Seeding seller_details...');
    const sellers = [
        { id: 1, name: 'Colombo Auto Parts', logo_url: '/sellers/colombo-auto.png', br_number: 'BR-001', address: '456 Baseline Road, Colombo 09', city: 1, disctrict: 1, tel1: 711234567, tel2: 711234568, seller_type: 2, verified: 1, user_name: '0711234567', password: 'password123' },
        { id: 2, name: 'Kandy Spares Hub', logo_url: '/sellers/kandy-spares.png', br_number: 'BR-002', address: '12 Peradeniya Road, Kandy', city: 17, disctrict: 3, tel1: 712345678, seller_type: 2, verified: 1, user_name: '0712345678', password: 'password123' },
        { id: 3, name: 'Galle Parts Depot', logo_url: '/sellers/galle-parts.png', br_number: 'BR-003', address: '89 Main Street, Galle', city: 23, disctrict: 4, tel1: 713456789, seller_type: 3, verified: 1, user_name: '0713456789', password: 'password123' },
        { id: 4, name: 'Island Auto Imports', logo_url: '/sellers/island-imports.png', br_number: 'BR-004', address: '22 Negombo Road, Wattala', city: 13, disctrict: 2, tel1: 714567890, seller_type: 4, verified: 1, user_name: '0714567890', password: 'password123' },
    ];
    for (const s of sellers) {
        await prisma.seller_details.upsert({
            where: { id: s.id },
            update: {},
            create: s,
        });
    }

    // ──────────────────────────────────────────────
    // 10. VEHICLE YEARS
    // ──────────────────────────────────────────────
    console.log('  → Seeding v_years...');
    const years = [];
    for (let y = 2000; y <= 2025; y++) {
        const yearId = y - 1999; // 1 to 26
        years.push({ id: yearId, year: y });
        await prisma.v_years.upsert({
            where: { id: yearId },
            update: {},
            create: { id: yearId, year: y },
        });
    }

    // ──────────────────────────────────────────────
    // 11. VEHICLE BRANDS & MODELS
    // ──────────────────────────────────────────────
    console.log('  → Seeding v_brands & v_models...');
    const vehicleBrands = [
        {
            id: 1, name: 'Toyota', logo_url: '/brands/toyota.png', description: 'Japanese automobile manufacturer',
            models: [
                { name: 'Corolla', yearId: 23 },       // 2022
                { name: 'Axio', yearId: 21 },           // 2020
                { name: 'Premio', yearId: 19 },          // 2018
                { name: 'Vitz', yearId: 20 },            // 2019
                { name: 'Aqua', yearId: 22 },            // 2021
                { name: 'Prius', yearId: 24 },           // 2023
                { name: 'Hilux', yearId: 25 },           // 2024
                { name: 'KDH', yearId: 18 },             // 2017
            ],
        },
        {
            id: 2, name: 'Honda', logo_url: '/brands/honda.png', description: 'Japanese automobile and motorcycle manufacturer',
            models: [
                { name: 'Civic', yearId: 23 },
                { name: 'Fit', yearId: 21 },
                { name: 'Vezel', yearId: 22 },
                { name: 'Grace', yearId: 20 },
                { name: 'CRV', yearId: 24 },
            ],
        },
        {
            id: 3, name: 'Suzuki', logo_url: '/brands/suzuki.png', description: 'Japanese manufacturer of automobiles and motorcycles',
            models: [
                { name: 'Swift', yearId: 22 },
                { name: 'Alto', yearId: 21 },
                { name: 'Wagon R', yearId: 23 },
                { name: 'Every', yearId: 19 },
                { name: 'Celerio', yearId: 24 },
            ],
        },
        {
            id: 4, name: 'Nissan', logo_url: '/brands/nissan.png', description: 'Japanese multinational automobile manufacturer',
            models: [
                { name: 'March', yearId: 20 },
                { name: 'Note', yearId: 22 },
                { name: 'X-Trail', yearId: 23 },
                { name: 'Leaf', yearId: 24 },
            ],
        },
        {
            id: 5, name: 'Mitsubishi', logo_url: '/brands/mitsubishi.png', description: 'Japanese multinational automotive manufacturer',
            models: [
                { name: 'Lancer', yearId: 18 },
                { name: 'Outlander', yearId: 22 },
                { name: 'L200', yearId: 23 },
                { name: 'Montero Sport', yearId: 24 },
            ],
        },
        {
            id: 6, name: 'Hyundai', logo_url: '/brands/hyundai.png', description: 'South Korean multinational automotive manufacturer',
            models: [
                { name: 'Tucson', yearId: 23 },
                { name: 'i10', yearId: 21 },
                { name: 'Creta', yearId: 24 },
            ],
        },
    ];

    let modelId = 1;
    const modelMap = {}; // store model IDs for later reference

    for (const vb of vehicleBrands) {
        await prisma.v_brands.upsert({
            where: { id: vb.id },
            update: {},
            create: { id: vb.id, name: vb.name, logo_url: vb.logo_url, description: vb.description },
        });
        for (const m of vb.models) {
            await prisma.v_models.upsert({
                where: { id: modelId },
                update: {},
                create: { id: modelId, name: m.name, v_brand: vb.id, year: m.yearId },
            });
            modelMap[`${vb.name}-${m.name}`] = modelId;
            modelId++;
        }
    }

    // ──────────────────────────────────────────────
    // 12. PART BRANDS & NAMES
    // ──────────────────────────────────────────────
    console.log('  → Seeding p_brands & p_names...');
    const partBrands = [
        {
            id: 1, name: 'Toyota Genuine', logo_url: '/pbrands/toyota-genuine.png', description: 'Original Toyota spare parts',
            parts: ['Oil Filter', 'Air Filter', 'Brake Pad Set', 'Timing Belt', 'Spark Plug Set', 'Radiator Fan', 'Head Lamp'],
        },
        {
            id: 2, name: 'Honda Genuine', logo_url: '/pbrands/honda-genuine.png', description: 'Original Honda spare parts',
            parts: ['Oil Filter', 'Brake Pad Set', 'CV Joint', 'Side Mirror', 'Tail Lamp', 'Wiper Blade Set'],
        },
        {
            id: 3, name: 'Denso', logo_url: '/pbrands/denso.png', description: 'High quality aftermarket parts',
            parts: ['Spark Plug', 'Alternator', 'Starter Motor', 'AC Compressor', 'Fuel Pump', 'Oxygen Sensor'],
        },
        {
            id: 4, name: 'Bosch', logo_url: '/pbrands/bosch.png', description: 'Premium aftermarket auto parts',
            parts: ['Brake Disc', 'Wiper Blade', 'Battery', 'Fuel Injector', 'Ignition Coil'],
        },
        {
            id: 5, name: 'Aisin', logo_url: '/pbrands/aisin.png', description: 'OEM-grade parts manufacturer',
            parts: ['Water Pump', 'Clutch Kit', 'Transmission Filter', 'Thermostat'],
        },
    ];

    let partNameId = 1;
    const partNameMap = {};

    for (const pb of partBrands) {
        await prisma.p_brands.upsert({
            where: { id: pb.id },
            update: {},
            create: { id: pb.id, name: pb.name, logo_url: pb.logo_url, description: pb.description },
        });
        for (const partName of pb.parts) {
            await prisma.p_names.upsert({
                where: { id: partNameId },
                update: {},
                create: { id: partNameId, name: partName, part_brand: pb.id },
            });
            partNameMap[`${pb.name}-${partName}`] = partNameId;
            partNameId++;
        }
    }

    // ──────────────────────────────────────────────
    // 13. CONDITIONS
    // ──────────────────────────────────────────────
    console.log('  → Seeding conditions...');
    const conditions = [
        { id: 1, status: 'Brand New', description: 'Never used, factory sealed item' },
        { id: 2, status: 'Used - Like New', description: 'Used but in excellent condition, minimal wear' },
        { id: 3, status: 'Used - Good', description: 'Used with some signs of wear but fully functional' },
        { id: 4, status: 'Refurbished', description: 'Professionally refurbished to working condition' },
    ];
    for (const c of conditions) {
        await prisma.conditions.upsert({
            where: { id: c.id },
            update: {},
            create: c,
        });
    }

    // ──────────────────────────────────────────────
    // 14. HASH TAGS
    // ──────────────────────────────────────────────
    console.log('  → Seeding hash_tags...');
    const hashTags = [
        { id: 1, name: 'Toyota', description: 'Toyota vehicle parts' },
        { id: 2, name: 'Honda', description: 'Honda vehicle parts' },
        { id: 3, name: 'Suzuki', description: 'Suzuki vehicle parts' },
        { id: 4, name: 'Genuine', description: 'Genuine OEM parts' },
        { id: 5, name: 'Aftermarket', description: 'Aftermarket replacement parts' },
        { id: 6, name: 'Engine', description: 'Engine related parts' },
        { id: 7, name: 'Brakes', description: 'Brake system parts' },
        { id: 8, name: 'Electrical', description: 'Electrical system parts' },
        { id: 9, name: 'Body', description: 'Vehicle body and exterior parts' },
        { id: 10, name: 'Suspension', description: 'Suspension and steering parts' },
        { id: 11, name: 'Nissan', description: 'Nissan vehicle parts' },
        { id: 12, name: 'Mitsubishi', description: 'Mitsubishi vehicle parts' },
    ];
    for (const ht of hashTags) {
        await prisma.hash_tags.upsert({
            where: { id: ht.id },
            update: {},
            create: ht,
        });
    }

    // ──────────────────────────────────────────────
    // 15. SELLER PRODUCTS
    // ──────────────────────────────────────────────
    console.log('  → Seeding seller_products...');
    const products = [
        { id: 1, seller_id: 1, p_name: 1, v_model: 1, hash_tag_1: 1, hash_tag_2: 4, hash_tag_3: 6, image_url_1: '/products/oil-filter-corolla.jpg', price: 1500.00, condition: 1, description: 'Genuine Toyota Oil Filter for Corolla 2022', v_year: 23 },
        { id: 2, seller_id: 1, p_name: 3, v_model: 1, hash_tag_1: 1, hash_tag_2: 4, hash_tag_3: 7, image_url_1: '/products/brake-pad-corolla.jpg', price: 4500.00, condition: 1, description: 'Toyota Genuine Brake Pad Set - Front for Corolla', v_year: 23 },
        { id: 3, seller_id: 1, p_name: 2, v_model: 5, hash_tag_1: 1, hash_tag_2: 6, image_url_1: '/products/air-filter-aqua.jpg', price: 1200.00, condition: 1, description: 'Genuine Air Filter for Toyota Aqua 2021', v_year: 22 },
        { id: 4, seller_id: 2, p_name: 8, v_model: 9, hash_tag_1: 2, hash_tag_2: 4, hash_tag_3: 6, image_url_1: '/products/oil-filter-civic.jpg', price: 1800.00, condition: 1, description: 'Honda Genuine Oil Filter for Civic 2022', v_year: 23 },
        { id: 5, seller_id: 2, p_name: 10, v_model: 11, hash_tag_1: 2, hash_tag_2: 4, hash_tag_3: 9, image_url_1: '/products/cv-joint-vezel.jpg', price: 12000.00, condition: 1, description: 'Honda CV Joint for Vezel', v_year: 22 },
        { id: 6, seller_id: 3, p_name: 14, v_model: 1, hash_tag_1: 1, hash_tag_2: 5, hash_tag_3: 6, image_url_1: '/products/spark-plug-denso.jpg', price: 800.00, condition: 1, description: 'Denso Spark Plug for Toyota Corolla', v_year: 23 },
        { id: 7, seller_id: 3, p_name: 16, v_model: 9, hash_tag_1: 2, hash_tag_2: 5, hash_tag_3: 8, image_url_1: '/products/ac-compressor-civic.jpg', price: 45000.00, condition: 4, description: 'Refurbished Denso AC Compressor for Honda Civic', v_year: 23 },
        { id: 8, seller_id: 4, p_name: 19, v_model: 1, hash_tag_1: 1, hash_tag_2: 5, hash_tag_3: 7, image_url_1: '/products/brake-disc-bosch.jpg', price: 6500.00, condition: 1, description: 'Bosch Brake Disc for Toyota Corolla', v_year: 23 },
        { id: 9, seller_id: 1, p_name: 7, v_model: 8, hash_tag_1: 1, hash_tag_2: 4, hash_tag_3: 9, image_url_1: '/products/headlamp-kdh.jpg', price: 18000.00, condition: 2, description: 'Used Toyota Genuine Head Lamp for KDH - Like New', v_year: 18 },
        { id: 10, seller_id: 4, p_name: 23, v_model: 14, hash_tag_1: 3, hash_tag_2: 5, hash_tag_3: 6, image_url_1: '/products/water-pump-swift.jpg', price: 8500.00, condition: 1, description: 'Aisin Water Pump for Suzuki Swift', v_year: 22 },
        { id: 11, seller_id: 2, p_name: 11, v_model: 12, hash_tag_1: 2, hash_tag_2: 9, image_url_1: '/products/side-mirror-fit.jpg', price: 5500.00, condition: 3, description: 'Used Honda Side Mirror for Fit - Good Condition', v_year: 21 },
        { id: 12, seller_id: 3, p_name: 15, v_model: 5, hash_tag_1: 1, hash_tag_2: 5, hash_tag_3: 8, image_url_1: '/products/alternator-aqua.jpg', price: 25000.00, condition: 4, description: 'Refurbished Denso Alternator for Toyota Aqua', v_year: 22 },
    ];
    for (const p of products) {
        await prisma.seller_products.upsert({
            where: { id: p.id },
            update: {},
            create: p,
        });
    }

    // ──────────────────────────────────────────────
    // 16. ORDER STATUS
    // ──────────────────────────────────────────────
    console.log('  → Seeding order_status...');
    const orderStatuses = [
        { id: 1, status: 'Pending', definition: 'Order placed, waiting for seller confirmation' },
        { id: 2, status: 'Confirmed', definition: 'Order confirmed by the seller' },
        { id: 3, status: 'Processing', definition: 'Order is being prepared for dispatch' },
        { id: 4, status: 'Shipped', definition: 'Order has been shipped to the buyer' },
        { id: 5, status: 'Delivered', definition: 'Order delivered to the buyer' },
        { id: 6, status: 'Cancelled', definition: 'Order has been cancelled' },
        { id: 7, status: 'Returned', definition: 'Order has been returned by the buyer' },
    ];
    for (const os of orderStatuses) {
        await prisma.order_status.upsert({
            where: { id: os.id },
            update: {},
            create: os,
        });
    }

    // ──────────────────────────────────────────────
    // 17. ORDERS & ORDER TRACKING
    // ──────────────────────────────────────────────
    console.log('  → Seeding orders & order_tracking...');
    const ordersData = [
        { id: 1, buyer_id: 1, product_id: 1, tracking: [{ status: 1 }, { status: 2 }, { status: 5 }] },
        { id: 2, buyer_id: 1, product_id: 4, tracking: [{ status: 1 }, { status: 2 }, { status: 3 }] },
        { id: 3, buyer_id: 2, product_id: 6, tracking: [{ status: 1 }, { status: 2 }] },
        { id: 4, buyer_id: 2, product_id: 8, tracking: [{ status: 1 }] },
        { id: 5, buyer_id: 3, product_id: 10, tracking: [{ status: 1 }, { status: 6 }] },
    ];

    let trackingId = 1;
    for (const o of ordersData) {
        await prisma.orders.upsert({
            where: { id: o.id },
            update: {},
            create: { id: o.id, buyer_id: o.buyer_id, product_id: o.product_id },
        });
        for (const t of o.tracking) {
            await prisma.order_tracking.upsert({
                where: { id: trackingId },
                update: {},
                create: { id: trackingId, order_id: o.id, status: t.status },
            });
            trackingId++;
        }
    }

    // ──────────────────────────────────────────────
    // 18. PAYMENT STATUS
    // ──────────────────────────────────────────────
    console.log('  → Seeding payment_status...');
    const paymentStatuses = [
        { id: 1, status: 'Pending', definition: 'Payment initiated but not yet completed' },
        { id: 2, status: 'Completed', definition: 'Payment successfully completed' },
        { id: 3, status: 'Failed', definition: 'Payment failed or was declined' },
        { id: 4, status: 'Refunded', definition: 'Payment has been refunded' },
        { id: 5, status: 'Expired', definition: 'Payment session has expired' },
    ];
    for (const ps of paymentStatuses) {
        await prisma.payment_status.upsert({
            where: { id: ps.id },
            update: {},
            create: ps,
        });
    }

    // ──────────────────────────────────────────────
    // 19. BUYER AMOUNTS (Credit Packages)
    // ──────────────────────────────────────────────
    console.log('  → Seeding buyer_amounts...');
    const buyerAmounts = [
        { id: 1, amount: 500.00, token_count: 5, validity_period: 30 },
        { id: 2, amount: 1000.00, token_count: 12, validity_period: 60 },
        { id: 3, amount: 2000.00, token_count: 25, validity_period: 90 },
        { id: 4, amount: 5000.00, token_count: 70, validity_period: 180 },
        { id: 5, amount: 10000.00, token_count: 150, validity_period: 365 },
    ];
    for (const ba of buyerAmounts) {
        await prisma.buyer_amounts.upsert({
            where: { id: ba.id },
            update: {},
            create: ba,
        });
    }

    // ──────────────────────────────────────────────
    // 20. BUYER PAYMENTS
    // ──────────────────────────────────────────────
    console.log('  → Seeding buyer_payments...');
    const buyerPayments = [
        { id: 1, buyer_id: 1, amount_id: 2, status_id: 2 },
        { id: 2, buyer_id: 1, amount_id: 3, status_id: 2 },
        { id: 3, buyer_id: 2, amount_id: 1, status_id: 2 },
        { id: 4, buyer_id: 3, amount_id: 1, status_id: 3 },
    ];
    for (const bp of buyerPayments) {
        await prisma.buyer_payments.upsert({
            where: { id: bp.id },
            update: {},
            create: bp,
        });
    }

    // ──────────────────────────────────────────────
    // 21. BUYER ORDER TOKENS
    // ──────────────────────────────────────────────
    console.log('  → Seeding buyer_order_token...');
    const buyerOrderTokens = [
        { id: 1, buyer_id: 1, payment_id: 1, token: 'TKN-001-BUYER1-ORD1', status: 1, order_id: 1 },
        { id: 2, buyer_id: 1, payment_id: 1, token: 'TKN-002-BUYER1-ORD2', status: 1, order_id: 2 },
        { id: 3, buyer_id: 2, payment_id: 3, token: 'TKN-003-BUYER2-ORD3', status: 1, order_id: 3 },
        { id: 4, buyer_id: 2, payment_id: 3, token: 'TKN-004-BUYER2-ORD4', status: 0, order_id: 4 },
    ];
    for (const bot of buyerOrderTokens) {
        await prisma.buyer_order_token.upsert({
            where: { id: bot.id },
            update: {},
            create: bot,
        });
    }

    // ──────────────────────────────────────────────
    // 22. CONVERSATIONS & MESSAGES
    // ──────────────────────────────────────────────
    console.log('  → Seeding conversations & messages...');
    const conversationsData = [
        {
            id: 1, buyer_id: 1, seller_id: 1, order_id: 1,
            messages: [
                { sender_id: 1, receiver_id: 1, content: 'Hi, is this oil filter still available?', is_read: 1 },
                { sender_id: 1, receiver_id: 1, content: 'Yes, it is available. Would you like to place an order?', is_read: 1 },
                { sender_id: 1, receiver_id: 1, content: 'Yes please! I will order now.', is_read: 1 },
            ],
        },
        {
            id: 2, buyer_id: 1, seller_id: 2, order_id: 2,
            messages: [
                { sender_id: 1, receiver_id: 2, content: 'Can you ship this to Colombo?', is_read: 1 },
                { sender_id: 2, receiver_id: 1, content: 'Yes, we deliver island-wide. Delivery charge is LKR 350.', is_read: 1 },
                { sender_id: 1, receiver_id: 2, content: 'OK great, I will proceed with the order.', is_read: 0 },
            ],
        },
        {
            id: 3, buyer_id: 2, seller_id: 3, order_id: 3,
            messages: [
                { sender_id: 2, receiver_id: 3, content: 'Is this spark plug compatible with 2021 model?', is_read: 1 },
                { sender_id: 3, receiver_id: 2, content: 'Yes, it fits 2020-2023 Corolla models.', is_read: 0 },
            ],
        },
    ];

    let messageId = 1;
    for (const conv of conversationsData) {
        await prisma.conversations.upsert({
            where: { id: conv.id },
            update: {},
            create: { id: conv.id, buyer_id: conv.buyer_id, seller_id: conv.seller_id, order_id: conv.order_id },
        });
        for (const msg of conv.messages) {
            await prisma.messages.upsert({
                where: { id: messageId },
                update: {},
                create: {
                    id: messageId,
                    conversation_id: conv.id,
                    sender_id: msg.sender_id,
                    receiver_id: msg.receiver_id,
                    content: msg.content,
                    is_read: msg.is_read,
                },
            });
            messageId++;
        }
    }

    // ──────────────────────────────────────────────
    // 23. MEDIA TYPES
    // ──────────────────────────────────────────────
    console.log('  → Seeding media_types...');
    const mediaTypes = [
        { id: 1, type: 'Image', extention: 'jpg,png,webp' },
        { id: 2, type: 'Video', extention: 'mp4,webm' },
        { id: 3, type: 'Document', extention: 'pdf,doc,docx' },
        { id: 4, type: 'Audio', extention: 'mp3,wav' },
    ];
    for (const mt of mediaTypes) {
        await prisma.media_types.upsert({
            where: { id: mt.id },
            update: {},
            create: mt,
        });
    }

    // ──────────────────────────────────────────────
    // 24. SELLER PAYMENTS
    // ──────────────────────────────────────────────
    console.log('  → Seeding seller_payments...');
    const sellerPayments = [
        { id: 1, seller_id: 1, product_id: 1, order_id: 'SORD-2024-001', amount: 2500.00, currency: 'LKR', status: 'COMPLETED', payhere_status: 2, payhere_amount: 2500.00, method: 'VISA' },
        { id: 2, seller_id: 1, product_id: 2, order_id: 'SORD-2024-002', amount: 5000.00, currency: 'LKR', status: 'COMPLETED', payhere_status: 2, payhere_amount: 5000.00, method: 'MASTER' },
        { id: 3, seller_id: 2, product_id: 4, order_id: 'SORD-2024-003', amount: 2500.00, currency: 'LKR', status: 'PENDING', payhere_status: 0, payhere_amount: null, method: null },
    ];
    for (const sp of sellerPayments) {
        await prisma.seller_payments.upsert({
            where: { id: sp.id },
            update: {},
            create: sp,
        });
    }

    // ──────────────────────────────────────────────
    // NOTE: Session tables (app_admin_sessions, buyer_sessions, seller_sessions)
    // are NOT seeded as they are runtime-generated during user login.
    // ──────────────────────────────────────────────

    // NOTE: media table is NOT seeded as it depends on actual uploaded files.
    // Media types are seeded above for reference data.

    console.log('\n✅ Seeding finished successfully!');
    console.log('   Summary:');
    console.log('   ────────────────────────────────────');
    console.log(`   • App Details:       1 record`);
    console.log(`   • Admin Roles:       ${roles.length} records`);
    console.log(`   • Role Permissions:  ${permId - 1} records`);
    console.log(`   • Departments:       ${departments.length} records`);
    console.log(`   • Admins:            ${admins.length} records`);
    console.log(`   • Districts:         ${districtsData.length} records`);
    console.log(`   • Cities:            ${cityId - 1} records`);
    console.log(`   • Seller Types:      ${sellerTypes.length} records`);
    console.log(`   • Buyers:            ${buyers.length} records`);
    console.log(`   • Sellers:           ${sellers.length} records`);
    console.log(`   • Vehicle Years:     ${years.length} records`);
    console.log(`   • Vehicle Brands:    ${vehicleBrands.length} records`);
    console.log(`   • Vehicle Models:    ${modelId - 1} records`);
    console.log(`   • Part Brands:       ${partBrands.length} records`);
    console.log(`   • Part Names:        ${partNameId - 1} records`);
    console.log(`   • Conditions:        ${conditions.length} records`);
    console.log(`   • Hash Tags:         ${hashTags.length} records`);
    console.log(`   • Products:          ${products.length} records`);
    console.log(`   • Order Statuses:    ${orderStatuses.length} records`);
    console.log(`   • Orders:            ${ordersData.length} records`);
    console.log(`   • Order Tracking:    ${trackingId - 1} records`);
    console.log(`   • Payment Statuses:  ${paymentStatuses.length} records`);
    console.log(`   • Buyer Amounts:     ${buyerAmounts.length} records`);
    console.log(`   • Buyer Payments:    ${buyerPayments.length} records`);
    console.log(`   • Buyer Order Tokens:${buyerOrderTokens.length} records`);
    console.log(`   • Conversations:     ${conversationsData.length} records`);
    console.log(`   • Messages:          ${messageId - 1} records`);
    console.log(`   • Media Types:       ${mediaTypes.length} records`);
    console.log(`   • Seller Payments:   ${sellerPayments.length} records`);
}

main()
    .catch((e) => {
        console.error('❌ Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
