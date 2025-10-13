import { useState, useEffect } from 'react';
import { useAppSelector } from '../../store/hooks';
import { 
  useGetUserProfileQuery,
  useUpdateUserProfileMutation,
  useChangePasswordMutation,
  useGetUserSecurityQuery,
  useUpdateTwoFactorAuthMutation,
  useTerminateAllSessionsMutation,
  useGetUserPreferencesQuery,
  useUpdateNotificationPreferencesMutation,
  useUpdateAccountPreferencesMutation,
  useUploadAvatarMutation,
  useRemoveAvatarMutation,
  useDeleteAccountMutation
} from '../../store/api/profileApi';
import { 
  UserIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  CalendarIcon,
  PencilSquareIcon,
  CheckIcon,
  XMarkIcon,
  CameraIcon,
  ShieldCheckIcon,
  KeyIcon,
  BellIcon,
  ComputerDesktopIcon,
  ExclamationTriangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

export default function UserProfile() {
  const { user } = useAppSelector((state) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // API hooks
  const { data: profileData, isLoading: profileLoading, error: profileError } = useGetUserProfileQuery();
  const { data: securityData, isLoading: securityLoading } = useGetUserSecurityQuery();
  const { data: preferencesData, isLoading: preferencesLoading } = useGetUserPreferencesQuery();

  const [updateProfile, { isLoading: isUpdatingProfile, error: updateProfileError }] = useUpdateUserProfileMutation();
  const [changePassword, { isLoading: isChangingPassword, error: passwordError }] = useChangePasswordMutation();
  const [updateTwoFactor, { isLoading: isUpdatingTwoFactor }] = useUpdateTwoFactorAuthMutation();
  const [terminateAllSessions, { isLoading: isTerminating }] = useTerminateAllSessionsMutation();
  const [updateNotifications, { isLoading: isUpdatingNotifications }] = useUpdateNotificationPreferencesMutation();
  const [updateAccount, { isLoading: isUpdatingAccount }] = useUpdateAccountPreferencesMutation();
  const [uploadAvatar, { isLoading: isUploadingAvatar }] = useUploadAvatarMutation();
  const [removeAvatar, { isLoading: isRemovingAvatar }] = useRemoveAvatarMutation();
  const [deleteAccount, { isLoading: isDeletingAccount }] = useDeleteAccountMutation();

  const [profileForm, setProfileForm] = useState({
    firstName: '',
    lastName: '',
    phone: ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [deleteForm, setDeleteForm] = useState({
    password: '',
    reason: '',
    confirmation: ''
  });

  // Update form data when profile loads
  useEffect(() => {
    if (profileData) {
      setProfileForm({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        phone: profileData.phone || ''
      });
    }
  }, [profileData]);

  const handleProfileSave = async () => {
    try {
      await updateProfile(profileForm).unwrap();
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  const handlePasswordChange = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    try {
      await changePassword(passwordForm).unwrap();
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      alert('Password changed successfully');
    } catch (error) {
      console.error('Failed to change password:', error);
    }
  };

  const handleToggleTwoFactor = async () => {
    if (!securityData) return;

    try {
      await updateTwoFactor({
        enabled: !securityData.twoFactorEnabled,
        phoneNumber: profileData?.phone
      }).unwrap();
    } catch (error) {
      console.error('Failed to update two-factor auth:', error);
    }
  };

  const handleTerminateSessions = async () => {
    if (window.confirm('Are you sure you want to terminate all other sessions? You will remain logged in on this device.')) {
      try {
        await terminateAllSessions().unwrap();
        alert('All other sessions have been terminated');
      } catch (error) {
        console.error('Failed to terminate sessions:', error);
      }
    }
  };

  const handleNotificationUpdate = async (key: string, value: boolean) => {
    try {
      await updateNotifications({ [key]: value }).unwrap();
    } catch (error) {
      console.error('Failed to update notifications:', error);
    }
  };

  const handleAccountUpdate = async (key: string, value: string) => {
    try {
      await updateAccount({ [key]: value }).unwrap();
    } catch (error) {
      console.error('Failed to update account settings:', error);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Convert to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const base64Data = base64String.split(',')[1]; // Remove data:image/...;base64, prefix

      try {
        await uploadAvatar({
          avatarData: base64Data,
          fileName: file.name
        }).unwrap();
      } catch (error) {
        console.error('Failed to upload avatar:', error);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    if (window.confirm('Are you sure you want to remove your profile picture?')) {
      try {
        await removeAvatar().unwrap();
      } catch (error) {
        console.error('Failed to remove avatar:', error);
      }
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteForm.confirmation !== 'DELETE MY ACCOUNT') {
      alert('Please type "DELETE MY ACCOUNT" to confirm');
      return;
    }

    try {
      await deleteAccount(deleteForm).unwrap();
      alert('Account deletion initiated. You will receive a confirmation email.');
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Failed to delete account:', error);
    }
  };

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'preferences', name: 'Preferences', icon: BellIcon },
    { id: 'account', name: 'Account', icon: ComputerDesktopIcon }
  ];

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-md p-4">
        <div className="flex">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading profile
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {'data' in profileError ? (profileError.data as any)?.message : 'Failed to load user profile'}
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
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="relative">
                {profileData?.avatar ? (
                  <img
                    className="h-20 w-20 rounded-full"
                    src={profileData.avatar}
                    alt={`${profileData.firstName} ${profileData.lastName}`}
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                    <UserIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-0 right-0">
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <div className="bg-blue-600 rounded-full p-1 text-white hover:bg-blue-700">
                      <CameraIcon className="h-4 w-4" />
                    </div>
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {profileData?.firstName} {profileData?.lastName}
              </h1>
              <p className="text-sm text-gray-500">{profileData?.email}</p>
              <p className="text-sm text-gray-500">
                {profileData?.organization?.name} • {profileData?.role?.replace('_', ' ')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm flex items-center`}
                >
                  <Icon className="h-5 w-5 mr-2" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-6">
          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <PencilSquareIcon className="h-4 w-4 mr-1" />
                    Edit
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleProfileSave}
                      disabled={isUpdatingProfile}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                    >
                      <CheckIcon className="h-4 w-4 mr-1" />
                      {isUpdatingProfile ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">First Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, firstName: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{profileData?.firstName || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Last Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, lastName: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{profileData?.lastName || 'Not specified'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{profileData?.email}</p>
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <p className="mt-1 text-sm text-gray-900">{profileData?.phone || 'Not specified'}</p>
                  )}
                </div>
              </div>

              {updateProfileError && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-700">
                    {'data' in updateProfileError ? (updateProfileError.data as any)?.message : 'Failed to update profile'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Security Tab */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>

              {/* Password */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Password</h4>
                    <p className="text-sm text-gray-500">
                      Last changed: {securityData?.lastPasswordChange ? new Date(securityData.lastPasswordChange).toLocaleDateString() : 'Never'}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <KeyIcon className="h-4 w-4 mr-1" />
                    Change Password
                  </button>
                </div>
              </div>

              {/* Two-Factor Authentication */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">
                      {securityData?.twoFactorEnabled ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleTwoFactor}
                    disabled={isUpdatingTwoFactor}
                    className={`inline-flex items-center px-3 py-2 border text-sm leading-4 font-medium rounded-md ${
                      securityData?.twoFactorEnabled
                        ? 'border-red-300 text-red-700 bg-white hover:bg-red-50'
                        : 'border-green-300 text-green-700 bg-white hover:bg-green-50'
                    }`}
                  >
                    {isUpdatingTwoFactor ? 'Updating...' : securityData?.twoFactorEnabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Active Sessions</h4>
                    <p className="text-sm text-gray-500">
                      {securityData?.activeSessions} active sessions
                    </p>
                  </div>
                  <button
                    onClick={handleTerminateSessions}
                    disabled={isTerminating}
                    className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                  >
                    {isTerminating ? 'Terminating...' : 'Terminate All Others'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Preferences Tab */}
          {activeTab === 'preferences' && preferencesData && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Notification Preferences</h3>

              <div className="space-y-4">
                {Object.entries(preferencesData.notifications).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-gray-900 capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </label>
                    </div>
                    <button
                      onClick={() => handleNotificationUpdate(key, !value)}
                      disabled={isUpdatingNotifications}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                        value ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          value ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>

              <hr />

              <h3 className="text-lg font-medium text-gray-900">Account Preferences</h3>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Language</label>
                  <select
                    value={preferencesData.account.language}
                    onChange={(e) => handleAccountUpdate('language', e.target.value)}
                    disabled={isUpdatingAccount}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="en">English</option>
                    <option value="tw">Twi</option>
                    <option value="fr">French</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Theme</label>
                  <select
                    value={preferencesData.account.theme}
                    onChange={(e) => handleAccountUpdate('theme', e.target.value)}
                    disabled={isUpdatingAccount}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Timezone</label>
                  <select
                    value={preferencesData.account.timezone}
                    onChange={(e) => handleAccountUpdate('timezone', e.target.value)}
                    disabled={isUpdatingAccount}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Africa/Accra">Africa/Accra</option>
                    <option value="UTC">UTC</option>
                    <option value="America/New_York">America/New_York</option>
                    <option value="Europe/London">Europe/London</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Date Format</label>
                  <select
                    value={preferencesData.account.dateFormat}
                    onChange={(e) => handleAccountUpdate('dateFormat', e.target.value)}
                    disabled={isUpdatingAccount}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Account Tab */}
          {activeTab === 'account' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Account Management</h3>

              {/* Avatar Management */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Profile Picture</h4>
                    <p className="text-sm text-gray-500">Update your profile picture</p>
                  </div>
                  <div className="flex space-x-2">
                    <label htmlFor="avatar-upload-2" className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      <CameraIcon className="h-4 w-4 mr-1" />
                      {isUploadingAvatar ? 'Uploading...' : 'Upload'}
                      <input
                        id="avatar-upload-2"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </label>
                    {profileData?.avatar && (
                      <button
                        onClick={handleRemoveAvatar}
                        disabled={isRemovingAvatar}
                        className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        {isRemovingAvatar ? 'Removing...' : 'Remove'}
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Deletion */}
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-red-900">Delete Account</h4>
                    <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                  </div>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="inline-flex items-center px-3 py-2 border border-red-300 text-sm leading-4 font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4 mr-1" />
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Password Change Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Change Password</h3>
                <button
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Password</label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">New Password</label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirm New Password</label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {passwordError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-700">
                      {'data' in passwordError ? (passwordError.data as any)?.message : 'Failed to change password'}
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    disabled={isChangingPassword || !passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-red-900">Delete Account</h3>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-sm text-red-700">
                    This action cannot be undone. All your data will be permanently deleted.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    value={deleteForm.password}
                    onChange={(e) => setDeleteForm(prev => ({ ...prev, password: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Reason (Optional)</label>
                  <textarea
                    value={deleteForm.reason}
                    onChange={(e) => setDeleteForm(prev => ({ ...prev, reason: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type "DELETE MY ACCOUNT" to confirm
                  </label>
                  <input
                    type="text"
                    value={deleteForm.confirmation}
                    onChange={(e) => setDeleteForm(prev => ({ ...prev, confirmation: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeletingAccount || !deleteForm.password || deleteForm.confirmation !== 'DELETE MY ACCOUNT'}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeletingAccount ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}