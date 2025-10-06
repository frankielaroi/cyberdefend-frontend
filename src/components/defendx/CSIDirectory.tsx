import { useState } from 'react';
import { useGetCSIDirectoryQuery, useGetCSIHeatmapQuery } from '../../store/api/csiDirectoryApi';
import { Search, MapPin, Building2, Users, Eye, Shield, TrendingUp } from 'lucide-react';

export default function CSIDirectory() {
  const [filters, setFilters] = useState({
    sector: '',
    region: '',
    size: '',
    riskTier: '',
    search: '',
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('grid');

  const { data: directoryData, isLoading } = useGetCSIDirectoryQuery();
  const { data: heatmapData } = useGetCSIHeatmapQuery();
  
  const entries = directoryData?.data || [];
  const total = directoryData?.pagination?.total || 0;

  const sectors = ['Finance', 'Healthcare', 'Education', 'Government', 'Technology', 'Retail', 'Manufacturing', 'Energy'];
  const regions = ['Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Northern', 'Central', 'Volta', 'Upper East', 'Upper West', 'Brong-Ahafo'];
  const sizes = ['Small (1-50)', 'Medium (51-250)', 'Large (251-1000)', 'Enterprise (1000+)'];
  const riskTiers = ['Low Risk (80-100)', 'Medium Risk (60-79)', 'High Risk (0-59)'];

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100';
    if (score >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getTierBadge = (tier: string) => {
    const colors = {
      A: 'bg-green-100 text-green-700',
      B: 'bg-blue-100 text-blue-700',
      C: 'bg-yellow-100 text-yellow-700',
      D: 'bg-orange-100 text-orange-700',
      F: 'bg-red-100 text-red-700',
    };
    return colors[tier as keyof typeof colors] || 'bg-slate-100 text-slate-700';
  };

  const clearFilters = () => {
    setFilters({
      sector: '',
      region: '',
      size: '',
      riskTier: '',
      search: '',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">CSI Directory</h1>
          <p className="text-slate-600 mt-1">
            Public cybersecurity readiness scores across Ghana • {total} organizations
          </p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'map' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            <MapPin className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search organizations..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Sector Filter */}
          <select
            value={filters.sector}
            onChange={(e) => setFilters({ ...filters, sector: e.target.value })}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Sectors</option>
            {sectors.map((sector) => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>

          {/* Region Filter */}
          <select
            value={filters.region}
            onChange={(e) => setFilters({ ...filters, region: e.target.value })}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Regions</option>
            {regions.map((region) => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>

          {/* Size Filter */}
          <select
            value={filters.size}
            onChange={(e) => setFilters({ ...filters, size: e.target.value })}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Sizes</option>
            {sizes.map((size) => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>

          {/* Risk Tier Filter */}
          <select
            value={filters.riskTier}
            onChange={(e) => setFilters({ ...filters, riskTier: e.target.value })}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Risk Levels</option>
            {riskTiers.map((tier) => (
              <option key={tier} value={tier}>{tier}</option>
            ))}
          </select>
        </div>
        
        {/* Active Filters & Clear */}
        {(filters.sector || filters.region || filters.size || filters.riskTier || filters.search) && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200">
            <div className="flex flex-wrap gap-2">
              {filters.search && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  Search: "{filters.search}"
                </span>
              )}
              {filters.sector && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {filters.sector}
                </span>
              )}
              {filters.region && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {filters.region}
                </span>
              )}
              {filters.size && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {filters.size}
                </span>
              )}
              {filters.riskTier && (
                <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {filters.riskTier}
                </span>
              )}
            </div>
            <button
              onClick={clearFilters}
              className="text-slate-600 hover:text-slate-800 text-sm font-medium"
            >
              Clear All Filters
            </button>
          </div>
        )}
      </div>

      {/* Results Content */}
      {viewMode === 'map' ? (
        /* Regional Heatmap */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Regional Cybersecurity Heatmap</h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ghana Map Placeholder */}
            <div className="lg:col-span-2 bg-slate-50 rounded-lg p-8 text-center">
              <MapPin className="w-16 h-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">Ghana Regional Map</h3>
              <p className="text-slate-600 text-sm">
                Interactive map showing cybersecurity readiness by region
              </p>
              {/* This would be replaced with an actual map component */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                {heatmapData?.slice(0, 4).map((region: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
                    <h4 className="font-semibold text-slate-900">{region.region}</h4>
                    <div className="text-2xl font-bold text-blue-600">{region.score}</div>
                    <p className="text-sm text-slate-600">{region.count} orgs</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Legend and Stats */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Risk Level Legend</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded"></div>
                    <span className="text-sm">Low Risk (80-100)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                    <span className="text-sm">Medium Risk (60-79)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-500 rounded"></div>
                    <span className="text-sm">High Risk (0-59)</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">National Stats</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-600">National Average:</span>
                    <span className="font-semibold text-slate-900">
                      {heatmapData?.[0]?.score || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Organizations:</span>
                    <span className="font-semibold text-slate-900">{total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Assessed This Month:</span>
                    <span className="font-semibold text-slate-900">
                      {entries.filter((e: any) => {
                        const assessmentDate = new Date(e.lastAssessmentDate || '');
                        const now = new Date();
                        return assessmentDate.getMonth() === now.getMonth();
                      }).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* List/Grid View */
        <div className="bg-white rounded-xl shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {isLoading ? 'Loading...' : `${entries.length} Organizations`}
              </h2>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <TrendingUp className="w-4 h-4" />
                Sorted by CSI Score
              </div>
            </div>
          </div>
          
          {isLoading ? (
            <div className="p-12 text-center">
              <Shield className="w-16 h-16 text-slate-300 mx-auto mb-4 animate-pulse" />
              <p className="text-slate-600">Loading organizations...</p>
            </div>
          ) : entries.length === 0 ? (
            <div className="p-12 text-center">
              <Search className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No organizations found</h3>
              <p className="text-slate-600">Try adjusting your search criteria</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {entries.map((entry: any) => (
                <div key={entry.id} className="border border-slate-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-900 mb-1">
                        {entry.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Building2 className="w-4 h-4" />
                        {entry.sector}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                        <MapPin className="w-4 h-4" />
                        {entry.region}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold ${getScoreColor(entry.score).split(' ')[0]}`}>
                        {entry.score}
                      </div>
                      <div className="text-sm text-slate-600">CSI Score</div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getTierBadge(entry.tier)}`}>
                      Tier {entry.tier}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">
                      Updated {new Date(entry.lastAssessmentDate || '').toLocaleDateString()}
                    </span>
                    <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* List View */
            <div className="divide-y divide-slate-200">
              {entries.map((entry: any) => (
                <div key={entry.id} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">
                          {entry.name}
                        </h3>
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${getTierBadge(entry.tier)}`}>
                          Tier {entry.tier}
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm text-slate-600">
                        <div className="flex items-center gap-2">
                          <Building2 className="w-4 h-4" />
                          {entry.sector}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {entry.region}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {entry.size}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${getScoreColor(entry.score).split(' ')[0]}`}>
                          {entry.score}
                        </div>
                        <div className="text-sm text-slate-600">CSI Score</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-500 mb-2">
                          Last updated: {new Date(entry.lastAssessmentDate || '').toLocaleDateString()}
                        </div>
                        <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium">
                          <Eye className="w-4 h-4" />
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}