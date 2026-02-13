# ANYPART.LK - Quick Installation Guide

## Issue: MySQL Installation Failed

**Problem:** On Debian Trixie, `mysql-server` package is not available. MariaDB is the replacement.

**Solution:** The fix.sh script has been updated to automatically install MariaDB instead.

## Commands to Run on Server

### 1. Pull Latest Changes
```bash
cd /var/www/anypart.lk
git pull origin main
```

### 2. Make Scripts Executable
```bash
chmod +x installation.sh debug.sh fix.sh
```

### 3. Run Fix Script Again
```bash
sudo ./fix.sh
```

This will now install **MariaDB** (which is MySQL-compatible).

### 4. Secure MariaDB Installation
```bash
sudo mysql_secure_installation
```

Follow the prompts:
- Set root password
- Remove anonymous users: Yes
- Disallow root login remotely: Yes
- Remove test database: Yes
- Reload privilege tables: Yes

### 5. Create Database for Application
```bash
sudo mariadb
```

Then run these SQL commands:
```sql
CREATE DATABASE anypart_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'anypart_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON anypart_db.* TO 'anypart_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 6. Update .env File
```bash
cd /var/www/anypart.lk
nano .env
```

Add this line (replace with your actual password):
```
DATABASE_URL="mysql://anypart_user:your_secure_password@localhost:3306/anypart_db"
```

Save and exit (Ctrl+X, then Y, then Enter)

### 7. Run Prisma Migrations
```bash
npx prisma migrate deploy
```

### 8. Restart Application
```bash
pm2 restart anypart-app
```

### 9. Verify Everything Works
```bash
./debug.sh
```

### 10. Check Application Logs
```bash
pm2 logs anypart-app
```

### 11. Test the Website
```bash
curl http://localhost:3000
```

Or visit in browser: `http://anypart.lk`

## Why MariaDB Instead of MySQL?

- **MariaDB** is a drop-in replacement for MySQL
- It's the default on modern Debian/Ubuntu systems
- 100% compatible with MySQL syntax
- Often faster and more feature-rich
- Your Prisma schema works exactly the same

## Troubleshooting

### If MariaDB service won't start:
```bash
sudo systemctl status mariadb
sudo journalctl -u mariadb -n 50
```

### If database connection fails:
```bash
# Test connection
sudo mariadb -u anypart_user -p anypart_db

# Check if user exists
sudo mariadb -e "SELECT User, Host FROM mysql.user;"
```

### If PM2 app keeps crashing:
```bash
pm2 logs anypart-app --lines 100
pm2 restart anypart-app --update-env
```

## Summary

The updated scripts now:
✅ Install MariaDB (MySQL-compatible)
✅ Detect both MySQL and MariaDB
✅ Provide correct commands for your system
✅ Handle Debian Trixie properly
