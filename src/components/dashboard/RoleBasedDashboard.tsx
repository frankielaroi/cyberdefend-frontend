import { useAppSelector } from '../../store/hooks';
import AdminDashboard from '../admin/AdminDashboard';
import OrganizationManagerDashboard from './OrganizationManagerDashboard';
import EndUserDashboard from './EndUserDashboard';
import type { UserRole } from '../../types';

export default function RoleBasedDashboard() {
  const user = useAppSelector((state) => state.auth.user);
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-slate-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const renderDashboard = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
      case 'CSA_ADMIN':
        return <AdminDashboard />;
      
      case 'ORG_ADMIN':
      case 'ORG_MANAGER':
        return <OrganizationManagerDashboard />;
      
      case 'END_USER':
        return <EndUserDashboard />;
      
      default:
        // Fallback to Organization Manager dashboard for unknown roles
        return <OrganizationManagerDashboard />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderDashboard(user.role)}
    </div>
  );
}