import { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { 
  useGetOrganizationMembersQuery,
  useInviteMemberMutation,
  useUpdateMemberRoleMutation,
  useRemoveMemberMutation
} from '../../store/api/organizationApi';
import { 
  UserGroupIcon, 
  PlusIcon, 
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { UserRole } from '../../types';

interface InviteFormData {
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  message: string;
}

export default function UserManagement() {
  const { user } = useAppSelector((state) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [editingMemberId, setEditingMemberId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('END_USER');

  // API hooks
  const { 
    data: members = [], 
    isLoading, 
    error 
  } = useGetOrganizationMembersQuery(user?.organization?.id || '', {
    skip: !user?.organization?.id
  });

  const [inviteMember, { isLoading: isInviting, error: inviteError }] = useInviteMemberMutation();
  const [updateMemberRole, { isLoading: isUpdating }] = useUpdateMemberRoleMutation();
  const [removeMember, { isLoading: isRemoving }] = useRemoveMemberMutation();

  const [inviteForm, setInviteForm] = useState<InviteFormData>({
    email: '',
    firstName: '',
    lastName: '',
    role: 'END_USER',
    message: ''
  });

  const filteredMembers = members.filter(member => 
    member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInviteUser = async () => {
    if (!user?.organization?.id) return;

    try {
      await inviteMember({
        organizationId: user.organization.id,
        data: inviteForm
      }).unwrap();
      
      setShowInviteModal(false);
      setInviteForm({
        email: '',
        firstName: '',
        lastName: '',
        role: 'END_USER',
        message: ''
      });
    } catch (error) {
      console.error('Failed to invite user:', error);
    }
  };

  const handleUpdateRole = async (memberId: string) => {
    if (!user?.organization?.id) return;

    try {
      await updateMemberRole({
        organizationId: user.organization.id,
        memberId,
        data: { role: newRole }
      }).unwrap();
      
      setEditingMemberId(null);
    } catch (error) {
      console.error('Failed to update member role:', error);
    }
  };

  const handleRemoveUser = async (memberId: string, memberName: string) => {
    if (!user?.organization?.id) return;

    const reason = prompt(
      `Please provide a reason for removing ${memberName} from the organization:`
    );
    
    if (reason === null) return; // User cancelled

    if (window.confirm(`Are you sure you want to remove ${memberName}?`)) {
      try {
        await removeMember({
          organizationId: user.organization.id,
          memberId,
          data: { reason }
        }).unwrap();
      } catch (error) {
        console.error('Failed to remove member:', error);
      }
    }
  };

  const getRoleDisplay = (role: UserRole) => {
    switch (role) {
      case 'ORG_ADMIN': return 'Organization Admin';
      case 'ORG_MANAGER': return 'Organization Manager';
      case 'END_USER': return 'End User';
      case 'SUPER_ADMIN': return 'Super Admin';
      case 'CSA_ADMIN': return 'CSA Admin';
      default: return role;
    }
  };

  const getRoleColor = (role: UserRole) => {
    switch (role) {
      case 'ORG_ADMIN': return 'bg-purple-100 text-purple-800';
      case 'ORG_MANAGER': return 'bg-blue-100 text-blue-800';
      case 'END_USER': return 'bg-green-100 text-green-800';
      case 'SUPER_ADMIN': return 'bg-red-100 text-red-800';
      case 'CSA_ADMIN': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'INACTIVE': return 'bg-red-100 text-red-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canManageMembers = user?.role === 'ORG_ADMIN' || user?.role === 'ORG_MANAGER';
  const canRemoveMembers = user?.role === 'ORG_ADMIN';

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
              Error loading members
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {'data' in error ? (error.data as any)?.message : 'Failed to load organization members'}
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
                <UserGroupIcon className="h-10 w-10 text-gray-400" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  User Management
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Manage organization members, roles, and permissions.
                </p>
              </div>
            </div>
            {canManageMembers && (
              <button
                onClick={() => setShowInviteModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Invite Member
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <div className="relative">
                <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search members..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Members List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Organization Members ({filteredMembers.length})
          </h3>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Member
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  {(canManageMembers || canRemoveMembers) && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {member.firstName[0]}{member.lastName[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {member.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingMemberId === member.id ? (
                        <div className="flex items-center space-x-2">
                          <select
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value as UserRole)}
                            className="text-sm border border-gray-300 rounded-md px-2 py-1"
                          >
                            <option value="END_USER">End User</option>
                            <option value="ORG_MANAGER">Organization Manager</option>
                            {user?.role === 'ORG_ADMIN' && (
                              <option value="ORG_ADMIN">Organization Admin</option>
                            )}
                          </select>
                          <button
                            onClick={() => handleUpdateRole(member.id)}
                            disabled={isUpdating}
                            className="text-green-600 hover:text-green-900"
                          >
                            <CheckIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingMemberId(null)}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRoleColor(member.role)}`}>
                          {getRoleDisplay(member.role)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.status)}`}>
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.lastActiveAt ? new Date(member.lastActiveAt).toLocaleDateString() : 'Never'}
                    </td>
                    {(canManageMembers || canRemoveMembers) && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          {canManageMembers && user?.role === 'ORG_ADMIN' && member.role !== 'ORG_ADMIN' && (
                            <button
                              onClick={() => {
                                setEditingMemberId(member.id);
                                setNewRole(member.role);
                              }}
                              className="text-blue-600 hover:text-blue-900"
                              title="Edit Role"
                            >
                              <PencilSquareIcon className="h-4 w-4" />
                            </button>
                          )}
                          {canRemoveMembers && member.id !== user?.id && (
                            <button
                              onClick={() => handleRemoveUser(member.id, `${member.firstName} ${member.lastName}`)}
                              disabled={isRemoving}
                              className="text-red-600 hover:text-red-900"
                              title="Remove Member"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMembers.length === 0 && (
            <div className="text-center py-8">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No members found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria.' : 'Get started by inviting the first member.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Invite New Member</h3>
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    value={inviteForm.firstName}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    value={inviteForm.lastName}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                    Role
                  </label>
                  <select
                    id="role"
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value as UserRole }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="END_USER">End User</option>
                    <option value="ORG_MANAGER">Organization Manager</option>
                    {user?.role === 'ORG_ADMIN' && (
                      <option value="ORG_ADMIN">Organization Admin</option>
                    )}
                  </select>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                    Welcome Message (Optional)
                  </label>
                  <textarea
                    id="message"
                    rows={3}
                    value={inviteForm.message}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, message: e.target.value }))}
                    placeholder="Welcome to our cybersecurity team!"
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {inviteError && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-3">
                    <p className="text-sm text-red-700">
                      {'data' in inviteError ? (inviteError.data as any)?.message : 'Failed to send invitation'}
                    </p>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleInviteUser}
                    disabled={isInviting || !inviteForm.email || !inviteForm.firstName || !inviteForm.lastName}
                    className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isInviting ? 'Sending...' : 'Send Invitation'}
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