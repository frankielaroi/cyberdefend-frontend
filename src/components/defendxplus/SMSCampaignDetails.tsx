import React from 'react';
import { useParams } from 'react-router-dom';
import { useGetSMSCampaignResultsQuery } from '../../store/api/realDefendXPlusApi';

const SMSCampaignDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: results, isLoading, error } = useGetSMSCampaignResultsQuery(id || '');

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error || !results?.data) {
    return <div>Error loading campaign details</div>;
  }

  const { overview, timeline, targetPerformance } = results.data;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">SMS Campaign Details</h1>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Targets</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{overview.totalTargets}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">SMS Sent</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{overview.smsSent}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">SMS Delivered</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{overview.smsDelivered}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Links Clicked</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{overview.linksClicked}</p>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Campaign Timeline</h2>
        <div className="flow-root">
          <ul className="-mb-8">
            {timeline.map((event, eventIdx) => (
              <li key={event.timestamp}>
                <div className="relative pb-8">
                  {eventIdx !== timeline.length - 1 ? (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span
                        className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${
                          event.event === 'SMS_QUEUED' ? 'bg-gray-400' :
                          event.event === 'SMS_SENT' ? 'bg-blue-500' :
                          event.event === 'SMS_DELIVERED' ? 'bg-green-500' :
                          event.event === 'SMS_CLICKED' ? 'bg-yellow-500' :
                          'bg-red-500'
                        }`}
                      />
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-gray-500">
                          {event.event.replace('_', ' ')}
                          {event.targetPhone && <span className="font-medium text-gray-900"> - {event.targetPhone}</span>}
                        </p>
                      </div>
                      <div className="text-right text-sm whitespace-nowrap text-gray-500">
                        <time dateTime={event.timestamp}>
                          {new Date(event.timestamp).toLocaleString()}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Target Performance */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Target Performance</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action Time</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {targetPerformance.map((target) => (
                <tr key={target.phoneNumber}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {target.phoneNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {target.firstName} {target.lastName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {target.department || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        !target.delivered ? 'bg-gray-100 text-gray-800' :
                        target.clicked ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      }`}
                    >
                      {!target.delivered ? 'Pending' :
                        target.clicked ? 'Clicked' : 'Delivered'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {target.actionTimestamp ?
                      new Date(target.actionTimestamp).toLocaleString() :
                      '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SMSCampaignDetails;