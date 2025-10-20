import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  useGetCampaignTemplatesQuery,
  useCreateTemplateMutation,
  useUpdateTemplateMutation,
  useDeleteTemplateMutation
} from '../../store/api/realDefendXPlusApi';
import {
  Plus,
  Edit3,
  Trash2,
  Eye,
  Save,
  X,
  ArrowLeft,
  Mail,
  Settings,
  AlertTriangle,
  CheckCircle,
  Copy
} from 'lucide-react';
import type { CampaignTemplate, CreateTemplateDto } from '../../types';

interface TemplateFormData extends Omit<CreateTemplateDto, 'tags'> {
  tags: string; // Convert array to string for form handling
}

export default function TemplateManager() {
  const navigate = useNavigate();
  const { data: templatesData, isLoading, refetch } = useGetCampaignTemplatesQuery();
  const [createTemplate, { isLoading: isCreating }] = useCreateTemplateMutation();
  const [updateTemplate, { isLoading: isUpdating }] = useUpdateTemplateMutation();
  const [deleteTemplate, { isLoading: isDeleting }] = useDeleteTemplateMutation();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CampaignTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<CampaignTemplate | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    category: 'SECURITY',
    riskLevel: 'MEDIUM',
    defaultSubject: '',
    defaultSenderName: 'IT Security Team',
    emailBodyHtml: '',
    emailBodyText: '',
    landingPageHtml: '',
    captureCredentials: false,
    previewContent: '',
    tags: '',
  });

  // Landing page style animations
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Extract templates from the paginated response
  const templates = templatesData?.templates || [];

  // Get pagination info
  const pagination = templatesData?.pagination;

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: 'SECURITY',
      riskLevel: 'MEDIUM',
      defaultSubject: '',
      defaultSenderName: 'IT Security Team',
      emailBodyHtml: '',
      emailBodyText: '',
      landingPageHtml: '',
      captureCredentials: false,
      previewContent: '',
      tags: '',
    });
  };

  const handleCreateNew = () => {
    resetForm();
    setEditingTemplate(null);
    setShowCreateForm(true);
  };

  const handleEdit = (template: CampaignTemplate) => {
    setFormData({
      name: template.name,
      description: template.description,
      category: template.category === 'COMPLIANCE'
        ? 'GENERAL'
        : template.category,
      riskLevel: template.riskLevel,
      defaultSubject: template.defaultSubject,
      defaultSenderName: template.defaultSenderName,
      emailBodyHtml: template.emailBodyHtml,
      emailBodyText: template.emailBodyText,
      landingPageHtml: template.landingPageHtml || '',
      captureCredentials: template.captureCredentials || false,
      previewContent: template.previewContent,
      tags: template.tags?.join(', ') || '',
    });
    setEditingTemplate(template);
    setShowCreateForm(true);
  };

  const handleCloseForm = () => {
    setShowCreateForm(false);
    setEditingTemplate(null);
    resetForm();
  };

  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Convert form data to API format
      const templateData: CreateTemplateDto = {
        name: formData.name,
        description: formData.description,
        category: formData.category,
        riskLevel: formData.riskLevel,
        defaultSubject: formData.defaultSubject,
        defaultSenderName: formData.defaultSenderName,
        emailBodyHtml: formData.emailBodyHtml,
        emailBodyText: formData.emailBodyText,
        landingPageHtml: formData.landingPageHtml || undefined,
        captureCredentials: formData.captureCredentials,
        previewContent: formData.previewContent,
        tags: formData.tags ? formData.tags.split(',').map(tag => tag.trim()).filter(Boolean) : undefined,
      };

      if (editingTemplate) {
        await updateTemplate({
          id: editingTemplate.id,
          data: templateData
        }).unwrap();
      } else {
        await createTemplate(templateData).unwrap();
      }
      
      handleCloseForm();
      refetch();
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await deleteTemplate(templateId).unwrap();
      setDeleteConfirm(null);
      refetch();
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  const handleCloneTemplate = (template: CampaignTemplate) => {
    setFormData({
      name: `${template.name} (Copy)`,
      description: template.description,
      category: template.category === 'COMPLIANCE'
        ? 'GENERAL'
        : template.category,
      riskLevel: template.riskLevel,
      defaultSubject: template.defaultSubject,
      defaultSenderName: template.defaultSenderName,
      emailBodyHtml: template.emailBodyHtml,
      emailBodyText: template.emailBodyText,
      landingPageHtml: template.landingPageHtml || '',
      captureCredentials: template.captureCredentials || false,
      previewContent: template.previewContent,
      tags: template.tags?.join(', ') || '',
    });
    setEditingTemplate(null);
    setShowCreateForm(true);
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'LOW': return 'bg-green-100 text-green-800';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'VERY_HIGH': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'SECURITY': return <AlertTriangle className="w-4 h-4" />;
      case 'IT': return <Settings className="w-4 h-4" />;
      case 'HR': return <CheckCircle className="w-4 h-4" />;
      default: return <Mail className="w-4 h-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <span className="text-gray-600">Loading templates...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden relative">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`
          }}
        />
        
        {/* Floating Particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-30 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className={`mb-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/defendx-plus')}
                className="flex items-center text-slate-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </button>
            <div>
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">Campaign Templates</h1>
                {pagination && (
                  <span className="text-sm text-slate-400">
                    Showing {templates.length} of {pagination.total} templates
                  </span>
                )}
              </div>
              <p className="text-slate-300 mt-1">Create and manage phishing campaign templates</p>
            </div>
            </div>
            <button
              onClick={handleCreateNew}
              className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25 flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>Create Template</span>
            </button>
          </div>
        </div>

        {/* Templates Grid */}
        {!showCreateForm && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <div key={template.id} className="group relative bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden hover:border-blue-500/50 transition-all duration-500 transform hover:scale-105 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
                
                <div className="relative z-10 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      {getCategoryIcon(template.category)}
                      <h3 className="text-lg font-semibold text-white line-clamp-1">
                        {template.name}
                      </h3>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRiskLevelColor(template.riskLevel)}`}>
                      {template.riskLevel}
                    </span>
                  </div>
                  
                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                    {template.description}
                  </p>
                  
                  <div className="space-y-2 mb-4">
                    <div className="text-sm">
                      <span className="font-medium text-slate-200">Subject:</span>
                      <p className="text-slate-300 line-clamp-1">{template.defaultSubject}</p>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-slate-200">From:</span>
                      <p className="text-slate-300">{template.defaultSenderName}</p>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-slate-200">Category:</span>
                      <span className="text-slate-300 ml-1">{template.category}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-slate-200">Created by:</span>
                      <span className="text-slate-300 ml-1">
                        {template.creator ? `${template.creator.firstName} ${template.creator.lastName}` : 'Unknown'}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="font-medium text-slate-200">Usage:</span>
                        <span className="text-slate-300 ml-1">{template.usageCount} times</span>
                      </div>
                      {template.successRate !== null && (
                        <div>
                          <span className="font-medium text-slate-200">Success:</span>
                          <span className="text-slate-300 ml-1">{(template.successRate * 100).toFixed(1)}%</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {template.tags && template.tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {template.tags.slice(0, 2).map((tag, index) => (
                            <span key={index} className="px-2 py-1 text-xs bg-slate-700/50 text-slate-300 rounded">
                              {tag}
                            </span>
                          ))}
                          {template.tags.length > 2 && (
                            <span className="text-xs text-slate-400">+{template.tags.length - 2}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">No tags</span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => setPreviewTemplate(template)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-900/30 rounded transition-colors"
                        title="Preview"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleCloneTemplate(template)}
                        className="p-2 text-slate-400 hover:text-green-400 hover:bg-green-900/30 rounded transition-colors"
                        title="Clone"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(template)}
                        className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-900/30 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(template.id)}
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {templates.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Mail className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">No templates yet</h3>
                <p className="text-slate-300 mb-4">Create your first campaign template to get started</p>
                <button
                  onClick={handleCreateNew}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 text-white px-4 py-2 rounded-lg hover:from-blue-500 hover:to-blue-400 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                >
                  Create Template
                </button>
              </div>
            )}
          </div>
        )}

        {/* Create/Edit Form */}
        {showCreateForm && (
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  {editingTemplate ? 'Edit Template' : 'Create New Template'}
                </h2>
                <button
                  onClick={handleCloseForm}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSaveTemplate} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Template Name */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
                    placeholder="Enter template name"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="SECURITY">Security</option>
                    <option value="IT">IT</option>
                    <option value="HR">HR</option>
                    <option value="FINANCE">Finance</option>
                    <option value="EXECUTIVE">Executive</option>
                    <option value="GENERAL">General</option>
                  </select>
                </div>

                {/* Risk Level */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Risk Level *
                  </label>
                  <select
                    required
                    value={formData.riskLevel}
                    onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="VERY_HIGH">Very High</option>
                  </select>
                </div>

                {/* Capture Credentials */}
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Capture Credentials
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={formData.captureCredentials}
                        onChange={() => setFormData({ ...formData, captureCredentials: true })}
                        className="mr-2"
                      />
                      Yes
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        checked={!formData.captureCredentials}
                        onChange={() => setFormData({ ...formData, captureCredentials: false })}
                        className="mr-2"
                      />
                      No
                    </label>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
                  placeholder="Describe the purpose and context of this template"
                />
              </div>

              {/* Default Subject */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Default Subject Line *
                </label>
                <input
                  type="text"
                  required
                  value={formData.defaultSubject}
                  onChange={(e) => setFormData({ ...formData, defaultSubject: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
                  placeholder="Enter default email subject"
                />
              </div>

              {/* Default Sender Name */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Default Sender Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.defaultSenderName}
                  onChange={(e) => setFormData({ ...formData, defaultSenderName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
                  placeholder="Enter default sender name"
                />
              </div>

              {/* Preview Content */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Preview Content *
                </label>
                <textarea
                  required
                  rows={4}
                  value={formData.previewContent}
                  onChange={(e) => setFormData({ ...formData, previewContent: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
                  placeholder="Enter a brief preview of the email content"
                />
              </div>

              {/* Email Body HTML */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Email Body HTML *
                </label>
                <textarea
                  required
                  rows={8}
                  value={formData.emailBodyHtml}
                  onChange={(e) => setFormData({ ...formData, emailBodyHtml: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
                  placeholder="Enter the HTML email template content"
                />
                <p className="text-sm text-slate-400 mt-1">
                  You can use HTML and placeholder variables like {'{username}'}, {'{company}'}, etc.
                </p>
              </div>

              {/* Email Body Text */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Email Body Text *
                </label>
                <textarea
                  required
                  rows={6}
                  value={formData.emailBodyText}
                  onChange={(e) => setFormData({ ...formData, emailBodyText: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
                  placeholder="Enter the plain text version of the email"
                />
                <p className="text-sm text-slate-400 mt-1">
                  Plain text fallback for email clients that don't support HTML
                </p>
              </div>

              {/* Landing Page HTML */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Landing Page HTML (Optional)
                </label>
                <textarea
                  rows={6}
                  value={formData.landingPageHtml}
                  onChange={(e) => setFormData({ ...formData, landingPageHtml: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
                  placeholder="Enter landing page HTML content"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-slate-200 mb-2">
                  Tags (Optional)
                </label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700/50 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
                  placeholder="Enter tags separated by commas (e.g., password, reset, security)"
                />
                <p className="text-sm text-slate-400 mt-1">
                  Tags help organize and filter templates
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-slate-700/50">
                <button
                  type="button"
                  onClick={handleCloseForm}
                  className="px-4 py-2 text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{isCreating || isUpdating ? 'Saving...' : 'Save Template'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Preview Modal */}
        {previewTemplate && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden border border-slate-700/50 shadow-2xl">
              <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Template Preview</h3>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-white">{previewTemplate.name}</h4>
                    <p className="text-slate-300 text-sm">{previewTemplate.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Category:</span>
                      <p className="text-gray-900">{previewTemplate.category}</p>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-700">Risk Level:</span>
                      <p className="text-gray-900">{previewTemplate.riskLevel}</p>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Subject:</span>
                    <p className="text-gray-900">{previewTemplate.defaultSubject}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">From:</span>
                    <p className="text-gray-900">{previewTemplate.defaultSenderName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Created by:</span>
                    <p className="text-gray-900">
                      {previewTemplate.creator ? `${previewTemplate.creator.firstName} ${previewTemplate.creator.lastName}` : 'Unknown'}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Usage Count:</span>
                      <p className="text-gray-900">{previewTemplate.usageCount}</p>
                    </div>
                    {previewTemplate.successRate !== null && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Success Rate:</span>
                        <p className="text-gray-900">{(previewTemplate.successRate * 100).toFixed(1)}%</p>
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Email HTML Body:</span>
                    <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                      <pre className="text-sm text-gray-900 whitespace-pre-wrap">{previewTemplate.emailBodyHtml}</pre>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Email Text Body:</span>
                    <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                      <pre className="text-sm text-gray-900 whitespace-pre-wrap">{previewTemplate.emailBodyText}</pre>
                    </div>
                  </div>
                  {previewTemplate.landingPageHtml && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Landing Page HTML:</span>
                      <div className="bg-gray-50 p-4 rounded-lg max-h-40 overflow-y-auto">
                        <pre className="text-sm text-gray-900 whitespace-pre-wrap">{previewTemplate.landingPageHtml}</pre>
                      </div>
                    </div>
                  )}
                  {previewTemplate.tags && previewTemplate.tags.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-gray-700">Tags:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {previewTemplate.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-gray-700">Preview Content:</span>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-900">{previewTemplate.previewContent}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800/90 backdrop-blur-xl rounded-2xl max-w-md w-full border border-slate-700/50 shadow-2xl">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                  <h3 className="text-lg font-semibold text-white">Delete Template</h3>
                </div>
                <p className="text-slate-300 mb-6">
                  Are you sure you want to delete this template? This action cannot be undone.
                </p>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 text-slate-300 bg-slate-700/50 rounded-lg hover:bg-slate-600/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteTemplate(deleteConfirm)}
                    disabled={isDeleting}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}