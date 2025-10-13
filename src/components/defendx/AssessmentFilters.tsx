import { useState } from 'react';
import { useGetOrganizationAssessmentsQuery } from '../../store/api/defendxApi';
import { AssessmentHistoryParams } from '../../store/api/realDefendXApi';
import { Filter, RefreshCw } from 'lucide-react';

interface AssessmentFiltersProps {
  // Props interface - organizationId could be used for future filtering
}

/**
 * Example component demonstrating proper query parameter handling
 * following the best practices from the solution guide
 */
export default function AssessmentFilters({}: AssessmentFiltersProps) {
  // State for filter form
  const [filters, setFilters] = useState<AssessmentHistoryParams>({
    page: 1,
    limit: 10,
    status: undefined,
    type: undefined,
    startDate: '',
    endDate: ''
  });

  // Using RTK Query with proper parameter handling - this automatically
  // converts to URLSearchParams correctly, no manual spreading needed
  const { 
    data: assessments, 
    isLoading, 
    error, 
    refetch 
  } = useGetOrganizationAssessmentsQuery(filters);

  /**
   * ✅ CORRECT: Proper filter update function
   * This ensures we pass clean parameters to the API
   */
  const updateFilters = (newFilters: Partial<AssessmentHistoryParams>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      page: 1 // Reset to first page when filters change
    }));
  };

  /**
   * ✅ CORRECT: Input validation before API call
   * This prevents invalid data from being sent to backend
   */
  const validateAndUpdateFilters = (newFilters: Partial<AssessmentHistoryParams>) => {
    const validatedFilters: Partial<AssessmentHistoryParams> = {};

    // Only include non-empty values
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        (validatedFilters as any)[key] = value;
      }
    });

    updateFilters(validatedFilters);
  };

  const handleStatusChange = (status: string) => {
    validateAndUpdateFilters({
      status: status === 'all' ? undefined : status as any
    });
  };

  const handleTypeChange = (type: string) => {
    validateAndUpdateFilters({
      type: type === 'all' ? undefined : type as any
    });
  };

  const handleDateRangeChange = (startDate: string, endDate: string) => {
    validateAndUpdateFilters({
      startDate: startDate || undefined,
      endDate: endDate || undefined
    });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= (assessments?.pagination?.totalPages || 1)) {
      updateFilters({ page });
    }
  };

  const handleLimitChange = (limit: number) => {
    if (limit >= 1 && limit <= 100) {
      updateFilters({ limit, page: 1 });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-slate-600" />
            <h2 className="text-lg font-semibold text-slate-900">Assessment Filters</h2>
          </div>
          <button
            onClick={() => refetch()}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Status
          </label>
          <select
            value={filters.status || 'all'}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="EXPIRED">Expired</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>

        {/* Type Filter */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Assessment Type
          </label>
          <select
            value={filters.type || 'all'}
            onChange={(e) => handleTypeChange(e.target.value)}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Types</option>
            <option value="CSI_ASSESSMENT">CSI Assessment</option>
            <option value="COMPLIANCE_CHECK">Compliance Check</option>
            <option value="SECURITY_AUDIT">Security Audit</option>
            <option value="BASELINE_ASSESSMENT">Baseline Assessment</option>
          </select>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleDateRangeChange(e.target.value, filters.endDate || '')}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleDateRangeChange(filters.startDate || '', e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Results per page */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Results per page
          </label>
          <select
            value={filters.limit || 10}
            onChange={(e) => handleLimitChange(parseInt(e.target.value))}
            className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      {/* Results Section */}
      <div className="border-t border-slate-200">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Assessment Results
            </h3>
            {assessments?.pagination && (
              <span className="text-sm text-slate-600">
                {assessments.pagination.total} total assessments
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="text-center py-8 text-slate-600">
              Loading assessments...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-600">
              Error loading assessments. Please try again.
            </div>
          ) : assessments?.data && assessments.data.length > 0 ? (
            <div className="space-y-3">
              {assessments.data.map((assessment) => (
                <div
                  key={assessment.id}
                  className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium text-slate-900">
                        Assessment #{assessment.id}
                      </h4>
                      <p className="text-sm text-slate-600">
                        Started: {new Date(assessment.startedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        assessment.status === 'COMPLETED' 
                          ? 'bg-green-100 text-green-700' 
                          : assessment.status === 'IN_PROGRESS'
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {assessment.status === 'COMPLETED' ? 'Completed' 
                          : assessment.status === 'IN_PROGRESS' ? 'In Progress'
                          : assessment.status === 'DRAFT' ? 'Draft'
                          : assessment.status === 'EXPIRED' ? 'Expired'
                          : 'Cancelled'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-600">
              No assessments found with current filters.
            </div>
          )}

          {/* Pagination */}
          {assessments?.pagination && assessments.pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => handlePageChange(filters.page! - 1)}
                disabled={filters.page === 1}
                className="px-3 py-1 border border-slate-300 rounded disabled:opacity-50 hover:bg-slate-50"
              >
                Previous
              </button>
              
              <span className="px-3 py-1 text-sm text-slate-600">
                Page {filters.page} of {assessments.pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(filters.page! + 1)}
                disabled={filters.page === assessments.pagination.totalPages}
                className="px-3 py-1 border border-slate-300 rounded disabled:opacity-50 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Current Filters Debug Info (for development) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="border-t border-slate-200 p-4 bg-slate-50">
          <details className="text-sm">
            <summary className="font-medium cursor-pointer text-slate-700">
              Debug: Current Filters
            </summary>
            <pre className="mt-2 text-xs text-slate-600 bg-white p-2 rounded border overflow-auto">
              {JSON.stringify(filters, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}