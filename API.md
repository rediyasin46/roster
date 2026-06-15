# API Documentation

## Base URL
```
Production: https://scorebook.com.et/api
Development: http://localhost:3001/api
```

## Authentication
Most endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer {accessToken}
```

---

## Endpoints

### Health Check

#### GET `/health`
Check if the backend server is running.

**Response** (200 OK):
```json
{
  "status": "ok",
  "message": "Backend server is running",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production"
}
```

---

### Authentication

#### POST `/auth/register`
Register a new user account.

**Request**:
```json
{
  "username": "myschool",
  "email": "admin@myschool.edu.et",
  "password": "SecurePassword123!",
  "full_name": "My School",
  "phone": "+251911234567",
  "national_id": "ET123456789",
  "user_type": "school"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "user": {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "username": "myschool",
    "email": "admin@myschool.edu.et",
    "full_name": "My School",
    "user_type": "school"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors**:
- 400: Missing required fields or invalid input
- 409: Username or email already exists
- 500: Server error

---

#### POST `/auth/login`
Authenticate user and receive tokens.

**Request**:
```json
{
  "username": "myschool",
  "password": "SecurePassword123!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "username": "myschool",
    "email": "admin@myschool.edu.et",
    "full_name": "My School",
    "user_type": "school"
  },
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors**:
- 400: Missing credentials
- 401: Invalid credentials
- 403: Account is suspended/inactive
- 429: Too many login attempts (rate limited)
- 500: Server error

---

#### POST `/auth/refresh`
Get a new access token using refresh token.

**Request**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response** (200 OK):
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Errors**:
- 400: Refresh token required
- 401: Invalid or expired refresh token
- 500: Server error

---

#### POST `/auth/logout`
Logout user and revoke tokens.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Errors**:
- 401: Unauthorized
- 500: Server error

---

### User Profile

#### GET `/profile/profile`
Get current user's profile information.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Response** (200 OK):
```json
{
  "success": true,
  "user": {
    "id": 1,
    "uuid": "550e8400-e29b-41d4-a716-446655440000",
    "username": "myschool",
    "email": "admin@myschool.edu.et",
    "full_name": "My School",
    "phone": "+251911234567",
    "national_id": "ET123456789",
    "user_type": "school",
    "status": "active",
    "email_verified": false,
    "phone_verified": false,
    "created_at": "2024-01-15T10:30:00.000Z",
    "last_login": "2024-01-15T11:45:00.000Z",
    "profile": {
      "school_name": "My School",
      "school_address": "123 Main Street, Addis Ababa",
      "school_phone": "+251911234567",
      "school_email": "info@myschool.edu.et",
      "school_reg_number": "REG123456",
      "city": "Addis Ababa",
      "region": "Addis Ababa",
      "country": "Ethiopia",
      "bio": "A leading educational institution",
      "avatar_url": "https://example.com/avatar.jpg",
      "language": "am",
      "timezone": "Africa/Addis_Ababa",
      "notification_preferences": {
        "email_notifications": true,
        "sms_notifications": false
      }
    }
  }
}
```

**Errors**:
- 401: Unauthorized
- 404: User not found
- 500: Server error

---

#### PUT `/profile/profile`
Update user's profile information.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request** (all fields optional):
```json
{
  "email": "newemail@myschool.edu.et",
  "phone": "+251922345678",
  "school_name": "My School - Updated",
  "school_address": "456 New Street, Addis Ababa",
  "school_phone": "+251922345678",
  "school_email": "newemail@myschool.edu.et",
  "school_reg_number": "REG123456-U",
  "city": "Addis Ababa",
  "region": "Addis Ababa",
  "country": "Ethiopia",
  "bio": "Updated school description",
  "avatar_url": "https://example.com/new-avatar.jpg",
  "language": "am",
  "timezone": "Africa/Addis_Ababa",
  "notification_preferences": {
    "email_notifications": true,
    "sms_notifications": true
  }
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Profile updated successfully"
}
```

**Errors**:
- 400: Invalid input
- 401: Unauthorized
- 500: Server error

---

#### POST `/profile/change-password`
Change user's password.

**Headers**:
```
Authorization: Bearer {accessToken}
```

**Request**:
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword456!"
}
```

**Response** (200 OK):
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

**Errors**:
- 400: Missing required fields or password too short
- 401: Current password is incorrect
- 500: Server error

---

### Payment (Chapa Integration)

#### POST `/chapa/initialize`
Initialize a payment transaction.

**Request**:
```json
{
  "amount": 100,
  "currency": "ETB",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+251911234567",
  "tx_ref": "unique-transaction-ref-2024",
  "return_url": "https://scorebook.com.et/payment-success",
  "customization": {
    "title": "Roster Subscription",
    "description": "Annual subscription fee"
  }
}
```

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "checkout_url": "https://checkout.chapa.co/...",
    "tx_ref": "unique-transaction-ref-2024"
  }
}
```

**Errors**:
- 400: Missing required fields
- 500: Payment service error

---

#### GET `/chapa/verify/:txRef`
Verify a payment transaction.

**Response** (200 OK):
```json
{
  "status": "success",
  "data": {
    "status": "completed",
    "tx_ref": "unique-transaction-ref-2024",
    "amount": 100,
    "currency": "ETB"
  }
}
```

**Errors**:
- 400: Missing reference
- 500: Verification error

---

## Rate Limiting

### Login Endpoint
- **Limit**: 5 attempts per 15 minutes per IP address
- **Error**: 429 Too Many Requests

### Registration Endpoint
- **Limit**: 3 attempts per hour per IP address
- **Error**: 429 Too Many Requests

---

## Error Responses

### Standard Error Format
```json
{
  "error": "Error type",
  "message": "Detailed error message"
}
```

### Common HTTP Status Codes
- `200 OK`: Successful request
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid input or missing required fields
- `401 Unauthorized`: Missing or invalid authentication token
- `403 Forbidden`: Access denied (e.g., suspended account)
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists (e.g., duplicate username)
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server error

---

## Token Storage

### Frontend Storage
Recommended approach using localStorage:
```javascript
// After successful login/register
localStorage.setItem('accessToken', response.accessToken);
localStorage.setItem('refreshToken', response.refreshToken);
localStorage.setItem('user', JSON.stringify(response.user));
```

### Token Expiration
- **Access Token**: 24 hours
- **Refresh Token**: 7 days
- **Password Reset Token**: 15-30 minutes
- **Email Verification Token**: 24 hours

---

## Examples

### Example: Complete Login Flow

```javascript
// 1. Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'myschool',
    password: 'password'
  })
});

const { accessToken, refreshToken, user } = await loginResponse.json();
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);

// 2. Get Profile
const profileResponse = await fetch('/api/profile/profile', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

const profileData = await profileResponse.json();

// 3. Update Profile
await fetch('/api/profile/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    school_name: 'Updated School Name'
  })
});

// 4. Logout
await fetch('/api/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ refreshToken })
});

localStorage.clear();
```

---

## Support

For API issues or questions, contact: support@scorebook.com.et
