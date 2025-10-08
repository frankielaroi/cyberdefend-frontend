import { useState } from 'react';
import { useGetCSIDirectoryQuery, useGetCSIHeatmapQuery, useGetCSIInsightsQuery } from '../../store/api/csiDirectoryApi';
import { Search, MapPin, Building2, Eye, Shield, TrendingUp, BarChart3, Table, Grid3X3 } from 'lucide-react';
import type { Sector, OrganizationSize } from '../../types';

export default function CSIDirectory() {
  const [filters, setFilters] = useState<{
    sector: Sector | '';
    region: string;
    size: OrganizationSize | '';
    riskTier: string;
    search: string;
  }>({
    sector: '',
    region: '',
    size: '',
    riskTier: '',
    search: '',
  });
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'map'>('grid');

  // Prepare filters for API call
  const apiFilters = {
    ...(filters.sector && { sector: filters.sector as Sector }),
    ...(filters.region && { region: filters.region }),
    ...(filters.size && { size: filters.size as OrganizationSize }),
    ...(filters.search && { search: filters.search }),
    page: 1,
    limit: 20,
  };

  const { data: directoryData, isLoading } = useGetCSIDirectoryQuery(apiFilters);
  const { data: heatmapData } = useGetCSIHeatmapQuery();
  const { data: insightsData } = useGetCSIInsightsQuery();
  
  const entries = directoryData?.data || [];
  const total = directoryData?.pagination?.total || 0;

  const sectors = ['BANKING', 'TELECOMMUNICATIONS', 'INSURANCE', 'GOVERNMENT', 'HEALTHCARE', 'EDUCATION', 'ENERGY', 'MANUFACTURING', 'RETAIL', 'LOGISTICS', 'TECHNOLOGY', 'NGO'];
  const regions = ['Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Northern', 'Central', 'Volta', 'Upper East', 'Upper West', 'Brong-Ahafo'];
  const sizes = ['SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'];
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
      {/* Header Section */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-8 h-8 text-slate-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">CSI Directory</h1>
        <p className="text-slate-600 max-w-2xl mx-auto">
          Public leaderboard showcasing organizational cybersecurity standings.<br />
          Compare security postures across industries and learn from top performers.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-slate-200">
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {total}
          </div>
          <div className="text-sm text-slate-600">Total Organizations</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-slate-200">
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {insightsData?.data?.benchmarks?.nationalAverage?.toFixed(1) || '71.8'}
          </div>
          <div className="text-sm text-slate-600">Average CSI Score</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-slate-200">
          <div className="text-2xl font-bold text-green-600 mb-1">
            {insightsData?.data?.riskDistribution?.lowRisk || '25'}
          </div>
          <div className="text-sm text-slate-600">Low Risk Organizations</div>
          <div className="text-xs text-slate-500 mt-1">Score 80+</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-slate-200">
          <div className="text-2xl font-bold text-slate-900 mb-1">
            {Object.keys(insightsData?.data?.benchmarks?.sectorAverages || {}).length || '3'}
          </div>
          <div className="text-sm text-slate-600">Sectors Covered</div>
        </div>
      </div>

      {/* Risk Distribution Summary */}
      {insightsData?.data?.riskDistribution && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-slate-900">Risk Distribution</h2>
            <span className="text-sm text-slate-600">Cybersecurity risk levels across organizations</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <h3 className="font-semibold text-green-800">Low Risk</h3>
                <p className="text-sm text-green-600">Score 80-100</p>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {insightsData.data.riskDistribution.lowRisk}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <h3 className="font-semibold text-yellow-800">Medium Risk</h3>
                <p className="text-sm text-yellow-600">Score 60-79</p>
              </div>
              <div className="text-2xl font-bold text-yellow-600">
                {insightsData.data.riskDistribution.mediumRisk}
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
              <div>
                <h3 className="font-semibold text-red-800">High Risk</h3>
                <p className="text-sm text-red-600">Score 0-59</p>
              </div>
              <div className="text-2xl font-bold text-red-600">
                {insightsData.data.riskDistribution.highRisk}
              </div>
            </div>
          </div>
          
          {/* Risk distribution visualization */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-slate-600 mb-2">
              <span>Risk Distribution</span>
              <span>
                {insightsData.data.riskDistribution.lowRisk + 
                 insightsData.data.riskDistribution.mediumRisk + 
                 insightsData.data.riskDistribution.highRisk} total organizations
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
              <div className="h-full flex">
                <div 
                  className="bg-green-500" 
                  style={{ 
                    width: `${(insightsData.data.riskDistribution.lowRisk / 
                      (insightsData.data.riskDistribution.lowRisk + 
                       insightsData.data.riskDistribution.mediumRisk + 
                       insightsData.data.riskDistribution.highRisk)) * 100}%` 
                  }}
                />
                <div 
                  className="bg-yellow-500" 
                  style={{ 
                    width: `${(insightsData.data.riskDistribution.mediumRisk / 
                      (insightsData.data.riskDistribution.lowRisk + 
                       insightsData.data.riskDistribution.mediumRisk + 
                       insightsData.data.riskDistribution.highRisk)) * 100}%` 
                  }}
                />
                <div 
                  className="bg-red-500" 
                  style={{ 
                    width: `${(insightsData.data.riskDistribution.highRisk / 
                      (insightsData.data.riskDistribution.lowRisk + 
                       insightsData.data.riskDistribution.mediumRisk + 
                       insightsData.data.riskDistribution.highRisk)) * 100}%` 
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Performers Section */}
      <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-5 h-5 text-yellow-500" />
          <h2 className="text-lg font-semibold text-slate-900">Top Performers</h2>
          <span className="text-sm text-slate-600">Organizations leading in cybersecurity excellence</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(insightsData?.data?.topPerformers?.overall && insightsData.data.topPerformers.overall.length > 0 
            ? insightsData.data.topPerformers.overall 
            : entries.slice(0, 3)
          ).map((entry: any, index: number) => (
            <div key={entry.organizationId || entry.organization || index} className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg">
              <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-slate-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-slate-900">{entry.organization || entry.name}</h3>
                <p className="text-sm text-slate-600">{entry.sector}</p>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-slate-900">{entry.score}</div>
                <div className="text-xs text-slate-500">CSI Score</div>
                {entry.improvement && (
                  <div className="text-xs text-green-600">+{entry.improvement}%</div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Show message if no top performers data available */}
        {(!insightsData?.data?.topPerformers?.overall || insightsData.data.topPerformers.overall.length === 0) && entries.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <p>No performance data available yet. Check back soon!</p>
          </div>
        )}
      </div>

      {/* Sector Performance Section */}
      {insightsData?.data?.benchmarks?.sectorAverages && Object.keys(insightsData.data.benchmarks.sectorAverages).length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-slate-900">Sector Performance</h2>
            <span className="text-sm text-slate-600">Average cybersecurity scores by industry</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(insightsData.data.benchmarks.sectorAverages)
              .sort(([,a], [,b]) => b - a)
              .slice(0, 6)
              .map(([sector, average]) => (
                <div key={sector} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-slate-900 capitalize">
                      {sector.toLowerCase().replace('_', ' ')}
                    </h3>
                    <p className="text-sm text-slate-600">Industry Average</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      average >= 80 ? 'text-green-600' :
                      average >= 70 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {average}
                    </div>
                    <div className="text-xs text-slate-500">Score</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Regional Performance Section */}
      {insightsData?.data?.benchmarks?.regionalAverages && Object.keys(insightsData.data.benchmarks.regionalAverages).length > 0 && (
        <div className="bg-white rounded-lg p-6 shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-5 h-5 text-green-500" />
            <h2 className="text-lg font-semibold text-slate-900">Regional Performance</h2>
            <span className="text-sm text-slate-600">Average cybersecurity scores by region</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(insightsData.data.benchmarks.regionalAverages)
              .sort(([,a], [,b]) => b - a)
              .map(([region, average]) => (
                <div key={region} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                  <div>
                    <h3 className="font-semibold text-slate-900">{region}</h3>
                    <p className="text-sm text-slate-600">Regional Average</p>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${
                      average >= 80 ? 'text-green-600' :
                      average >= 70 ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>
                      {average}
                    </div>
                    <div className="text-xs text-slate-500">Score</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search organizations..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600 mr-2">All Sectors</span>
            <span className="text-sm text-slate-600 mr-4">All Risk Levels</span>
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
                Cards
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1 ${
                  viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Table className="w-4 h-4" />
                Table
              </button>
            </div>
          </div>
        </div>
        
        {/* Quick Filter Buttons */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <select
            value={filters.sector}
            onChange={(e) => setFilters({ ...filters, sector: e.target.value as Sector | '' })}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Sectors</option>
            {sectors.map((sector) => (
              <option key={sector} value={sector}>{sector.charAt(0) + sector.slice(1).toLowerCase().replace('_', ' ')}</option>
            ))}
          </select>

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

          <select
            value={filters.size}
            onChange={(e) => setFilters({ ...filters, size: e.target.value as OrganizationSize | '' })}
            className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Sizes</option>
            {sizes.map((size) => (
              <option key={size} value={size}>{size.charAt(0) + size.slice(1).toLowerCase()}</option>
            ))}
          </select>

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
        
        {/* Active Filters Display */}
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
                {heatmapData?.data?.regions && heatmapData.data.regions.length > 0 ? (
                  heatmapData.data.regions.slice(0, 4).map((region: any, index: number) => (
                    <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
                      <h4 className="font-semibold text-slate-900">{region.name}</h4>
                      <div className="text-2xl font-bold text-blue-600">{region.averageScore}</div>
                      <p className="text-sm text-slate-600">{region.organizationCount} orgs</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 bg-white rounded-lg p-6 border border-slate-200 text-center">
                    <div className="text-slate-400 mb-2">
                      <MapPin className="w-8 h-8 mx-auto" />
                    </div>
                    <p className="text-slate-600 text-sm">
                      No regional data available yet. Regional statistics will appear here as organizations are assessed.
                    </p>
                  </div>
                )}
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
                      {heatmapData?.data?.national?.averageScore ? 
                        `${heatmapData.data.national.averageScore}%` : 
                        'N/A'
                      }
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Total Organizations:</span>
                    <span className="font-semibold text-slate-900">
                      {heatmapData?.data?.national?.totalOrganizations || total}
                    </span>
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
        <div className="bg-white rounded-lg shadow-sm border border-slate-200">
          <div className="p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">
                {isLoading ? 'Loading...' : `Showing 1-${Math.min(10, entries.length)} of ${entries.length} organizations`}
              </h2>
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
              <p className="text-slate-600">Try adjusting your search criteria or check back later</p>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {entries.map((entry: any) => (
                <div key={entry.id} className="border border-slate-200 rounded-lg p-6 hover:border-blue-300 hover:shadow-md transition-all bg-white">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                          {entry.name}
                        </h3>
                        <div className="text-sm text-slate-600">
                          {entry.sector}
                        </div>
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${getTierBadge(entry.tier)}`}>
                      #{entry.rank || 1}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(entry.score).split(' ')[0]}`}>
                        {entry.score}
                      </div>
                      <div className="text-sm text-slate-600">
                        out of 100
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-600 mb-1">Risk Level</div>
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                        entry.score >= 80 ? 'bg-green-100 text-green-700' :
                        entry.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {entry.score >= 80 ? 'Low' : entry.score >= 60 ? 'Medium' : 'High'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Last Updated</span>
                      <span className="text-slate-900">
                        {new Date(entry.lastAssessmentDate || '').toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">Security Readiness</span>
                      <span className="text-slate-900 font-medium">
                        {entry.score >= 80 ? 'Excellent' : entry.score >= 60 ? 'Good' : 'Improving'}
                      </span>
                    </div>
                  </div>
                  
                  <button className="w-full mt-4 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 text-sm font-medium py-2 border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                    <Eye className="w-4 h-4" />
                    View Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            /* Table View */
            <div>
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-6 border-b border-slate-200 bg-slate-50 text-sm font-medium text-slate-600">
                <div className="col-span-4">Organization</div>
                <div className="col-span-2">CSI Score</div>
                <div className="col-span-2">Risk Level</div>
                <div className="col-span-2">Last Updated</div>
                <div className="col-span-2">Security Readiness</div>
              </div>
              
              {/* Table Rows */}
              <div className="divide-y divide-slate-200">
                {entries.map((entry: any) => (
                  <div key={entry.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-6 hover:bg-slate-50 transition-colors">
                    {/* Organization Info */}
                    <div className="col-span-1 md:col-span-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Building2 className="w-5 h-5 text-slate-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-slate-900 truncate">
                            {entry.name}
                          </h3>
                          <div className="text-sm text-slate-600 flex items-center gap-4">
                            <span>{entry.sector}</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {entry.region}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* CSI Score */}
                    <div className="col-span-1 md:col-span-2">
                      <div className="md:hidden text-sm text-slate-600 mb-1">CSI Score</div>
                      <div className={`text-2xl font-bold ${getScoreColor(entry.score).split(' ')[0]}`}>
                        {entry.score}
                      </div>
                      <div className="text-sm text-slate-600">out of 100</div>
                    </div>
                    
                    {/* Risk Level */}
                    <div className="col-span-1 md:col-span-2">
                      <div className="md:hidden text-sm text-slate-600 mb-1">Risk Level</div>
                      <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                        entry.score >= 80 ? 'bg-green-100 text-green-700' :
                        entry.score >= 60 ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {entry.score >= 80 ? 'Low' : entry.score >= 60 ? 'Medium' : 'High'}
                      </div>
                    </div>
                    
                    {/* Last Updated */}
                    <div className="col-span-1 md:col-span-2">
                      <div className="md:hidden text-sm text-slate-600 mb-1">Last Updated</div>
                      <div className="text-sm text-slate-900">
                        {new Date(entry.lastAssessmentDate || '').toLocaleDateString()}
                      </div>
                    </div>
                    
                    {/* Security Readiness */}
                    <div className="col-span-1 md:col-span-2">
                      <div className="md:hidden text-sm text-slate-600 mb-1">Security Readiness</div>
                      <div className="text-sm font-medium text-slate-900">
                        {entry.score >= 80 ? 'Excellent' : entry.score >= 60 ? 'Good' : 'Improving'}
                      </div>
                      <button className="flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium mt-1">
                        <Eye className="w-4 h-4" />
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Pagination */}
          {entries.length > 0 && (
            <div className="p-6 border-t border-slate-200 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Showing <span className="font-medium">1-{Math.min(10, entries.length)}</span> of{' '}
                <span className="font-medium">{entries.length}</span> organizations
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50" disabled>
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  <button className="px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg">
                    1
                  </button>
                  <button className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
                    2
                  </button>
                  <button className="px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">
                    3
                  </button>
                </div>
                <button className="px-3 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Call to Action Section */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Want to see your organization here?</h2>
        <p className="text-slate-600 mb-6 max-w-2xl mx-auto">
          Join the CSI Directory by completing your cybersecurity assessment. Showcase your security 
          posture and benchmark against industry leaders.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button className="px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors">
            Take Assessment
          </button>
          <button className="px-6 py-3 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors">
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}