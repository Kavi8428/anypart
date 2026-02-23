# 🔍 AnyPart.lk — Comprehensive Bug Analysis & Fix Plan

> Generated: 2026-02-15  
> Scope: Full project deep-dive — Schema, Actions, APIs, Pages, Components, Middleware, Seed, Config

---

## Table of Contents

1. [🔴 CRITICAL Bugs (Data Loss / Security)](#-critical-bugs)
2. [🟠 HIGH Bugs (Broken Features / Logic Errors)](#-high-bugs)
3. [🟡 MEDIUM Issues (Inconsistencies / Bad Practices)](#-medium-issues)
4. [🔵 LOW Issues (Polish / Code Quality)](#-low-issues)
5. [📋 Fix Plan (Prioritized)](#-fix-plan)

---

## 🔴 CRITICAL Bugs

### C1. Dead Code After `return` in `unlockSellerDetails()` — Unreachable `revalidatePath`
**File:** `app/actions/buyer.ts` → Lines 262-263  
**Bug:** The `$transaction()` call on line 211 **returns** inside the callback (lines 221, 236, 257). This means the `revalidatePath()` on line 262 and the second `return` on line 263 are **completely unreachable**.  
**Impact:** After a buyer unlocks a product, the page is **never revalidated**. The user must hard-refresh to see the unlocked seller details.  
**Fix:** Move `revalidatePath()` **before** the final return inside the `try` block, right after the transaction completes successfully.

```typescript
// CURRENT (broken): revalidatePath is AFTER a return statement
return await prisma.$transaction(async (tx) => { ... })
// ↓ This code is unreachable!
revalidatePath(`/buyer/product_view/${productId}`)
return { success: true, message: "Seller details unlocked!" }

// FIX:
const result = await prisma.$transaction(async (tx) => { ... })
revalidatePath(`/buyer/product_view/${productId}`)
return result
```

---

### C2. `onError` Event Handler on Server Component — Will Crash at Runtime
**File:** `app/buyer/product_view/[id]/page.tsx` → Lines 60-62, 83-85  
**Bug:** This is a **Server Component** (no `'use client'` directive), but it has `onError` event handlers on `<img>` tags. Event handlers are **client-side only** in React and Next.js. This will either: (a) throw a runtime error, or (b) silently not work, leaving broken images.  
**Impact:** Broken images show no fallback; potential runtime crash.  
**Fix:** Either:
- Add `'use client'` to the page (not ideal for SSR/SEO), OR
- Extract the image gallery into a **client component** (preferred).

---

### C3. API Route `PUT /api/products/[id]` Mass-Assignment Vulnerability
**File:** `app/api/products/[id]/route.js` → Lines 54-63  
**Bug:** The `PUT` handler spreads the entire request body directly into the database update:
```javascript
data: { ...body, updated_at: new Date() }
```
An attacker can send **any field** — including `seller_id`, `is_featured`, `payment_id` — and overwrite it without authorization checks.  
**Impact:** Critical security vulnerability: product ownership hijacking, unauthorized featured status, payment manipulation.  
**Fix:** Whitelist allowed update fields explicitly.

---

### C4. Seller Payments Seed Has Non-Existent `product_id` Field
**File:** `prisma/seed.js` → Lines 616-618  
**Bug:** The seed data for `seller_payments` includes `product_id: 1`, `product_id: 2`, `product_id: 4`, but the `seller_payments` model in schema has **no `product_id` field**. This field doesn't exist. Prisma should reject it, causing seed failure or silently ignoring it.  
**Impact:** Seed script may fail or silently lose data.  
**Fix:** Remove the `product_id` property from seller_payments seed data.

---

### C5. Admin Login Page Has No Actual Authentication Logic
**File:** `app/admin/(auth)/login/page.tsx` → Lines 11-16  
**Bug:** The admin login form's `handleSubmit` function only does `setTimeout(() => setIsLoading(false), 2000)`. It **never authenticates**. There's no API call, no session creation, nothing. The admin dashboard is only "protected" by the middleware cookie check — but there's no way to create that cookie.  
**Impact:** Admin panel is completely inaccessible (no login mechanism), OR if cookies are manually forged, it's completely unprotected.  
**Fix:** Implement admin login logic (similar to seller login) with proper session creation.

---

### C6. Admin Passwords Stored in Plaintext in Seed
**File:** `prisma/seed.js` → Lines 96-100  
**Bug:** Admin passwords (`password123`) are seeded as **plaintext strings** without bcrypt hashing. The buyer and seller seeds also do this, but those registrations go through `bcrypt.hash()` at runtime. Admin accounts seeded this way will **never** be able to log in via bcrypt.compare() since the stored value isn't actually hashed.  
**Impact:** All seeded admin, buyer, and seller accounts are broken — bcrypt.compare will always return false.  
**Fix:** Hash all passwords in the seed script using `bcryptjs` before insertion.

---

### C7. Seller Login Uses `fetch()` from Server Action (Self-Referential HTTP Call)  
**File:** `app/actions/seller-auth.ts` → Lines 24-28  
**Bug:** The `sellerLogin` server action calls `fetch()` to its own API route (`/api/seller/auth/login`). This creates multiple issues:
1. During build/SSR, `NEXT_PUBLIC_APP_URL` may not be set, causing failures
2. It's an unnecessary roundtrip — Server Actions can directly query the DB
3. Cookies from the API response are not forwarded properly  
**Impact:** Login may fail in certain deployment environments; unnecessary overhead.  
**Fix:** Refactor to query the database directly (like `buyerLogin` does) instead of calling an internal API.

---

## 🟠 HIGH Bugs

### H1. Missing NaN Validation on Required `parseInt()` Calls in `products.ts`
**File:** `app/actions/products.ts` → Lines 82-84, 100, 166-168, 208  
**Bug:** `parseInt(formData.get('p_name') as string)` will return `NaN` if the field is missing or empty. `NaN` is then passed to Prisma's `create()`, which will throw an unhandled Prisma error (cryptic error message to the user).  
**Impact:** Poor error reporting; potential crashes on product creation.  
**Fix:** Add validation before database operations:
```typescript
if (isNaN(p_name) || isNaN(v_model)) {
  return { success: false, error: 'Missing required fields' };
}
```

---

### H2. Buyer `use server` in `lib/buyer.ts` — Incorrect Location for Directive
**File:** `lib/buyer.ts` → Line 1  
**Bug:** `"use server"` is at the top of `lib/buyer.ts`. The `"use server"` directive marks functions as Server Actions that can be called from client components. But this file is imported and used by other server components and server actions, which is correct — **however**, placing `"use server"` here means ALL exported functions become callable from the client, including `getSearchSuggestions` which has no authentication. Any client can call it directly.  
**Impact:** All functions in this file are exposed as server actions to the client, potentially unintended.  
**Fix:** Move `"use server"` to only the specific functions that should be callable from client components, or keep it as a server module without the directive.

---

### H3. `getProductsByVModelAndPart()` Returns Full `seller_details` Including Passwords
**File:** `app/actions/category.ts` → Lines 141-169  
**Bug:** The query includes `seller_details: true` (line 159) which returns ALL seller fields, including the **hashed password**. These products are displayed to buyers.  
**Impact:** Seller password hashes are leaked to the client.  
**Fix:** Use `select` instead of `include: true` to explicitly exclude `password`.

---

### H4. `searchProducts()` Also Returns Full `seller_details` Including Passwords
**File:** `app/actions/category.ts` → Lines 171-209  
**Bug:** Same as H3 — `seller_details: true` on line 198 leaks password hashes.  
**Fix:** Same as H3.

---

### H5. Middleware Doesn't Protect `/buyer/chat` Route
**File:** `middleware.ts` → Line 32  
**Bug:** The protected buyer routes are:
```typescript
const protectedBuyerRoutes = ['/buyer/dashboard', '/buyer/profile', '/buyer/orders'];
```
But `/buyer/chat` is NOT listed. The chat page can be accessed without login.  
**Impact:** Unauthenticated users can access the chat page (though the action checks session, the page itself renders).  
**Fix:** Add `/buyer/chat` to the `protectedBuyerRoutes` array.

---

### H6. `next.config.ts` Remote Image Hostname is `example.com`
**File:** `next.config.ts` → Line 10  
**Bug:** The remote image pattern hostname is set to `example.com`. This is clearly a placeholder.  
**Impact:** Any actual remote images will fail to load with Next.js `<Image>` component.  
**Fix:** Replace with actual remote image hostnames used by the app, or remove if not needed (since the app uses `<img>` tags mostly).

---

### H7. Chat Message `sender_id` Comparison Logic is Fragile
**File:** `app/actions/chat/buyer.ts` → Line 92  
**Bug:** 
```typescript
senderId: msg.sender_id === session.buyer_id ? "me" : "partner"
```
The `sender_id` in the messages table is just an `Int` with no FK to any specific entity. A buyer's ID `1` and a seller's ID `1` are different entities but have the same numeric value. The comparison `msg.sender_id === session.buyer_id` could return `"me"` for a seller's message if they happen to have the same ID.  
**Impact:** Messages may appear from the wrong sender in the chat UI.  
**Fix:** Add a `sender_type` field to the `messages` model (e.g., `'buyer'` or `'seller'`), or use a composite check.

---

### H8. API Register Route Directory Typo: `regsiter` Instead of `register`
**File:** `app/api/seller/auth/regsiter/route.ts`  
**Bug:** The directory is named `regsiter` instead of `register`. This means the API endpoint is `/api/seller/auth/regsiter` — a misspelling.  
**Impact:** Any client expecting `/api/seller/auth/register` will get a 404. Currently the server action calls `createSeller()` directly, so this may not cause immediate issues, but the API is broken for external use.  
**Fix:** Rename directory to `register`.

---

### H9. Seller Logout API Route Has No Authentication
**File:** `app/api/seller/auth/logout/route.ts`  
**Bug:** The logout route accepts any token in the body and deletes matching sessions. There's no verification that the caller actually owns that token.  
**Impact:** An attacker could potentially log out other users by guessing/brute-forcing tokens.  
**Fix:** Compare the token from the request body with the cookie-based session before deletion.

---

### H10. `v_year` Passed as Int but Schema Says Nullable (`Int?`)
**File:** `app/actions/products.ts` → Lines 84, 121, 168, 188, 204  
**Bug:** In `saveProduct()`, `v_year` is parsed as `parseInt()` (line 84, non-nullable). But the schema has `v_year Int?` (nullable). If the user doesn't select a year, `parseInt(null)` = `NaN`, which will cause a Prisma error.  
**In `updateProduct()`**, the `ProductUpdateData` interface defines `v_year: number` (non-nullable, line 188) which is inconsistent with the schema.  
**Fix:** Use `parseOptionalInt()` for `v_year` and make the interface field nullable.

---

## 🟡 MEDIUM Issues

### M1. `getBuyerDetails()` Uses Type Assertion `as any` to Suppress Type Error
**File:** `app/actions/buyer.ts` → Line 168  
**Bug:** `include: { buyer_details: { include: { cities: true, districts: true } } } as any`  
The `as any` suppresses a legitimate type error — this likely means the Prisma types don't match what's expected. This can lead to runtime errors.  
**Fix:** Investigate the actual Prisma type and fix the query to match.

---

### M2. Inconsistent Session Token Generation
**Files:**  
- `app/actions/buyer-auth.ts` → uses `randomBytes(32).toString('hex')` (64 character hex)  
- `app/api/seller/auth/login/route.ts` → uses `randomUUID()` (36 character UUID)  
**Bug:** Different token formats for different user types. Not a critical bug but makes the codebase inconsistent and harder to maintain.  
**Fix:** Standardize on one approach (preferably `randomBytes(32).toString('hex')` for higher entropy).

---

### M3. `seller_payments` Seed Data: `payhere_status: 0` for PENDING
**File:** `prisma/seed.js` → Line 618  
**Bug:** For the PENDING payment, `payhere_status` is set to `0`. PayHere uses status codes like `2` (success), `-2` (failed), etc. `0` is not a standard PayHere status. With `Int?` type, using `null` would be more accurate for "not yet processed".  
**Fix:** Use `null` for `payhere_status` when payment is pending.

---

### M4. Missing `created_at` Field on `app_admin_roles` Model
**File:** `prisma/schema.prisma` → Lines 25-32  
**Bug:** `app_admin_roles` has `updated_at` but **no** `created_at` field. Every other model in the schema has `created_at`. This is an inconsistency.  
**Fix:** Add `created_at DateTime @default(now())`.

---

### M5. Duplicate Data Model: `getDistricts()` / `getCities()` in Both `location.ts` AND `seller-meta.ts`
**Files:** `app/actions/location.ts`, `app/actions/seller-meta.ts`  
**Bug:** Both files fetch districts and cities. `seller-meta.ts` also bundles seller types. This is code duplication.  
**Fix:** Consolidate location-fetching into `location.ts` and import from there.

---

### M6. `lib/buyer.ts` Has `"use server"` but `lib/seller.ts` Does NOT
**Files:** `lib/buyer.ts`, `lib/seller.ts`  
**Bug:** `lib/buyer.ts` is marked `"use server"` but `lib/seller.ts` is not, despite both being library files intended for server-side use. This inconsistency could cause confusion.  
**Fix:** Remove `"use server"` from `lib/buyer.ts` (it's imported by server-side code, not called directly from client), or add it to both if both need client-callable functions.

---

### M7. `app-details.ts` Server Action Calls Internal API Via `fetch()`
**File:** `app/actions/app-details.ts` → Lines 10-12  
**Bug:** Server Action calls `fetch(baseUrl + '/api/app-details')` — a self-referential HTTP call. The comment even acknowledges this is "not recommended."  
**Fix:** Call `prisma.app_details.findFirst()` directly.

---

### M8. `getProductDetails()` Calls `getBuyerDetails()` Without Caching
**File:** `app/actions/buyer.ts` → Line 70  
**Bug:** In `product_view/[id]/page.tsx`, `getBuyerDetails()` is called directly on line 19, AND `getProductDetails()` also calls `getBuyerDetails()` internally (line 70). This means buyer details are fetched **twice** on every product page load.  
**Fix:** Pass the buyer ID as a parameter to `getProductDetails()` instead of re-fetching.

---

### M9. `orders` Has `@@unique([buyer_id, product_id])` — Buyers Can Only Order Each Product Once
**File:** `prisma/schema.prisma` → Line 286  
**Bug:** The unique constraint on `[buyer_id, product_id]` makes business sense for the "unlock" model, but could be an issue if the app ever supports re-orders or quantities. Currently it also means the `unlockSellerDetails` function's duplicate check is logically redundant with the DB constraint (though it provides better error messages).  
**Impact:** Not a bug per se, but a design constraint worth documenting.

---

### M10. `v_models.year` → `v_years` FK is Optional but Used Alongside `seller_products.v_year`
**File:** `prisma/schema.prisma` → `v_models.year Int?`, `seller_products.v_year Int?`  
**Bug:** Year is stored in **two places**: as part of the model definition (`v_models.year`) AND as a direct reference on the product (`seller_products.v_year`). In `product_view/[id]/page.tsx` line 29:
```typescript
const year = product.v_year_ref?.year || product.v_model_ref?.v_years?.year
```
This dual-source creates potential inconsistency — a product could reference year 2022 while its model references year 2020.  
**Fix:** Document which is authoritative, or enforce consistency via business logic.

---

## 🔵 LOW Issues

### L1. `buyer/page.tsx` Links to `/buyer/products` Which Doesn't Exist
**File:** `app/buyer/page.tsx` → Line 21  
**Bug:** "View All" link goes to `/buyer/products` but there's no `app/buyer/products/` page. Should likely be `/buyer/categories`.

### L2. ESLint Config References Non-Existent Rule
**File:** `eslint.config.mjs` → Line 19  
**Bug:** `"react-hooks/incompatible-library": "off"` — this rule doesn't exist in standard eslint-plugin-react-hooks. It may be silently ignored.

### L3. `product_view/[id]/page.tsx` — "Add to Cart" Button Does Nothing
**File:** `app/buyer/product_view/[id]/page.tsx` → Lines 180-183  
**Bug:** The "Add to Cart" button has no `onClick` handler and there's no cart implementation (`/buyer/cart` directory is empty).

### L4. Hard-coded Rating Stars (Always 5 Stars, 0 Reviews)
**File:** `app/buyer/product_view/[id]/page.tsx` → Lines 111-118  
**Bug:** All products show 5 filled stars and "(0 reviews)" — this is misleading to users.

### L5. `payments.ts` Hard-codes city as 'Colombo'
**File:** `app/actions/payments.ts` → Line 59  
**Bug:** `city: 'Colombo'` is hard-coded instead of looking up the seller's actual city name. Comment says "Should ideally come from city name lookup."

### L6. Seller Login Text Typo: "Register Now . its free"
**File:** `app/seller/(auth)/login/page.tsx` → Line 133  
**Bug:** Typo: should be "Register Now. It's free" (missing apostrophe, extra space before period).

### L7. Missing `NIC` Field in Admin Seed Data  
**File:** `prisma/seed.js` → Lines 97-99  
**Bug:** The `app_admins` model has a `NIC` field (unique), which is not provided in the seed data. If NIC is required for any admin operations, this could cause issues.

### L8. Conversation Seed Data Has Incorrect `sender_id`/`receiver_id` Pairs
**File:** `prisma/seed.js` → Lines 547-549  
**Bug:** In conversation 1 (buyer_id=1, seller_id=1), all messages have `sender_id: 1, receiver_id: 1`. Both IDs are `1` so it's impossible to tell who sent what. Given the chat sender_id comparison issue (H7), this makes the seed data confusing.

### L9. `buyer/cart` and `buyer/credits` Directories Are Empty
**Files:** `app/buyer/cart/`, `app/buyer/credits/`  
**Bug:** Empty directories with no pages — if users navigate to these URLs they'll get 404s.

### L10. Prisma Dev Logging Includes `"query"` — Performance Impact
**File:** `lib/prisma.ts` → Line 10  
**Bug:** In development mode, all Prisma queries are logged. With the amount of joins and queries on each page, this floods the terminal and may slow down development.

---

## 📋 Fix Plan (Prioritized)

### Phase 1: 🔴 Critical Security & Data Bugs (Immediate)

| # | Bug | File(s) | Action |
|---|-----|---------|--------|
| 1 | C3 | `api/products/[id]/route.js` | Whitelist allowed update fields in PUT handler |
| 2 | C1 | `actions/buyer.ts` | Move `revalidatePath()` before return, fix dead code |
| 3 | H3, H4 | `actions/category.ts` | Use `select` to exclude password from seller_details |
| 4 | C2 | `buyer/product_view/[id]/page.tsx` | Extract image gallery into client component |
| 5 | C6 | `prisma/seed.js` | Hash all passwords with bcrypt before seeding |
| 6 | C5 | `admin/(auth)/login/page.tsx` | Implement actual admin login logic |
| 7 | C7 | `actions/seller-auth.ts` | Refactor sellerLogin to use Prisma directly instead of fetch() |

### Phase 2: 🟠 High-Priority Logic Fixes

| # | Bug | File(s) | Action |
|---|-----|---------|--------|
| 8 | H1 | `actions/products.ts` | Add NaN validation for all parseInt() calls |
| 9 | H10 | `actions/products.ts` | Fix v_year parsing to use parseOptionalInt() |
| 10 | H5 | `middleware.ts` | Add `/buyer/chat` to protected routes |
| 11 | H8 | `api/seller/auth/regsiter/` | Rename directory to `register` |
| 12 | H6 | `next.config.ts` | Update remote image hostname or remove placeholder |
| 13 | H7 | Schema + `actions/chat/buyer.ts` | Add sender_type to messages or use a different approach |
| 14 | H9 | `api/seller/auth/logout/route.ts` | Add authentication check before session deletion |
| 15 | H2 | `lib/buyer.ts` | Review and fix `"use server"` placement |
| 16 | C4 | `prisma/seed.js` | Remove non-existent `product_id` from seller_payments seed |

### Phase 3: 🟡 Medium-Priority Consistency Fixes

| # | Bug | File(s) | Action |
|---|-----|---------|--------|
| 17 | M1 | `actions/buyer.ts` | Fix Prisma query type and remove `as any` |
| 18 | M7 | `actions/app-details.ts` | Replace fetch() with direct Prisma call |
| 19 | M8 | `actions/buyer.ts` + `product_view` page | Eliminate duplicate getBuyerDetails() calls |
| 20 | M2 | All auth files | Standardize session token generation |
| 21 | M4 | `prisma/schema.prisma` | Add `created_at` to `app_admin_roles` |
| 22 | M5, M6 | `lib/buyer.ts`, `lib/seller.ts`, actions | Consolidate duplicate code, fix directive |
| 23 | M3 | `prisma/seed.js` | Use null for pending payhere_status |

### Phase 4: 🔵 Low-Priority Polish

| # | Bug | File(s) | Action |
|---|-----|---------|--------|
| 24 | L1 | `buyer/page.tsx` | Fix "View All" link to correct path |
| 25 | L5 | `actions/payments.ts` | Look up seller's actual city name |
| 26 | L6 | `seller/(auth)/login/page.tsx` | Fix typo |
| 27 | L8 | `prisma/seed.js` | Fix sender/receiver IDs in conversation seed |
| 28 | L3, L9 | `buyer/cart/`, `buyer/credits/` | Add placeholder pages or remove routes |
| 29 | L4 | `product_view/[id]/page.tsx` | Remove misleading stars or add "No reviews yet" |
| 30 | L7 | `prisma/seed.js` | Add NIC to admin seed data |
| 31 | L2 | `eslint.config.mjs` | Remove non-existent ESLint rule |
| 32 | L10 | `lib/prisma.ts` | Consider removing "query" from dev logging |

---

## Summary

| Severity | Count | Impact |
|----------|-------|--------|
| 🔴 Critical | 7 | Data loss, security vulnerabilities, broken features |
| 🟠 High | 10 | Logic errors, data leaks, broken navigation |
| 🟡 Medium | 10 | Inconsistencies, tech debt, code smells |
| 🔵 Low | 10 | Polish, UX issues, minor typos |
| **Total** | **37** | |

Would you like me to begin implementing fixes starting from Phase 1?
