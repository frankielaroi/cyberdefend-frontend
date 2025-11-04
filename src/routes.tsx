import { createBrowserRouter } from 'react-router-dom';
import LandingPage from './components/LandingPage';
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
import BillingDashboard from './components/billing/BillingDashboard';
import OrganizationProfile from './components/organization/OrganizationProfile';
import OrganizationSettings from './components/organization/OrganizationSettings';
import UserManagement from './components/organization/UserManagement';
import UserProfile from './components/profile/UserProfile';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
    },
  
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    path: '/forgot-password',
    element: <ForgotPassword />,
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
  },
  {
    path: '/verify-email',
    element: <VerifyEmail />,
  },
  {
    path: '/csi-directory',
    element: <CSIDirectory />,
  },
  {
    path: '/assessment/anonymous',
    element: <AnonymousAssessment />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        path: '',
        element: <RoleBasedDashboard />,
      },
      {
        path: 'defendx',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER']}>
            <AssessmentDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'defendx/assessment/start',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER']}>
            <StartAssessment onComplete={(results) => console.log('Assessment completed:', results)} />
          </ProtectedRoute>
        ),
      },
      {
        path: 'defendx/assessment/result/:id',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER']}>
            <AssessmentResults />
          </ProtectedRoute>
        ),
      },
      {
        path: 'defendx/demo-results',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER']}>
            <AssessmentResults />
          </ProtectedRoute>
        ),
      },
      {
        path: 'defendxplus/phishing',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER','SUPER_ADMIN']}>
            <PhishingDashboard />
          </ProtectedRoute>
        ),
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
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER']}>
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
        path: 'backup',
        element: (
          <ProtectedRoute allowedRoles={['SUPER_ADMIN', 'CSA_ADMIN', 'ORG_ADMIN']}>
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
  },]);
