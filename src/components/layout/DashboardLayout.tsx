import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logout } from '../../store/slices/authSlice';
import SideNavigation from './SideNavigation';
import {
  UserIcon,
  ShieldCheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ArrowRightOnRectangleIcon,
  BellIcon,
} from '@heroicons/react/24/outline';

const DashboardLayout = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    
    if (path === '/dashboard') return 'Dashboard';
    if (path === '/csi-directory') return 'CSI Directory';
    if (path.includes('/defendx/assessment/start')) return 'Security Assessment';
    if (path.includes('/defendx/assessment/result')) return 'Assessment Results';
    if (path.includes('/defendx')) return 'DefendX - Security Assessments';
    if (path.includes('/defendxplus/phishing')) return 'Phishing Dashboard';
    if (path.includes('/defendxplus/monitoring')) return 'Security Monitoring';
    if (path.includes('/defendxplus/scans')) return 'Scan Reports';
    if (path.includes('/defendxplus/campaigns/create')) return 'Create Campaign';
    if (path.includes('/defendxplus/campaigns/')) return 'Campaign Details';
    if (path.includes('/defendxplus')) return 'DefendX Plus';
    if (path.includes('/billing')) return 'Billing & Subscription';
    if (path.includes('/admin/overview')) return 'Admin Dashboard';
    if (path.includes('/admin/questions')) return 'Question Management';
    if (path.includes('/admin')) return 'Administration';
    
    // Fallback to capitalize the last segment
    const segments = path.split('/').filter(Boolean);
    const lastSegment = segments[segments.length - 1];
    return lastSegment ? lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1).replace('-', ' ') : 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} bg-white shadow-lg transition-all duration-300 ease-in-out flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          {!sidebarCollapsed && (
            <div className="flex items-center space-x-2">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">CyberDefend</span>
            </div>
          )}
          {sidebarCollapsed && (
            <div className="flex items-center justify-center w-full">
              <ShieldCheckIcon className="h-8 w-8 text-blue-600" />
            </div>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            {sidebarCollapsed ? (
              <ChevronRightIcon className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <SideNavigation collapsed={sidebarCollapsed} />

        {/* User Profile & Logout */}
        <div className="border-t border-gray-200 p-4 mt-auto">
          {!sidebarCollapsed && user && (
            <div className="flex items-center space-x-3 mb-3">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <UserIcon className="h-5 w-5 text-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <p className="text-xs text-blue-600 font-medium">{user.role.replace('_', ' ')}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`${
              sidebarCollapsed ? 'w-8 h-8 p-1' : 'w-full px-3 py-2'
            } flex items-center justify-center text-sm font-medium text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors`}
            title={sidebarCollapsed ? 'Logout' : ''}
          >
            <ArrowRightOnRectangleIcon className={`${sidebarCollapsed ? 'h-6 w-6' : 'h-4 w-4 mr-2'}`} />
            {!sidebarCollapsed && 'Logout'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">
                  {getPageTitle()}
                </h1>
                {user?.organizationName && (
                  <p className="text-sm text-gray-600">{user.organizationName}</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-500 hover:bg-gray-100 rounded-md transition-colors relative">
                <BellIcon className="h-5 w-5" />
                {/* Notification badge */}
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </button>
              {user && (
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">
                      {user.firstName} {user.lastName}
                    </span>
                    <p className="text-xs text-gray-500">{user.role.replace('_', ' ')}</p>
                  </div>
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <UserIcon className="h-5 w-5 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
