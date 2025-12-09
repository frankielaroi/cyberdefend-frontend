import { createBrowserRouter } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import NotFound from './components/NotFound';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import VerifyEmail from './components/auth/VerifyEmail';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedDashboard from './components/dashboard/RoleBasedDashboard';
import { BackupLayout } from './components/backup/BackupLayout';
import { BackupList } from './components/backup/BackupList';
import { BackupAgentList } from './components/backup/BackupAgentList';

import AssessmentDashboard from './components/defendx/AssessmentDashboard';
import StartAssessment from './components/defendx/StartAssessment';
import AssessmentResults from './components/defendx/AssessmentResults';
import ErrorPage from './components/ErrorPage';
import CSIDirectory from './components/defendx/CSIDirectory';
import AnonymousAssessment from './components/defendx/AnonymousAssessment';
import PhishingDashboard from './components/defendxplus/PhishingDashboard';
import MonitoringDashboard from './components/defendxplus/MonitoringDashboard';
import ScanReports from './components/defendxplus/ScanReports';
import CreateCampaignPage from './components/defendxplus/CreateCampaignPage';
import CampaignDetails from './components/defendxplus/CampaignDetails';
import SMSCampaignManager from './components/defendxplus/SMSCampaignManager';
import SMSCampaignDetails from './components/defendxplus/SMSCampaignDetails';
import TemplateManager from './components/defendxplus/TemplateManager';
import AdminDashboard from './components/admin/AdminDashboard';
import QuestionManager from './components/admin/QuestionManager';
import AdminBillingPage from './components/admin/billing/AdminBillingPage';
import BillingDashboard from './components/billing/BillingDashboard';
import PaystackCallback from './components/billing/PaystackCallback';
import OrganizationProfile from './components/organization/OrganizationProfile';
import OrganizationSettings from './components/organization/OrganizationSettings';
import UserManagement from './components/organization/UserManagement';
import UserProfile from './components/profile/UserProfile';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
    errorElement: <ErrorPage />,
    },
  {
    path: '/login',
    element: <Login />,
    errorElement: <ErrorPage />,
  },
    
  {
    path: '/register',
    element: <Register />,
    errorElement: <ErrorPage />,
  },
    
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
    errorElement: <ErrorPage />,
  },
    
  {
    path: '/verify-email',
    element: <VerifyEmail />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/csi-directory',
    element: <CSIDirectory />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/assessment/anonymous',
    element: <AnonymousAssessment />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/billing/callback',
    element: <PaystackCallback />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        path: '',
        element: <RoleBasedDashboard />,
      },
      {
        path: '*',
        element: <NotFound />,
        errorElement: <ErrorPage />,
      },
      {
        path: 'defendx',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER']} requiredFeatures={['full_security_suite']}>
            <AssessmentDashboard />
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: 'defendx/assessment/start',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER']} requiredFeatures={['full_security_suite']}>
            <StartAssessment onComplete={(results) => console.log('Assessment completed:', results)} />
          </ProtectedRoute>
        ),
      },
      {
        path: 'defendx/assessment/result/:id',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER']} requiredFeatures={['full_security_suite']}>
            <AssessmentResults />
          </ProtectedRoute>
        ),
      },
      {
        path: 'defendx/demo-results',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER']} requiredFeatures={['full_security_suite']}>
            <AssessmentResults />
          </ProtectedRoute>
        ),
      },
      {
        path: 'defendxplus/phishing',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER','SUPER_ADMIN']} requiredFeatures={['advanced_reporting']}>
            <PhishingDashboard />
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: 'defendxplus/campaigns/create',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER','SUPER_ADMIN']}>
            <CreateCampaignPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'defendxplus/templates',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER','SUPER_ADMIN']}>
            <TemplateManager />
          </ProtectedRoute>
        ),
      },
      {
        path: 'defendxplus/campaigns/:id',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER']}>
            <CampaignDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: 'defendxplus/sms-campaigns',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER']}>
            <SMSCampaignManager />
          </ProtectedRoute>
        ),
      },
      {
        path: 'defendxplus/sms-campaigns/:id',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER']}>
            <SMSCampaignDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: 'defendxplus/monitoring',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER']} requiredFeatures={['realtime_monitoring']}>
            <MonitoringDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'defendxplus/scans',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER']}>
            <ScanReports />
          </ProtectedRoute>
        ),
      },
      {
        path: 'billing',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER']}>
            <BillingDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'billing/callback',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER']}>
            <PaystackCallback />
          </ProtectedRoute>
        ),
      },
      {
        path: 'organization/profile',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER']}>
            <OrganizationProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'organization/settings',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER']}>
            <OrganizationSettings />
          </ProtectedRoute>
        ),
      },
      {
        path: 'organization/users',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER']}>
            <UserManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile/edit',
        element: (
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile/settings',
        element: (
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'profile/notifications',
        element: (
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/overview',
        element: (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'CSA_ADMIN']}>
            <AdminDashboard />
          </ProtectedRoute>
        ),
        errorElement: <ErrorPage />,
      },
      {
        path: 'admin/questions',
        element: (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'CSA_ADMIN']}>
            <QuestionManager />
          </ProtectedRoute>
        ),
      },
      {
        path: 'admin/billing',
        element: (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'CSA_ADMIN']}>
            <AdminBillingPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'backup',
        element: (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'CSA_ADMIN', 'ORG_ADMIN']} requiredFeatures={['backup_management']}>
            <BackupLayout />
          </ProtectedRoute>
        ),
        children: [
          {
            path: '',
            element: <BackupList />,
          },
          {
            path: 'agents',
            element: <BackupAgentList />,
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
    errorElement: <ErrorPage />,
  },
]);
