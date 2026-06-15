# Installation & Setup Commands

## Prerequisites
- Node.js 16+ installed
- MySQL 5.7+ installed
- npm or yarn package manager

---

## 1. Install Node Packages

```bash
# Install all required dependencies
npm install

# Verify critical security packages are installed
npm list bcryptjs jsonwebtoken mysql2 express-rate-limit helmet uuid
```

Expected output:
```
├── bcryptjs@2.4.3
├── express-rate-limit@7.1.5
├── helmet@7.1.0
├── jsonwebtoken@9.1.2
├── mysql2@3.6.5
└── uuid@9.0.1
```

---

## 2. Setup MySQL Database

### Option A: Command Line (Recommended)

```bash
# Connect to MySQL
mysql -u root -p

# Run these commands:
CREATE DATABASE roster_db;
CREATE USER 'roster_user'@'localhost' IDENTIFIED BY 'your_strong_password';
GRANT ALL PRIVILEGES ON roster_db.* TO 'roster_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import schema
mysql -u roster_user -p roster_db < database/schema.sql
```

### Option B: Using GUI (MySQL Workbench)

1. Connect to MySQL Server
2. Create new schema: `roster_db`
3. Create new user:
   - Username: `roster_user`
   - Password: Your strong password
   - Host: `localhost`
4. Grant all privileges on `roster_db`
5. Run script: `database/schema.sql`

### Verify Installation

```bash
mysql -u roster_user -p roster_db -e "SHOW TABLES;"
```

Should show 9 tables:
- users
- user_profiles
- auth_tokens
- user_sessions
- login_attempts
- audit_logs
- password_resets
- email_verifications
- user_permissions

---

## 3. Configure Environment Variables

### Create .env file

```bash
# Copy template
cp .env.example .env

# Edit with your values (use your preferred editor)
nano .env
```

### Fill in the values

```env
# DATABASE
DB_HOST=localhost
DB_PORT=3306
DB_USER=roster_user
DB_PASSWORD=YOUR_PASSWORD_HERE
DB_NAME=roster_db

# JWT - Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-generated-secret-here
REFRESH_TOKEN_SECRET=another-generated-secret-here

# API
VITE_API_PORT=3001
VITE_API_URL=http://localhost:3001
NODE_ENV=development

# CHAPA (from your Chapa account)
VITE_CHAPA_API_KEY=your_key
VITE_CHAPA_SECRET_KEY=your_secret
```

### Generate Strong Secrets

```bash
# Generate 32-character random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Run this command twice and paste results into .env
```

---

## 4. Test Database Connection

```bash
# Create a quick test script
cat > test_db.js << 'EOF'
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function test() {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    });
    
    const [rows] = await connection.execute('SHOW TABLES;');
    console.log('✓ Database connected successfully!');
    console.log('Tables:', rows.length);
    
    await connection.end();
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
  }
}

test();
EOF

node test_db.js
```

---

## 5. Start Development Server

### Terminal 1: Frontend (React with Vite)

```bash
npm run dev

# Output should show:
# ➜ Local:   http://localhost:5173/
```

### Terminal 2: Backend (Node.js)

```bash
npm run dev:backend

# Output should show something like:
# ╔════════════════════════════════════════╗
# ║ Roster Application Backend Server      ║
# ╠════════════════════════════════════════╣
# ║ Environment: development               ║
# ║ Port: 3001                             ║
```

### Or Both Together

```bash
npm run dev:all

# Runs both frontend and backend concurrently
```

---

## 6. Test API Health

```bash
# Check if backend is running
curl http://localhost:3001/api/health

# Expected response:
# {"status":"ok","message":"Backend server is running","timestamp":"...","environment":"development"}
```

---

## 7. Test Complete Authentication Flow

### 1. Register a User

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "myschool",
    "email": "admin@myschool.edu.et",
    "password": "MyPassword123!",
    "full_name": "My School",
    "phone": "+251911234567",
    "national_id": "ET123456789",
    "user_type": "school"
  }'

# Save the accessToken from response
```

### 2. Login

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "myschool",
    "password": "MyPassword123!"
  }'

# Save the accessToken from response
```

### 3. Get Profile

```bash
# Replace TOKEN with your actual token
curl http://localhost:3001/api/profile/profile \
  -H "Authorization: Bearer TOKEN"
```

### 4. Update Profile

```bash
curl -X PUT http://localhost:3001/api/profile/profile \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "school_name": "My Updated School",
    "city": "Addis Ababa",
    "region": "Addis Ababa"
  }'
```

### 5. Change Password

```bash
curl -X POST http://localhost:3001/api/profile/change-password \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "MyPassword123!",
    "newPassword": "NewPassword456!"
  }'
```

### 6. Logout

```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

---

## 8. Build for Production

```bash
# Build React frontend
npm run build

# Output folder: dist/
# Ready to deploy to web server

# Build backend is already prepared
# Just run: node server.js
```

---

## 9. Production Deployment (Plesk)

See [PLESK_DEPLOYMENT.md](./PLESK_DEPLOYMENT.md) for complete instructions

Quick summary:
```bash
# 1. SSH into Plesk server
ssh user@scorebook.com.et

# 2. Navigate to project
cd /var/www/vhosts/scorebook.com.et/httpdocs

# 3. Install dependencies
npm install --production

# 4. Build frontend
npm run build

# 5. Configure .env with production values
nano .env

# 6. Start with PM2
npm install -g pm2
pm2 start server.js --name "roster-backend"
pm2 startup
pm2 save
```

---

## Troubleshooting

### MySQL Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:3306
```

**Solution:**
```bash
# Check if MySQL is running
mysql --version

# Start MySQL service
# On Mac: brew services start mysql
# On Linux: sudo systemctl start mysql
# On Windows: net start MySQL80 (or your MySQL version)

# Verify connection
mysql -u root -p
```

### Port 3001 Already in Use

```
Error: EADDRINUSE: address already in use :::3001
```

**Solution:**
```bash
# Find process using port 3001
lsof -i :3001
# or on Windows:
netstat -ano | findstr :3001

# Kill the process
kill -9 <PID>
# or on Windows:
taskkill /PID <PID> /F

# Change port in .env if needed
VITE_API_PORT=3002
```

### Database Schema Not Found

```
Error: Table 'roster_db.users' doesn't exist
```

**Solution:**
```bash
# Re-import schema
mysql -u roster_user -p roster_db < database/schema.sql

# Verify tables were created
mysql -u roster_user -p roster_db -e "SHOW TABLES;"
```

### Wrong Database Password

```
Error: Access denied for user 'roster_user'@'localhost'
```

**Solution:**
```bash
# Reset user password
mysql -u root -p
ALTER USER 'roster_user'@'localhost' IDENTIFIED BY 'new_password';
FLUSH PRIVILEGES;

# Update .env
DB_PASSWORD=new_password
```

---

## Useful Commands

```bash
# Install dependencies
npm install

# Run frontend
npm run dev

# Run backend
npm run dev:backend

# Build production
npm run build

# Start production backend
node server.js

# Check Node version
node --version

# Check npm version
npm --version

# Check MySQL status
mysql -u root -p -e "STATUS;"

# View database tables
mysql -u roster_user -p roster_db -e "SHOW TABLES;"

# View users table
mysql -u roster_user -p roster_db -e "SELECT * FROM users;"

# View audit logs
mysql -u roster_user -p roster_db -e "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 10;"
```

---

## File Permissions (Linux/Mac)

```bash
# Make scripts executable
chmod +x *.sh

# Secure .env file (owner read/write only)
chmod 600 .env

# Make database backups secure
chmod 600 database/backup/*

# Allow directory listing for necessary folders
chmod 755 src/
chmod 755 server/
chmod 755 database/
```

---

## Next Steps

1. ✅ Complete all installation steps above
2. ✅ Test API endpoints with curl/Postman
3. ✅ Read [API.md](./API.md) for full documentation
4. ✅ Read [SECURITY.md](./SECURITY.md) for security best practices
5. ✅ Review [PLESK_DEPLOYMENT.md](./PLESK_DEPLOYMENT.md) before deployment
6. ✅ Create backup strategy
7. ✅ Setup monitoring and logging

---

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install dependencies |
| `npm run dev` | Start frontend dev server |
| `npm run dev:backend` | Start backend server |
| `npm run build` | Build for production |
| `npm run lint` | Check code quality |

---

**All set! You're ready to develop and deploy. 🚀**
