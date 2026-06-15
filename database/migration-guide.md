# Database Migration Guide for Plesk Deployment

## Prerequisites
- Access to your Plesk server's database management (typically via cPanel/Plesk)
- MySQL 5.7 or higher
- Basic knowledge of MySQL/database operations

## Step 1: Create Database

### Option A: Using Plesk Dashboard
1. Log into your Plesk control panel
2. Navigate to **Databases**
3. Click **Create Database**
4. Enter database name: `roster_db`
5. Set database user and password
6. Click **OK**

### Option B: Using SSH/Terminal
```sql
CREATE DATABASE roster_db;
CREATE USER 'roster_user'@'localhost' IDENTIFIED BY 'strong_password_here';
GRANT ALL PRIVILEGES ON roster_db.* TO 'roster_user'@'localhost';
FLUSH PRIVILEGES;
```

## Step 2: Execute Schema

### Option A: Using phpMyAdmin (Plesk)
1. Go to your Plesk panel → **Databases**
2. Click on your `roster_db` database
3. Open **phpMyAdmin**
4. Select the `roster_db` database
5. Click **Import** tab
6. Select the `database/schema.sql` file
7. Click **Go/Import**

### Option B: Using MySQL Command Line
```bash
mysql -h localhost -u roster_user -p roster_db < database/schema.sql
```

### Option C: Using SSH on Plesk Server
```bash
ssh user@your-plesk-server.com
cd /path/to/your/app
mysql -u roster_user -p roster_db < database/schema.sql
# Enter password when prompted
```

## Step 3: Configure Environment Variables

Create or update `.env` file in your project root with your Plesk database credentials:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=roster_user
DB_PASSWORD=your_database_password
DB_NAME=roster_db
NODE_ENV=production
JWT_SECRET=generate-a-strong-random-string
REFRESH_TOKEN_SECRET=generate-another-strong-random-string
```

### How to generate strong secrets:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 4: Update Server Configuration

### Install Required Dependencies
```bash
npm install bcryptjs jsonwebtoken express-rate-limit helmet mysql2
```

### Update package.json scripts
Ensure your `package.json` has:
```json
{
  "scripts": {
    "dev": "vite",
    "dev:backend": "node server.js",
    "dev:all": "concurrently \"npm run dev\" \"npm run dev:backend\"",
    "build": "vite build",
    "preview": "vite preview",
    "start": "node server.js"
  }
}
```

## Step 5: Update Main Server File

Update your `server.js` to include database initialization:

```javascript
import mysql from 'mysql2/promise';
import { initializeAuthRoutes } from './server/auth.js';
import { initializeProfileRoutes } from './server/profile.js';

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test connection
pool.getConnection((err, connection) => {
  if (err) {
    console.error('Database connection failed:', err);
  } else {
    console.log('Database connected successfully');
    connection.release();
  }
});

// Initialize routes
app.use('/api/auth', initializeAuthRoutes(pool));
app.use('/api', initializeProfileRoutes(pool));
```

## Step 6: Database Cleanup & Maintenance

The schema includes automatic events for cleanup:

- **Daily**: Expired tokens cleanup
- **Weekly**: Old login attempts cleanup (>90 days)
- **Monthly**: Old audit logs cleanup (>1 year)

To manually run cleanup:
```sql
CALL cleanup_expired_tokens();
CALL cleanup_old_login_attempts();
CALL cleanup_old_audit_logs();
```

## Step 7: Backup Strategy

### Create Regular Backups
```bash
# Daily backup script (add to crontab)
0 2 * * * /usr/bin/mysqldump -u roster_user -p'password' roster_db > /backup/roster_$(date +\%Y\%m\%d).sql
```

Or use Plesk's backup feature:
1. Go to **Backups** in Plesk
2. Click **Add backup task**
3. Select your domain
4. Enable database backup
5. Set schedule (daily recommended)

## Step 8: Security Hardening

### 1. Restrict Database User
```sql
-- Remove unnecessary privileges
REVOKE ALL PRIVILEGES ON *.* FROM 'roster_user'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, ALTER, EXECUTE ON roster_db.* TO 'roster_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Enable MySQL SSL (if available)
Check your hosting provider's documentation for SSL configuration.

### 3. Monitor Failed Login Attempts
```sql
SELECT * FROM login_attempts 
WHERE success = FALSE 
AND attempted_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
ORDER BY attempted_at DESC;
```

### 4. Check Audit Logs
```sql
SELECT * FROM audit_logs 
WHERE created_at > DATE_SUB(NOW(), INTERVAL 7 DAY)
ORDER BY created_at DESC;
```

## Troubleshooting

### Connection Failed
- Verify database credentials in `.env`
- Check if MySQL service is running on Plesk
- Ensure your IP is not blocked by firewall

### Permission Denied
- Verify user permissions: `SHOW GRANTS FOR 'roster_user'@'localhost';`
- Re-run GRANT commands

### Events Not Running
- Check if events are enabled: `SHOW VARIABLES LIKE 'event_scheduler';`
- Enable if needed: `SET GLOBAL event_scheduler = ON;`

### Slow Queries
- Check indexes: `SHOW INDEXES FROM users;`
- Run: `ANALYZE TABLE users; ANALYZE TABLE login_attempts;`

## Testing

After deployment, test the authentication:

```bash
# Test registration
curl -X POST http://your-domain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Test@1234",
    "full_name": "Test User",
    "user_type": "school"
  }'

# Test login
curl -X POST http://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "Test@1234"
  }'
```

## Production Checklist

- [ ] Database created and schema imported
- [ ] Environment variables configured (.env file in place)
- [ ] SSL/TLS certificates installed
- [ ] CORS configured for your domain
- [ ] Rate limiting enabled
- [ ] Backup strategy implemented
- [ ] Audit logs monitored
- [ ] Database users have minimal necessary privileges
- [ ] Connection pooling configured
- [ ] Error logging configured
- [ ] Security headers configured (helmet.js)
