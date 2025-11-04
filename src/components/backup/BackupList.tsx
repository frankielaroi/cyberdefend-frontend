import React, { useState } from 'react';
import { 
  useGetOrganizationBackupsQuery,
  useLazyGetBackupDownloadUrlQuery,
  useDeleteBackupMutation
} from '../../store/api/backupApi';
import type { Backup } from '../../store/api/backupApi';
import { RegisterAgent } from './RegisterAgent';

export const BackupList: React.FC = () => {
  const [isRegisterAgentOpen, setIsRegisterAgentOpen] = useState(false);
  
  // Get organization backups
  const { data: backups, isLoading, error: fetchError } = useGetOrganizationBackupsQuery();
  
  // Delete mutation
  const [deleteBackup, { isLoading: isDeleting }] = useDeleteBackupMutation();
  
  // Lazy query for download URL
  const [getDownloadUrl, { isLoading: isDownloading }] = useLazyGetBackupDownloadUrlQuery();

  // Log API request status
  React.useEffect(() => {
    console.log('Backup List Status:', { 
      isLoading, 
      isDeleting,
      isDownloading,
      error: fetchError, 
      backupsCount: backups?.length 
    });
  }, [isLoading, isDeleting, isDownloading, fetchError, backups]);

  const handleDownload = async (backup: Backup) => {
    try {
      const result = await getDownloadUrl({
        backupId: backup.id,
        s3Key: backup.s3Key,
        s3Bucket: backup.s3Bucket
      });
      
      if (result.data?.downloadUrl) {
        // Open in new tab
        window.open(result.data.downloadUrl, '_blank');
      } else {
        console.error('No download URL in response:', result);
      }
    } catch (err) {
      console.error('Failed to generate download link:', err);
    }
  };

  const handleDelete = async (backup: Backup) => {
    if (!window.confirm('Are you sure you want to delete this backup?')) {
      return;
    }

    try {
      const result = await deleteBackup({
        backupId: backup.id,
        organizationId: backup.organizationId
      }).unwrap();
      console.log(result.message); // Log success message
    } catch (err) {
      console.error('Failed to delete backup:', err);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatSize = (bytes: number) => {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(2)} ${units[unitIndex]}`;
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Organization Backups
          </h2>
          <p className="text-slate-400">Secure and manage your organization's data backups</p>
        </div>
        <button
          onClick={() => setIsRegisterAgentOpen(true)}
          className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-blue-500/25"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity rounded-xl" />
          Add Backup Agent
        </button>
      </div>

      {/* Register Agent Modal */}
      {isRegisterAgentOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 rounded-2xl border border-slate-700/50 p-6 w-full max-w-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Register New Agent
              </h2>
              <button
                onClick={() => setIsRegisterAgentOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            <RegisterAgent
              organizationId={backups?.[0]?.organizationId || ''}
              onSuccess={() => setIsRegisterAgentOpen(false)}
            />
          </div>
        </div>
      )}
      
      {Boolean(fetchError) && (
        <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-400 px-4 py-3 rounded-xl mb-4" role="alert">
          <span>An error occurred while fetching backups</span>
        </div>
      )}

      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
        <table className="min-w-full divide-y divide-slate-700/50">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">File Name</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Size</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Created At</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {backups?.map((backup) => (
              <tr key={backup.id} className="hover:bg-slate-700/20 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-300">{backup.originalName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-400">{formatSize(backup.size)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                    ${backup.job.status === 'COMPLETED' ? 'bg-green-500/20 text-green-400 border border-green-500/30' :
                      backup.job.status === 'FAILED' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                      backup.job.status === 'RUNNING' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                      'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'}`}>
                    {backup.job.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-400">{formatDate(backup.createdAt)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-4">
                  <button
                    onClick={() => handleDownload(backup)}
                    disabled={backup.job.status !== 'COMPLETED' || isDownloading}
                    className="text-blue-400 hover:text-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDownloading ? 'Generating...' : 'Download'}
                  </button>
                  <button
                    onClick={() => handleDelete(backup)}
                    disabled={isDeleting}
                    className="text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </td>
              </tr>
            ))}
            {(!backups || backups.length === 0) && (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center">
                    <div className="mb-4">
                      <svg className="w-12 h-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium">No backups found</p>
                    <p className="mt-1 text-sm text-slate-500">Start by adding a backup agent to protect your data</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};