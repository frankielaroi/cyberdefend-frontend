import React from 'react';
import { useGetOrganizationAgentsQuery } from '../../store/api/backupApi';
import { format } from 'date-fns';

export const BackupAgentList: React.FC = () => {
  // TODO: Get this from user context or URL params
  const organizationId = '123'; // Placeholder - replace with actual org ID
  const { data: agents, isLoading, error } = useGetOrganizationAgentsQuery({ organizationId });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 text-red-400 px-4 py-3 rounded-xl" role="alert">
        <span>Failed to load backup agents</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
            Backup Agents
          </h2>
          <p className="text-slate-400">Manage your organization's backup agents</p>
        </div>
      </div>

      <div className="bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden">
        <table className="min-w-full divide-y divide-slate-700/50">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Agent Name</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Last Updated</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {agents?.map((agent) => (
              <tr key={agent.id} className="hover:bg-slate-700/20 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-8 w-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {agent.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-slate-300">{agent.name}</div>
                      <div className="text-sm text-slate-500">ID: {agent.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-400">
                    {format(new Date(agent.createdAt), 'MMM d, yyyy HH:mm')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-slate-400">
                    {format(new Date(agent.updatedAt), 'MMM d, yyyy HH:mm')}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                    Active
                  </span>
                </td>
              </tr>
            ))}
            {(!agents || agents.length === 0) && (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center">
                    <div className="mb-4">
                      <svg className="w-12 h-12 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <p className="text-lg font-medium">No backup agents found</p>
                    <p className="mt-1 text-sm text-slate-500">Add a backup agent to start protecting your data</p>
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