import { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { getNavigationForRole, type NavigationItem } from '../../config/navigation';
import { UserRole } from '../../types';
import { 
  UserIcon, 
  ShieldCheckIcon, 
  DocumentTextIcon,
  EyeIcon 
} from '@heroicons/react/24/outline';

// Demo component to showcase navigation for different roles
const NavigationDemo = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'END_USER');

  const roles: { role: UserRole; name: string; description: string }[] = [
    {
      role: 'SUPER_ADMIN',
      name: 'Super Admin',
      description: 'Full system access and control'
    },
    {
      role: 'CSA_ADMIN',
      name: 'CSA Admin',
      description: 'Cyber Security Advisor administration'
    },
    {
      role: 'ORG_ADMIN',
      name: 'Organization Admin',
      description: 'Organization-wide administration'
    },
    {
      role: 'ORG_MANAGER',
      name: 'Organization Manager',
      description: 'Team and security management'
    },
    {
      role: 'END_USER',
      name: 'End User',
      description: 'Individual user access'
    }
  ];

  const currentNavigation = getNavigationForRole(selectedRole);

  const renderNavigationPreview = (items: NavigationItem[], level: number = 0) => {
    return (
      <ul className={`${level > 0 ? 'ml-4 mt-2' : ''} space-y-1`}>
        {items.map((item) => {
          const IconComponent = item.icon;
          return (
            <li key={item.name}>
              <div className={`flex items-center p-2 text-sm rounded-lg ${
                level === 0 
                  ? 'bg-gray-50 border border-gray-200' 
                  : 'bg-gray-25 border-l-2 border-gray-300 ml-2'
              }`}>
                <IconComponent className="h-4 w-4 text-gray-500 mr-3" />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{item.name}</div>
                  {item.description && (
                    <div className="text-xs text-gray-500">{item.description}</div>
                  )}
                </div>
                {item.badge && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {item.badge}
                  </span>
                )}
              </div>
              {item.children && item.children.length > 0 && (
                renderNavigationPreview(item.children, level + 1)
              )}
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Navigation System Demo</h1>
        <p className="text-gray-600">
          This demo shows how the side navigation adapts based on user roles. 
          Select different roles to see the available navigation options.
        </p>
      </div>

      {/* Role Selector */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Select User Role</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {roles.map((roleInfo) => (
            <button
              key={roleInfo.role}
              onClick={() => setSelectedRole(roleInfo.role)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                selectedRole === roleInfo.role
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center mb-2">
                <UserIcon className="h-5 w-5 text-gray-500 mr-2" />
                <span className="font-medium text-gray-900">{roleInfo.name}</span>
              </div>
              <p className="text-sm text-gray-600">{roleInfo.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Navigation Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Role Info */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Current Role: {roles.find(r => r.role === selectedRole)?.name}
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-2">
              <ShieldCheckIcon className="h-5 w-5 text-blue-600 mr-2" />
              <span className="font-medium text-blue-900">Role Capabilities</span>
            </div>
            <p className="text-blue-800 text-sm">
              {roles.find(r => r.role === selectedRole)?.description}
            </p>
            <div className="mt-3">
              <span className="text-blue-700 text-sm font-medium">
                Navigation Items: {currentNavigation.length}
              </span>
            </div>
          </div>

          {/* Navigation Stats */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <DocumentTextIcon className="h-8 w-8 text-gray-400 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {currentNavigation.length}
                  </div>
                  <div className="text-sm text-gray-500">Main Items</div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center">
                <EyeIcon className="h-8 w-8 text-gray-400 mr-3" />
                <div>
                  <div className="text-2xl font-bold text-gray-900">
                    {currentNavigation.reduce((acc, item) => 
                      acc + (item.children ? item.children.length : 0), 0
                    )}
                  </div>
                  <div className="text-sm text-gray-500">Sub Items</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Preview */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Available Navigation Items
          </h3>
          <div className="bg-white border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
            {currentNavigation.length > 0 ? (
              renderNavigationPreview(currentNavigation)
            ) : (
              <p className="text-gray-500 text-center py-8">
                No navigation items available for this role.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Implementation Notes */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Implementation Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <ul className="space-y-2">
            <li>• Role-based navigation configuration</li>
            <li>• Hierarchical menu structure with sub-items</li>
            <li>• Active route highlighting</li>
            <li>• Collapsible sidebar with responsive design</li>
          </ul>
          <ul className="space-y-2">
            <li>• Dynamic page titles based on current route</li>
            <li>• Badge support for notifications</li>
            <li>• Tooltips for collapsed sidebar items</li>
            <li>• Consistent visual design with hover states</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NavigationDemo;