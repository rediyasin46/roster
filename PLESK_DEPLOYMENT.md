# Plesk Deployment Setup Guide for scorebook.com.et

## Overview
This guide walks you through deploying the Roster application on your Plesk-hosted server with secure MySQL authentication and user profile management.

## Prerequisites
- Active Plesk hosting account
- SSH access to your server (usually available in Plesk)
- Node.js runtime (version 16+ recommended)
- Database management tools (phpMyAdmin included with Plesk)

## Deployment Steps

### 1. Prepare Your Plesk Server

#### Access Plesk Dashboard
1. Log into your Plesk control panel (typically: https://your-server-ip:8443)
2. Navigate to your domain: **scorebook.com.et**

#### Create Database
1. Go to **Databases**
2. Click **Create Database**
3. Fill in:
   - **Database Name**: `roster_db`
   - **Database User**: `roster_user`
   - **Password**: Use a strong password (save this)
4. Click **Create**

#### Get Database Credentials
- Host: `localhost`
- Port: `3306`
- Database: `roster_db`
- User: `roster_user`
- Password: (the one you set)

---

### 2. Deploy Application Files

#### Option A: Using Plesk File Manager
1. In Plesk, go to **Files** section
2. Navigate to your domain's root directory (usually `/var/www/vhosts/scorebook.com.et/httpdocs`)
3. Upload project files:
   - Create folders: `server/`, `src/`, `database/`, `public/`
   - Upload all application files

#### Option B: Using SSH
```bash
# Connect to your server
ssh user@scorebook.com.et

# Navigate to domain directory
cd /var/www/vhosts/scorebook.com.et/httpdocs

# Clone or upload your project
git clone https://your-repo-url .
# OR upload via SCP/SFTP
```

---

### 3. Install Dependencies

```bash
# SSH into your server
ssh user@scorebook.com.et

# Navigate to project directory
cd /var/www/vhosts/scorebook.com.et/httpdocs

# Install dependencies
npm install

# Verify dependencies
npm list | grep mysql
npm list | grep jsonwebtoken
npm list | grep bcryptjs
```

**Required packages** (should already be in package.json):
```bash
npm install mysql2 jsonwebtoken bcryptjs uuid express-rate-limit helmet
```

---

### 4. Initialize Database Schema

#### Using phpMyAdmin (Recommended for Plesk users)
1. In Plesk, go to **Databases** → Click your database
2. Click **phpMyAdmin**
3. Select database `roster_db`
4. Go to **SQL** tab
5. Copy contents of `database/schema.sql` and paste
6. Click **Go**

#### Using SSH
```bash
mysql -u roster_user -p roster_db < database/schema.sql
# Enter password when prompted
```

#### Verify tables created
```bash
mysql -u roster_user -p roster_db -e "SHOW TABLES;"
```

Expected output:
```
Tables_in_roster_db
users
user_profiles
auth_tokens
password_resets
email_verifications
login_attempts
audit_logs
user_sessions
user_permissions
```

---

### 5. Configure Environment Variables

#### Create `.env` file in project root
```bash
# SSH into your server
ssh user@scorebook.com.et
cd /var/www/vhosts/scorebook.com.et/httpdocs
nano .env
```

Paste the following, updating with your values:
```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
DB_HOST=localhost
DB_PORT=3306
DB_USER=roster_user
DB_PASSWORD=YOUR_DATABASE_PASSWORD_HERE
DB_NAME=roster_db
DB_POOL_SIZE=10

# ============================================
# JWT CONFIGURATION
# ============================================
# Generate these using: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-unique-jwt-secret-key-here
REFRESH_TOKEN_SECRET=your-unique-refresh-secret-here
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_EXPIRES_IN=7d

# ============================================
# API CONFIGURATION
# ============================================
VITE_API_PORT=3001
VITE_API_URL=https://scorebook.com.et/api
NODE_ENV=production

# ============================================
# CHAPA PAYMENT
# ============================================
VITE_CHAPA_API_KEY=your_chapa_api_key
VITE_CHAPA_SECRET_KEY=your_chapa_secret_key

# ============================================
# SUPABASE (if still using)
# ============================================
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_key

# ============================================
# CORS CONFIGURATION
# ============================================
CORS_ORIGIN=https://scorebook.com.et

# ============================================
# SMTP (Optional: for email notifications)
# ============================================
SMTP_HOST=your-smtp-host
SMTP_PORT=587
SMTP_USER=your-email@scorebook.com.et
SMTP_PASSWORD=your-email-password
```

Save: **Ctrl+O → Enter → Ctrl+X**

---

### 6. Set File Permissions

```bash
# SSH into server
ssh user@scorebook.com.et

# Navigate to project
cd /var/www/vhosts/scorebook.com.et/httpdocs

# Set permissions
chmod 755 . -R
chmod 600 .env
```

---

### 7. Build Frontend

```bash
ssh user@scorebook.com.et
cd /var/www/vhosts/scorebook.com.et/httpdocs

# Build React app
npm run build

# This creates 'dist' folder with static files
```

---

### 8. Start Backend Server

#### Using Node.js directly (for testing)
```bash
ssh user@scorebook.com.et
cd /var/www/vhosts/scorebook.com.et/httpdocs
node server.js
```

#### Using PM2 (Recommended for production)
```bash
# Install PM2 globally
npm install -g pm2

# Start application
pm2 start server.js --name "roster-backend"

# Make it auto-restart on reboot
pm2 startup
pm2 save

# Check status
pm2 status
```

#### Verify backend is running
```bash
curl http://localhost:3001/api/health
```

Expected response:
```json
{
  "status": "ok",
  "message": "Backend server is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production"
}
```

---

### 9. Configure Plesk Web Server

#### Setup Static File Serving (Nginx/Apache)
1. In Plesk, go to **Domains** → **Your Domain**
2. Click **Apache & Nginx Settings**
3. For **Apache**, configure document root to point to `dist/` folder:
   ```
   /var/www/vhosts/scorebook.com.et/httpdocs/dist
   ```

#### Configure Proxy for Backend API
Create or edit `.htaccess` in `dist/` folder:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /

  # Proxy API requests to Node.js backend
  RewriteRule ^api/(.*)$ http://localhost:3001/api/$1 [P,L]

  # Route all other requests to index.html (React router)
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [QSA,L]
</IfModule>
```

---

### 10. Test the Deployment

#### Test API Health
```bash
curl https://scorebook.com.et/api/health
```

#### Test User Registration
```bash
curl -X POST https://scorebook.com.et/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testschool",
    "email": "admin@testschool.edu.et",
    "password": "SecurePass123!",
    "full_name": "Test School",
    "user_type": "school"
  }'
```

#### Test User Login
```bash
curl -X POST https://scorebook.com.et/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testschool",
    "password": "SecurePass123!"
  }'
```

---

### 11. Security Hardening

#### Enable SSL/TLS
1. In Plesk, go to **SSL/TLS Certificates**
2. Install Let's Encrypt certificate (free)
3. Enable auto-renewal

#### Restrict Database Access
```sql
-- Limit to localhost only (already done by default)
REVOKE ALL PRIVILEGES ON *.* FROM 'roster_user'@'%';
GRANT SELECT, INSERT, UPDATE, DELETE ON roster_db.* TO 'roster_user'@'localhost';
FLUSH PRIVILEGES;
```

#### Enable HTTP Security Headers
The application uses Helmet.js which automatically sets:
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- Strict-Transport-Security

#### Configure Firewall
1. In Plesk, go to **Tools & Settings** → **IP Address Banning**
2. Monitor `login_attempts` table for suspicious activity
3. Configure fail2ban if needed

---

### 12. Monitoring & Maintenance

#### Monitor Database
```bash
# Check user activity
mysql -u roster_user -p roster_db << EOF
SELECT username, COUNT(*) as attempts, MAX(attempted_at) as last_attempt
FROM login_attempts
WHERE attempted_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
GROUP BY username;
EOF
```

#### Check Application Logs
```bash
# View PM2 logs
pm2 logs roster-backend

# Or check system logs
tail -f /var/log/pm2/roster-backend-error.log
```

#### Regular Backups
```bash
# In Plesk, go to Backups section and enable daily database backups
# Or use command:
mysqldump -u roster_user -p roster_db > backup_$(date +%Y%m%d).sql
```

---

## Troubleshooting

### Database Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:3306
```
**Solution**: Verify MySQL is running and credentials are correct
```bash
mysql -u roster_user -p -e "SELECT 1;"
```

### Port 3001 Already in Use
```
Error: EADDRINUSE: address already in use :::3001
```
**Solution**: Change port or kill existing process
```bash
# Find process using port 3001
lsof -i :3001
kill -9 <PID>
```

### SSL Certificate Error
```
SSL_ERROR_RX_RECORD_TOO_LONG
```
**Solution**: Make sure you're using HTTPS and backend is running
```bash
curl -k https://scorebook.com.et/api/health
```

### Authentication Not Working
1. Verify `.env` JWT secrets are set
2. Check database `auth_tokens` table exists
3. Review error logs: `pm2 logs`

---

## Next Steps

1. ✅ Test all authentication flows (register, login, logout)
2. ✅ Test user profile updates
3. ✅ Monitor audit logs for suspicious activity
4. ✅ Set up email notifications for password reset
5. ✅ Configure backup strategy
6. ✅ Document admin procedures

## Support & Documentation

- **Backend Endpoints**: See [API Documentation](./API.md)
- **Database Schema**: See [Database Schema](./schema.sql)
- **Security**: See [Security Guide](./SECURITY.md)
