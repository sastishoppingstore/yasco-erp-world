#!/bin/bash
# VPS Deployment Script for YASCO ERP
# VPS: 203.161.63.59
# Password: hEFZX17Y9rN7wiki34

set -e

VPS_HOST="203.161.63.59"
VPS_USER="root"
VPS_PASS="hEFZX17Y9rN7wiki34"
DB_NAME="erp_yasco_prod"
DB_USER="erp_user"
DB_PASS="ErpPass123"

echo "🚀 Starting VPS Deployment..."

# Step 1: Test connection
echo "1️⃣ Testing VPS connection..."
SSHPASS="$VPS_PASS" sshpass -e ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST 'echo "✅ Connected to VPS"'

# Step 2: Install dependencies
echo "2️⃣ Installing Node.js and MySQL on VPS..."
SSHPASS="$VPS_PASS" sshpass -e ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST << 'EOF'
# Update system
apt-get update -qq

# Install Node.js 20
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    echo "✅ Node.js installed: $(node --version)"
else
    echo "✅ Node.js already installed: $(node --version)"
fi

# Install MySQL
if ! command -v mysql &> /dev/null; then
    apt-get install -y mysql-server
    systemctl start mysql
    systemctl enable mysql
    echo "✅ MySQL installed"
else
    echo "✅ MySQL already installed"
fi

# Install PM2
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
    echo "✅ PM2 installed"
else
    echo "✅ PM2 already installed"
fi

# Install Redis
if ! command -v redis-cli &> /dev/null; then
    apt-get install -y redis-server
    systemctl start redis
    systemctl enable redis
    echo "✅ Redis installed"
else
    echo "✅ Redis already installed"
fi
EOF

# Step 3: Create database and user
echo "3️⃣ Setting up database..."
SSHPASS="$VPS_PASS" sshpass -e ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST << EOF
mysql -e "CREATE DATABASE IF NOT EXISTS $DB_NAME DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';"
mysql -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';"
mysql -e "FLUSH PRIVILEGES;"
echo "✅ Database $DB_NAME created"
echo "✅ User $DB_USER created with all privileges"
EOF

# Step 4: Copy application files
echo "4️⃣ Copying application files to VPS..."
SSHPASS="$VPS_PASS" sshpass -e ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST 'mkdir -p /opt/erp'

# Copy package.json and install dependencies
echo "   📦 Copying package files..."
SSHPASS="$VPS_PASS" sshpass -e scp -o StrictHostKeyChecking=no package.json package-lock.json $VPS_USER@$VPS_HOST:/opt/erp/

# Copy built files
echo "   📦 Copying dist folder..."
SSHPASS="$VPS_PASS" sshpass -e scp -r -o StrictHostKeyChecking=no dist $VPS_USER@$VPS_HOST:/opt/erp/

# Copy database migrations
echo "   📦 Copying database migrations..."
SSHPASS="$VPS_PASS" sshpass -e scp -r -o StrictHostKeyChecking=no db/migrations $VPS_USER@$VPS_HOST:/opt/erp/

# Copy .env file
echo "   📦 Creating .env file..."
SSHPASS="$VPS_PASS" sshpass -e ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST << 'ENVEOF'
cat > /opt/erp/.env << 'EOF'
NODE_ENV=production
PORT=3000
DATABASE_URL=mysql://erp_user:ErpPass123@localhost:3306/erp_yasco_prod
REDIS_URL=redis://localhost:6379
SESSION_SECRET=$(openssl rand -base64 32)
ADMIN_USERNAME=wafaweb
ADMIN_PASSWORD=Wafa@1122
EOF
echo "✅ .env file created"
ENVEOF

# Step 5: Apply database migrations
echo "5️⃣ Applying database migrations..."
SSHPASS="$VPS_PASS" sshpass -e scp -o StrictHostKeyChecking=no db/migrations/0012_healthcare_workshop_complete.sql $VPS_USER@$VPS_HOST:/tmp/

SSHPASS="$VPS_PASS" sshpass -e ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST << EOF
mysql $DB_NAME < /tmp/0012_healthcare_workshop_complete.sql 2>&1
echo "✅ Healthcare & Workshop tables created"

# Check tables
mysql $DB_NAME -e "SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema='$DB_NAME';"
EOF

# Step 6: Install Node modules on VPS
echo "6️⃣ Installing Node modules..."
SSHPASS="$VPS_PASS" sshpass -e ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST << 'EOF'
cd /opt/erp
npm install --production
echo "✅ Node modules installed"
EOF

# Step 7: Start application with PM2
echo "7️⃣ Starting application with PM2..."
SSHPASS="$VPS_PASS" sshpass -e ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST << 'EOF'
cd /opt/erp
pm2 delete erp-backend 2>/dev/null || true
pm2 start dist/boot.js --name erp-backend -i 2 --max-memory-restart 500M
pm2 save
pm2 startup systemd -u root --hp /root
echo "✅ Application started with PM2"
pm2 list
EOF

# Step 8: Setup NGINX reverse proxy
echo "8️⃣ Setting up NGINX..."
SSHPASS="$VPS_PASS" sshpass -e ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST << 'EOF'
# Install NGINX
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    systemctl start nginx
    systemctl enable nginx
    echo "✅ NGINX installed"
else
    echo "✅ NGINX already installed"
fi

# Create NGINX config
cat > /etc/nginx/sites-available/erp << 'NGINXEOF'
server {
    listen 80;
    server_name 203.161.63.59 erp.yasco.tech;

    client_max_body_size 50M;

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
NGINXEOF

ln -sf /etc/nginx/sites-available/erp /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
echo "✅ NGINX configured and reloaded"
EOF

# Step 9: Setup firewall
echo "9️⃣ Configuring firewall..."
SSHPASS="$VPS_PASS" sshpass -e ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST << 'EOF'
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
echo "✅ Firewall configured"
EOF

# Step 10: Check application status
echo "🔟 Checking application status..."
SSHPASS="$VPS_PASS" sshpass -e ssh -o StrictHostKeyChecking=no $VPS_USER@$VPS_HOST << 'EOF'
echo ""
echo "📊 System Status:"
echo "================"
pm2 status
echo ""
echo "📊 Database Tables:"
mysql erp_yasco_prod -e "SELECT COUNT(*) as total_tables FROM information_schema.tables WHERE table_schema='erp_yasco_prod';"
echo ""
echo "🌐 Application URL: http://203.161.63.59"
echo "🔐 Admin Login: wafaweb / Wafa@1122"
EOF

echo ""
echo "✅ ✅ ✅ DEPLOYMENT COMPLETE ✅ ✅ ✅"
echo ""
echo "🌐 Application running at: http://203.161.63.59"
echo "📱 Login with: wafaweb / Wafa@1122"
echo ""
echo "📝 Next Steps:"
echo "1. Configure domain: erp.yasco.tech -> 203.161.63.59"
echo "2. Install SSL certificate with certbot"
echo "3. Test all modules"
echo ""
