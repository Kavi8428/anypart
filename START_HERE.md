# 🚨 IMPORTANT: Read This First!

## The Prisma Version Problem

Your server is trying to use **Prisma 7.x**, but this project uses **Prisma 6.x**.

### ❌ DO NOT RUN:
```bash
npx prisma db push
```

### ✅ INSTEAD, RUN ONE OF THESE:

#### **Easiest: Use the automated script**
```bash
cd /var/www/anypart.lk
git pull origin main
chmod +x setup-database.sh
./setup-database.sh
```

#### **Or: Use npm scripts**
```bash
cd /var/www/anypart.lk
npm run db:push
```

#### **Or: Use local Prisma directly**
```bash
cd /var/www/anypart.lk
./node_modules/.bin/prisma db push
```

---

## 🚀 Quick Deployment (After Git Push)

```bash
cd /var/www/anypart.lk
chmod +x deploy.sh
./deploy.sh
```

This single command will:
- Pull latest code
- Install dependencies
- Setup database
- Build application
- Restart PM2

---

## 📚 Documentation Files

- **`DEPLOYMENT.md`** - Complete deployment guide
- **`SERVER_COMMANDS.md`** - All server commands reference
- **`setup-database.sh`** - Automated database setup
- **`deploy.sh`** - One-command deployment

---

## 🆘 Quick Troubleshooting

### Application not starting?
```bash
pm2 logs anypart-app --lines 100
```

### Database connection error?
```bash
cat .env | grep DATABASE_URL
sudo mariadb -u admin -p anypart_db
```

### Nginx not working?
```bash
sudo nginx -t
sudo systemctl status nginx
```

---

## 📞 Need Help?

Check the logs:
```bash
pm2 logs anypart-app          # Application logs
sudo tail -f /var/log/nginx/error.log  # Nginx logs
sudo journalctl -xe           # System logs
```
