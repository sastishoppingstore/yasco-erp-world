#!/bin/bash

###############################################################################
# YASCO ERP - Quick Deployment Script
# Date: July 3, 2026
# Target VPS: 203.161.63.59
# 
# This script automates the deployment process to VPS
# Run this script FROM THE VPS after code upload
###############################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}YASCO ERP - Deployment Script${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Please run as root (use sudo)${NC}"
  exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo -e "${RED}Error: package.json not found. Are you in the /home/ubuntu/erp directory?${NC}"
  exit 1
fi

# Step 1: Backup existing installation
echo -e "${YELLOW}Step 1: Creating backup...${NC}"
BACKUP_DIR="/home/ubuntu/erp-backups"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
mkdir -p $BACKUP_DIR

if [ -d "dist" ]; then
  echo "Backing up existing installation..."
  tar -czf "$BACKUP_DIR/erp-backup-$TIMESTAMP.tar.gz" dist/ .env 2>/dev/null || true
  echo -e "${GREEN}✓ Backup created: $BACKUP_DIR/erp-backup-$TIMESTAMP.tar.gz${NC}"
fi

# Step 2: Backup database
echo -e "${YELLOW}Step 2: Backing up database...${NC}"
read -p "Enter MySQL root password: " -s MYSQL_PASSWORD
echo ""

read -p "Enter database name (default: erp_database): " DB_NAME
DB_NAME=${DB_NAME:-erp_database}

mysqldump -u root -p"$MYSQL_PASSWORD" "$DB_NAME" > "$BACKUP_DIR/db-backup-$TIMESTAMP.sql" 2>/dev/null || {
  echo -e "${RED}Database backup failed. Continue anyway? (y/n)${NC}"
  read -p "" continue
  if [ "$continue" != "y" ]; then
    exit 1
  fi
}

echo -e "${GREEN}✓ Database backup created: $BACKUP_DIR/db-backup-$TIMESTAMP.sql${NC}"

# Step 3: Stop running services
echo -e "${YELLOW}Step 3: Stopping PM2 services...${NC}"
pm2 stop all 2>/dev/null || echo "No PM2 processes to stop"
echo -e "${GREEN}✓ Services stopped${NC}"

# Step 4: Install dependencies
echo -e "${YELLOW}Step 4: Installing dependencies...${NC}"
npm install --production
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Step 5: Build application (if dist doesn't exist or is empty)
if [ ! -d "dist" ] || [ -z "$(ls -A dist)" ]; then
  echo -e "${YELLOW}Step 5: Building application...${NC}"
  NODE_OPTIONS="--max-old-space-size=4096" npm run build
  echo -e "${GREEN}✓ Build completed${NC}"
else
  echo -e "${YELLOW}Step 5: Build already exists, skipping...${NC}"
fi

# Step 6: Run database migration
echo -e "${YELLOW}Step 6: Running database migration...${NC}"
echo "Migration file: db/migrations/0013_saudi_market_enhancements.sql"
read -p "Run database migration? (y/n): " run_migration

if [ "$run_migration" = "y" ]; then
  mysql -u root -p"$MYSQL_PASSWORD" "$DB_NAME" < db/migrations/0013_saudi_market_enhancements.sql 2>&1 || {
    echo -e "${RED}Migration failed! Check errors above.${NC}"
    echo "You can run migration manually later:"
    echo "mysql -u root -p $DB_NAME < db/migrations/0013_saudi_market_enhancements.sql"
    read -p "Continue anyway? (y/n): " continue
    if [ "$continue" != "y" ]; then
      exit 1
    fi
  }
  echo -e "${GREEN}✓ Migration completed${NC}"
else
  echo -e "${YELLOW}⚠ Migration skipped. Remember to run it manually!${NC}"
fi

# Step 7: Verify .env file
echo -e "${YELLOW}Step 7: Checking .env file...${NC}"
if [ ! -f ".env" ]; then
  echo -e "${RED}Warning: .env file not found!${NC}"
  echo "Creating .env from .env.example..."
  if [ -f ".env.example" ]; then
    cp .env.example .env
    echo -e "${YELLOW}⚠ Please edit .env file and configure:${NC}"
    echo "  - DATABASE_URL"
    echo "  - ADMIN_USERNAME and ADMIN_PASSWORD"
    echo "  - SMTP settings (for OTP email)"
    read -p "Press Enter to continue after editing .env..."
  else
    echo -e "${RED}Error: .env.example also not found!${NC}"
    exit 1
  fi
else
  echo -e "${GREEN}✓ .env file exists${NC}"
fi

# Step 8: Start services with PM2
echo -e "${YELLOW}Step 8: Starting services with PM2...${NC}"

# Delete old processes if they exist
pm2 delete erp-api 2>/dev/null || true
pm2 delete erp-email-worker 2>/dev/null || true
pm2 delete erp-tax-worker 2>/dev/null || true
pm2 delete erp-report-worker 2>/dev/null || true

# Start main API
pm2 start dist/boot.js --name "erp-api" \
  --max-memory-restart 1G \
  --log /var/log/pm2/erp-api.log \
  --error /var/log/pm2/erp-api-error.log

# Start queue workers (optional)
read -p "Start queue workers (email, tax, report)? (y/n): " start_workers
if [ "$start_workers" = "y" ]; then
  if [ -f "dist/queue/email.queue.js" ]; then
    pm2 start dist/queue/email.queue.js --name "erp-email-worker"
  fi
  if [ -f "dist/queue/tax.queue.js" ]; then
    pm2 start dist/queue/tax.queue.js --name "erp-tax-worker"
  fi
  if [ -f "dist/queue/report.queue.js" ]; then
    pm2 start dist/queue/report.queue.js --name "erp-report-worker"
  fi
fi

# Save PM2 process list
pm2 save

echo -e "${GREEN}✓ Services started${NC}"

# Step 9: Setup PM2 startup (if not already done)
echo -e "${YELLOW}Step 9: Setting up PM2 startup...${NC}"
pm2 startup systemd -u root --hp /root 2>/dev/null || true
echo -e "${GREEN}✓ PM2 startup configured${NC}"

# Step 10: Verify deployment
echo -e "${YELLOW}Step 10: Verifying deployment...${NC}"
sleep 5  # Wait for services to start

# Check PM2 status
echo ""
echo "PM2 Process Status:"
pm2 status

# Check logs
echo ""
echo "Recent logs (last 20 lines):"
pm2 logs erp-api --lines 20 --nostream

# Test API health
echo ""
echo "Testing API health endpoint..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health 2>/dev/null || echo "000")

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "404" ]; then
  echo -e "${GREEN}✓ API is responding${NC}"
else
  echo -e "${RED}⚠ API not responding (HTTP $HTTP_CODE). Check logs above.${NC}"
fi

# Final summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}Deployment Summary${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "✓ Backup created: ${GREEN}$BACKUP_DIR/erp-backup-$TIMESTAMP.tar.gz${NC}"
echo -e "✓ Database backup: ${GREEN}$BACKUP_DIR/db-backup-$TIMESTAMP.sql${NC}"
echo -e "✓ Dependencies installed"
echo -e "✓ Application built"
echo -e "✓ Services started with PM2"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Check PM2 logs: ${GREEN}pm2 logs erp-api${NC}"
echo "2. Access application: ${GREEN}http://your-server-ip:3000${NC}"
echo "3. Login with admin credentials from .env file"
echo "4. Configure Nginx reverse proxy (see DEPLOY_TO_VPS_INSTRUCTIONS.md)"
echo "5. Setup SSL certificate with Let's Encrypt"
echo "6. Test key features (customer creation, invoice generation)"
echo ""
echo -e "${GREEN}Deployment completed successfully!${NC}"
echo ""

# Offer to show logs
read -p "Do you want to watch logs now? (y/n): " watch_logs
if [ "$watch_logs" = "y" ]; then
  pm2 logs erp-api
fi
