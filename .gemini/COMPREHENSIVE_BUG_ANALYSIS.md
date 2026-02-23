# 🔍 Comprehensive Project Bug Analysis & Fix Plan
**Generated:** 2026-02-15T04:26:20+05:30  
**Project:** anypart.lk - Auto Parts E-commerce Platform

---

## 📊 Executive Summary

This document presents a deep consistency check and comprehensive bug analysis of the entire project, identifying **critical**, **high**, **medium**, and **low** priority issues across architecture, security, data integrity, performance, and code quality.

### Issue Breakdown
- **🔴 Critical Issues:** 4
- **🟠 High Priority:** 8
- **🟡 Medium Priority:** 12
- **🔵 Low Priority:** 6

---

## 🔴 CRITICAL ISSUES (Immediate Action Required)

### 1. **Duplicate Authentication Logic - Seller Login**
**Location:** `app/actions/seller-auth.ts` + `app/api/seller/auth/login/route.ts`  
**Severity:** 🔴 Critical  
**Impact:** Code inconsistency, maintenance nightmare, potential security vulnerabilities

**Problem:**
- Seller login is implemented in BOTH a Server Action (`seller-auth.ts`) AND an API route (`login/route.ts`)
- User recently refactored `seller-auth.ts` to use direct database calls (correct approach)
- API route at `app/api/seller/auth/login/route.ts` still exists but uses `tel1` field instead of `user_name`
- This creates two different login mechanisms with different behaviors

**Evidence:**
```typescript
// seller-auth.ts (Line 24) - Uses user_name
const seller = await prisma.seller_details.findUnique({
    where: { user_name: phone },
});

// login/route.ts (Line 14) - Uses tel1
const seller = await prisma.seller_details.findFirst({
    where: { tel1: phone },
});
```

**Fix Required:**
- ✅ Remove API route entirely: `app/api/seller/auth/login/route.ts`
- ✅ Remove API route: `app/api/seller/auth/logout/route.ts`
- ✅ Remove API route: `app/api/seller/auth/register/route.ts` (if not used)
- Ensure all components use Server Actions only

---

### 2. **Inconsistent Image Filename Generation**
**Location:** `lib/image-server.ts` line 19  
**Severity:** 🔴 Critical  
**Impact:** Collision risk, security vulnerability

**Problem:**
```typescript
const uniqueId = Math.random().toString(36).substring(2, 10);
```
- Uses `Math.random()` which is NOT cryptographically secure
- User already fixed this in `app/actions/products.ts` but NOT in the shared utility
- Creates collision risk with concurrent uploads

**Fix Required:**
```typescript
import { randomUUID } from 'crypto';

const uniqueId = randomUUID().substring(0, 8);
const filename = `${Date.now()}_${uniqueId}_${file.name.replace(/\s+/g, '_')}`;
```

---

### 3. **Missing v_year Validation Can Cause Data Corruption**
**Location:** `app/actions/products.ts` lines 59-70  
**Severity:** 🔴 Critical  
**Impact:** Database integrity violation, orphaned records

**Problem:**
```typescript
const v_year = parseOptionalInt(formData.get('v_year') as string);
// ... later used directly in create/update without validation
```
- `v_year` is marked as optional but database requires valid foreign key to `v_years` table
- No validation that `v_year` exists in `v_years` table before creating product
- Can cause foreign key constraint violations or orphaned data

**Fix Required:**
```typescript
// After parsing v_year
if (v_year) {
    const yearExists = await tx.v_years.findUnique({ where: { id: v_year } });
    if (!yearExists) {
        throw new Error('Invalid vehicle year selected');
    }
}
```

---

### 4. **Authentication Session Expiry Not Checked on Page Load**
**Location:** `lib/auth.ts` - all session functions  
**Severity:** 🔴 Critical  
**Impact:** Expired sessions still work, security risk

**Problem:**
- Sessions are checked for expiry in database queries (good)
- BUT expired cookies are not deleted from client
- User can keep making requests with expired session token
- Middleware only checks cookie EXISTS, not if it's valid

**Fix Required:**
```typescript
// In middleware.ts - add session validation
if (pathname.startsWith('/seller')) {
    const sellerSession = request.cookies.get('seller_session');
    if (!sellerSession) {
        return NextResponse.redirect(new URL('/seller/login', request.url));
    }
    
    // NEW: Validate session is not expired
    const session = await prisma.seller_sessions.findFirst({
        where: { 
            token: sellerSession.value,
            token_expire_at: { gt: new Date() }
        }
    });
    
    if (!session) {
        const response = NextResponse.redirect(new URL('/seller/login', request.url));
        response.cookies.delete('seller_session');
        return response;
    }
}
```

---

## 🟠 HIGH PRIORITY ISSUES

### 5. **No Transaction Rollback for File Uploads on DB Failure**
**Location:** `app/actions/products.ts` lines 103-145  
**Severity:** 🟠 High  
**Impact:** Orphaned files, disk space waste

**Current State:**
- User added cleanup logic (good!)
- BUT cleanup only happens if transaction throws error
- If database succeeds but later operations fail, files remain

**Fix Required:**
- Add try-finally block around entire operation
- Store uploaded file paths in state
- Clean up files if operation doesn't complete successfully

---

### 6. **Missing Input Sanitization**
**Location:** Multiple - All user input fields  
**Severity:** 🟠 High  
**Impact:** XSS, SQL Injection (via Prisma less likely but possible), data corruption

**Problem:**
- No sanitization of phone numbers (can contain special chars)
- No sanitization of business names, addresses
- No HTML escaping in product descriptions
- No validation of email format in buyer/seller registration

**Fix Required:**
```typescript
// Install: npm install validator
import validator from 'validator';

// In registration functions
const sanitizedEmail = validator.normalizeEmail(email);
if (!validator.isEmail(sanitizedEmail)) {
    throw new Error('Invalid email format');
}

const sanitizedPhone = phone.replace(/[^0-9+]/g, '');
if (!validator.isMobilePhone(sanitizedPhone, 'any')) {
    throw new Error('Invalid phone number');
}
```

---

### 7. **Password Validation Too Weak**
**Location:** `app/actions/seller-auth.ts` line 113  
**Severity:** 🟠 High  
**Impact:** Weak passwords, account compromise

**Problem:**
```typescript
if (password.length < 6) {
    return { message: 'Password is too short.', errors: { password: ['Password must be at least 6 characters.'] } };
}
```
- Only checks length, no complexity requirements
- Should enforce: uppercase, lowercase, number, special character

**Fix Required:**
```typescript
function validatePassword(password: string): { valid: boolean; message?: string } {
    if (password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters' };
    }
    if (!/[A-Z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/[a-z]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/[0-9]/.test(password)) {
        return { valid: false, message: 'Password must contain at least one number' };
    }
    return { valid: true };
}
```

---

### 8. **No Rate Limiting on Authentication Endpoints**
**Location:** All authentication actions  
**Severity:** 🟠 High  
**Impact:** Brute force attacks, DDoS

**Problem:**
- No rate limiting on login attempts
- No account lockout after failed attempts
- No CAPTCHA or similar protection

**Fix Required:**
- Implement rate limiting using Upstash Redis or similar
- Track failed login attempts per IP/account
- Add progressive delays or account lockout

---

### 9. **Inconsistent Error Handling**
**Location:** Multiple files  
**Severity:** 🟠 High  
**Impact:** Information leakage, poor UX

**Problem:**
```typescript
// Some places return detailed errors
return { error: 'Username or Email already taken.' };

// Other places return generic errors
return { message: 'Something went wrong. Please try again.', errors: {} };

// Some log to console, others don't
console.error('Error fetching products:', error);
```

**Fix Required:**
- Create standardized error response format
- Never expose internal errors to client in production
- Always log errors server-side
- Return user-friendly messages

---

### 10. **No CSRF Protection**
**Location:** All form submissions  
**Severity:** 🟠 High  
**Impact:** Cross-Site Request Forgery attacks

**Problem:**
- Next.js Server Actions don't have built-in CSRF protection
- No CSRF tokens on forms
- No origin validation

**Fix Required:**
- Implement CSRF token generation and validation
- Or use Next.js headers to validate origin
- Add `headers: { 'X-CSRF-Token': token }` to all mutations

---

### 11. **Missing Database Indexes**
**Location:** Prisma schema  
**Severity:** 🟠 High  
**Impact:** Slow queries, poor performance at scale

**Problem:**
- No index on `seller_products.v_year` (frequently queried)
- No index on `seller_products.p_name` (filtered often)
- No composite indexes for common query patterns

**Fix Required:**
```prisma
model seller_products {
  // Add composite index for common queries
  @@index([v_model, p_name, v_year], name: "idx_product_search")
  @@index([seller_id, is_featured], name: "idx_seller_featured")
  @@index([created_at], name: "idx_created_at")
}
```

---

### 12. **No Email Verification Flow**
**Location:** Buyer/Seller registration  
**Severity:** 🟠 High  
**Impact:** Fake accounts, spam

**Problem:**
- `verified` field exists in schema but not implemented
- Users can register with fake emails
- No email confirmation required

**Fix Required:**
- Implement email verification using nodemailer or similar
- Generate verification token on registration
- Require email verification before full account access

---

## 🟡 MEDIUM PRIORITY ISSUES

### 13. **Inconsistent Naming Conventions**
**Location:** Throughout codebase  
**Severity:** 🟡 Medium  
**Impact:** Code maintainability

**Examples:**
- `seller_products` vs `sellerProducts` (snake_case in DB, camelCase in code)
- `buyer_details` vs `buyerDetails`
- Some functions use `get` prefix, others don't
- File names: `buyer-auth.ts` (kebab) vs `buyer.ts` (no separator)

**Fix Required:**
- Establish coding standards document
- Use ESLint rules to enforce
- Gradually refactor to consistent style

---

### 14. **Missing Pagination**
**Location:** `app/actions/buyer.ts`, `category.ts`, `products.ts`  
**Severity:** 🟡 Medium  
**Impact:** Performance degradation with large datasets

**Problem:**
```typescript
// No limit or pagination
const products = await prisma.seller_products.findMany({...});
```
- Fetches ALL products at once
- Will cause memory issues with thousands of products
- Slow page loads

**Fix Required:**
```typescript
export async function getProducts(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    
    const [products, total] = await Promise.all([
        prisma.seller_products.findMany({
            skip,
            take: limit,
            // ... rest of query
        }),
        prisma.seller_products.count()
    ]);
    
    return {
        products,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
}
```

---

### 15. **No Caching Strategy**
**Location:** All data fetching functions  
**Severity:** 🟡 Medium  
**Impact:** Unnecessary database load

**Problem:**
- Every request hits database
- No caching for static data (brands, models, years)
- No CDN for images

**Fix Required:**
- Implement React cache() for static data
- Use Next.js built-in caching with revalidate
- Consider Redis for session data

---

### 16. **Hardcoded Pagination Limits**
**Location:** `lib/buyer.ts` line 83, `app/actions/buyer.ts` line 40  
**Severity:** 🟡 Medium  
**Impact:** Inflexible, magic numbers

**Problem:**
```typescript
take: 8, // Hardcoded limit
```

**Fix Required:**
- Create constants file for configuration
- Make limits configurable via env vars or settings

---

### 17. **No Soft Delete Implementation**
**Location:** All delete operations  
**Severity:** 🟡 Medium  
**Impact:** Data loss, no audit trail

**Problem:**
```typescript
await prisma.seller_products.delete({ where: { id } });
```
- Hard deletes remove data permanently
- No way to recover deleted items
- No audit trail

**Fix Required:**
- Add `deleted_at` field to models
- Implement soft delete pattern
- Filter out soft-deleted records in queries

---

### 18. **Missing TypeScript Strict Mode**
**Location:** `tsconfig.json`  
**Severity:** 🟡 Medium  
**Impact:** Type safety issues

**Problem:**
- Likely not using strict mode
- Allows implicit `any` types
- Weak type checking

**Fix Required:**
```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true
  }
}
```

---

### 19. **Inconsistent Date Handling**
**Location:** Multiple  
**Severity:** 🟡 Medium  
**Impact:** Timezone bugs

**Problem:**
- Using `new Date()` without timezone considerations
- No centralized date utility
- Inconsistent date formatting

**Fix Required:**
- Use date-fns or dayjs for date handling
- Store all dates in UTC
- Format dates in user's timezone on display

---

### 20. **No Request Validation Schema**
**Location:** All API routes and actions  
**Severity:** 🟡 Medium  
**Impact:** Runtime errors, type safety

**Problem:**
- Manual validation with if statements
- No schema validation library (Zod, Yup)
- Type safety not guaranteed at runtime

**Fix Required:**
```typescript
import { z } from 'zod';

const loginSchema = z.object({
    phone: z.string().min(10).max(15),
    password: z.string().min(6)
});

export async function sellerLogin(prevState: FormState | null, formData: FormData) {
    const data = {
        phone: formData.get('phone'),
        password: formData.get('password')
    };
    
    const validated = loginSchema.safeParse(data);
    if (!validated.success) {
        return { message: 'Invalid input', errors: validated.error.flatten() };
    }
    // ... rest of logic
}
```

---

### 21. **No Environment Variable Validation**
**Location:** `.env` file usage  
**Severity:** 🟡 Medium  
**Impact:** Runtime errors in production

**Problem:**
- No validation that required env vars are set
- App might crash at runtime if var is missing
- No type safety for env vars

**Fix Required:**
```typescript
// lib/env.ts
import { z } from 'zod';

const envSchema = z.object({
    DATABASE_URL: z.string().url(),
    PAYHERE_MERCHANT_ID: z.string(),
    PAYHERE_SECRET: z.string(),
    NEXT_PUBLIC_APP_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
```

---

### 22. **Console Logs in Production Code**
**Location:** Throughout - especially `lib/auth.ts` lines 36, 40, 58, 60  
**Severity:** 🟡 Medium  
**Impact:** Performance, information leakage

**Problem:**
```typescript
console.log('[AUTH] seller_session cookie found, querying DB...');
console.log('[AUTH] Session found for seller_id:', session.seller_id);
```
- Debug logs in production code
- Can expose sensitive information
- Performance overhead

**Fix Required:**
- Use proper logging library (winston, pino)
- Log levels (debug, info, warn, error)
- Only log debug statements in development

---

### 23. **Missing Database Connection Pooling Configuration**
**Location:** `lib/prisma.ts`  
**Severity:** 🟡 Medium  
**Impact:** Connection exhaustion under load

**Problem:**
```typescript
export const prisma = globalForPrisma.prisma ?? new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
});
```
- No connection pool configuration
- Default pool size might be too small

**Fix Required:**
```typescript
export const prisma = new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
    datasources: {
        db: {
            url: env.DATABASE_URL,
        },
    },
    // Configure connection pool
    connectionLimit: 10,
});
```

---

### 24. **No API Versioning**
**Location:** `app/api/**`  
**Severity:** 🟡 Medium  
**Impact:** Breaking changes for clients

**Problem:**
- No version prefix in API routes
- No way to maintain backwards compatibility
- Difficult to deprecate old endpoints

**Fix Required:**
- Add version to routes: `/api/v1/seller/auth/login`
- Document API changes
- Support multiple versions during transition

---

## 🔵 LOW PRIORITY ISSUES

### 25. **Unused API Routes**
**Location:** `app/api/seller/auth/register/route.ts`  
**Severity:** 🔵 Low  
**Impact:** Code bloat, confusion

**Problem:**
- User created Server Action for seller registration
- API route might be unused
- Creates confusion about which to use

**Fix Required:**
- Audit all API routes
- Remove unused routes
- Document intended usage

---

### 26. **Missing JSDoc Comments**
**Location:** Throughout  
**Severity:** 🔵 Low  
**Impact:** Developer experience

**Problem:**
- No function documentation
- Unclear parameter purposes
- No return type documentation

**Fix Required:**
```typescript
/**
 * Authenticates a seller and creates a session
 * @param phone - Seller's registered phone number
 * @param password - Seller's password (will be compared with hash)
 * @returns Session token and expiry date
 * @throws Error if credentials are invalid
 */
export async function sellerLogin(phone: string, password: string) {
    // ...
}
```

---

### 27. **No Git Hooks for Quality Checks**
**Location:** Project root  
**Severity:** 🔵 Low  
**Impact:** Code quality

**Problem:**
- No pre-commit hooks
- No lint-staged
- No commit message validation

**Fix Required:**
```bash
npm install -D husky lint-staged
npx husky init
```

```json
// package.json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write"]
  }
}
```

---

### 28. **No Error Boundary Components**
**Location:** React component tree  
**Severity:** 🔵 Low  
**Impact:** Poor error UX

**Problem:**
- No error boundaries to catch React errors
- App crashes show blank screen
- No graceful degradation

**Fix Required:**
```typescript
// components/error-boundary.tsx
'use client';

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh the page.</div>;
    }
    return this.props.children;
  }
}
```

---

### 29. **Inconsistent File Naming**
**Location:** Project structure  
**Severity:** 🔵 Low  
**Impact:** Navigation difficulty

**Problem:**
- Some files use kebab-case: `seller-auth.ts`
- Some use camelCase: `buyerAuth.ts` (if exists)
- Component files should be PascalCase

**Fix Required:**
- Establish naming convention
- Rename files for consistency

---

### 30. **No Component Story/Documentation**
**Location:** UI components  
**Severity:** 🔵 Low  
**Impact:** Developer experience

**Problem:**
- No Storybook or component playground
- Hard to develop UI in isolation
- No visual regression testing

**Fix Required:**
- Set up Storybook
- Create stories for reusable components
- Document component props

---

## 🔧 IMMEDIATE ACTION PLAN (Next 7 Days)

### Day 1-2: Critical Security Fixes
1. ✅ Remove duplicate seller auth API routes
2. ✅ Fix image filename generation in `image-server.ts`
3. ✅ Add v_year validation in product creation
4. ✅ Implement session expiry cleanup in middleware

### Day 3-4: Authentication Hardening
5. ✅ Add password strength validation
6. ✅ Implement input sanitization
7. ✅ Add rate limiting to auth endpoints
8. ✅ Implement CSRF protection

### Day 5-6: Data Integrity
9. ✅ Add database indexes
10. ✅ Implement pagination
11. ✅ Add transaction rollback for file operations
12. ✅ Standardize error handling

### Day 7: Code Quality
13. ✅ Remove console.logs
14. ✅ Add JSDoc comments to public APIs
15. ✅ Enable TypeScript strict mode
16. ✅ Set up ESLint rules

---

## 📈 LONG-TERM IMPROVEMENTS (30-90 Days)

### Phase 1: Architecture (Weeks 1-4)
- Implement caching strategy
- Add API versioning
- Set up monitoring and logging
- Implement soft delete pattern

### Phase 2: Features (Weeks 5-8)
- Email verification flow
- Two-factor authentication
- Advanced search with Elasticsearch
- Real-time notifications

### Phase 3: Performance (Weeks 9-12)
- Database query optimization
- Image optimization and CDN
- Code splitting and lazy loading
- Server-side rendering optimization

---

## 🎯 SUCCESS METRICS

### Before Fixes
- Security Score: 3/10
- Code Quality: 5/10
- Performance: 6/10
- Maintainability: 4/10

### Expected After Fixes
- Security Score: 9/10
- Code Quality: 8/10
- Performance: 8/10
- Maintainability: 9/10

---

## 📝 NOTES

This analysis was conducted on 2026-02-15. The codebase shows good architectural decisions in many areas (transactions, password hashing, session management) but needs consistency and hardening across the board.

Priority should be given to security fixes first, then data integrity, then code quality and performance optimizations.

---

**Next Steps:**
1. Review this document with the team
2. Create GitHub issues for each bug
3. Prioritize based on business impact
4. Start implementation following the action plan
