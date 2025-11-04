import React, { useState } from 'react';
import { useCreateAgentMutation } from '../../store/api/backupApi';

interface RegisterAgentProps {
  organizationId: string;
  onSuccess?: () => void;
  
}

export const RegisterAgent: React.FC<RegisterAgentProps> = ({ organizationId, onSuccess }) => {
  const [createAgent, { isLoading, error }] = useCreateAgentMutation();
  const [agentName, setAgentName] = useState('');

  const downloadAgentInfo = (agentInfo: any) => {
    // Create formatted content
    const content = `Backup Agent Information
========================
ID: ${agentInfo.id}
Name: ${agentInfo.name}
Token: ${agentInfo.token}
Organization ID: ${agentInfo.organizationId}
Created At: ${new Date(agentInfo.createdAt).toLocaleString()}
Updated At: ${new Date(agentInfo.updatedAt).toLocaleString()}

IMPORTANT: Please save this information securely. 
The token will not be shown again after this download.
`;

    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-${agentInfo.name}-credentials.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await createAgent({
        name: agentName,
        organizationId,
      }).unwrap();
      
      // Download the agent information
      downloadAgentInfo(result);
      
      setAgentName('');
      onSuccess?.();
    } catch (err) {
      console.error('Failed to register agent:', err);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="agentName" className="block text-sm font-medium text-slate-300 mb-2">
            Agent Name
          </label>
          <input
            type="text"
            id="agentName"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            className="block w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white placeholder-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            placeholder="Enter agent name..."
            required
          />
        </div>

        {Boolean(error) && (
          <div className="bg-red-500/10 backdrop-blur-sm border border-red-500/20 rounded-xl px-4 py-3">
            <p className="text-red-400 text-sm">
              Failed to register agent. Please try again.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity rounded-xl" />
          {isLoading ? 'Registering Agent...' : 'Register Agent'}
        </button>
      </form>
      
      <div className="border-t border-slate-700/50 pt-4">
        <p className="text-sm text-slate-400 text-center">
          After registration, you'll receive secure credentials for your new backup agent
        </p>
      </div>
    </div>
  );
};