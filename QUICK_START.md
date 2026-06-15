# Quick Start Guide - Roster Application with MySQL Authentication

## 📋 Summary of What's Been Created

Your Roster application now includes a complete secure authentication system with:

✅ **MySQL Database** with 10 tables for users, profiles, tokens, sessions, and audit logs  
✅ **JWT Authentication** with access & refresh tokens  
✅ **Password Security** using bcrypt hashing  
✅ **Rate Limiting** on login/registration to prevent brute force  
✅ **Audit Logging** for security monitoring  
✅ **User Profile Management** for storing school information  
✅ **Session Management** for tracking active sessions  

---

## 🚀 Quick Start (Local Development)

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Edit `.env` and update:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=roster_db
JWT_SECRET=your-secret-key-here
REFRESH_TOKEN_SECRET=another-secret-here
```

### 3. Create Database & Schema

**Using MySQL CLI:**
```bash
mysql -u root -p

# In MySQL:
CREATE DATABASE roster_db;
USE roster_db;
SOURCE database/schema.sql;
```

**Or using phpMyAdmin:**
- Create database: `roster_db`
- Open phpMyAdmin
- Import `database/schema.sql` file

### 4. Start Development Server
```bash
# Terminal 1: Start frontend (Vite)
npm run dev

# Terminal 2: Start backend (Node.js)
npm run dev:backend

# Or run both concurrently:
npm run dev:all
```

Frontend: http://localhost:5173  
Backend: http://localhost:3001  

---

## 🧪 Test Authentication

### Test Registration
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testschool",
    "email": "admin@testschool.edu.et",
    "password": "TestPass123!",
    "full_name": "Test School",
    "phone": "+251911234567",
    "user_type": "school"
  }'
```

### Test Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testschool",
    "password": "TestPass123!"
  }'
```

Response will include `accessToken` and `refreshToken`.

### Test Profile Retrieval
```bash
curl http://localhost:3001/api/profile/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN_HERE"
```

---

## 📦 Project Structure

```
roster/
├── database/
│   ├── schema.sql           # MySQL database schema
│   └── migration-guide.md   # Deployment instructions
├── server/
│   ├── auth.js              # Authentication endpoints
│   └── profile.js           # Profile management endpoints
├── src/
│   ├── services/
│   │   └── authService.ts   # Frontend API client
│   └── ...
├── server.js                # Main backend server
├── package.json             # Dependencies
├── .env.example             # Environment template
├── API.md                   # API documentation
├── SECURITY.md              # Security guide
└── PLESK_DEPLOYMENT.md      # Plesk deployment guide
```

---

## 📱 File Reference

### For Deployment
- **[PLESK_DEPLOYMENT.md](./PLESK_DEPLOYMENT.md)** - Step-by-step Plesk hosting guide
- **[database/migration-guide.md](./database/migration-guide.md)** - Database setup instructions
- **[.env.example](./.env.example)** - Environment variables template

### For Development
- **[API.md](./API.md)** - Complete API endpoint documentation
- **[SECURITY.md](./SECURITY.md)** - Security features and best practices
- **[database/schema.sql](./database/schema.sql)** - Database structure

### Backend Code
- **[server.js](./server.js)** - Main server with database integration
- **[server/auth.js](./server/auth.js)** - Authentication logic
- **[server/profile.js](./server/profile.js)** - User profile management

### Frontend Integration
- **[src/services/authService.ts](./src/services/authService.ts)** - API client for authentication

---

## 🔐 Security Highlights

- ✅ Passwords hashed with bcrypt (10 salt rounds)
- ✅ JWT tokens with 24-hour expiration
- ✅ Refresh tokens with 7-day expiration
- ✅ SQL injection prevention (parameterized queries)
- ✅ Rate limiting on sensitive endpoints
- ✅ CORS protection
- ✅ Audit logging for all activities
- ✅ Failed login attempt tracking
- ✅ Secure session management
- ✅ HTTP security headers

---

## 📊 Database Tables

| Table | Purpose |
|-------|---------|
| `users` | User accounts and credentials |
| `user_profiles` | Extended user profile information |
| `auth_tokens` | JWT tokens and refresh tokens |
| `user_sessions` | Active user sessions |
| `login_attempts` | Failed login tracking |
| `audit_logs` | Security audit trail |
| `password_resets` | Password reset tokens |
| `email_verifications` | Email verification tokens |
| `user_permissions` | User permissions/roles |

---

## 🛠️ Common Tasks

### Change User Password
```bash
curl -X POST http://localhost:3001/api/profile/change-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "OldPass123!",
    "newPassword": "NewPass456!"
  }'
```

### Update User Profile
```bash
curl -X PUT http://localhost:3001/api/profile/profile \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "school_name": "My School Updated",
    "city": "Addis Ababa",
    "region": "Addis Ababa"
  }'
```

### Logout
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "YOUR_REFRESH_TOKEN"}'
```

---

## 📋 Deployment Checklist

- [ ] Read [PLESK_DEPLOYMENT.md](./PLESK_DEPLOYMENT.md)
- [ ] Create database on Plesk server
- [ ] Run schema.sql to create tables
- [ ] Configure .env with production values
- [ ] Update CORS_ORIGIN in .env
- [ ] Generate strong JWT secrets
- [ ] Build frontend: `npm run build`
- [ ] Start backend with PM2
- [ ] Test all endpoints
- [ ] Enable SSL/TLS certificate
- [ ] Setup backup strategy
- [ ] Monitor audit logs

---

## ❓ Frequently Asked Questions

### Q: Where are passwords stored?
**A:** Passwords are hashed using bcrypt and stored in the `users` table. They are never stored as plain text.

### Q: How long are tokens valid?
**A:** Access tokens are valid for 24 hours, refresh tokens for 7 days.

### Q: Can I customize the database?
**A:** Yes! The schema includes comments and is well-structured. You can modify it as needed.

### Q: How is user data protected?
**A:** Users can only access their own data. Admin access is logged. All changes are recorded in audit logs.

### Q: What if I forget my password?
**A:** Password reset functionality is ready to implement. See `password_resets` table in schema.

---

## 📞 Support

For issues or questions:
1. Check [API.md](./API.md) for endpoint documentation
2. Review [SECURITY.md](./SECURITY.md) for security questions
3. See [PLESK_DEPLOYMENT.md](./PLESK_DEPLOYMENT.md) for deployment issues
4. Check server logs: `npm run dev:backend` shows real-time logs

---

## 🎯 Next Steps

1. ✅ Set up local development environment
2. ✅ Test authentication flows
3. ✅ Integrate with React frontend components
4. ✅ Build and deploy to Plesk
5. ✅ Monitor and maintain in production

---

**Happy coding! 🚀**
