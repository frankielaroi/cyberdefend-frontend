# CyberDefend 360 Frontend

A comprehensive React + Redux frontend for the CyberDefend 360 cybersecurity platform featuring DefendX assessments and DefendX+ monitoring capabilities.

## Features

### DefendX - Cybersecurity Assessment
- Interactive questionnaire system with adaptive logic
- Real-time CSI (Cyber Safety Index) scoring
- Tier-based risk classification (A-F)
- Benchmarking against regional, sectoral, and national averages
- Automated report generation
- Assessment history tracking

### DefendX+ - Phishing & Monitoring
- Phishing simulation campaign management
- Real-time alert monitoring dashboard
- System security scanning and reporting
- Campaign analytics with detailed metrics
- Detection rule management
- Resilience scoring

### Billing & Subscriptions
- Multiple subscription tiers (DefendCore, DefendVault, DefendClick, Enterprise)
- Payment integration (Card & Mobile Money)
- Invoice history and management
- Auto-renewal controls
- Trial and subscription lifecycle management

### Admin Dashboard
- System-wide analytics and statistics
- Question bank management
- Organization oversight
- Regional and sectoral reporting
- CSI Directory approval workflow
- Audit logging

### Public CSI Directory
- Searchable database of organization CSI scores
- Filter by sector, region, and company size
- Public transparency and benchmarking

## Tech Stack

- **Framework**: React 18 + TypeScript
- **State Management**: Redux Toolkit + RTK Query
- **Routing**: React Router v6
- **Styling**: TailwindCSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Build Tool**: Vite

## Project Structure

```
src/
├── components/
│   ├── auth/              # Authentication components
│   ├── defendx/           # DefendX assessment modules
│   ├── defendxplus/       # DefendX+ phishing & monitoring
│   ├── admin/             # Admin dashboard components
│   ├── billing/           # Billing & subscription
│   └── layout/            # Layout components
├── store/
│   ├── api/              # RTK Query API endpoints
│   ├── slices/           # Redux slices
│   ├── hooks.ts          # Typed Redux hooks
│   └── index.ts          # Store configuration
├── types/                # TypeScript type definitions
├── routes.tsx            # Application routing
└── main.tsx             # Application entry point
```

## Redux Architecture

### Slices
- **authSlice**: User authentication and session management
- **defendxSlice**: Assessment state and questionnaire flow
- **defendxPlusSlice**: Campaign and alert state
- **billingSlice**: Subscription and payment state
- **adminSlice**: Admin filters and preferences

### API Endpoints
- **authApi**: Login, register, logout
- **defendxApi**: Assessments, results, CSI directory
- **defendxPlusApi**: Campaigns, alerts, scans, rules
- **billingApi**: Plans, subscriptions, invoices, payments
- **adminApi**: Organizations, questions, analytics, audit logs

## Key Features

### Role-Based Access Control
Three user roles with distinct permissions:
- **Admin**: Full system access, analytics, question management
- **Organization Manager**: Assessment and monitoring tools, billing
- **End User**: Basic assessment participation

### Real-time Updates
- Live alert monitoring with WebSocket support
- Automatic alert count updates
- Campaign metrics tracking

### Security
- JWT-based authentication
- Protected routes with role validation
- Secure API communication
- Token management with localStorage

### Responsive Design
- Mobile-first approach
- Collapsible sidebar navigation
- Adaptive layouts for all screen sizes
- Touch-friendly interfaces

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_URL=http://localhost:3000/api/v1
```

## Getting Started

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Type Check
```bash
npm run typecheck
```

### Lint
```bash
npm run lint
```

## API Integration

The frontend expects the following backend endpoints:

### Authentication
- POST `/auth/login`
- POST `/auth/register`
- GET `/auth/me`
- POST `/auth/logout`

### DefendX
- POST `/defendx/csi/start`
- POST `/defendx/csi/submit`
- GET `/defendx/csi/result/:id`
- GET `/defendx/csi/history`
- GET `/csi-directory/public`

### DefendX+
- GET `/defendxplus/campaigns`
- POST `/defendxplus/campaigns`
- GET `/defendxplus/campaigns/:id/analytics`
- GET `/defendxplus/alerts`
- POST `/defendxplus/alerts/:id/acknowledge`
- GET `/defendxplus/scans`
- POST `/defendxplus/scans/schedule`

### Billing
- GET `/billing/plans`
- GET `/billing/subscriptions`
- POST `/billing/checkout/session`
- GET `/billing/invoices`
- GET `/billing/payment-methods`

### Admin
- GET `/admin/dashboard/stats`
- GET `/admin/organizations`
- GET `/admin/questions`
- POST `/admin/questions`
- PUT `/admin/questions/:id`
- DELETE `/admin/questions/:id`

## Component Highlights

### AssessmentQuestionnaire
Interactive questionnaire with progress tracking, multiple question types, and results display with benchmarking data.

### PhishingDashboard
Campaign management interface with metrics cards, timeline visualization, and campaign creation modal.

### MonitoringDashboard
Real-time alert feed with severity-based filtering, acknowledgment workflow, and live status indicators.

### AdminDashboard
System-wide analytics with charts, regional/sectoral breakdowns, and activity trends.

## Customization

### Theme Colors
The application uses a neutral color palette. Primary color can be adjusted in Tailwind configuration.

### API Base URL
Configure via `VITE_API_URL` environment variable for different deployment environments.

### Question Types
Currently supports:
- Multiple choice
- Yes/No
- Rating (1-5)

Additional types can be added by extending the Question type and updating the AssessmentQuestionnaire component.

## Best Practices

- Components follow single responsibility principle
- API calls use RTK Query for caching and optimization
- Type safety enforced throughout with TypeScript
- Loading and error states handled consistently
- Accessible UI with proper ARIA labels
- Responsive design patterns

## Future Enhancements

- WebSocket integration for real-time alerts
- Advanced data visualization
- Export functionality for reports
- Multi-language support
- Dark mode theme
- Advanced filtering and search
- Notification preferences
- Two-factor authentication

## License

Proprietary - CyberDefend 360 Platform
