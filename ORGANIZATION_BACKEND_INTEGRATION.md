# Organization Backend Integration Guide

## Overview

The frontend has been updated to connect to real backend endpoints for organization management. This document provides the complete API specification for organization creation, joining, and management.

## API Endpoints

### 1. **POST /api/v1/organizations**
Create a new organization

**Request Body:**
```json
{
  "name": "ACME Corporation",
  "email": "contact@acme.com",
  "phone": "+1-555-0123",
  "website": "https://acme.com",
  "sector": "TECHNOLOGY",
  "size": "MEDIUM",
  "description": "Leading technology solutions provider",
  "isPublic": false
}
```

**Response:**
```json
{
  "success": true,
  "message": "Organization created successfully",
  "data": {
    "id": "org_abc123",
    "name": "ACME Corporation",
    "email": "contact@acme.com",
    "phone": "+1-555-0123",
    "website": "https://acme.com",
    "sector": "TECHNOLOGY",
    "size": "MEDIUM",
    "description": "Leading technology solutions provider",
    "isPublic": false,
    "status": "active",
    "memberCount": 1,
    "createdAt": "2024-01-01T12:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z",
    "createdBy": "user_123"
  }
}
```

### 2. **GET /api/v1/organizations**
Get public organizations for browsing

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term for organization name
- `sector`: Filter by sector (TECHNOLOGY, HEALTHCARE, etc.)
- `size`: Filter by size (MICRO, SMALL, MEDIUM, LARGE, ENTERPRISE)
- `isPublic`: Filter by public visibility (default: true)

**Example:** `/api/v1/organizations?page=1&limit=10&search=tech&sector=TECHNOLOGY&isPublic=true`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "org_abc123",
      "name": "Tech Solutions Inc",
      "sector": "TECHNOLOGY",
      "size": "MEDIUM",
      "description": "Leading software development company",
      "memberCount": 125,
      "isPublic": true,
      "plan": "Professional",
      "status": "active",
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

### 3. **POST /api/v1/organizations/join**
Join an organization via invite code or organization ID

**Request Body (Invite Code):**
```json
{
  "inviteCode": "INV-ABC123XYZ"
}
```

**Request Body (Organization ID):**
```json
{
  "organizationId": "org_abc123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully joined organization",
  "data": {
    "organization": {
      "id": "org_abc123",
      "name": "ACME Corporation",
      "sector": "TECHNOLOGY",
      "size": "MEDIUM",
      "memberCount": 126
    },
    "userRole": "END_USER",
    "joinedAt": "2024-01-01T12:00:00Z"
  }
}
```

### 4. **GET /api/v1/organizations/{orgId}**
Get organization details

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "org_abc123",
    "name": "ACME Corporation",
    "email": "contact@acme.com",
    "phone": "+1-555-0123",
    "website": "https://acme.com",
    "sector": "TECHNOLOGY",
    "size": "MEDIUM",
    "description": "Leading technology solutions provider",
    "isPublic": false,
    "status": "active",
    "memberCount": 125,
    "plan": "Professional",
    "subscription": {
      "id": "sub_xyz789",
      "status": "active",
      "currentPeriodEnd": "2024-12-31T23:59:59Z"
    },
    "settings": {
      "allowPublicJoin": false,
      "requireApprovalToJoin": true,
      "maxMembers": 500
    },
    "createdAt": "2024-01-01T12:00:00Z",
    "updatedAt": "2024-01-01T12:00:00Z",
    "createdBy": "user_123"
  }
}
```

### 5. **PUT /api/v1/organizations/{orgId}**
Update organization details

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "name": "ACME Corporation Ltd",
  "email": "info@acme.com",
  "description": "Updated description",
  "website": "https://acme.com",
  "isPublic": true,
  "settings": {
    "allowPublicJoin": true,
    "requireApprovalToJoin": false,
    "maxMembers": 1000
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Organization updated successfully",
  "data": {
    // Updated organization object
  }
}
```

### 6. **GET /api/v1/organizations/{orgId}/members**
Get organization members

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 50)
- `role`: Filter by role (ORG_ADMIN, ORG_MANAGER, END_USER)
- `status`: Filter by status (active, inactive, pending)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_123",
      "email": "john@acme.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "ORG_ADMIN",
      "status": "active",
      "joinedAt": "2024-01-01T12:00:00Z",
      "lastLogin": "2024-01-06T10:30:00Z",
      "invitedBy": "user_456"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 125,
    "totalPages": 3
  }
}
```

### 7. **POST /api/v1/organizations/{orgId}/invite-codes**
Generate invite code for organization

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "expiresIn": 7,
  "usageLimit": 10
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "invite_789",
    "code": "INV-ABC123XYZ",
    "organizationId": "org_abc123",
    "createdBy": "user_123",
    "expiresAt": "2024-01-08T12:00:00Z",
    "usageLimit": 10,
    "usedCount": 0,
    "isActive": true,
    "createdAt": "2024-01-01T12:00:00Z"
  }
}
```

### 8. **GET /api/v1/organizations/{orgId}/invite-codes**
Get organization invite codes

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "invite_789",
      "code": "INV-ABC123XYZ",
      "organizationId": "org_abc123",
      "createdBy": "user_123",
      "expiresAt": "2024-01-08T12:00:00Z",
      "usageLimit": 10,
      "usedCount": 3,
      "isActive": true,
      "createdAt": "2024-01-01T12:00:00Z"
    }
  ]
}
```

### 9. **PUT /api/v1/organizations/{orgId}/members/{userId}**
Update member role

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "role": "ORG_MANAGER"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Member role updated successfully"
}
```

### 10. **DELETE /api/v1/organizations/{orgId}/members/{userId}**
Remove member from organization

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Member removed successfully"
}
```

### 11. **POST /api/v1/organizations/{orgId}/leave**
Leave organization

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Successfully left organization"
}
```

### 12. **DELETE /api/v1/organizations/{orgId}**
Delete organization

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "message": "Organization deleted successfully"
}
```

### 13. **GET /api/v1/organizations/me**
Get current user's organization

**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "success": true,
  "data": {
    // Organization object for user's current organization
  }
}
```

## Data Models

### Organization Entity
```typescript
{
  id: string;
  name: string;
  email?: string;
  phone?: string;
  website?: string;
  sector: 'TECHNOLOGY' | 'HEALTHCARE' | 'BANKING' | ...; // See Sector enum
  size: 'MICRO' | 'SMALL' | 'MEDIUM' | 'LARGE' | 'ENTERPRISE';
  description?: string;
  isPublic: boolean;
  status: 'active' | 'suspended' | 'pending';
  memberCount: number;
  plan?: string;
  subscription?: {
    id: string;
    status: 'active' | 'trial' | 'expired';
    currentPeriodEnd: string;
  };
  settings?: {
    allowPublicJoin: boolean;
    requireApprovalToJoin: boolean;
    maxMembers?: number;
  };
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}
```

### Organization Member Entity
```typescript
{
  id: string;
  userId: string;
  organizationId: string;
  role: 'ORG_ADMIN' | 'ORG_MANAGER' | 'END_USER';
  status: 'active' | 'inactive' | 'pending';
  joinedAt: string;
  invitedBy?: string;
  inviteCode?: string;
}
```

### Invite Code Entity
```typescript
{
  id: string;
  code: string; // Format: "INV-{6-8 random chars}"
  organizationId: string;
  createdBy: string;
  expiresAt: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
}
```

## Frontend Integration Points

### Register Component
The Register component (`src/components/auth/Register.tsx`) handles three organization flows:

1. **Create Organization**: User creates new organization during registration
2. **Join by Invite**: User enters invite code to join existing organization
3. **Browse & Join**: User searches and selects from public organizations

### API Hooks Used
```typescript
// From src/store/api/organizationApi.ts
import {
  useCreateOrganizationMutation,
  useJoinOrganizationMutation,
  useGetOrganizationsQuery,
} from '../../store/api/organizationApi';
```

### Error Handling
All API calls use `.unwrap()` for proper RTK Query error handling:
```typescript
try {
  await createOrganization(orgData).unwrap();
  // Success handling
} catch (err: any) {
  // Error is automatically handled by RTK Query error state
  console.error('Organization setup failed:', err);
}
```

## Business Logic Requirements

### Organization Creation
1. Validate organization name uniqueness
2. Set creator as ORG_ADMIN automatically
3. Initialize with default settings
4. Create basic subscription/trial

### Invite Code Generation
1. Generate unique codes with format "INV-{random}"
2. Default expiration: 7 days
3. Default usage limit: unlimited (-1)
4. Only ORG_ADMIN and ORG_MANAGER can generate

### Join Approval Flow
1. If `requireApprovalToJoin` is true, create pending membership
2. Notify organization admins via email/notification
3. Provide approval/rejection workflow
4. Send confirmation emails

### Access Control
- **ORG_ADMIN**: Full organization management
- **ORG_MANAGER**: Member management, invite codes
- **END_USER**: Read-only access to organization info

## Error Responses

```json
// Invalid invite code
{
  "success": false,
  "message": "Invalid or expired invite code",
  "code": "INVALID_INVITE_CODE"
}

// Organization not found
{
  "success": false,
  "message": "Organization not found",
  "code": "ORG_NOT_FOUND"
}

// Already a member
{
  "success": false,
  "message": "User is already a member of this organization",
  "code": "ALREADY_MEMBER"
}

// Permission denied
{
  "success": false,
  "message": "Insufficient permissions",
  "code": "PERMISSION_DENIED"
}
```

## Testing the Integration

1. **Set API URL** in `.env`:
   ```bash
   VITE_API_URL=http://localhost:3000/api/v1
   ```

2. **Test Registration Flows**:
   - Create new organization during registration
   - Join existing organization with invite code
   - Browse and join public organizations

3. **Test Organization Management**:
   - View organization details
   - Manage members and roles
   - Generate invite codes
   - Update organization settings

The frontend is now fully connected to backend organization endpoints with proper error handling and type safety!