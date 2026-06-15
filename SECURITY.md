# Security Guide for Roster Application

## Overview
This document outlines security best practices and implementation details for the Roster application authentication system.

---

## Security Features Implemented

### 1. **Password Security**
- ✅ Passwords hashed using bcrypt (10 salt rounds)
- ✅ Never stored as plain text
- ✅ Minimum 8 characters required
- ✅ Supports special characters and unicode

**Implementation**:
```javascript
const salt = await bcrypt.genSalt(10);
const hash = await bcrypt.hash(password, salt);
```

### 2. **JWT Token Security**
- ✅ Access tokens expire in 24 hours
- ✅ Refresh tokens expire in 7 days
- ✅ Tokens signed with strong secret keys
- ✅ Token validation on every protected request

**Environment Variables Required**:
```env
JWT_SECRET=minimum-32-character-random-string
REFRESH_TOKEN_SECRET=minimum-32-character-random-string
```

### 3. **Rate Limiting**
- ✅ Login attempts: 5 per 15 minutes per IP
- ✅ Registration: 3 per hour per IP
- ✅ Prevents brute force attacks

### 4. **SQL Injection Prevention**
- ✅ Parameterized queries (prepared statements)
- ✅ Input validation
- ✅ No string concatenation in SQL

**Example**:
```javascript
const [results] = await conn.execute(
  'SELECT * FROM users WHERE username = ?',
  [username] // Username is safely parameterized
);
```

### 5. **CORS Protection**
- ✅ Configured for specific domains only
- ✅ Credentials validation
- ✅ Prevents unauthorized cross-origin requests

```env
CORS_ORIGIN=https://scorebook.com.et
```

### 6. **Session Security**
- ✅ Secure session storage in database
- ✅ Session tokens hashed with SHA-256
- ✅ Sessions expire after 7 days of inactivity
- ✅ Session-per-device tracking

### 7. **Audit Logging**
- ✅ All authentication events logged
- ✅ Failed login attempts tracked
- ✅ Profile changes recorded
- ✅ IP addresses and user agents logged

### 8. **Data Protection**
- ✅ HTTPS/TLS encryption in transit
- ✅ Sensitive fields stored securely (hashed tokens)
- ✅ Regular data cleanup (automatic via MySQL events)
- ✅ User data accessible only to user and admins

### 9. **Account Protection**
- ✅ Account status tracking (active/inactive/suspended)
- ✅ Email verification support
- ✅ Phone verification support
- ✅ Password reset functionality
- ✅ Two-factor authentication ready

### 10. **HTTP Security Headers**
Using Helmet.js, the following headers are automatically set:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

---

## Security Checklist for Production

### Database Level
- [ ] MySQL root password changed
- [ ] Database user has minimal required privileges
- [ ] Database access restricted to localhost only
- [ ] Regular automated backups enabled
- [ ] Backup files encrypted and stored securely
- [ ] Expired data cleaned up automatically (events enabled)
- [ ] Failed login attempts monitored
- [ ] Audit logs retained for at least 90 days

### Application Level
- [ ] `.env` file is NOT in version control (added to .gitignore)
- [ ] `.env` file permissions set to 600 (owner read/write only)
- [ ] JWT_SECRET and REFRESH_TOKEN_SECRET are strong (32+ chars, random)
- [ ] CORS_ORIGIN configured for production domain only
- [ ] NODE_ENV set to 'production'
- [ ] Error messages don't expose sensitive info
- [ ] Rate limiting enabled
- [ ] SSL/TLS certificate installed and valid
- [ ] HTTPS enforced (redirect HTTP to HTTPS)

### Server Level
- [ ] SSH key-based authentication enabled
- [ ] Firewall configured (port 80, 443 open, 3001 restricted)
- [ ] Unnecessary services disabled
- [ ] System packages updated regularly
- [ ] Log files monitored for suspicious activity
- [ ] PM2 or similar configured for auto-restart
- [ ] Database backups automated
- [ ] SSL certificate auto-renewal configured

### API Level
- [ ] Authentication required for sensitive endpoints
- [ ] Rate limiting prevents abuse
- [ ] Input validation on all endpoints
- [ ] Output encoding prevents XSS
- [ ] CORS properly configured
- [ ] CSRF tokens used where applicable
- [ ] Request logging enabled
- [ ] API versioning implemented

### Access Control
- [ ] Users can only access their own data
- [ ] Admin access properly restricted and logged
- [ ] API tokens rotated periodically
- [ ] Unused accounts disabled
- [ ] Password reset tokens expire quickly (15-30 min)
- [ ] Permission changes logged

---

## Password Requirements

Recommended password policy for users:
- **Minimum length**: 8 characters
- **Must include**: At least one uppercase letter
- **Must include**: At least one number
- **Must include**: At least one special character (!@#$%^&*)

Example strong passwords:
```
✓ MySchool@2024
✓ Roster#Pass123
✓ SecureEth!Edu
```

---

## Monitoring & Alerts

### Check Failed Login Attempts
```sql
SELECT 
    username,
    COUNT(*) as failed_attempts,
    MAX(attempted_at) as last_attempt,
    ip_address
FROM login_attempts
WHERE success = FALSE
AND attempted_at > DATE_SUB(NOW(), INTERVAL 1 DAY)
GROUP BY username, ip_address
ORDER BY failed_attempts DESC;
```

### Check Account Status
```sql
SELECT 
    username, 
    status, 
    email_verified,
    phone_verified,
    last_login
FROM users
WHERE status != 'active'
OR last_login IS NULL;
```

### Check Recent Changes
```sql
SELECT 
    u.username,
    a.action,
    a.entity_type,
    a.created_at
FROM audit_logs a
JOIN users u ON a.user_id = u.id
WHERE a.created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
ORDER BY a.created_at DESC;
```

### Check Active Sessions
```sql
SELECT 
    u.username,
    s.ip_address,
    s.device_name,
    s.last_activity,
    s.expires_at
FROM user_sessions s
JOIN users u ON s.user_id = u.id
WHERE s.expires_at > NOW()
ORDER BY s.last_activity DESC;
```

---

## Incident Response

### If Database is Compromised
1. Change all user passwords (force reset on next login)
2. Revoke all active tokens
3. Review audit logs for unauthorized access
4. Update database backups
5. Monitor for suspicious activity
6. Consider password reset email to all users

```sql
-- Revoke all tokens
UPDATE auth_tokens SET revoked = TRUE, revoked_at = NOW() WHERE revoked = FALSE;

-- Clear active sessions
DELETE FROM user_sessions;

-- Log incident
INSERT INTO audit_logs (action, entity_type) VALUES ('SECURITY_INCIDENT', 'system');
```

### If Account is Compromised
1. Lock account immediately
2. Force password reset
3. Invalidate all sessions
4. Review login history
5. Notify user

```sql
-- Lock compromised account
UPDATE users SET status = 'suspended' WHERE id = ?;

-- Revoke user's tokens
UPDATE auth_tokens SET revoked = TRUE WHERE user_id = ?;

-- Clear user sessions
DELETE FROM user_sessions WHERE user_id = ?;
```

### If Server is Compromised
1. Take server offline immediately
2. Preserve logs for forensics
3. Restore from clean backup
4. Change all secrets/keys
5. Force password reset for all users
6. Update SSH keys
7. Review all code for backdoors

---

## Regular Security Tasks

### Weekly
- [ ] Review failed login attempts
- [ ] Check for unusual API usage patterns
- [ ] Verify backup completion

### Monthly
- [ ] Review audit logs
- [ ] Check for inactive admin accounts
- [ ] Update security dependencies
- [ ] Test backup restoration

### Quarterly
- [ ] Security audit of code
- [ ] Penetration testing (if resources available)
- [ ] Update SSL/TLS certificates
- [ ] Review user permissions

### Annually
- [ ] Full security assessment
- [ ] Disaster recovery drill
- [ ] Update security policies
- [ ] Review compliance requirements

---

## Dependencies & Updates

Keep these security-critical dependencies updated:
- `bcryptjs`: Password hashing
- `jsonwebtoken`: Token creation/verification
- `mysql2`: Database connection
- `helmet`: HTTP security headers
- `express-rate-limit`: Rate limiting

Check for updates:
```bash
npm audit
npm update
```

---

## GDPR & Data Privacy

### Data Collection
- Only collect necessary personal information
- Get explicit consent for data collection
- Document collection purposes

### Data Access
- Users can request their data
- Users can request data deletion
- Implement data export functionality

### Data Retention
- Specify retention periods for each data type
- Automatically delete old audit logs (> 1 year)
- Archive older data as needed

---

## Support & Reporting

### Security Issues
For security vulnerabilities, please report to: security@scorebook.com.et

Do NOT open public issues for security problems.

---

## References

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
- MySQL Security: https://dev.mysql.com/doc/refman/8.0/en/security.html
- Express Security: https://expressjs.com/en/advanced/best-practice-security.html
