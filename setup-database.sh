#!/bin/bash

# ==============================================================================
# DATABASE SETUP SCRIPT FOR ANYPART.LK
# ==============================================================================
# This script uses the LOCAL Prisma version to avoid version conflicts
# ==============================================================================

# Colors for Output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║        ANYPART.LK - DATABASE SETUP SCRIPT                  ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    print_error "package.json not found. Are you in the project directory?"
    print_info "Run: cd /var/www/anypart.lk"
    exit 1
fi

print_success "Found package.json"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    print_warning "node_modules not found. Installing dependencies..."
    npm install
fi

# Check if local Prisma exists
if [ ! -f "node_modules/.bin/prisma" ]; then
    print_error "Local Prisma not found in node_modules"
    print_info "Run: npm install"
    exit 1
fi

print_success "Found local Prisma installation"

# Show Prisma version
print_header "Prisma Version"
PRISMA_VERSION=$(./node_modules/.bin/prisma --version | grep "prisma" | head -1)
print_info "$PRISMA_VERSION"

# Check .env file
print_header "Checking Environment"
if [ ! -f ".env" ]; then
    print_error ".env file not found"
    
    if [ -f ".env.example" ]; then
        print_info "Creating .env from .env.example..."
        cp .env.example .env
        print_warning "Please edit .env and set DATABASE_URL"
        print_info "nano .env"
        exit 1
    else
        print_error ".env.example not found"
        exit 1
    fi
fi

print_success ".env file exists"

# Check DATABASE_URL
if grep -q "DATABASE_URL" .env; then
    print_success "DATABASE_URL is set"
    # Don't show the actual URL for security
    print_info "DATABASE_URL=***"
else
    print_error "DATABASE_URL not found in .env"
    print_info "Add: DATABASE_URL=\"mysql://user:password@localhost:3306/database\""
    exit 1
fi

# Push database schema
print_header "Pushing Database Schema"
print_info "Using local Prisma to push schema changes..."

if ./node_modules/.bin/prisma db push; then
    print_success "Database schema pushed successfully!"
else
    print_error "Failed to push database schema"
    print_info "Check the error message above"
    exit 1
fi

# Generate Prisma Client
print_header "Generating Prisma Client"
if ./node_modules/.bin/prisma generate; then
    print_success "Prisma Client generated successfully!"
else
    print_error "Failed to generate Prisma Client"
    exit 1
fi

# Final summary
print_header "Setup Complete!"
echo -e "${GREEN}Database setup completed successfully!${NC}"
echo -e "\nNext steps:"
echo -e "  1. Build the application"
echo -e "     ${YELLOW}npm run build${NC}"
echo -e "  2. Restart PM2"
echo -e "     ${YELLOW}pm2 restart anypart-app${NC}"
echo -e "  3. Check logs"
echo -e "     ${YELLOW}pm2 logs anypart-app${NC}"
echo -e "  4. Test the application"
echo -e "     ${YELLOW}curl http://localhost:3000${NC}"
echo ""
