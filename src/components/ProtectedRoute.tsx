import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import type { UserRole } from '../types';

interface Props {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredFeatures?: string[]; // Features that must be present in user's subscription
}

export default function ProtectedRoute({ children, allowedRoles, requiredFeatures }: Props) {
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  // Check if user has required features
  if (requiredFeatures && requiredFeatures.length > 0) {
    const userFeatures = user.features || {};
    const hasRequiredFeatures = requiredFeatures.some(feature => {
      // Check if the feature exists in any category
      return Object.values(userFeatures).some((categoryFeatures: string[]) => 
        categoryFeatures.includes(feature)
      );
    });

    if (!hasRequiredFeatures) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
}
