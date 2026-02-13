#!/bin/bash

# ==============================================================================
# DEBUG SCRIPT FOR ANYPART.LK INSTALLATION
# ==============================================================================
# This script checks if all dependencies are installed and configured correctly
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

# ---------------------------- CHECK FUNCTIONS ----------------------------

check_node_npm() {
    print_header "Checking Node.js and NPM"
    
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node -v)
        print_success "Node.js is installed: $NODE_VERSION"
        
        # Check if version is >= 18
        NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | sed 's/v//')
        if [ "$NODE_MAJOR" -ge 18 ]; then
            print_success "Node.js version is compatible (>= 18)"
        else
            print_error "Node.js version is too old. Need >= 18.x"
        fi
    else
        print_error "Node.js is NOT installed"
        return 1
    fi
    
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm -v)
        print_success "NPM is installed: v$NPM_VERSION"
    else
        print_error "NPM is NOT installed"
        return 1
    fi
    
    # Test npm functionality
    if npm list -g --depth=0 &> /dev/null; then
        print_success "NPM is working correctly"
    else
        print_warning "NPM might have issues"
    fi
}

check_mysql_mariadb() {
    print_header "Checking MySQL/MariaDB"
    
    MYSQL_FOUND=false
    DB_TYPE=""
    
    # Check for MySQL
    if command -v mysql &> /dev/null; then
        MYSQL_VERSION=$(mysql --version)
        
        # Determine if it's MySQL or MariaDB
        if echo "$MYSQL_VERSION" | grep -qi "mariadb"; then
            print_success "MariaDB client is installed: $MYSQL_VERSION"
            DB_TYPE="mariadb"
        else
            print_success "MySQL client is installed: $MYSQL_VERSION"
            DB_TYPE="mysql"
        fi
        MYSQL_FOUND=true
    fi
    
    # Check for MariaDB command
    if command -v mariadb &> /dev/null && [ "$MYSQL_FOUND" = false ]; then
        MARIADB_VERSION=$(mariadb --version)
        print_success "MariaDB client is installed: $MARIADB_VERSION"
        DB_TYPE="mariadb"
        MYSQL_FOUND=true
    fi
    
    if [ "$MYSQL_FOUND" = false ]; then
        print_error "Neither MySQL nor MariaDB client is installed"
        print_info "Install with: sudo apt install mariadb-server mariadb-client"
        return 1
    fi
    
    # Check if MySQL/MariaDB service is running
    if systemctl is-active --quiet mariadb; then
        print_success "MariaDB service is running"
        print_info "Status: $(systemctl status mariadb | grep Active)"
    elif systemctl is-active --quiet mysql; then
        print_success "MySQL service is running"
        print_info "Status: $(systemctl status mysql | grep Active)"
    else
        print_error "MySQL/MariaDB service is NOT running"
        if [ "$DB_TYPE" = "mariadb" ]; then
            print_info "Try: sudo systemctl start mariadb"
        else
            print_info "Try: sudo systemctl start mysql"
        fi
        return 1
    fi
    
    # Check if we can connect (requires .my.cnf or manual credentials)
    if mysql -e "SELECT 1;" &> /dev/null; then
        print_success "Database connection successful"
        
        # Show databases
        print_info "Available databases:"
        mysql -e "SHOW DATABASES;" | tail -n +2 | while read db; do
            print_info "  - $db"
        done
    else
        print_warning "Cannot connect to database (credentials may be required)"
        if [ "$DB_TYPE" = "mariadb" ]; then
            print_info "Test manually: sudo mariadb"
        else
            print_info "Test manually: sudo mysql"
        fi
    fi
}

check_nginx() {
    print_header "Checking Nginx"
    
    if command -v nginx &> /dev/null; then
        NGINX_VERSION=$(nginx -v 2>&1)
        print_success "Nginx is installed: $NGINX_VERSION"
    else
        print_error "Nginx is NOT installed"
        return 1
    fi
    
    # Check if Nginx is running
    if systemctl is-active --quiet nginx; then
        print_success "Nginx service is running"
        print_info "Status: $(systemctl status nginx | grep Active)"
    else
        print_error "Nginx service is NOT running"
        print_info "Try: sudo systemctl start nginx"
        return 1
    fi
    
    # Check configuration syntax
    if nginx -t &> /dev/null; then
        print_success "Nginx configuration is valid"
    else
        print_error "Nginx configuration has errors"
        print_info "Run: sudo nginx -t"
    fi
    
    # Check if domain configuration exists
    if [ -f "/etc/nginx/sites-available/$DOMAIN" ]; then
        print_success "Domain configuration exists: /etc/nginx/sites-available/$DOMAIN"
        
        if [ -L "/etc/nginx/sites-enabled/$DOMAIN" ]; then
            print_success "Domain is enabled in sites-enabled"
        else
            print_warning "Domain is NOT enabled (symlink missing in sites-enabled)"
            print_info "Enable with: sudo ln -s /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/"
        fi
        
        # Show configuration
        print_info "Configuration preview:"
        grep -E "server_name|proxy_pass|listen" "/etc/nginx/sites-available/$DOMAIN" | while read line; do
            print_info "  $line"
        done
    else
        print_error "Domain configuration NOT found: /etc/nginx/sites-available/$DOMAIN"
    fi
    
    # Check if Nginx is listening on port 80
    if netstat -tuln 2>/dev/null | grep -q ":80 " || ss -tuln 2>/dev/null | grep -q ":80 "; then
        print_success "Nginx is listening on port 80"
    else
        print_warning "Port 80 is not in use"
    fi
}

check_pm2() {
    print_header "Checking PM2"
    
    if command -v pm2 &> /dev/null; then
        PM2_VERSION=$(pm2 -v)
        print_success "PM2 is installed: v$PM2_VERSION"
    else
        print_error "PM2 is NOT installed"
        print_info "Install with: sudo npm install -g pm2"
        return 1
    fi
    
    # Check PM2 process list
    print_info "PM2 Process List:"
    if pm2 list | grep -q "online\|stopped\|errored"; then
        pm2 list
        
        # Check if our app is running
        if pm2 list | grep -q "$APP_NAME"; then
            if pm2 list | grep "$APP_NAME" | grep -q "online"; then
                print_success "Application '$APP_NAME' is running"
            else
                print_error "Application '$APP_NAME' is NOT running (stopped/errored)"
                print_info "Check logs: pm2 logs $APP_NAME"
            fi
        else
            print_warning "Application '$APP_NAME' is NOT in PM2 list"
        fi
    else
        print_warning "No PM2 processes found"
    fi
    
    # Check PM2 startup configuration
    if pm2 startup | grep -q "already"; then
        print_success "PM2 startup is configured"
    else
        print_warning "PM2 startup is NOT configured"
        print_info "Configure with: pm2 startup"
    fi
    
    # Check if PM2 save file exists
    if [ -f "$HOME/.pm2/dump.pm2" ]; then
        print_success "PM2 process list is saved"
    else
        print_warning "PM2 process list is NOT saved"
        print_info "Save with: pm2 save"
    fi
}

check_prisma() {
    print_header "Checking Prisma"
    
    # Check if we're in the app directory
    if [ -d "$APP_DIR" ]; then
        cd "$APP_DIR" || exit
        print_success "Application directory found: $APP_DIR"
    else
        print_error "Application directory NOT found: $APP_DIR"
        return 1
    fi
    
    # Check if Prisma is installed locally
    if [ -f "node_modules/.bin/prisma" ]; then
        print_success "Prisma is installed in node_modules"
        
        PRISMA_VERSION=$(npx prisma --version | grep "prisma" | head -1)
        print_info "$PRISMA_VERSION"
    else
        print_error "Prisma is NOT installed in node_modules"
        print_info "Run: npm install"
        return 1
    fi
    
    # Check if schema exists
    if [ -f "prisma/schema.prisma" ]; then
        print_success "Prisma schema found: prisma/schema.prisma"
        
        # Show database provider
        DB_PROVIDER=$(grep "provider" prisma/schema.prisma | head -1)
        print_info "Database: $DB_PROVIDER"
    else
        print_error "Prisma schema NOT found"
        return 1
    fi
    
    # Check if .env exists
    if [ -f ".env" ]; then
        print_success ".env file exists"
        
        if grep -q "DATABASE_URL" .env; then
            print_success "DATABASE_URL is defined in .env"
            
            # Don't show the actual URL for security
            DB_URL_PREVIEW=$(grep "DATABASE_URL" .env | cut -d'=' -f1)
            print_info "$DB_URL_PREVIEW=***"
        else
            print_error "DATABASE_URL is NOT defined in .env"
        fi
    else
        print_error ".env file NOT found"
        print_info "Copy from: cp .env.example .env"
    fi
    
    # Check if Prisma Client is generated
    if [ -d "node_modules/.prisma/client" ]; then
        print_success "Prisma Client is generated"
    else
        print_warning "Prisma Client is NOT generated"
        print_info "Generate with: npx prisma generate"
    fi
    
    # Try to check database connection (this might fail if DB is not configured)
    if npx prisma db execute --stdin <<< "SELECT 1;" &> /dev/null; then
        print_success "Database connection successful"
    else
        print_warning "Cannot connect to database (check DATABASE_URL)"
    fi
}

check_application() {
    print_header "Checking Application"
    
    if [ -d "$APP_DIR" ]; then
        cd "$APP_DIR" || exit
        print_success "Application directory: $APP_DIR"
    else
        print_error "Application directory NOT found: $APP_DIR"
        return 1
    fi
    
    # Check if package.json exists
    if [ -f "package.json" ]; then
        print_success "package.json found"
        
        APP_NAME_PKG=$(grep '"name"' package.json | head -1 | cut -d'"' -f4)
        print_info "Application: $APP_NAME_PKG"
    else
        print_error "package.json NOT found"
        return 1
    fi
    
    # Check if node_modules exists
    if [ -d "node_modules" ]; then
        print_success "node_modules directory exists"
        
        MODULE_COUNT=$(ls -1 node_modules | wc -l)
        print_info "Installed packages: ~$MODULE_COUNT"
    else
        print_error "node_modules NOT found"
        print_info "Run: npm install"
        return 1
    fi
    
    # Check if .next build exists
    if [ -d ".next" ]; then
        print_success "Next.js build directory exists"
    else
        print_warning "Next.js build directory NOT found"
        print_info "Build with: npm run build"
    fi
    
    # Check if app is accessible on localhost:3000
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "Application is responding on http://localhost:3000"
    else
        print_warning "Application is NOT responding on http://localhost:3000"
        print_info "Check if PM2 process is running"
    fi
}

check_git() {
    print_header "Checking Git Repository"
    
    if command -v git &> /dev/null; then
        GIT_VERSION=$(git --version)
        print_success "Git is installed: $GIT_VERSION"
    else
        print_error "Git is NOT installed"
        return 1
    fi
    
    if [ -d "$APP_DIR/.git" ]; then
        cd "$APP_DIR" || exit
        print_success "Git repository initialized"
        
        # Show remote
        if git remote -v | grep -q "origin"; then
            REMOTE_URL=$(git remote get-url origin)
            print_success "Remote origin: $REMOTE_URL"
        else
            print_warning "No remote origin configured"
        fi
        
        # Show current branch
        CURRENT_BRANCH=$(git branch --show-current)
        print_info "Current branch: $CURRENT_BRANCH"
        
        # Check for uncommitted changes
        if git status --porcelain | grep -q .; then
            print_warning "There are uncommitted changes"
            print_info "Run: git status"
        else
            print_success "Working directory is clean"
        fi
    else
        print_warning "Not a git repository: $APP_DIR"
    fi
}

# ---------------------------- MAIN EXECUTION ----------------------------

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        ANYPART.LK - INSTALLATION DEBUG SCRIPT              ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Run all checks
check_node_npm
check_mysql_mariadb
check_nginx
check_pm2
check_prisma
check_application
check_git

# Final summary
print_header "Summary"
echo -e "${GREEN}Debug check completed!${NC}"
echo -e "\nIf any errors were found, please address them before deploying."
echo -e "For detailed logs, check:"
echo -e "  - PM2 logs: ${YELLOW}pm2 logs $APP_NAME${NC}"
echo -e "  - Nginx logs: ${YELLOW}sudo tail -f /var/log/nginx/error.log${NC}"
echo -e "  - System logs: ${YELLOW}sudo journalctl -xe${NC}"
echo ""
