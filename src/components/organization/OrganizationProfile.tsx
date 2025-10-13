import { useState, useEffect } from 'react';
import { useAppSelector } from '../../store/hooks';
import { 
  useGetOrganizationSettingsQuery,
  useUpdateOrganizationSettingsMutation 
} from '../../store/api/organizationApi';
import { 
  BuildingOfficeIcon, 
  UserGroupIcon,
  CalendarIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { OrganizationSize, Sector } from '../../types';

export default function OrganizationProfile() {
  const { user } = useAppSelector((state) => state.auth);
  const [isEditing, setIsEditing] = useState(false);
  
  // API hooks
  const { 
    data: organizationData, 
    isLoading, 
    error 
  } = useGetOrganizationSettingsQuery(user?.organization?.id || '', {
    skip: !user?.organization?.id
  });

  const [
    updateOrganization, 
    { 
      isLoading: isUpdating, 
      error: updateError 
    }
  ] = useUpdateOrganizationSettingsMutation();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    address: '',
    city: '',
    region: '',
    gpsAddress: '',
    size: 'MEDIUM' as OrganizationSize,
    sector: 'TECHNOLOGY' as Sector,
    isPublic: true
  });

  // Update form data when organization data loads
  useEffect(() => {
    if (organizationData) {
      setFormData({
        name: organizationData.name || '',
        email: organizationData.email || '',
        phone: organizationData.phone || '',
        website: organizationData.website || '',
        description: organizationData.description || '',
        address: organizationData.address || '',
        city: organizationData.city || '',
        region: organizationData.region || '',
        gpsAddress: organizationData.gpsAddress || '',
        size: organizationData.size || 'MEDIUM',
        sector: organizationData.sector || 'TECHNOLOGY',
        isPublic: organizationData.isPublic ?? true
      });
    }
  }, [organizationData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSave = async () => {
    if (!user?.organization?.id) return;
    
    try {
      await updateOrganization({
        organizationId: user.organization.id,
        data: formData
      }).unwrap();
      
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update organization:', error);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    if (organizationData) {
      setFormData({
        name: organizationData.name || '',
        email: organizationData.email || '',
        phone: organizationData.phone || '',
        website: organizationData.website || '',
        description: organizationData.description || '',
        address: organizationData.address || '',
        city: organizationData.city || '',
        region: organizationData.region || '',
        gpsAddress: organizationData.gpsAddress || '',
        size: organizationData.size || 'MEDIUM',
        sector: organizationData.sector || 'TECHNOLOGY',
        isPublic: organizationData.isPublic ?? true
      });
    }
    setIsEditing(false);
  };

  const organizationSizes = [
    { value: 'MICRO', label: 'Micro (1-5 employees)' },
    { value: 'SMALL', label: 'Small (6-50 employees)' },
    { value: 'MEDIUM', label: 'Medium (51-250 employees)' },
    { value: 'LARGE', label: 'Large (251-1000 employees)' },
    { value: 'ENTERPRISE', label: 'Enterprise (1000+ employees)' }
  ];

  const sectors = [
    { value: 'BANKING', label: 'Banking & Finance' },
    { value: 'TELECOMMUNICATIONS', label: 'Telecommunications' },
    { value: 'INSURANCE', label: 'Insurance' },
    { value: 'GOVERNMENT', label: 'Government' },
    { value: 'HEALTHCARE', label: 'Healthcare' },
    { value: 'EDUCATION', label: 'Education' },
    { value: 'ENERGY', label: 'Energy & Utilities' },
    { value: 'MANUFACTURING', label: 'Manufacturing' },
    { value: 'RETAIL', label: 'Retail & Commerce' },
    { value: 'LOGISTICS', label: 'Logistics & Transportation' },
    { value: 'TECHNOLOGY', label: 'Technology & Software' },
    { value: 'NGO', label: 'Non-Governmental Organization' },
    { value: 'OTHER', label: 'Other' }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading organization data
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {'data' in error ? (error.data as any)?.message : 'Failed to load organization information'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <BuildingOfficeIcon className="h-10 w-10 text-gray-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Organization Profile
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Manage your organization's information and settings.
                </p>
              </div>
            </div>
            <div className="flex space-x-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    disabled={isUpdating}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <CheckIcon className="h-4 w-4 mr-1" />
                    {isUpdating ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isUpdating}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <XMarkIcon className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PencilSquareIcon className="h-4 w-4 mr-1" />
                  Edit
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Organization Details */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Organization Details
          </h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Organization Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Organization Name *
              </label>
              <div className="mt-1">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{formData.name || 'Not specified'}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Contact Email *
              </label>
              <div className="mt-1">
                {isEditing ? (
                  <input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{formData.email || 'Not specified'}</p>
                )}
              </div>
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                Phone Number
              </label>
              <div className="mt-1">
                {isEditing ? (
                  <input
                    type="tel"
                    name="phone"
                    id="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+233-20-123-4567"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{formData.phone || 'Not specified'}</p>
                )}
              </div>
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700">
                Website
              </label>
              <div className="mt-1">
                {isEditing ? (
                  <input
                    type="url"
                    name="website"
                    id="website"
                    value={formData.website}
                    onChange={handleInputChange}
                    placeholder="https://www.example.com"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="text-sm text-gray-900">
                    {formData.website ? (
                      <a href={formData.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-500">
                        {formData.website}
                      </a>
                    ) : (
                      'Not specified'
                    )}
                  </p>
                )}
              </div>
            </div>

            {/* Sector */}
            <div>
              <label htmlFor="sector" className="block text-sm font-medium text-gray-700">
                Industry Sector
              </label>
              <div className="mt-1">
                {isEditing ? (
                  <select
                    name="sector"
                    id="sector"
                    value={formData.sector}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    {sectors.map((sector) => (
                      <option key={sector.value} value={sector.value}>
                        {sector.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-gray-900">
                    {sectors.find(s => s.value === formData.sector)?.label || 'Not specified'}
                  </p>
                )}
              </div>
            </div>

            {/* Organization Size */}
            <div>
              <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                Organization Size
              </label>
              <div className="mt-1">
                {isEditing ? (
                  <select
                    name="size"
                    id="size"
                    value={formData.size}
                    onChange={handleInputChange}
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  >
                    {organizationSizes.map((size) => (
                      <option key={size.value} value={size.value}>
                        {size.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <p className="text-sm text-gray-900">
                    {organizationSizes.find(s => s.value === formData.size)?.label || 'Not specified'}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <div className="mt-1">
                {isEditing ? (
                  <textarea
                    name="description"
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Brief description of your organization..."
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{formData.description || 'No description provided'}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Information */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Location Information
          </h3>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {/* Address */}
            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <div className="mt-1">
                {isEditing ? (
                  <input
                    type="text"
                    name="address"
                    id="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="123 Independence Avenue"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{formData.address || 'Not specified'}</p>
                )}
              </div>
            </div>

            {/* City */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                City
              </label>
              <div className="mt-1">
                {isEditing ? (
                  <input
                    type="text"
                    name="city"
                    id="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    placeholder="Accra"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{formData.city || 'Not specified'}</p>
                )}
              </div>
            </div>

            {/* Region */}
            <div>
              <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                Region
              </label>
              <div className="mt-1">
                {isEditing ? (
                  <input
                    type="text"
                    name="region"
                    id="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    placeholder="Greater Accra"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{formData.region || 'Not specified'}</p>
                )}
              </div>
            </div>

            {/* GPS Address */}
            <div>
              <label htmlFor="gpsAddress" className="block text-sm font-medium text-gray-700">
                GPS Address
              </label>
              <div className="mt-1">
                {isEditing ? (
                  <input
                    type="text"
                    name="gpsAddress"
                    id="gpsAddress"
                    value={formData.gpsAddress}
                    onChange={handleInputChange}
                    placeholder="GA-123-4567"
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  />
                ) : (
                  <p className="text-sm text-gray-900">{formData.gpsAddress || 'Not specified'}</p>
                )}
              </div>
            </div>

            {/* Public Organization */}
            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isPublic"
                  id="isPublic"
                  checked={formData.isPublic}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="isPublic" className="ml-2 block text-sm text-gray-900">
                  Public Organization
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Allow your organization to be discovered by other users
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Organization Statistics */}
      {organizationData && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Organization Statistics
            </h3>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="flex items-center">
                <UserGroupIcon className="h-8 w-8 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Members</p>
                  <p className="text-2xl font-semibold text-gray-900">{organizationData.memberCount}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <CalendarIcon className="h-8 w-8 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Created</p>
                  <p className="text-sm text-gray-900">
                    {new Date(organizationData.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <BuildingOfficeIcon className="h-8 w-8 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Status</p>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    organizationData.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {organizationData.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {updateError && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Update Failed
              </h3>
              <p className="mt-1 text-sm text-red-700">
                {'data' in updateError ? (updateError.data as any)?.message : 'Failed to update organization'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}