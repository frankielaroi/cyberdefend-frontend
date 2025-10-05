import { createBrowserRouter } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ForgotPassword from './components/auth/ForgotPassword';
import ResetPassword from './components/auth/ResetPassword';
import DashboardLayout from './components/layout/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedDashboard from './components/dashboard/RoleBasedDashboard';

import AssessmentDashboard from './components/defendx/AssessmentDashboard';
import StartAssessment from './components/defendx/StartAssessment';
import AssessmentResult from './components/defendx/AssessmentResult';
import CSIDirectory from './components/defendx/CSIDirectory';
import PhishingDashboard from './components/defendxplus/PhishingDashboard';
import MonitoringDashboard from './components/defendxplus/MonitoringDashboard';
import ScanReports from './components/defendxplus/ScanReports';
import CreateCampaignPage from './components/defendxplus/CreateCampaignPage';
import CampaignDetails from './components/defendxplus/CampaignDetails';
import AdminDashboard from './components/admin/AdminDashboard';
import QuestionManager from './components/admin/QuestionManager';
import BillingDashboard from './components/billing/BillingDashboard';

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
    path: '/csi-directory',
    element: <CSIDirectory />,
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
            <AssessmentResult />
          </ProtectedRoute>
        ),
      },
      {
        path: 'defendxplus/phishing',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER']}>
            <PhishingDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: 'defendxplus/campaigns/create',
        element: (
          <ProtectedRoute allowedRoles={['ORG_ADMIN', 'ORG_MANAGER']}>
            <CreateCampaignPage />
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
    ],
  },
]);
