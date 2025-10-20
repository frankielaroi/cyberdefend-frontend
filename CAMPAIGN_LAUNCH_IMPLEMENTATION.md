# Campaign Launch Implementation with Scheduled Launch Support

## Overview
This document describes the implementation of phishing campaign launch functionality in the CyberDefend frontend application, including support for immediate and scheduled launches.

## Backend API Endpoint
The backend exposes the following endpoint for launching campaigns:

```
POST /api/v1/defendx-plus/campaigns/:campaignId/launch
```

### Request Body
```typescript
{
  "launchType": "NOW" | "SCHEDULED",  // Required: NOW for immediate, SCHEDULED for future
  "scheduledAt": "2025-10-20T09:00:00Z"  // Required when launchType is SCHEDULED
}
```

**Important:** If a campaign was created with a `scheduledAt` date/time, the frontend will automatically use `SCHEDULED` launchType and pass the scheduled date when launching.

### Response
```typescript
{
  "id": "campaign-uuid",
  "name": "Campaign Name",
  "status": "RUNNING" | "SCHEDULED",
  "launchedAt": "2025-10-15T10:30:00Z",
  "targetCount": 10,
  "emailsSent": 0,
  ...
}
```

## Frontend Implementation

### 1. PhishingDashboard Component
**File:** `src/components/defendxplus/PhishingDashboard.tsx`

**Features:**
- Added a **Launch** button (Play icon) in the campaign actions column for campaigns with status `DRAFT`
- Shows a loading spinner while launching
- **Smart Launch Modal:**
  - If campaign has a `scheduledAt` date, shows a modal with two options:
    - **Use Scheduled Time** - Launches with SCHEDULED type
    - **Launch Immediately** - Launches with NOW type
  - If no schedule exists, launches immediately with confirmation
- Refreshes campaign list after successful launch
- Shows success/error alerts with appropriate messaging

**Code Changes:**
- Imported `useLaunchCampaignMutation` hook and `Play`, `Calendar` icons
- Added `handleLaunchCampaign` function to check for schedule and show modal
- Added `executeLaunch` function to handle actual launch with proper launchType
- Added state for tracking which campaign is being launched
- Added state for modal visibility and selected campaign
- Created launch options modal UI
- Updated actions column to show Launch button conditionally

### 2. CreateCampaignModal Component
**File:** `src/components/defendxplus/CreateCampaignModal.tsx`

**Features:**
- After successfully creating a campaign, displays a success modal
- **Smart Launch Behavior:**
  - If campaign has `scheduledAt` date, button shows **"Activate Schedule"** and uses SCHEDULED launchType
  - If no schedule, button shows **"Launch Now"** and uses NOW launchType
- Shows scheduled date/time in amber notification box when applicable
- Gives users two options:
  1. **Launch/Activate** - Launch immediately or activate schedule
  2. **Save as Draft** - Keep it as draft for later
- Shows loading state during launch with appropriate text
- Handles launch errors gracefully

**Code Changes:**
- Added `useLaunchCampaignMutation` hook and `Calendar` icon
- Added state for success modal visibility and created campaign data
- Modified `handleSubmit` to show success modal instead of closing immediately
- Updated `handleLaunchNow` to check for `scheduledAt` and use appropriate launchType
- Added `handleSaveAsDraft` function
- Created success modal UI with:
  - Conditional display of scheduled date/time
  - Dynamic button text based on schedule presence
  - Contextual messaging
  - Campaign info and action buttons

### 3. CreateCampaignPage Component
**File:** `src/components/defendxplus/CreateCampaignPage.tsx`

**Features:**
- Multi-step campaign creation wizard
- Step 4 (Review & Launch) has two action buttons:
  1. **Launch Campaign / Activate Schedule** - Creates and launches (immediate or scheduled)
  2. **Save as Draft** - Creates without launching
- **Dynamic Button Text:**
  - Shows "Activate Schedule" when `scheduledAt` is set
  - Shows "Launch Campaign" when no schedule exists
  - Shows "Scheduling..." or "Launching..." during action
- Shows success messages with schedule info and redirects to dashboard

**Code Changes:**
- Updated `handleLaunchCampaign` to:
  - Check for `scheduledAt` field
  - Use SCHEDULED launchType when schedule exists
  - Pass scheduledAt to API when using SCHEDULED type
  - Show contextual success messages
- Updated button text to be dynamic based on schedule presence
- Updated `handleSaveDraft` to add error handling and user feedback
- Fixed navigation paths to use `/dashboard/defendxplus/phishing`
- Added alert messages for user confirmation with schedule details

### 4. CampaignDetails Component
**File:** `src/components/defendxplus/CampaignDetails.tsx`

**Features:**
- Shows launch buttons in header for DRAFT campaigns
- **Dual Launch Options when schedule exists:**
  - **Activate Schedule** (blue button with Calendar icon) - Uses scheduled time
  - **Launch Now** (green button with Play icon) - Launches immediately
  - Shows scheduled date/time next to Activate Schedule button
- **Single Launch Option when no schedule:**
  - **Launch Campaign** (green button) - Launches immediately
- Button shows loading state during launch
- Confirmation dialog before launching with contextual messaging
- Refreshes campaign data after launch

**Code Changes:**
- Imported `useLaunchCampaignMutation`, `useGetCampaignQuery` hooks
- Added `Play` and `Calendar` icon imports
- Updated `handleLaunchCampaign` to:
  - Accept `useSchedule` parameter
  - Check for campaign's scheduledAt field
  - Show contextual confirmation messages
  - Use appropriate launchType (NOW or SCHEDULED)
  - Pass scheduledAt when using SCHEDULED type
- Retrieved campaign status and scheduledAt to conditionally show buttons
- Updated header section with:
  - Conditional dual-button layout for scheduled campaigns
  - Single-button layout for non-scheduled campaigns
  - Schedule information display
  - Dynamic button text and icons

## Scheduled Launch Feature

### How It Works

When creating a campaign, users can optionally set a **Scheduled Launch Date/Time**. This date is stored in the campaign's `scheduledAt` field.

**Launch Behavior:**
1. **Campaign Created WITHOUT Schedule:**
   - Launch buttons show "Launch Now" or "Launch Campaign"
   - Clicking launch immediately sends emails (launchType: NOW)
   
2. **Campaign Created WITH Schedule:**
   - Launch buttons show options for both scheduled and immediate launch
   - **Activate Schedule / Use Scheduled Time:**
     - Uses launchType: SCHEDULED
     - Passes scheduledAt to backend
     - Backend queues emails to be sent at the specified time
   - **Launch Now / Launch Immediately:**
     - Uses launchType: NOW
     - Ignores the schedule and sends immediately

### UI Indicators

- **CreateCampaignModal:** Shows amber notification box with calendar icon and scheduled date
- **PhishingDashboard:** Shows launch modal with both options and highlights scheduled date
- **CampaignDetails:** Shows scheduled date next to "Activate Schedule" button
- **CreateCampaignPage:** Button text changes to "Activate Schedule" when schedule exists

## User Flow

### Creating and Launching a Campaign

#### Option 1: Launch from Creation Modal
1. User clicks "Create New Campaign" from PhishingDashboard
2. Fills out campaign form (CreateCampaignModal)
3. Clicks "Create Campaign"
4. Success modal appears with campaign info
5. User chooses:
   - **Launch Now** → Campaign status changes to RUNNING/ACTIVE
   - **Save as Draft** → Campaign status remains DRAFT

#### Option 2: Launch from Dashboard
1. User sees list of campaigns in PhishingDashboard
2. For DRAFT campaigns, a Play button appears in the actions column
3. User clicks Play button
4. Confirmation dialog appears
5. User confirms
6. Campaign launches and status updates to RUNNING/ACTIVE

#### Option 3: Launch from Campaign Details
1. User views campaign details page
2. If campaign status is DRAFT, "Launch Campaign" button appears in header
3. User clicks "Launch Campaign"
4. Confirmation dialog appears
5. User confirms
6. Campaign launches and status updates to RUNNING/ACTIVE

#### Option 4: Launch from Creation Wizard
1. User uses the full campaign creation wizard (CreateCampaignPage)
2. Completes all 4 steps
3. In Step 4 (Review & Launch), user sees two buttons:
   - **Launch Campaign** → Creates and launches immediately
   - **Save as Draft** → Creates without launching

## API Integration

### Type Definitions
Located in `src/types/index.ts`:

```typescript
export interface LaunchCampaignDto {
  campaignId: string;
  launchType?: 'NOW' | 'SCHEDULED';
  scheduledAt?: string;
}
```

### RTK Query Hook
Located in `src/store/api/realDefendXPlusApi.ts`:

```typescript
launchCampaign: builder.mutation<ApiResponse<{ campaignId: string; status: string }>, LaunchCampaignDto>({
  query: (launchData) => ({
    url: `/defendx-plus/campaigns/${launchData.campaignId}/launch`,
    method: 'POST',
    body: launchData,
  }),
  invalidatesTags: (_result, _error, { campaignId }) => [
    'Campaign' as const,
    { type: 'Campaign' as const, id: campaignId }
  ],
})
```

### Usage Example
```typescript
import { useLaunchCampaignMutation } from '../../store/api/realDefendXPlusApi';

const [launchCampaign, { isLoading }] = useLaunchCampaignMutation();

const handleLaunch = async (campaignId: string) => {
  try {
    await launchCampaign({
      campaignId,
      launchType: 'NOW'
    }).unwrap();
    
    // Success handling
    alert('Campaign launched successfully!');
  } catch (error) {
    // Error handling
    console.error('Failed to launch campaign:', error);
    alert('Failed to launch campaign. Please try again.');
  }
};
```

## Backend Processing

According to the backend implementation:

1. **Validates** campaign exists and is in DRAFT or SCHEDULED status
2. **Checks** campaign has at least one target
3. **Updates** campaign status to RUNNING (immediate) or SCHEDULED (future date)
4. **Creates** email jobs for all targets
5. **Processes** emails using:
   - Bull Queue (if available) - recommended for production
   - Synchronous processing (fallback) - if queue not available
6. **Uses Circuit Breaker** for email failures and automatic recovery

## Related Features

### Additional Campaign Management Endpoints
- **Pause Campaign:** `POST /api/v1/defendx-plus/campaigns/:campaignId/pause`
- **Resume Campaign:** `POST /api/v1/defendx-plus/campaigns/:campaignId/resume`
- **Complete Campaign:** `POST /api/v1/defendx-plus/campaigns/:campaignId/complete`
- **Campaign Analytics:** `GET /api/v1/defendx-plus/campaigns/:campaignId/analytics`
- **Live Stats:** `GET /api/v1/defendx-plus/campaigns/:campaignId/live-stats`

### Future Enhancements
Consider implementing:
1. Pause/Resume buttons for ACTIVE campaigns
2. Schedule campaign for future date/time
3. Bulk launch multiple campaigns
4. Pre-launch validation checks
5. Campaign preview before launch
6. Scheduled launch calendar view

## Testing

### Manual Testing Checklist
- [ ] Launch campaign from dashboard
- [ ] Launch campaign from creation modal
- [ ] Launch campaign from creation wizard
- [ ] Launch campaign from details page
- [ ] Verify confirmation dialogs appear
- [ ] Check loading states during launch
- [ ] Verify error handling with invalid campaign
- [ ] Test with campaigns in different statuses
- [ ] Verify campaign status updates after launch
- [ ] Check that emails are being queued/sent

### Test Scenarios
1. **Happy Path:** Create campaign → Launch → Verify status changes to RUNNING
2. **Error Handling:** Launch non-existent campaign → Verify error message
3. **Status Validation:** Try to launch already running campaign → Should be prevented
4. **UI States:** Verify loading spinners and disabled states during launch
5. **Navigation:** Verify proper redirects after successful launch

## Notes
- Launch functionality only appears for campaigns with status `DRAFT`
- All launch actions require user confirmation
- Campaign status automatically updates after successful launch
- RTK Query automatically refreshes campaign data after mutations
- Proper error handling ensures user is informed of any issues
