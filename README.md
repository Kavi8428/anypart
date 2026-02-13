# AnyPart.lk

Next.js app for AnyPart.lk with public product view, seller dashboard, and admin dashboard.

## Tech stack

- **Next.js** (App Router)
- **shadcn/ui** (sidebar-07 dashboard)
- **Prisma** + **MySQL**

## Project structure

### Screens

| Route | Description |
|-------|-------------|
| `/` | **Public view** – Products listing (anyone can access) |
| **Seller** | |
| `/seller` | Seller dashboard overview |
| `/seller/products` | All products |
| `/seller/orders` | All orders |
| `/seller/chats` | Messages |
| `/seller/settings` | Profile & settings |
| `/seller/login`, `/seller/register` | Seller auth (no sidebar) |
| **Admin** | |
| `/admin` | Admin dashboard overview |
| `/admin/buyers` | All buyers |
| `/admin/sellers` | All sellers |
| `/admin/p-brands` | Product brands |
| `/admin/p-models` | Product models |
| `/admin/v-brands` | Vehicle brands |
| `/admin/v-models` | Vehicle models |
| `/admin/settings` | General settings |
| `/admin/login` | Admin auth (no sidebar) |

### Reusable components

- **`components/public/`** – Public site: `SiteHeader`, `ProductGrid`, `ProductCard`
- **`components/dashboard/`** – Dashboard shell and sidebars: `DashboardShell`, `SellerSidebar`, `AdminSidebar`
- **`components/`** – Shared: `AppSidebar`, `NavMain`, `NavProjects`, `NavUser`, `TeamSwitcher`
- **`components/ui/`** – shadcn UI primitives
- **`lib/`** – `sidebar-config.ts`, `seller-nav-config.ts`, `admin-nav-config.ts`, `prisma.ts`, `utils.ts`

### Prisma

- **`prisma/schema.prisma`** – MySQL schema (Brand, Model, Product placeholders)
- **`lib/prisma.ts`** – Prisma client singleton for Next.js

## Getting started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Environment**

   Copy `.env.example` to `.env` and set your MySQL `DATABASE_URL`:

   ```env
   DATABASE_URL="mysql://user:password@localhost:3306/anypart"
   ```

3. **Database**

   ```bash
   npx prisma generate
   npx prisma db push   # or: npx prisma migrate dev
   ```

4. **Run dev server**

   ```bash
   npm run dev
   ```

Open [http://localhost:3000](http://localhost:3000) for the public products page, [http://localhost:3000/seller](http://localhost:3000/seller) for the seller dashboard, and [http://localhost:3000/admin](http://localhost:3000/admin) for the admin dashboard.

## Scripts

- `npm run dev` – Start dev server
- `npm run build` – Generate Prisma client and build Next.js
- `npm run start` – Start production server
- `npm run lint` – Run ESLint
