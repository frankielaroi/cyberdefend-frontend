import { useState, useMemo } from 'react';
import { useGetCSIDirectoryQuery, useGetCSIHeatmapQuery } from '../../store/api/csiDirectoryApi';
import { Search, MapPin, Building2, Eye, Shield, TrendingUp, BarChart3, Table, Grid3X3, Home, ArrowLeft, ChevronRight } from 'lucide-react';
import type { Sector, OrganizationSize } from '../../types';
import { useNavigate } from 'react-router-dom';

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

  const navigate = useNavigate()
  const { data: directoryData, isLoading } = useGetCSIDirectoryQuery(apiFilters);
  const { data: heatmapData } = useGetCSIHeatmapQuery();
  
  const entries = directoryData?.data || [];
  const total = directoryData?.pagination?.total || 0;

  // Aggregate assessments into unique organizations to avoid repeated org entries
  const organizations = useMemo(() => {
    const map: Record<string, any> = {};
    entries.forEach((e: any, idx: number) => {
      const orgId = e.organizationId || `org-${idx}`;
      const existing = map[orgId];

      const assessmentDate = e.lastAssessmentDate
        ? new Date(e.lastAssessmentDate)
        : e.completedAt
        ? new Date(e.completedAt)
        : e.createdAt
        ? new Date(e.createdAt)
        : new Date();

      if (!existing) {
        map[orgId] = {
          organizationId: orgId,
          name: e.organization?.name || e.name || 'Unknown',
          sector: e.organization?.sector || e.sector || 'UNKNOWN',
          region: e.organization?.region || e.region || '',
          score: e.score ?? 0,
          lastAssessmentDate: assessmentDate.toISOString(),
          assessmentCount: 1,
          tier: e.tier || e.riskTier || undefined,
        };
      } else {
        existing.assessmentCount += 1;
        // update to most recent assessment info
        const existingDate = new Date(existing.lastAssessmentDate);
        if (assessmentDate > existingDate) {
          existing.lastAssessmentDate = assessmentDate.toISOString();
          existing.score = e.score ?? existing.score;
          existing.name = e.organization?.name || e.name || existing.name;
          existing.sector = e.organization?.sector || e.sector || existing.sector;
          existing.region = e.organization?.region || e.region || existing.region;
          existing.tier = e.tier || e.riskTier || existing.tier;
        }
      }
    });

    return Object.values(map).sort((a: any, b: any) => new Date(b.lastAssessmentDate).getTime() - new Date(a.lastAssessmentDate).getTime());
  }, [entries]);

  const sectors = ['BANKING', 'TELECOMMUNICATIONS', 'INSURANCE', 'GOVERNMENT', 'HEALTHCARE', 'EDUCATION', 'ENERGY', 'MANUFACTURING', 'RETAIL', 'LOGISTICS', 'TECHNOLOGY', 'NGO'];
  const regions = ['Greater Accra', 'Ashanti', 'Western', 'Eastern', 'Northern', 'Central', 'Volta', 'Upper East', 'Upper West', 'Brong-Ahafo'];
  const sizes = ['SMALL', 'MEDIUM', 'LARGE', 'ENTERPRISE'];
  const riskTiers = ['Low Risk (80-100)', 'Medium Risk (60-79)', 'High Risk (0-59)'];

  // Removed unused getTierBadge function

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
    <div className="min-h-screen bg-slate-900">
      {/* Navigation Breadcrumb */}
      <div className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Dashboard</span>
              </button>
              <ChevronRight className="w-4 h-4 text-slate-600" />
              <div className="flex items-center space-x-2 text-white">
                <Home className="w-5 h-5" />
                <span className="font-medium">CSI Directory</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-blue-600/30 via-purple-600/30 to-pink-600/30 rounded-full transform -translate-y-1/2"></div>
            <div className="relative">
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-600/10 border border-blue-500/20 text-blue-400 mb-6 transform hover:scale-105 transition-all duration-300">
                <TrendingUp className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">Cybersecurity Insights</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-4 tracking-tight">
                CSI Directory
              </h1>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
                Discover and compare cybersecurity readiness across organizations.
                <br className="hidden md:block" />
                Benchmark your performance against industry leaders.
              </p>
            </div>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="group bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl p-6 text-center backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500 hover:scale-105">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {total}
            </div>
            <div className="text-sm font-medium text-slate-400">Organizations</div>
          </div>
          
          <div className="group bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl p-6 text-center backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500 hover:scale-105">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <TrendingUp className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-purple-400 mb-2">
              71.8
            </div>
            <div className="text-sm font-medium text-slate-400">Average Score</div>
          </div>
          
          <div className="group bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl p-6 text-center backdrop-blur-sm border border-slate-700/50 hover:border-green-500/50 transition-all duration-500 hover:scale-105">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-green-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <Shield className="w-6 h-6 text-green-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-green-400 mb-2">
              25
            </div>
            <div className="text-sm font-medium text-slate-400">Low Risk</div>
          </div>
          
          <div className="group bg-gradient-to-br from-slate-800 to-slate-800/50 rounded-xl p-6 text-center backdrop-blur-sm border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500 hover:scale-105">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-pink-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500">
                <BarChart3 className="w-6 h-6 text-pink-400" />
              </div>
            </div>
            <div className="text-3xl font-bold text-pink-400 mb-2">
              3
            </div>
            <div className="text-sm font-medium text-slate-400">Sectors</div>
          </div>
        </div>


        {/* Sector and Regional Performance sections removed */}

        {/* Filters Section */}
        <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-700/50 p-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-8">
            <div className="relative flex-1 max-w-lg">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400">
                <Search className="w-full h-full transition-colors duration-200" />
              </div>
              <input
                type="text"
                placeholder="Search organizations..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-700/50 text-white placeholder-slate-400 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300"
              />
            </div>
          
            {/* View Mode Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400 mr-2">All Sectors</span>
              <span className="text-sm text-slate-400 mr-4">All Risk Levels</span>
              <div className="flex items-center gap-1 bg-slate-700 p-1 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                    viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-1 ${
                    viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'
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
            <div className="relative group">
              <select
                value={filters.sector}
                onChange={(e) => setFilters({ ...filters, sector: e.target.value as Sector | '' })}
                className="w-full px-4 py-3 appearance-none bg-slate-900/50 border border-slate-700/50 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:border-blue-500/30"
              >
                <option value="">All Sectors</option>
                {sectors.map((sector) => (
                  <option key={sector} value={sector}>{sector.charAt(0) + sector.slice(1).toLowerCase().replace('_', ' ')}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-400 transition-colors duration-200">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>

            <div className="relative group">
              <select
                value={filters.region}
                onChange={(e) => setFilters({ ...filters, region: e.target.value })}
                className="w-full px-4 py-3 appearance-none bg-slate-900/50 border border-slate-700/50 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:border-blue-500/30"
              >
                <option value="">All Regions</option>
                {regions.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-400 transition-colors duration-200">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>

            <div className="relative group">
              <select
                value={filters.size}
                onChange={(e) => setFilters({ ...filters, size: e.target.value as OrganizationSize | '' })}
                className="w-full px-4 py-3 appearance-none bg-slate-900/50 border border-slate-700/50 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:border-blue-500/30"
              >
                <option value="">All Sizes</option>
                {sizes.map((size) => (
                  <option key={size} value={size}>{size.charAt(0) + size.slice(1).toLowerCase()}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-400 transition-colors duration-200">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>

            <div className="relative group">
              <select
                value={filters.riskTier}
                onChange={(e) => setFilters({ ...filters, riskTier: e.target.value })}
                className="w-full px-4 py-3 appearance-none bg-slate-900/50 border border-slate-700/50 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-300 hover:border-blue-500/30"
              >
                <option value="">All Risk Levels</option>
                {riskTiers.map((tier) => (
                  <option key={tier} value={tier}>{tier}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-blue-400 transition-colors duration-200">
                <ChevronRight className="w-4 h-4 rotate-90" />
              </div>
            </div>
          </div>
        
          {/* Active Filters Display */}
          {(filters.sector || filters.region || filters.size || filters.riskTier || filters.search) && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-700">
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                    Search: "{filters.search}"
                  </span>
                )}
                {filters.sector && (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                    {filters.sector}
                  </span>
                )}
                {filters.region && (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                    {filters.region}
                  </span>
                )}
                {filters.size && (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                    {filters.size}
                  </span>
                )}
                {filters.riskTier && (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                    {filters.riskTier}
                  </span>
                )}
              </div>
              <button
                onClick={clearFilters}
                className="text-slate-400 hover:text-white text-sm font-medium transition-colors duration-200"
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
                            const assessmentDate = new Date(e.lastAssessmentDate || e.completedAt || e.createdAt || '');
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
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-700/50 animate-slideUp">
            <div className="p-8 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h2 className="text-2xl font-bold text-white">
                    {isLoading ? 'Loading...' : `${entries.length} Organizations`}
                  </h2>
                  <p className="text-slate-400">
                    {!isLoading && `Showing 1-${Math.min(10, entries.length)} of ${entries.length} results`}
                  </p>
                </div>
              </div>
            </div>
            
            {isLoading ? (
              <div className="p-12 text-center">
                <Shield className="w-16 h-16 text-slate-600 mx-auto mb-4 animate-pulse" />
                <p className="text-slate-400">Loading organizations...</p>
              </div>
            ) : entries.length === 0 ? (
              <div className="p-12 text-center">
                <Search className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">No organizations found</h3>
                <p className="text-slate-400">Try adjusting your search criteria or check back later</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {organizations.map((entry: any, index: number) => (
                  <div 
                    key={`${entry.organizationId}-${index}`} 
                    className="group relative bg-gradient-to-br from-slate-800/90 to-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500 hover:scale-105"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/0 via-blue-500/0 to-blue-500/0 group-hover:from-blue-500/3 group-hover:via-purple-500/3 group-hover:to-pink-500/3 transition-all duration-500"></div>
                    <div className="relative">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 border border-blue-500/20">
                            <Building2 className="w-6 h-6 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors duration-300">
                              {entry.name}
                            </h3>
                            <div className="text-sm text-slate-400 flex items-center gap-2">
                              <span>{entry.sector}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                            entry.score >= 80 ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
                            entry.score >= 60 ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' :
                            'bg-red-900/30 text-red-400 border border-red-500/30'
                          }`}>
                            #{entry.rank || 1}
                          </div>
                        </div>
                      </div>
                    
                      <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="text-center p-4 rounded-xl bg-slate-900/30 border border-slate-700/50">
                          <div className={`text-3xl font-bold mb-1 ${
                            entry.score >= 80 ? 'text-green-400' :
                            entry.score >= 60 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {entry.score}
                          </div>
                          <div className="text-sm font-medium text-slate-400">
                            CSI Score
                          </div>
                        </div>
                        <div className="text-center p-4 rounded-xl bg-slate-900/30 border border-slate-700/50">
                          <div className={`text-3xl font-bold mb-1 ${
                            entry.score >= 80 ? 'text-green-400' :
                            entry.score >= 60 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {entry.score >= 80 ? 'Low' : entry.score >= 60 ? 'Medium' : 'High'}
                          </div>
                          <div className="text-sm font-medium text-slate-400">
                            Risk Level
                          </div>
                        </div>
                      </div>
                    
                      <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm px-4 py-3 rounded-xl bg-slate-900/30 border border-slate-700/50">
                          <span className="text-slate-400">Last Updated</span>
                          <span className="text-white font-medium">
                            {new Date(entry.lastAssessmentDate || '').toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm px-4 py-3 rounded-xl bg-slate-900/30 border border-slate-700/50">
                          <span className="text-slate-400">Readiness</span>
                          <span className={`font-medium ${
                            entry.score >= 80 ? 'text-green-400' :
                            entry.score >= 60 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {entry.score >= 80 ? 'Excellent' : entry.score >= 60 ? 'Good' : 'Improving'}
                          </span>
                        </div>
                        
                        <button className="w-full flex items-center justify-center gap-2 text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-sm font-medium px-6 py-3 rounded-xl transition-all duration-300 group">
                          <Eye className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Table View */
              <div>
                {/* Table Header */}
              {/* Table Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 p-8 border-b border-slate-700/50 text-sm font-medium text-slate-300">
                <div className="col-span-4">Organization</div>
                <div className="col-span-2">CSI Score</div>
                <div className="col-span-2">Risk Level</div>
                <div className="col-span-2">Last Updated</div>
                <div className="col-span-2">Security Readiness</div>
              </div>
              
              {/* Table Rows */}
              <div className="divide-y divide-slate-700/50">
                {organizations.map((entry: any, index: number) => (
                  <div 
                    key={`${entry.organizationId}-${index}`} 
                    className="group grid grid-cols-1 md:grid-cols-12 gap-4 p-8 hover:bg-slate-800/50 transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    {/* Organization Info */}
                    <div className="col-span-1 md:col-span-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl flex items-center justify-center flex-shrink-0 border border-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                          <Building2 className="w-6 h-6 text-blue-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-bold text-white truncate group-hover:text-blue-400 transition-colors duration-300">
                            {entry.name}
                          </h3>
                          <div className="text-sm text-slate-400 flex items-center gap-4">
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
                      <div className="md:hidden text-sm text-slate-400 mb-2">CSI Score</div>
                      <div className="flex items-center gap-2">
                        <div className={`text-2xl font-bold ${
                          entry.score >= 80 ? 'text-green-400' :
                          entry.score >= 60 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {entry.score}
                        </div>
                        <div className="text-sm text-slate-500">/100</div>
                      </div>
                    </div>
                      
                      {/* Risk Level */}
                      <div className="col-span-1 md:col-span-2">
                        <div className="md:hidden text-sm text-slate-400 mb-2">Risk Level</div>
                        <div className={`inline-flex px-4 py-1.5 rounded-full text-sm font-medium ${
                          entry.score >= 80 ? 'bg-green-900/30 text-green-400 border border-green-500/30' :
                          entry.score >= 60 ? 'bg-yellow-900/30 text-yellow-400 border border-yellow-500/30' :
                          'bg-red-900/30 text-red-400 border border-red-500/30'
                        }`}>
                          {entry.score >= 80 ? 'Low' : entry.score >= 60 ? 'Medium' : 'High'}
                        </div>
                      </div>
                      
                      {/* Last Updated */}
                      <div className="col-span-1 md:col-span-2">
                        <div className="md:hidden text-sm text-slate-400 mb-2">Last Updated</div>
                        <div className="text-sm text-white font-medium">
                          {new Date(entry.lastAssessmentDate || '').toLocaleDateString()}
                        </div>
                      </div>
                      
                      {/* Security Readiness */}
                      <div className="col-span-1 md:col-span-2">
                        <div className="md:hidden text-sm text-slate-400 mb-2">Security Readiness</div>
                        <div className="flex items-center justify-between">
                          <div className={`text-sm font-medium ${
                            entry.score >= 80 ? 'text-green-400' :
                            entry.score >= 60 ? 'text-yellow-400' :
                            'text-red-400'
                          }`}>
                            {entry.score >= 80 ? 'Excellent' : entry.score >= 60 ? 'Good' : 'Improving'}
                          </div>
                          <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-medium transition-all duration-300 group-hover:scale-105">
                            <Eye className="w-4 h-4" />
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Pagination */}
        {entries.length > 0 && (
          <div className="p-8 border-t border-slate-700/50 flex items-center justify-between">
            <div className="text-sm text-slate-400">
              Showing <span className="font-medium text-white">1-{Math.min(10, entries.length)}</span> of{' '}
              <span className="font-medium text-white">{entries.length}</span> organizations
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="px-4 py-2 text-sm font-medium text-slate-400 bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300 disabled:opacity-50" 
                disabled
              >
                Previous
              </button>
              <div className="flex items-center gap-1">
                <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl border border-blue-500">
                  1
                </button>
                <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
                  2
                </button>
                <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
                  3
                </button>
              </div>
              <button className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-white bg-slate-900/50 rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-300">
                Next
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
        