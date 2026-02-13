# AnyPart.lk - Server Deployment Guide

## Quick Fix for Current Issue

You're seeing a Prisma version mismatch. The server tried to install Prisma 7.x, but your project uses Prisma 6.x.

### Solution: Use Local Prisma Version

```bash
cd /var/www/anypart.lk

# Use the npm script (recommended)
npm run db:push

# OR use the local binary directly
./node_modules/.bin/prisma db push
```

---

## Complete Server Setup

### 1. Install MariaDB (MySQL-compatible)

```bash
sudo apt update
sudo apt install -y mariadb-server mariadb-client
sudo systemctl start mariadb
sudo systemctl enable mariadb
```

### 2. Secure MariaDB

```bash
sudo mysql_secure_installation
```

Recommended answers:
- Set root password: **Yes** (choose a strong password)
- Remove anonymous users: **Yes**
- Disallow root login remotely: **Yes**
- Remove test database: **Yes**
- Reload privilege tables: **Yes**

### 3. Create Database and User

```bash
sudo mariadb
```

Run these SQL commands:

```sql
CREATE DATABASE anypart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'Admin@1234';
GRANT ALL PRIVILEGES ON anypart_db.* TO 'admin'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Configure Application

```bash
cd /var/www/anypart.lk

# Create .env file
cp .env.example .env
nano .env
```

Update the DATABASE_URL:
```
DATABASE_URL="mysql://admin:Admin@1234@localhost:3306/anypart_db"
```

### 5. Setup Database Schema

```bash
# Install dependencies
npm install

# Push database schema (creates tables)
npm run db:push

# OR run migrations if you have migration files
npm run db:migrate
```

### 6. Build Application

```bash
npm run build
```

### 7. Start with PM2

```bash
# If not already added to PM2
pm2 start npm --name anypart-app -- start

# If already in PM2, restart
pm2 restart anypart-app

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
# Run the command it outputs
```

### 8. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/anypart.lk
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name anypart.lk www.anypart.lk;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/anypart.lk /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## Available NPM Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run linter

# Database scripts
npm run db:push      # Push schema changes to database
npm run db:migrate   # Run migrations
npm run db:generate  # Generate Prisma Client
npm run db:studio    # Open Prisma Studio (database GUI)
npm run db:seed      # Seed database with initial data
```

---

## Common Commands

### Application Management

```bash
# View logs
pm2 logs anypart-app

# Restart application
pm2 restart anypart-app

# Stop application
pm2 stop anypart-app

# View status
pm2 status

# Monitor resources
pm2 monit
```

### Database Management

```bash
# Connect to database
sudo mariadb -u admin -p anypart_db

# Show databases
sudo mariadb -e "SHOW DATABASES;"

# Backup database
mysqldump -u admin -p anypart_db > backup.sql

# Restore database
mysql -u admin -p anypart_db < backup.sql
```

### Nginx Management

```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Restart Nginx
sudo systemctl restart nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log
```

### Git Operations

```bash
# Pull latest changes
git pull origin main

# Check status
git status

# View recent commits
git log --oneline -10
```

---

## Deployment Workflow

When you push new code to GitHub:

```bash
# 1. SSH into server
ssh user@your-server

# 2. Navigate to project
cd /var/www/anypart.lk

# 3. Pull latest changes
git pull origin main

# 4. Install any new dependencies
npm install

# 5. Run database migrations (if schema changed)
npm run db:push

# 6. Rebuild application
npm run build

# 7. Restart PM2
pm2 restart anypart-app

# 8. Check logs
pm2 logs anypart-app --lines 50
```

---

## Troubleshooting

### Application won't start

```bash
# Check PM2 logs
pm2 logs anypart-app --lines 100

# Check if port 3000 is in use
sudo lsof -i :3000

# Restart with fresh environment
pm2 delete anypart-app
pm2 start npm --name anypart-app -- start
pm2 save
```

### Database connection errors

```bash
# Test database connection
sudo mariadb -u admin -p anypart_db

# Check if database exists
sudo mariadb -e "SHOW DATABASES;"

# Check user permissions
sudo mariadb -e "SHOW GRANTS FOR 'admin'@'localhost';"

# Verify .env file
cat .env | grep DATABASE_URL
```

### Nginx issues

```bash
# Check if Nginx is running
sudo systemctl status nginx

# Test configuration
sudo nginx -t

# Check error logs
sudo tail -f /var/log/nginx/error.log

# Restart Nginx
sudo systemctl restart nginx
```

### Prisma issues

```bash
# Regenerate Prisma Client
npm run db:generate

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# View Prisma version
npx prisma --version
```

---

## Security Checklist

- ✅ MariaDB secured with `mysql_secure_installation`
- ✅ Strong database password set
- ✅ Database user has minimal required permissions
- ✅ `.env` file not committed to Git (in `.gitignore`)
- ✅ Nginx configured with proper headers
- ✅ PM2 running as non-root user (recommended)
- ⚠️ Consider setting up SSL/HTTPS with Let's Encrypt
- ⚠️ Consider setting up firewall (ufw)
- ⚠️ Consider setting up automated backups

---

## Performance Optimization

### PM2 Cluster Mode

For better performance, run multiple instances:

```bash
pm2 delete anypart-app
pm2 start npm --name anypart-app -i max -- start
pm2 save
```

### Nginx Caching

Add to Nginx config for static assets:

```nginx
location /_next/static {
    proxy_cache STATIC;
    proxy_pass http://localhost:3000;
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

---

## Support

For issues or questions:
- Check PM2 logs: `pm2 logs anypart-app`
- Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
- Check system logs: `sudo journalctl -xe`
