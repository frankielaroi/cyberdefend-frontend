import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { getNavigationForRole, isActivePath, type NavigationItem } from '../../config/navigation';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

interface SideNavigationProps {
  collapsed: boolean;
}

const SideNavigation: React.FC<SideNavigationProps> = ({ collapsed }) => {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const navigationItems = user ? getNavigationForRole(user.role) : [];

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isExpanded = (itemName: string) => expandedItems.includes(itemName);

  const renderNavigationItem = (item: NavigationItem, level: number = 0) => {
    const isActive = isActivePath(location.pathname, item.href);
    const hasChildren = item.children && item.children.length > 0;
    const itemExpanded = isExpanded(item.name);
    const IconComponent = item.icon;

    // Check if any child is active to highlight parent
    const hasActiveChild = hasChildren && item.children?.some(child => 
      isActivePath(location.pathname, child.href)
    );

    const isItemActive = isActive || hasActiveChild;

    return (
      <div key={item.name} className={`${level > 0 ? 'ml-4' : ''}`}>
        <div className="relative">
          {hasChildren ? (
            <button
              onClick={() => toggleExpanded(item.name)}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isItemActive
                  ? 'bg-blue-900/30 text-blue-400 border-r-2 border-blue-400'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title={collapsed ? item.name : ''}
            >
              <div className="flex items-center">
                <IconComponent 
                  className={`${collapsed ? 'h-6 w-6' : 'h-5 w-5'} ${
                    isItemActive ? 'text-blue-400' : 'text-slate-400'
                  }`} 
                />
                {!collapsed && (
                  <span className="ml-3 truncate">{item.name}</span>
                )}
              </div>
              {!collapsed && (
                <div className="flex items-center space-x-1">
                  {item.badge && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-100">
                      {item.badge}
                    </span>
                  )}
                  {itemExpanded ? (
                    <ChevronDownIcon className="h-4 w-4 text-slate-400" />
                  ) : (
                    <ChevronRightIcon className="h-4 w-4 text-slate-400" />
                  )}
                </div>
              )}
            </button>
          ) : (
            <Link
              to={item.href}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-900/30 text-blue-400 border-r-2 border-blue-400'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
              title={collapsed ? item.name : item.description}
            >
              <IconComponent 
                className={`${collapsed ? 'h-6 w-6' : 'h-5 w-5'} ${
                  isActive ? 'text-blue-400' : 'text-slate-400'
                }`} 
              />
              {!collapsed && (
                <div className="ml-3 flex-1 min-w-0">
                  <span className="truncate">{item.name}</span>
                  {item.description && (
                    <p className="text-xs text-slate-400 truncate">{item.description}</p>
                  )}
                </div>
              )}
              {!collapsed && item.badge && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-900 text-red-100">
                  {item.badge}
                </span>
              )}
            </Link>
          )}
        </div>

        {/* Render children if expanded */}
        {hasChildren && (itemExpanded || collapsed) && !collapsed && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}

        {/* Show tooltip for collapsed menu with children */}
        {collapsed && hasChildren && (
          <div className="absolute left-full top-0 ml-2 invisible group-hover:visible z-50">
            <div className="bg-slate-800 border border-slate-600 text-white text-xs rounded-lg py-2 px-3 shadow-xl">
              <div className="font-medium">{item.name}</div>
              <div className="mt-1 space-y-1">
                {item.children?.map(child => (
                  <Link
                    key={child.name}
                    to={child.href}
                    className="block text-slate-300 hover:text-blue-400"
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
      {/* Role Badge */}
      {!collapsed && user && (
        <div className="mb-4 px-3 py-2 bg-slate-700 rounded-lg border border-slate-600">
          <div className="text-xs font-medium text-slate-400 uppercase tracking-wide">
            Current Role
          </div>
          <div className="text-sm font-semibold text-white mt-1">
            {user.role.replace('_', ' ')}
          </div>
          {user.organizationName && (
            <div className="text-xs text-slate-300 truncate">
              {user.organizationName}
            </div>
          )}
        </div>
      )}

      {/* Navigation Items */}
      <div className="space-y-1">
        {navigationItems.map(item => renderNavigationItem(item))}
      </div>

      {/* Collapsed Role Indicator */}
      {collapsed && user && (
        <div className="mt-4 px-3 py-2 text-center">
          <div className="w-8 h-8 bg-blue-900/30 rounded-full flex items-center justify-center mx-auto">
            <span className="text-xs font-bold text-blue-400">
              {user.role.charAt(0)}
            </span>
          </div>
        </div>
      )}

      {/* Quick Actions for Collapsed Mode */}
      {collapsed && (
        <div className="mt-4 pt-4 border-t border-slate-700">
          <div className="text-center text-xs text-slate-400 mb-2">
            Quick Access
          </div>
          <div className="space-y-2">
            {navigationItems.slice(0, 3).map(item => {
              const IconComponent = item.icon;
              const isActive = isActivePath(location.pathname, item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`block p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-900/30 text-blue-400'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700'
                  }`}
                  title={item.name}
                >
                  <IconComponent className="h-6 w-6 mx-auto" />
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
};

export default SideNavigation;