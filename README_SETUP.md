# 📚 Roster Application - Complete Setup Documentation

## 🎯 Overview

This is a complete roster management application with:
- **React Frontend** (TypeScript + Vite + Tailwind)
- **Node.js Backend** (Express.js)
- **MySQL Database** (Secure authentication & user profiles)
- **Payment Integration** (Chapa - Ethiopian payment gateway)

The application is production-ready and fully secured for deployment on **Plesk hosting** at **scorebook.com.et**.

---

## 📋 What's Included

### ✅ Security Features
- Password hashing with bcrypt
- JWT authentication (24h access tokens, 7d refresh tokens)
- Rate limiting on authentication endpoints
- SQL injection prevention
- CORS protection
- Audit logging system
- Failed login attempt tracking
- Secure session management

### ✅ Database
- 9 optimized tables
- Automatic data cleanup events
- Support for user profiles, permissions, and sessions
- Full audit trail

### ✅ Backend API
- User registration & login
- Profile management
- Password changes
- Token refresh
- Secure logout
- Payment gateway integration

### ✅ Frontend Integration
- Authentication service client
- Ready for React components integration
- Supports local storage token management

---

## 🚀 Quick Start

### 1️⃣ **Installation** (5 minutes)
```bash
# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your values
nano .env
```

### 2️⃣ **Database Setup** (5 minutes)
```bash
# Create database and import schema
mysql -u root -p
CREATE DATABASE roster_db;
CREATE USER 'roster_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON roster_db.* TO 'roster_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;

# Import tables
mysql -u roster_user -p roster_db < database/schema.sql
```

### 3️⃣ **Run Development Server** (2 minutes)
```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
npm run dev:backend
```

Frontend: http://localhost:5173  
Backend: http://localhost:3001

---

## 📖 Documentation

| Document | Purpose |
|----------|---------|
| [QUICK_START.md](./QUICK_START.md) | 5-minute quick start guide |
| [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) | Detailed setup with all commands |
| [API.md](./API.md) | Complete API endpoint documentation |
| [SECURITY.md](./SECURITY.md) | Security features & best practices |
| [PLESK_DEPLOYMENT.md](./PLESK_DEPLOYMENT.md) | **Deployment to scorebook.com.et** |
| [database/schema.sql](./database/schema.sql) | Database structure |
| [database/migration-guide.md](./database/migration-guide.md) | Database migration steps |

---

## 📁 Project Structure

```
roster/
├── 📄 QUICK_START.md              ← Start here!
├── 📄 INSTALLATION_GUIDE.md       ← Detailed setup
├── 📄 PLESK_DEPLOYMENT.md         ← Deploy to Plesk
├── 📄 API.md                      ← API endpoints
├── 📄 SECURITY.md                 ← Security guide
├── 📄 .env.example                ← Environment template
│
├── 📁 database/
│   ├── schema.sql                 ← MySQL tables
│   └── migration-guide.md         ← DB migration
│
├── 📁 server/
│   ├── auth.js                    ← Authentication endpoints
│   └── profile.js                 ← Profile management
│
├── 📁 src/
│   ├── services/
│   │   └── authService.ts         ← Frontend API client
│   ├── components/
│   │   ├── Auth.tsx               ← Auth UI component
│   │   └── ... (other components)
│   └── ...
│
├── server.js                      ← Main backend server
├── package.json                   ← Dependencies
└── vite.config.ts                 ← Frontend config
```

---

## 🔐 Security Implemented

✅ **Authentication**
- JWT token-based authentication
- Secure password hashing (bcrypt)
- Token refresh mechanism
- Automatic token expiration

✅ **Protection**
- Rate limiting (5 login attempts per 15 min)
- SQL injection prevention (parameterized queries)
- CORS configured for specific domains
- HTTP security headers (Helmet.js)

✅ **Monitoring**
- Audit logs for all activities
- Failed login attempt tracking
- Session management
- Permission-based access control

✅ **Data**
- User data isolation (users only access their own data)
- Encrypted passwords
- Automatic old data cleanup
- Regular backup recommendations

---

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts, email, phone, credentials |
| `user_profiles` | Extended profile (school info, preferences) |
| `auth_tokens` | JWT and refresh tokens |
| `user_sessions` | Active user sessions |
| `login_attempts` | Failed login tracking |
| `audit_logs` | Security audit trail |
| `password_resets` | Password reset tokens |
| `email_verifications` | Email verification tokens |
| `user_permissions` | User permissions/roles |

---

## 🌐 API Endpoints

### Authentication
```
POST   /api/auth/register        - Create new account
POST   /api/auth/login           - Authenticate user
POST   /api/auth/refresh         - Get new access token
POST   /api/auth/logout          - Logout user
```

### Profile
```
GET    /api/profile/profile      - Get user profile
PUT    /api/profile/profile      - Update profile
POST   /api/profile/change-password - Change password
```

### Payment
```
POST   /api/chapa/initialize     - Start payment
GET    /api/chapa/verify/:txRef  - Verify payment
```

See [API.md](./API.md) for full documentation.

---

## 🛠️ Environment Variables

Create `.env` file with:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=roster_user
DB_PASSWORD=your_password
DB_NAME=roster_db

# JWT (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-secret-here
REFRESH_TOKEN_SECRET=your-secret-here

# API
VITE_API_PORT=3001
VITE_API_URL=http://localhost:3001

# Chapa (get from your account)
VITE_CHAPA_API_KEY=your_key
VITE_CHAPA_SECRET_KEY=your_secret
```

---

## 📱 Frontend Integration

### Using Auth Service

```typescript
import { authService } from '@/services/authService';

// Register
await authService.register({
  username: 'myschool',
  email: 'admin@school.edu.et',
  password: 'Password123!',
  full_name: 'My School'
});

// Login
await authService.login('myschool', 'Password123!');

// Get profile
const profile = await authService.getProfile();

// Update profile
await authService.updateProfile({ school_name: 'New Name' });

// Logout
await authService.logout();
```

---

## 🚀 Deployment to Plesk

For **scorebook.com.et**:

**See [PLESK_DEPLOYMENT.md](./PLESK_DEPLOYMENT.md) for complete step-by-step guide**

Quick overview:
1. Create database in Plesk
2. Import schema.sql
3. Configure .env with production values
4. Build frontend: `npm run build`
5. Start backend with PM2
6. Configure web server proxy
7. Test all endpoints
8. Enable SSL/TLS

---

## ✅ Pre-Deployment Checklist

- [ ] All dependencies installed (`npm install`)
- [ ] Database created and schema imported
- [ ] `.env` file configured with production values
- [ ] JWT secrets generated and set
- [ ] CORS_ORIGIN configured for your domain
- [ ] Frontend built (`npm run build`)
- [ ] Backend tested locally
- [ ] SSL/TLS certificate installed
- [ ] Database backups automated
- [ ] Firewall configured
- [ ] PM2 or similar set up for auto-restart
- [ ] Logging configured
- [ ] Rate limiting verified

---

## 🧪 Testing

### Test API Health
```bash
curl http://localhost:3001/api/health
```

### Test Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "email": "test@example.com",
    "password": "Test@1234",
    "full_name": "Test User"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test",
    "password": "Test@1234"
  }'
```

See [API.md](./API.md) for more examples.

---

## 📊 Monitoring

### Check Database
```bash
# View users
mysql -u roster_user -p roster_db -e "SELECT * FROM users;"

# View failed logins
mysql -u roster_user -p roster_db -e "SELECT * FROM login_attempts WHERE success = FALSE;"

# View audit logs
mysql -u roster_user -p roster_db -e "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 20;"
```

### Check Backend Logs
```bash
# If using PM2
pm2 logs roster-backend

# Or check direct output
npm run dev:backend
```

---

## 🆘 Troubleshooting

### Database Connection Failed
```bash
# Check MySQL is running
mysql -u root -p -e "STATUS;"

# Verify credentials in .env
# Ensure database and user exist
```

### Port Already in Use
```bash
# Find and kill process using port
lsof -i :3001
kill -9 <PID>
```

### Authentication Not Working
```bash
# Check .env JWT secrets are set
# Verify database tables exist
mysql -u roster_user -p roster_db -e "SHOW TABLES;"

# Check backend logs for errors
npm run dev:backend
```

See [SECURITY.md](./SECURITY.md) for more troubleshooting.

---

## 📚 Key Files Reference

| File | What It Does |
|------|-------------|
| `server.js` | Main backend with database & auth integration |
| `server/auth.js` | Authentication endpoints (register, login, tokens) |
| `server/profile.js` | User profile management endpoints |
| `src/services/authService.ts` | Frontend API client |
| `database/schema.sql` | MySQL database structure |
| `.env` | Configuration (NEVER commit) |

---

## 🎓 Learning Resources

- **JWT**: https://jwt.io/
- **bcryptjs**: https://github.com/dcodeIO/bcrypt.js
- **Express.js**: https://expressjs.com/
- **MySQL**: https://dev.mysql.com/doc/
- **Plesk**: https://docs.plesk.com/

---

## 📞 Support

### Getting Help

1. **API Questions**: See [API.md](./API.md)
2. **Security Issues**: See [SECURITY.md](./SECURITY.md)
3. **Deployment**: See [PLESK_DEPLOYMENT.md](./PLESK_DEPLOYMENT.md)
4. **Setup**: See [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md)
5. **Quick Start**: See [QUICK_START.md](./QUICK_START.md)

### Reporting Issues

- Check error logs: `npm run dev:backend`
- Verify database: `mysql -u roster_user -p roster_db -e "SHOW TABLES;"`
- Test connectivity: `curl http://localhost:3001/api/health`

---

## 📅 Maintenance Tasks

### Weekly
- Review failed login attempts
- Check database size
- Verify backups complete

### Monthly
- Review audit logs
- Update dependencies: `npm audit`
- Check disk space

### Quarterly
- Full security audit
- Test disaster recovery
- Update SSL certificates

### Annually
- Comprehensive security review
- Compliance check
- Plan infrastructure updates

---

## 🎉 Ready to Deploy!

**Start with:**
1. [QUICK_START.md](./QUICK_START.md) - Get running in 5 minutes
2. [INSTALLATION_GUIDE.md](./INSTALLATION_GUIDE.md) - Detailed setup
3. [PLESK_DEPLOYMENT.md](./PLESK_DEPLOYMENT.md) - Deploy to production

---

## 📜 License & Terms

This application is configured for **scorebook.com.et** educational portal.

---

**Happy Building! 🚀 Your secure authentication system is ready.**
