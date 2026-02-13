#!/bin/bash

# ==============================================================================
# INSTALLATION SCRIPT FOR ANYPART.LK
# ==============================================================================
# OS: Debian Linux
# Application: Next.js + Prisma + MySQL
# Process Manager: PM2
# Web Server: Nginx
# ==============================================================================

# ---------------------------- CONFIGURATION ----------------------------

# 1) Set variables for git upstream link
GIT_REPO_URL="https://github.com/Kavi8428/anypart.git"
GIT_BRANCH="main"

# Application Settings
APP_NAME="anypart-app"
APP_DIR="/var/www/anypart.lk"
DOMAIN="anypart.lk"

# Node.js Version
NODE_VERSION="20"

# Colors for Output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ---------------------------- HELPER FUNCTIONS ----------------------------

log_info() {
    echo -e "${GREEN}[INFO] $1${NC}"
}

log_error() {
    echo -e "${RED}[ERROR] $1${NC}"
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Please run as root (sudo ./installation.sh)"
        exit 1
    fi
}

# ---------------------------- MAIN INSTALLATION ----------------------------

check_root

log_info "Starting installation for $APP_NAME..."

# Step 1: Update System
log_info "Updating system packages..."
apt-get update && apt-get upgrade -y

# Step 2: Install Dependencies (MySQL, PM2, Nginx, Git, etc.)
# 3) Install dependanicies including mysql, pm2 and nginix
log_info "Installing core dependencies..."
apt-get install -y git curl build-essential nginx mysql-server

# Install Node.js
if ! command -v node &> /dev/null; then
    log_info "Installing Node.js $NODE_VERSION..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt-get install -y nodejs
else
    log_info "Node.js is already installed: $(node -v)"
fi

# Install PM2 Global
if ! command -v pm2 &> /dev/null; then
    log_info "Installing PM2 globally..."
    npm install -g pm2
else
    log_info "PM2 is already installed."
fi

# Step 3: Clone or Pull Repository
# 2) Clone the repo is already not. If already cloned then make pull request
if [ -d "$APP_DIR" ]; then
    log_info "Application directory exists at $APP_DIR. Pulling latest changes..."
    cd "$APP_DIR" || exit
    git stash # Stash local changes to avoid conflicts
    git pull origin "$GIT_BRANCH"
else
    log_info "Cloning repository from $GIT_REPO_URL..."
    mkdir -p "$(dirname "$APP_DIR")"
    git clone "$GIT_REPO_URL" "$APP_DIR"
    cd "$APP_DIR" || exit
fi

# Step 4: Install Project Dependencies
log_info "Installing npm dependencies..."
npm install

# Check .env file
if [ ! -f ".env" ]; then
    log_info "Creating .env file from .env.example..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        log_info "WARNING: Created .env file. Please edit it manually to set DATABASE_URL and other secrets!"
        # In a real automated script, we might sed/replace values if provided as arguments.
        # For now, we assume the user needs to configure the DB connection string manually or via CI/CD variables.
    else
        log_error ".env.example not found! Please create .env manually."
    fi
fi

# Step 5: Database Setup & Prisma
# 6) make prisma setup and migrations
log_info "Generating Prisma Client..."
npx prisma generate

# Attempt migrations (might fail if DB not configured in .env)
if grep -q "DATABASE_URL" .env; then
    log_info "Running Prisma Migrations..."
    # Note: This requires DATABASE_URL to be set correctly in .env
    npx prisma migrate deploy || log_error "Prisma migration failed. Check your DATABASE_URL."
else
    log_error "DATABASE_URL not found in .env. Skipping migrations."
fi

# Step 6: Build Project
# 4) build the project
log_info "Building the project..."
npm run build

# Step 7: Nginx Setup
# 7) setup nginx by adding domain anypart.lk
log_info "Configuring Nginx for $DOMAIN..."
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"

cat > "$NGINX_CONF" <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000; # Next.js default port
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

# Enable site
ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default

# Test Nginx
nginx -t && systemctl restart nginx
log_info "Nginx configured and restarted."

# Step 8: Start Project with PM2
# 5) setup pm2 to start project
# 8) start project using pm2
log_info "Starting application with PM2..."

# Check if app is already running
if pm2 list | grep -q "$APP_NAME"; then
    log_info "Reloading existing PM2 process..."
    pm2 reload "$APP_NAME"
else
    log_info "Starting new PM2 process..."
    pm2 start npm --name "$APP_NAME" -- start
fi

# Save PM2 list
pm2 save

# Setup PM2 startup script (ensures it runs on boot)
log_info "Setting up PM2 startup hook..."
pm2 startup systemd | grep "sudo" | bash 2>/dev/null || true 
# The above line tries to execute the output of `pm2 startup`.

log_info "--------------------------------------------------------"
log_info "Installation Complete!"
log_info "Access your site at: http://$DOMAIN"
log_info "Please ensure your .env file is configured with the correct database credentials."
log_info "--------------------------------------------------------"
