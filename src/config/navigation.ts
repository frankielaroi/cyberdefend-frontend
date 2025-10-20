import type { UserRole } from '../types';
import {
  HomeIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  CogIcon,
  ChartBarIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  CreditCardIcon,
  AcademicCapIcon,
  ExclamationTriangleIcon,
  BellIcon,
  EyeIcon,
  UserIcon,
  PencilSquareIcon,
  Cog6ToothIcon,
} from '@heroicons/react/24/outline';

export interface NavigationItem {
  name: string;
  href: string;
  icon: React.ComponentType<any>;
  description?: string;
  badge?: string | number;
  children?: NavigationItem[];
}

export interface RoleNavigation {
  [key: string]: NavigationItem[];
}

// Navigation configuration for each user role
export const navigationConfig: RoleNavigation = {
  SUPER_ADMIN: [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      description: 'System overview and analytics'
    },
    {
      name: 'Admin',
      href: '/dashboard/admin',
      icon: CogIcon,
      description: 'System administration',
      children: [
        {
          name: 'Overview',
          href: '/dashboard/admin/overview',
          icon: ChartBarIcon,
          description: 'Admin dashboard overview'
        },
        {
          name: 'Questions',
          href: '/dashboard/admin/questions',
          icon: DocumentTextIcon,
          description: 'Manage assessment questions'
        },
        {
          name: 'Phishing Dashboard',
          href: '/dashboard/defendxplus/phishing',
          icon: ExclamationTriangleIcon,
          description: 'Phishing campaigns'
        },
         {
          name: 'Template Manager',
          href: '/dashboard/defendxplus/templates',
          icon: DocumentTextIcon,
          description: 'Manage campaign templates'
        }
      ]
    }
  ],
  
  CSA_ADMIN: [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      description: 'CSA overview and analytics'
    },
    {
      name: 'Admin',
      href: '/dashboard/admin',
      icon: CogIcon,
      description: 'CSA administration',
      children: [
        {
          name: 'Overview',
          href: '/dashboard/admin/overview',
          icon: ChartBarIcon,
          description: 'Admin dashboard overview'
        },
        {
          name: 'Questions',
          href: '/dashboard/admin/questions',
          icon: DocumentTextIcon,
          description: 'Manage assessment questions'
        }
      ]
    }
  ],
  
  ORG_ADMIN: [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      description: 'Organization overview'
    },
    {
      name: 'DefendX',
      href: '/dashboard/defendx',
      icon: ShieldCheckIcon,
      description: 'Security assessments',
      children: [
        {
          name: 'Assessment Dashboard',
          href: '/dashboard/defendx',
          icon: ShieldCheckIcon,
          description: 'Main assessment dashboard'
        }
      ]
    },
    {
      name: 'DefendX Plus',
      href: '/dashboard/defendxplus',
      icon: ExclamationTriangleIcon,
      description: 'Advanced security tools',
      children: [
        {
          name: 'Phishing Dashboard',
          href: '/dashboard/defendxplus/phishing',
          icon: ExclamationTriangleIcon,
          description: 'Phishing campaigns'
        },
        {
          name: 'Monitoring',
          href: '/dashboard/defendxplus/monitoring',
          icon: EyeIcon,
          description: 'Security monitoring'
        },
        {
          name: 'Scan Reports',
          href: '/dashboard/defendxplus/scans',
          icon: DocumentTextIcon,
          description: 'Vulnerability scans'
        },
        {
          name: 'Create Campaign',
          href: '/dashboard/defendxplus/campaigns/create',
          icon: DocumentTextIcon,
          description: 'Create new campaign'
        },
        {
          name: 'Template Manager',
          href: '/dashboard/defendxplus/templates',
          icon: DocumentTextIcon,
          description: 'Manage campaign templates'
        }
      ]
    },
    {
      name: 'CSI Directory',
      href: '/csi-directory',
      icon: DocumentTextIcon,
      description: 'Security resources and directory'
    },
    {
      name: 'Organization',
      href: '/dashboard/organization',
      icon: BuildingOfficeIcon,
      description: 'Organization management',
      children: [
        {
          name: 'Organization Profile',
          href: '/dashboard/organization/profile',
          icon: BuildingOfficeIcon,
          description: 'Edit organization details'
        },
        // {
        //   name: 'Organization Settings',
        //   href: '/dashboard/organization/settings',
        //   icon: Cog6ToothIcon,
        //   description: 'Configure organization settings'
        // },
        {
          name: 'User Management',
          href: '/dashboard/organization/users',
          icon: UserGroupIcon,
          description: 'Manage organization users'
        }
      ]
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: UserIcon,
      description: 'User profile management',
      children: [
        {
          name: 'Edit Profile',
          href: '/dashboard/profile/edit',
          icon: PencilSquareIcon,
          description: 'Edit personal information'
        },
        // {
        //   name: 'Account Settings',
        //   href: '/dashboard/profile/settings',
        //   icon: CogIcon,
        //   description: 'Account preferences and security'
        // },
        // {
        //   name: 'Notifications',
        //   href: '/dashboard/profile/notifications',
        //   icon: BellIcon,
        //   description: 'Notification preferences'
        // }
      ]
    },
    {
      name: 'Billing',
      href: '/dashboard/billing',
      icon: CreditCardIcon,
      description: 'Billing and subscription'
    }
  ],
  
  ORG_MANAGER: [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      description: 'Manager overview'
    },
    {
      name: 'DefendX',
      href: '/dashboard/defendx',
      icon: ShieldCheckIcon,
      description: 'Security assessments',
      children: [
        {
          name: 'Assessment Dashboard',
          href: '/dashboard/defendx',
          icon: ShieldCheckIcon,
          description: 'Main assessment dashboard'
        },
        {
          name: 'Start Assessment',
          href: '/dashboard/defendx/assessment/start',
          icon: AcademicCapIcon,
          description: 'Begin new assessment'
        }
      ]
    },
    {
      name: 'DefendX Plus',
      href: '/dashboard/defendxplus',
      icon: ExclamationTriangleIcon,
      description: 'Advanced security tools',
      children: [
        {
          name: 'Phishing Dashboard',
          href: '/dashboard/defendxplus/phishing',
          icon: ExclamationTriangleIcon,
          description: 'Phishing campaigns'
        },
        {
          name: 'Monitoring',
          href: '/dashboard/defendxplus/monitoring',
          icon: EyeIcon,
          description: 'Security monitoring'
        },
        {
          name: 'Scan Reports',
          href: '/dashboard/defendxplus/scans',
          icon: DocumentTextIcon,
          description: 'Vulnerability scans'
        },
        {
          name: 'Create Campaign',
          href: '/dashboard/defendxplus/campaigns/create',
          icon: DocumentTextIcon,
          description: 'Create new campaign'
        },
        {
          name: 'Template Manager',
          href: '/dashboard/defendxplus/templates',
          icon: DocumentTextIcon,
          description: 'Manage campaign templates'
        }
      ]
    },
    {
      name: 'CSI Directory',
      href: '/csi-directory',
      icon: DocumentTextIcon,
      description: 'Security resources and directory'
    },
    {
      name: 'Organization',
      href: '/dashboard/organization',
      icon: BuildingOfficeIcon,
      description: 'Organization management',
      children: [
        {
          name: 'Organization Profile',
          href: '/dashboard/organization/profile',
          icon: BuildingOfficeIcon,
          description: 'Edit organization details'
        },
        {
          name: 'Organization Settings',
          href: '/dashboard/organization/settings',
          icon: Cog6ToothIcon,
          description: 'Configure organization settings'
        },
        {
          name: 'User Management',
          href: '/dashboard/organization/users',
          icon: UserGroupIcon,
          description: 'Manage organization users'
        }
      ]
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: UserIcon,
      description: 'User profile management',
      children: [
        {
          name: 'Edit Profile',
          href: '/dashboard/profile/edit',
          icon: PencilSquareIcon,
          description: 'Edit personal information'
        },
        {
          name: 'Account Settings',
          href: '/dashboard/profile/settings',
          icon: CogIcon,
          description: 'Account preferences and security'
        },
        {
          name: 'Notifications',
          href: '/dashboard/profile/notifications',
          icon: BellIcon,
          description: 'Notification preferences'
        }
      ]
    },
    {
      name: 'Billing',
      href: '/dashboard/billing',
      icon: CreditCardIcon,
      description: 'Billing and subscription'
    }
  ],
  
  END_USER: [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon,
      description: 'My dashboard'
    },
    {
      name: 'CSI Directory',
      href: '/csi-directory',
      icon: DocumentTextIcon,
      description: 'Security resources and directory'
    },
    {
      name: 'Profile',
      href: '/dashboard/profile',
      icon: UserIcon,
      description: 'User profile management',
      children: [
        {
          name: 'Edit Profile',
          href: '/dashboard/profile/edit',
          icon: PencilSquareIcon,
          description: 'Edit personal information'
        },
        // {
        //   name: 'Account Settings',
        //   href: '/dashboard/profile/settings',
        //   icon: CogIcon,
        //   description: 'Account preferences and security'
        // },
        {
          name: 'Notifications',
          href: '/dashboard/profile/notifications',
          icon: BellIcon,
          description: 'Notification preferences'
        }
      ]
    }
  ]
};

// Helper function to get navigation items for a specific role
export const getNavigationForRole = (role: UserRole): NavigationItem[] => {
  return navigationConfig[role] || [];
};

// Helper function to flatten navigation items (including children)
export const getFlatNavigationItems = (items: NavigationItem[]): NavigationItem[] => {
  const flatItems: NavigationItem[] = [];
  
  const addItems = (navItems: NavigationItem[]) => {
    navItems.forEach(item => {
      flatItems.push(item);
      if (item.children) {
        addItems(item.children);
      }
    });
  };
  
  addItems(items);
  return flatItems;
};

// Helper function to check if a path is active
export const isActivePath = (currentPath: string, itemPath: string): boolean => {
  if (itemPath === '/dashboard' && currentPath === '/dashboard') {
    return true;
  }
  if (itemPath !== '/dashboard' && currentPath.startsWith(itemPath)) {
    return true;
  }
  // Special case for defendxplus routes (handle both defendxplus and defendx-plus)
  if (itemPath.includes('/defendxplus/') && currentPath.includes('/defendxplus/')) {
    return currentPath.startsWith(itemPath);
  }
  return false;
};