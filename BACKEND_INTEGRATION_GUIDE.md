# Backend Integration Guide for CyberDefend Frontend

## Overview

The frontend has been updated to connect to a real backend API instead of using mock services. This document outlines the required backend endpoints and integration details.

## API Configuration

### Environment Variables
Set `VITE_API_URL` in your `.env` file:
```bash
VITE_API_URL=http://localhost:3000/api/v1
```

### Base URL
- **Development**: `http://localhost:3000/api/v1`
- **Production**: Set via environment variable

## Required Backend Endpoints

### Authentication Endpoints

#### 1. **POST /auth/login**
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "access_token": "jwt_access_token",
  "refresh_token": "jwt_refresh_token",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "name": "John Doe",
    "role": "ORG_ADMIN",
    "organizationId": "org_id",
    "organizationName": "ACME Corp",
    "phone": "+1234567890",
    "emailVerified": true,
    "isActive": true,
    "lastLogin": "2024-01-01T12:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z",
    "organization": {
      "id": "org_id",
      "name": "ACME Corp",
      "size": "MEDIUM",
      "email": "contact@acme.com",
      "sector": "TECHNOLOGY"
    }
  }
}
```

#### 2. **POST /auth/register**
**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "role": "ORG_ADMIN",
  "organization": {
    "name": "ACME Corp",
    "email": "contact@acme.com",
    "size": "MEDIUM",
    "sector": "TECHNOLOGY",
    "description": "Technology company"
  }
}
```

**Response:** Same as login response

#### 3. **POST /auth/refresh-token**
**Request:**
```json
{
  "refresh_token": "jwt_refresh_token"
}
```

**Response:**
```json
{
  "access_token": "new_jwt_access_token",
  "refresh_token": "new_jwt_refresh_token"
}
```

#### 4. **POST /auth/forgot-password**
**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset link sent to your email"
}
```

#### 5. **POST /auth/reset-password**
**Request:**
```json
{
  "token": "reset_token_from_email",
  "password": "newpassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

#### 6. **GET /auth/validate-token**
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "valid": true
}
```

#### 7. **GET /auth/profile**
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    // Same user object as in login response
  }
}
```

#### 8. **POST /auth/logout**
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### 9. **GET /health** (Optional)
Health check endpoint for connectivity testing

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00Z"
}
```

## Error Handling

### Error Response Format
All error responses should follow this format:
```json
{
  "message": "Error description",
  "statusCode": 400,
  "error": "Bad Request"
}
```

### Common HTTP Status Codes
- **200**: Success
- **400**: Bad Request (validation errors)
- **401**: Unauthorized (invalid credentials, expired token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found
- **500**: Internal Server Error

## Authentication Flow

### 1. **Login Process**
1. User submits email/password
2. Frontend sends POST to `/auth/login`
3. Backend validates credentials
4. Backend returns tokens + user data
5. Frontend stores tokens and redirects to dashboard

### 2. **Registration Process**
1. User submits registration form
2. Frontend sends POST to `/auth/register`
3. Backend creates user and organization (if provided)
4. Backend returns tokens + user data
5. Frontend stores tokens and redirects to dashboard

### 3. **Token Refresh Process**
1. Frontend detects 401 response
2. Frontend sends refresh token to `/auth/refresh-token`
3. Backend validates refresh token
4. Backend returns new tokens
5. Frontend retries original request with new token

### 4. **Password Reset Process**
1. User submits email on forgot password page
2. Frontend sends POST to `/auth/forgot-password`
3. Backend generates reset token and sends email
4. User clicks link in email (contains token)
5. Frontend displays reset password form
6. User submits new password + token
7. Frontend sends POST to `/auth/reset-password`
8. Backend validates token and updates password

## Security Requirements

### Token Management
- **Access tokens**: Short-lived (1 hour recommended)
- **Refresh tokens**: Long-lived (7 days recommended)
- **Token format**: JWT with proper claims
- **Storage**: Frontend uses localStorage

### Password Requirements
- Minimum 8 characters
- Frontend validates before submission

### CORS Configuration
Allow requests from your frontend domain:
```
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

## Testing Backend Integration

### 1. **Connection Test**
Use the `testBackendConnection()` utility:
```typescript
import { testBackendConnection } from '../utils/backendHealth';

const result = await testBackendConnection();
console.log(result); // { connected: true, latency: 123 }
```

### 2. **Authentication Test**
1. Start your backend server
2. Set `VITE_API_URL` in `.env`
3. Try logging in with test credentials
4. Check browser Network tab for API calls
5. Verify tokens are stored in localStorage

## Migration from Mock API

The following changes have been made:

1. **Created `realAuthApi.ts`** - Real RTK Query endpoints
2. **Updated `authApi.ts`** - Now exports from real API
3. **Updated auth components** - Proper error handling with `.unwrap()`
4. **Enhanced `apiSlice.ts`** - Token refresh logic for backend
5. **Added `backendHealth.ts`** - Connection testing utilities

## Next Steps

1. **Set up your backend** with the required endpoints
2. **Configure CORS** to allow frontend requests
3. **Test authentication flow** end-to-end
4. **Update API URL** in environment variables
5. **Test error scenarios** (invalid credentials, network errors)

## Troubleshooting

### Common Issues

1. **CORS Errors**: Configure backend CORS settings
2. **404 Errors**: Verify API endpoints exist and match the paths
3. **Token Issues**: Check JWT format and expiration
4. **Network Errors**: Verify backend is running and accessible

### Debug Tools

- **Browser DevTools**: Network tab for API calls
- **Redux DevTools**: Monitor auth state changes
- **Console Logs**: API errors are logged with 🚨 prefix
- **Backend Health Check**: Use `testBackendConnection()` utility

The frontend is now ready to connect to your backend API!