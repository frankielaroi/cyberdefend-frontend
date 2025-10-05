# CyberDefend 360 Frontend - Backend Integration Guide

## Overview
This guide helps you connect the CyberDefend 360 frontend to your backend API based on the provided Swagger specification.

## Environment Setup

1. **Create Environment File**
   ```bash
   cp .env.example .env.local
   ```

2. **Configure API URL**
   Update your `.env.local` file with your backend API URL:
   ```
   VITE_API_URL=https://your-backend-domain.com/api/v1
   ```

## API Endpoints Implemented

### Authentication (`/api/v1/auth/`)
- ✅ `POST /login` - User login
- ✅ `POST /register` - User registration  
- ✅ `POST /refresh-token` - Refresh access token
- ✅ `POST /logout` - User logout
- ✅ `GET /profile` - Get user profile
- ✅ `POST /change-password` - Change user password
- ✅ `POST /forgot-password` - Request password reset
- ✅ `POST /reset-password` - Reset user password
- ✅ `POST /verify-email` - Verify user email

### DefendX CSI (`/api/v1/defendx/`)
- ✅ `GET /csi-directory/public` - Get public CSI directory
- ✅ `GET /csi-directory/leaderboard` - Get CSI leaderboard
- ✅ `GET /csi-directory/heatmap` - Get CSI heatmap data
- ✅ `GET /csi-directory/admin/stats` - Get admin CSI statistics
- ✅ `GET /stats/regional` - Get regional cybersecurity statistics
- ✅ `GET /stats/sectoral` - Get sectoral cybersecurity statistics
- ✅ `POST /csi/start` - Initialize new cybersecurity assessment
- ✅ `POST /csi/submit` - Submit assessment answers
- ✅ `POST /assessments/{id}/complete` - Complete assessment
- ✅ `GET /csi/result/{id}` - Get assessment results
- ✅ `GET /organizations/{id}/assessments` - Get organization assessments

### DefendX+ Phishing (`/api/v1/defendxplus/`)
- ✅ `POST /campaign/create` - Create phishing campaign
- ✅ `POST /campaign/launch` - Launch campaign
- ✅ `GET /campaign/{id}/results` - Get campaign results
- ✅ `GET /campaign` - List all campaigns
- ✅ `PUT /campaign/{id}` - Update campaign
- ✅ `DELETE /campaign/{id}` - Delete campaign
- ✅ `POST /report/incident` - Report incident

### DefendX+ Agents (`/api/v1/defendxplus/agents/`)
- ✅ `POST /register` - Register endpoint agent
- ✅ `GET /{id}/config` - Get agent configuration
- ✅ `GET /` - List organization agents
- ✅ `POST /{id}/heartbeat` - Update agent heartbeat

### DefendX+ Telemetry (`/api/v1/defendxplus/`)
- ✅ `POST /telemetry` - Receive telemetry data

### DefendX+ Alerts (`/api/v1/defendxplus/alerts/`)
- ✅ `GET /` - Fetch alerts (filterable)
- ✅ `POST /{id}/ack` - Acknowledge alert
- ✅ `POST /{id}/close` - Close alert
- ✅ `GET /live` - Real-time alert stream (SSE)

### DefendX+ Scans (`/api/v1/defendxplus/scans/`)
- ✅ `POST /schedule` - Schedule periodic scans
- ✅ `POST /run` - Trigger manual scan
- ✅ `GET /` - List scan schedules
- ✅ `GET /results` - Get scan results
- ✅ `GET /results/{id}` - Get detailed scan report

### Billing (`/api/v1/billing/`)
- ✅ Subscription management
- ✅ Payment methods
- ✅ Invoice handling
- ✅ Checkout sessions
- ✅ Usage metrics

### Admin (`/api/v1/admin/`)
- ✅ Dashboard statistics
- ✅ User management
- ✅ Organization management
- ✅ Question management
- ✅ System configuration
- ✅ Audit logs
- ✅ CSI directory management

## TypeScript Types Generated

All API request/response types have been generated from the Swagger spec and are available in `src/types/index.ts`:

- Authentication DTOs (LoginDto, RegisterDto, etc.)
- Assessment types (CreateAssessmentDto, AssessmentResultDto, etc.)
- Campaign management types
- Agent and telemetry types
- Alert and scan types
- Billing and subscription types
- Admin types

## Usage Examples

### Authentication
```typescript
import { useLoginMutation, useGetProfileQuery } from '../store/api/authApi';

// Login
const [login, { isLoading }] = useLoginMutation();
const result = await login({ email: 'user@example.com', password: 'password' });

// Get profile
const { data: user, isLoading: profileLoading } = useGetProfileQuery();
```

### DefendX Assessment
```typescript
import { useStartAssessmentMutation } from '../store/api/defendxApi';
import { useGetCSIDirectoryQuery } from '../store/api/csiDirectoryApi';

// Start assessment
const [startAssessment] = useStartAssessmentMutation();
const assessment = await startAssessment({
  title: 'Q4 2025 Assessment',
  type: 'CSI_ASSESSMENT'
});

// Get CSI directory
const { data: csiDirectory } = useGetCSIDirectoryQuery({
  sector: 'healthcare',
  page: 1,
  limit: 25
});
```

### DefendX+ Campaigns
```typescript
import { useCreateCampaignMutation, useGetCampaignsQuery } from '../store/api/defendxPlusApi';

// Create campaign
const [createCampaign] = useCreateCampaignMutation();
const campaign = await createCampaign({
  name: 'Q4 Security Awareness',
  templateId: 'template-123',
  targetEmails: ['user1@company.com', 'user2@company.com']
});

// Get campaigns
const { data: campaigns } = useGetCampaignsQuery();
```

## Authentication Flow

The API client includes automatic token refresh:

1. Requests automatically include Bearer token
2. 401 responses trigger refresh token attempt
3. Successful refresh updates tokens and retries request
4. Failed refresh logs out user

## Error Handling

All API endpoints return standardized error responses:

```typescript
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}
```

## Real-time Features

### Server-Sent Events (SSE)
The alerts endpoint supports real-time updates via SSE:

```typescript
const { data: liveAlerts } = useGetLiveAlertsQuery();
```

Note: You may need to implement custom SSE handling for real-time features.

## Backend Requirements

Ensure your backend implements:

1. **CORS Configuration**: Allow requests from your frontend domain
2. **JWT Authentication**: With access and refresh tokens
3. **Rate Limiting**: Protect against abuse
4. **Input Validation**: Validate all request payloads
5. **Error Handling**: Return consistent error responses
6. **File Upload**: Support for assessment reports and documents

## Testing the Integration

1. **Start your backend server**
2. **Update VITE_API_URL in your .env.local**
3. **Run the frontend**: `npm run dev`
4. **Test authentication flow**
5. **Verify API calls in browser DevTools Network tab**

## Troubleshooting

### Common Issues

1. **CORS Errors**: Configure backend CORS to allow your frontend domain
2. **401 Unauthorized**: Check JWT token format and expiration
3. **404 Not Found**: Verify API base URL and endpoint paths
4. **Network Errors**: Check backend server is running and accessible

### Debug Mode

Enable debug logging by setting:
```
VITE_APP_ENV=development
```

This will log API requests/responses to the browser console.

## Security Considerations

1. **Environment Variables**: Never commit sensitive keys to version control
2. **Token Storage**: Tokens are stored in localStorage (consider more secure options for production)
3. **HTTPS**: Always use HTTPS in production
4. **Input Sanitization**: Validate and sanitize all user inputs
5. **Rate Limiting**: Implement rate limiting on sensitive endpoints

## Support

For backend integration issues:
1. Check this documentation
2. Verify Swagger specification matches implementation
3. Test endpoints with Postman or similar tool
4. Review browser DevTools for detailed error messages