#!/bin/bash

# ==============================================================================
# FIX SCRIPT FOR ANYPART.LK INSTALLATION ISSUES
# ==============================================================================
# This script attempts to automatically fix common installation issues
# ==============================================================================

# Colors for Output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="anypart.lk"
APP_NAME="anypart-app"
APP_DIR="/var/www/anypart.lk"
GIT_REPO_URL="https://github.com/Kavi8428/anypart.git"
GIT_BRANCH="main"
NODE_VERSION="20"

# ---------------------------- HELPER FUNCTIONS ----------------------------

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "  $1"
}

ask_confirmation() {
    echo -e "${YELLOW}$1${NC}"
    read -p "Continue? (y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        return 1
    fi
    return 0
}

check_root() {
    if [ "$EUID" -ne 0 ]; then
        print_error "This script requires root privileges"
        print_info "Run with: sudo ./fix.sh"
        exit 1
    fi
}

# ---------------------------- FIX FUNCTIONS ----------------------------

fix_node_npm() {
    print_header "Fixing Node.js and NPM"
    
    if ! command -v node &> /dev/null; then
        print_warning "Node.js is not installed. Installing..."
        
        # Install Node.js
        curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
        apt-get install -y nodejs
        
        if command -v node &> /dev/null; then
            print_success "Node.js installed: $(node -v)"
        else
            print_error "Failed to install Node.js"
            return 1
        fi
    else
        NODE_MAJOR=$(node -v | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -lt 18 ]; then
            print_warning "Node.js version is too old. Upgrading..."
            
            curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
            apt-get install -y nodejs
            
            print_success "Node.js upgraded to: $(node -v)"
        else
            print_success "Node.js version is compatible: $(node -v)"
        fi
    fi
    
    # Verify npm
    if ! command -v npm &> /dev/null; then
        print_error "NPM is not available after Node.js installation"
        return 1
    fi
    
    print_success "NPM is available: v$(npm -v)"
}

fix_mysql_mariadb() {
    print_header "Fixing MySQL/MariaDB"
    
    # Check if either is installed
    if ! command -v mysql &> /dev/null && ! command -v mariadb &> /dev/null; then
        print_warning "MySQL/MariaDB is not installed. Installing MySQL..."
        
        apt-get update
        apt-get install -y mysql-server
        
        if command -v mysql &> /dev/null; then
            print_success "MySQL installed successfully"
        else
            print_error "Failed to install MySQL"
            return 1
        fi
    fi
    
    # Check if service is running
    if ! systemctl is-active --quiet mysql && ! systemctl is-active --quiet mariadb; then
        print_warning "MySQL/MariaDB service is not running. Starting..."
        
        if systemctl start mysql 2>/dev/null; then
            print_success "MySQL service started"
        elif systemctl start mariadb 2>/dev/null; then
            print_success "MariaDB service started"
        else
            print_error "Failed to start database service"
            return 1
        fi
    fi
    
    # Enable service on boot
    if systemctl enable mysql 2>/dev/null || systemctl enable mariadb 2>/dev/null; then
        print_success "Database service enabled on boot"
    fi
    
    # Secure installation reminder
    print_info "Remember to run: sudo mysql_secure_installation"
}

fix_nginx() {
    print_header "Fixing Nginx"
    
    # Install if not present
    if ! command -v nginx &> /dev/null; then
        print_warning "Nginx is not installed. Installing..."
        
        apt-get update
        apt-get install -y nginx
        
        if command -v nginx &> /dev/null; then
            print_success "Nginx installed successfully"
        else
            print_error "Failed to install Nginx"
            return 1
        fi
    fi
    
    # Start service if not running
    if ! systemctl is-active --quiet nginx; then
        print_warning "Nginx is not running. Starting..."
        
        systemctl start nginx
        print_success "Nginx service started"
    fi
    
    # Enable on boot
    systemctl enable nginx
    print_success "Nginx enabled on boot"
    
    # Check domain configuration
    if [ ! -f "/etc/nginx/sites-available/$DOMAIN" ]; then
        print_warning "Domain configuration missing. Creating..."
        
        cat > "/etc/nginx/sites-available/$DOMAIN" <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF
        print_success "Domain configuration created"
    fi
    
    # Enable site
    if [ ! -L "/etc/nginx/sites-enabled/$DOMAIN" ]; then
        print_warning "Domain not enabled. Enabling..."
        
        ln -sf "/etc/nginx/sites-available/$DOMAIN" /etc/nginx/sites-enabled/
        print_success "Domain enabled"
    fi
    
    # Remove default site if exists
    if [ -f "/etc/nginx/sites-enabled/default" ]; then
        print_info "Removing default Nginx site..."
        rm -f /etc/nginx/sites-enabled/default
    fi
    
    # Test configuration
    if nginx -t 2>/dev/null; then
        print_success "Nginx configuration is valid"
        
        # Reload nginx
        systemctl reload nginx
        print_success "Nginx reloaded"
    else
        print_error "Nginx configuration has errors"
        nginx -t
        return 1
    fi
}

fix_pm2() {
    print_header "Fixing PM2"
    
    # Install if not present
    if ! command -v pm2 &> /dev/null; then
        print_warning "PM2 is not installed. Installing globally..."
        
        npm install -g pm2
        
        if command -v pm2 &> /dev/null; then
            print_success "PM2 installed: v$(pm2 -v)"
        else
            print_error "Failed to install PM2"
            return 1
        fi
    fi
    
    # Check if app directory exists
    if [ ! -d "$APP_DIR" ]; then
        print_warning "Application directory not found. Cannot configure PM2 yet."
        return 1
    fi
    
    cd "$APP_DIR" || return 1
    
    # Check if app is in PM2 list
    if ! pm2 list | grep -q "$APP_NAME"; then
        print_warning "Application not in PM2. Adding..."
        
        # Make sure dependencies are installed
        if [ ! -d "node_modules" ]; then
            print_info "Installing dependencies first..."
            npm install
        fi
        
        # Make sure build exists
        if [ ! -d ".next" ]; then
            print_info "Building application first..."
            npm run build
        fi
        
        # Start with PM2
        pm2 start npm --name "$APP_NAME" -- start
        print_success "Application started with PM2"
    else
        # Check if app is running
        if pm2 list | grep "$APP_NAME" | grep -q "online"; then
            print_success "Application is already running"
        else
            print_warning "Application is stopped. Restarting..."
            pm2 restart "$APP_NAME"
            print_success "Application restarted"
        fi
    fi
    
    # Save PM2 list
    pm2 save
    print_success "PM2 process list saved"
    
    # Setup startup script
    if ! pm2 startup | grep -q "already"; then
        print_info "Configuring PM2 startup..."
        
        # Get the startup command and execute it
        STARTUP_CMD=$(pm2 startup systemd | grep "sudo" | sed 's/\[PM2\] //')
        if [ -n "$STARTUP_CMD" ]; then
            eval "$STARTUP_CMD"
            print_success "PM2 startup configured"
        fi
    else
        print_success "PM2 startup already configured"
    fi
}

fix_prisma() {
    print_header "Fixing Prisma"
    
    if [ ! -d "$APP_DIR" ]; then
        print_error "Application directory not found: $APP_DIR"
        return 1
    fi
    
    cd "$APP_DIR" || return 1
    
    # Install dependencies if needed
    if [ ! -d "node_modules" ]; then
        print_warning "node_modules not found. Installing dependencies..."
        npm install
        print_success "Dependencies installed"
    fi
    
    # Check if Prisma is installed
    if [ ! -f "node_modules/.bin/prisma" ]; then
        print_warning "Prisma not found. Installing..."
        npm install prisma @prisma/client
        print_success "Prisma installed"
    fi
    
    # Check .env file
    if [ ! -f ".env" ]; then
        print_warning ".env file missing. Creating from .env.example..."
        
        if [ -f ".env.example" ]; then
            cp .env.example .env
            print_success ".env file created"
            print_warning "IMPORTANT: Edit .env and set DATABASE_URL!"
        else
            print_error ".env.example not found"
            return 1
        fi
    fi
    
    # Generate Prisma Client
    if [ ! -d "node_modules/.prisma/client" ]; then
        print_warning "Prisma Client not generated. Generating..."
        npx prisma generate
        print_success "Prisma Client generated"
    fi
    
    # Check if DATABASE_URL is set
    if grep -q "DATABASE_URL" .env && ! grep -q "DATABASE_URL=\"\"" .env; then
        print_info "Attempting to run migrations..."
        
        if npx prisma migrate deploy 2>/dev/null; then
            print_success "Database migrations completed"
        else
            print_warning "Migration failed. Check DATABASE_URL in .env"
            print_info "Run manually: npx prisma migrate deploy"
        fi
    else
        print_warning "DATABASE_URL not configured in .env"
        print_info "Set it to: mysql://USER:PASSWORD@localhost:3306/DATABASE_NAME"
    fi
}

fix_application() {
    print_header "Fixing Application"
    
    # Clone repository if not exists
    if [ ! -d "$APP_DIR" ]; then
        print_warning "Application directory not found. Cloning repository..."
        
        mkdir -p "$(dirname "$APP_DIR")"
        git clone "$GIT_REPO_URL" "$APP_DIR"
        
        if [ -d "$APP_DIR" ]; then
            print_success "Repository cloned successfully"
        else
            print_error "Failed to clone repository"
            return 1
        fi
    fi
    
    cd "$APP_DIR" || return 1
    
    # Pull latest changes
    if [ -d ".git" ]; then
        print_info "Pulling latest changes..."
        git stash
        git pull origin "$GIT_BRANCH"
        print_success "Repository updated"
    fi
    
    # Install dependencies
    if [ ! -d "node_modules" ]; then
        print_warning "Installing dependencies..."
        npm install
        print_success "Dependencies installed"
    else
        print_info "Updating dependencies..."
        npm install
        print_success "Dependencies updated"
    fi
    
    # Build application
    print_info "Building application..."
    if npm run build; then
        print_success "Application built successfully"
    else
        print_error "Build failed. Check for errors above."
        return 1
    fi
}

fix_permissions() {
    print_header "Fixing Permissions"
    
    if [ ! -d "$APP_DIR" ]; then
        print_warning "Application directory not found"
        return 1
    fi
    
    print_info "Setting proper ownership..."
    
    # Get the user who should own the files (usually the user who will run PM2)
    if [ -n "$SUDO_USER" ]; then
        TARGET_USER="$SUDO_USER"
    else
        TARGET_USER="www-data"
    fi
    
    chown -R "$TARGET_USER:$TARGET_USER" "$APP_DIR"
    print_success "Ownership set to $TARGET_USER"
    
    # Set proper permissions
    find "$APP_DIR" -type d -exec chmod 755 {} \;
    find "$APP_DIR" -type f -exec chmod 644 {} \;
    
    # Make scripts executable
    if [ -f "$APP_DIR/installation.sh" ]; then
        chmod +x "$APP_DIR/installation.sh"
    fi
    if [ -f "$APP_DIR/debug.sh" ]; then
        chmod +x "$APP_DIR/debug.sh"
    fi
    if [ -f "$APP_DIR/fix.sh" ]; then
        chmod +x "$APP_DIR/fix.sh"
    fi
    
    print_success "Permissions fixed"
}

# ---------------------------- MAIN EXECUTION ----------------------------

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        ANYPART.LK - INSTALLATION FIX SCRIPT                ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

check_root

print_warning "This script will attempt to fix common installation issues."
print_warning "It may install packages, modify configurations, and restart services."

if ! ask_confirmation "Do you want to proceed?"; then
    print_info "Aborted by user"
    exit 0
fi

# Run fixes
fix_node_npm
fix_mysql_mariadb
fix_nginx
fix_application
fix_prisma
fix_pm2
fix_permissions

# Final summary
print_header "Fix Summary"
echo -e "${GREEN}Fix process completed!${NC}"
echo -e "\nNext steps:"
echo -e "  1. Edit .env file and set DATABASE_URL"
echo -e "     ${YELLOW}nano $APP_DIR/.env${NC}"
echo -e "  2. Run database migrations"
echo -e "     ${YELLOW}cd $APP_DIR && npx prisma migrate deploy${NC}"
echo -e "  3. Restart the application"
echo -e "     ${YELLOW}pm2 restart $APP_NAME${NC}"
echo -e "  4. Check application status"
echo -e "     ${YELLOW}pm2 logs $APP_NAME${NC}"
echo -e "  5. Visit your site"
echo -e "     ${YELLOW}http://$DOMAIN${NC}"
echo -e "\nRun debug script to verify:"
echo -e "  ${YELLOW}./debug.sh${NC}"
echo ""
