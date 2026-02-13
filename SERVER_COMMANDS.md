# Server Commands - Fix Prisma Version Issue

## Problem
The server tried to install Prisma 7.4.0 globally, but the project uses Prisma 6.x which has a different configuration format.

## Solution
Use the **local Prisma version** from `node_modules` instead of the global one.

---

## Commands to Run on Server

### 1. Navigate to Project Directory
```bash
cd /var/www/anypart.lk
```

### 2. Check Local Prisma Version
```bash
npx prisma --version
```

If it shows version 7.x, we need to use the project's local version:

```bash
./node_modules/.bin/prisma --version
```

This should show version 6.x

### 3. Run Database Push with Local Prisma
```bash
./node_modules/.bin/prisma db push
```

OR use npm script (recommended):
```bash
npm run prisma:push
```

### 4. Run Migrations with Local Prisma
```bash
./node_modules/.bin/prisma migrate deploy
```

OR:
```bash
npm run prisma:migrate
```

### 5. Generate Prisma Client
```bash
./node_modules/.bin/prisma generate
```

OR (this already runs automatically via postinstall):
```bash
npm run postinstall
```

### 6. Restart Application
```bash
pm2 restart anypart-app
```

### 7. Check Application Status
```bash
pm2 logs anypart-app --lines 50
```

---

## Alternative: Add NPM Scripts

If the npm scripts don't exist, you can run these commands directly:

### Create/Update package.json scripts
```bash
nano package.json
```

Add these to the `"scripts"` section:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "eslint",
    "postinstall": "prisma generate",
    "prisma:generate": "prisma generate",
    "prisma:push": "prisma db push",
    "prisma:migrate": "prisma migrate deploy",
    "prisma:studio": "prisma studio"
  }
}
```

---

## Why This Happened

When you run `npx prisma`, it:
1. Checks if `prisma` is installed globally
2. If not, it asks to install the **latest version** (7.4.0)
3. This conflicts with your project's Prisma 6.x

**Solution:** Always use the local version:
- ✅ `./node_modules/.bin/prisma`
- ✅ `npm run <script>` (uses local version)
- ❌ `npx prisma` (may install wrong version)

---

## Quick Commands Reference

```bash
# Check versions
./node_modules/.bin/prisma --version
node --version
npm --version

# Database operations
./node_modules/.bin/prisma db push          # Push schema changes
./node_modules/.bin/prisma migrate deploy   # Run migrations
./node_modules/.bin/prisma generate         # Generate client
./node_modules/.bin/prisma studio           # Open Prisma Studio

# Application operations
npm install                                  # Install dependencies
npm run build                                # Build application
pm2 restart anypart-app                      # Restart app
pm2 logs anypart-app                         # View logs
pm2 status                                   # Check status

# Nginx operations
sudo systemctl status nginx                  # Check Nginx status
sudo nginx -t                                # Test Nginx config
sudo systemctl reload nginx                  # Reload Nginx

# Database operations
sudo mariadb                                 # Connect to MariaDB
sudo systemctl status mariadb                # Check MariaDB status
```

---

## Complete Setup Flow

```bash
# 1. Navigate to project
cd /var/www/anypart.lk

# 2. Ensure .env exists with DATABASE_URL
cat .env

# 3. Install dependencies (if needed)
npm install

# 4. Push database schema
./node_modules/.bin/prisma db push

# 5. Generate Prisma Client
./node_modules/.bin/prisma generate

# 6. Build application
npm run build

# 7. Restart with PM2
pm2 restart anypart-app

# 8. Check logs
pm2 logs anypart-app --lines 50

# 9. Test application
curl http://localhost:3000
```

---

## Troubleshooting

### If database connection fails:
```bash
# Test MariaDB connection
sudo mariadb -u admin -p anypart_db

# Check if database exists
sudo mariadb -e "SHOW DATABASES;"

# Check if user has permissions
sudo mariadb -e "SHOW GRANTS FOR 'admin'@'localhost';"
```

### If Prisma Client is not generated:
```bash
# Force regenerate
rm -rf node_modules/.prisma
./node_modules/.bin/prisma generate
```

### If PM2 app crashes:
```bash
# View full logs
pm2 logs anypart-app --lines 200

# Restart with environment update
pm2 restart anypart-app --update-env

# Delete and re-add to PM2
pm2 delete anypart-app
pm2 start npm --name anypart-app -- start
pm2 save
```
