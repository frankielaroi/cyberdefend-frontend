import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegisterMutation } from '../../store/api/authApi';
import { useCreateOrganizationMutation, useJoinOrganizationMutation, useGetOrganizationsQuery } from '../../store/api/organizationApi';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/slices/authSlice';
import { Shield, User, Mail, Phone, Lock, CheckCircle, Users, Building2, Plus, Search, Eye, EyeOff } from 'lucide-react';
import type { UserRole } from '../../types';
import { Sector, OrganizationSize } from '../../types';

type RegistrationStep = 'account' | 'organization';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [register, { isLoading, error }] = useRegisterMutation();
  const [createOrganization, { isLoading: isCreatingOrg, error: createOrgError }] = useCreateOrganizationMutation();
  const [joinOrganization, { isLoading: isJoiningOrg, error: joinOrgError }] = useJoinOrganizationMutation();
  
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('account');
  const [userCredentials, setUserCredentials] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'ORG_ADMIN' as UserRole,
    acceptTerms: false,
  });

  const [orgData, setOrgData] = useState({
    action: 'create' as 'create' | 'join' | 'browse',
    // For creating organization
    organizationName: '',
    email: '',
    industry: '',
    size: '',
    description: '',
    // For joining organization
    inviteCode: '',
    selectedOrgId: '',
    searchQuery: '',
  });

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);
  
  // Get public organizations for browsing
  const { data: publicOrgs, isLoading: isLoadingOrgs } = useGetOrganizationsQuery({
    page: 1,
    limit: 10,
    search: orgData.searchQuery,
  }, {
    skip: orgData.action !== 'browse' || currentStep !== 'organization',
  });
  
  const isOrgLoading = isCreatingOrg || isJoiningOrg;
  const orgError = createOrgError || joinOrgError;

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleOrgInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrgData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateAccountForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.role) {
      errors.role = 'Please select a role';
    }
    if (!formData.acceptTerms) {
      errors.acceptTerms = 'You must accept the terms and conditions';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateOrganizationForm = () => {
    const errors: { [key: string]: string } = {};

    if (orgData.action === 'create') {
      if (!orgData.organizationName.trim()) {
        errors.organizationName = 'Organization name is required';
      }
      if (!orgData.email.trim()) {
        errors.orgEmail = 'Institutional email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(orgData.email)) {
        errors.orgEmail = 'Please enter a valid email address';
      }
      if (!orgData.industry) {
        errors.industry = 'Please select an industry';
      }
      if (!orgData.size) {
        errors.size = 'Please select organization size';
      }
    } else if (orgData.action === 'join') {
      if (!orgData.inviteCode.trim()) {
        errors.inviteCode = 'Invite code is required';
      }
    } else if (orgData.action === 'browse') {
      if (!orgData.selectedOrgId) {
        errors.selectedOrgId = 'Please select an organization to join';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAccountForm()) {
      return;
    }

    try {
      // Prepare the registration payload
      const registerPayload: any = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: formData.role,
      };

      // If user is creating a new organization, include organization data
      if (orgData.action === 'create' && orgData.organizationName) {
        registerPayload.organization = {
          name: orgData.organizationName,
          email: orgData.email,
          size: orgData.size,
          sector: orgData.industry,
          ...(orgData.description && { description: orgData.description }),
        };
      }
      // If user is joining an existing organization by ID
      else if (orgData.action === 'browse' && orgData.selectedOrgId) {
        registerPayload.organizationId = orgData.selectedOrgId;
      }

      const result = await register(registerPayload).unwrap();

      // Store credentials immediately to enable authenticated API calls
      dispatch(setCredentials(result));

      // If user has organization data already, navigate to dashboard
      if (result?.user?.organization || registerPayload.organizationId || registerPayload.organization) {
        navigate('/dashboard');
      } else {
        // Otherwise proceed to organization setup with auth token now available
        setUserCredentials(result);
        setCurrentStep('organization');
      }
    } catch (err: any) {
      console.error('Registration failed:', err);
      // Handle registration errors - this will be displayed by the error state from the mutation
    }
  };

  const handleOrganizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateOrganizationForm()) {
      return;
    }

    try {
      if (orgData.action === 'create') {
        await createOrganization({
          name: orgData.organizationName,
          sector: orgData.industry as any, // Convert string to Sector enum
          email: orgData.email,
          size: orgData.size as any, // Convert string to OrganizationSize enum
          description: orgData.description,
        }).unwrap();
      } else if (orgData.action === 'join') {
        await joinOrganization({
          inviteCode: orgData.inviteCode,
        }).unwrap();
      } else if (orgData.action === 'browse') {
        await joinOrganization({
          organizationId: orgData.selectedOrgId,
        }).unwrap();
      }

      // Organization operations completed successfully, navigate to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      console.error('Organization setup failed:', err);
      // Error will be shown by the RTK Query error state
    }
  };

  const handleSkipOrganization = () => {
    // Navigate to dashboard (credentials already stored from account creation)
    navigate('/dashboard');
  };

  const handleSubmit = currentStep === 'account' ? handleAccountSubmit : handleOrganizationSubmit;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `translate(${mousePosition.x * 0.005}px, ${mousePosition.y * 0.005}px)`
          }}
        />
        
        {/* Floating Particles */}
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className={`max-w-4xl w-full relative z-10 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-3xl mb-6 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-pink-500 rounded-3xl animate-pulse opacity-75" />
            <Shield className="w-14 h-14 text-white relative z-10" />
            
            {/* Security Scanning Animation */}
            <div className="absolute inset-0 border-2 border-purple-400 rounded-3xl animate-ping opacity-30" />
            <div className="absolute inset-2 border border-pink-400 rounded-2xl animate-pulse opacity-50" />
          </div>
          
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              {currentStep === 'account' ? 'Create Your Account' : 'Setup Your Organization'}
            </span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mx-auto">
            {currentStep === 'account' 
              ? 'Create your account and join our security platform'
              : 'Set up your organization and invite your team'
            }
          </p>
          
          {/* Enhanced Step Progress Indicator */}
          <div className="flex items-center justify-center mt-8 space-x-8">
            <div className={`flex items-center transition-all duration-500 ${currentStep === 'account' ? 'text-purple-400' : 'text-green-400'}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold relative overflow-hidden ${
                currentStep === 'account' 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-purple-400' 
                  : 'bg-gradient-to-br from-green-500 to-blue-500 border-2 border-green-400'
              }`}>
                <div className="absolute inset-0 bg-white/10 animate-pulse" />
                <span className="relative z-10">
                  {currentStep === 'account' ? '01' : <CheckCircle className="w-6 h-6" />}
                </span>
              </div>
              <span className="ml-3 text-lg font-medium">Account Setup</span>
            </div>
            
            <div className={`w-16 h-1 rounded-full transition-all duration-500 ${
              currentStep === 'organization' ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-slate-700'
            }`} />
            
            <div className={`flex items-center transition-all duration-500 ${currentStep === 'organization' ? 'text-purple-400' : 'text-slate-500'}`}>
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg font-bold relative overflow-hidden ${
                currentStep === 'organization' 
                  ? 'bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-purple-400' 
                  : 'bg-slate-800 border-2 border-slate-600'
              }`}>
                <div className="absolute inset-0 bg-white/10 animate-pulse" />
                <span className="relative z-10">02</span>
              </div>
              <span className="ml-3 text-lg font-medium">Organization Setup</span>
            </div>
          </div>
        </div>

        {/* Registration Form */}
        <div className="relative bg-slate-800/60 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-10 shadow-2xl overflow-hidden">
          {/* Animated Border */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-blue-500/20 rounded-3xl opacity-0 hover:opacity-100 transition-opacity animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-t-3xl" />
          
          <div className="relative z-10">
            {/* Security Alert */}
            {(error || orgError) && (
              <div className="mb-8 p-6 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-sm animate-pulse">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">!</span>
                  </div>
                  <div>
                    <h4 className="text-red-300 font-semibold mb-1">ERROR</h4>
                    <p className="text-red-200 text-sm">
                      {(() => {
                        const currentError = error || orgError;
                        if (currentError && typeof currentError === 'object' && 'message' in currentError) {
                          return (currentError as { message: string }).message;
                        }
                        if (currentError && typeof currentError === 'string') {
                          return currentError;
                        }
                        return currentStep === 'account' ? 'Account creation failed. Please try again.' : 'Organization setup failed. Please try again.';
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-8">
              {currentStep === 'account' && (
                <>
                  {/* Account Information Section */}
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <User className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-2xl font-bold text-white">Personal Information</h3>
                    </div>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-slate-700 mb-2">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.firstName ? 'border-red-300' : 'border-slate-300'
                        }`}
                        placeholder="John"
                      />
                      {formErrors.firstName && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.firstName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-slate-700 mb-2">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.lastName ? 'border-red-300' : 'border-slate-300'
                        }`}
                        placeholder="Doe"
                      />
                      {formErrors.lastName && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.email ? 'border-red-300' : 'border-slate-300'
                          }`}
                          placeholder="admin@yourcompany.com"
                        />
                      </div>
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-700 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="+233 XX XXX XXXX"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-slate-700 mb-2">
                      Role <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white ${
                          formErrors.role ? 'border-red-300' : 'border-slate-300'
                        }`}
                      >
                        <option value="ORG_ADMIN">Organization Administrator</option>
                        <option value="ORG_MANAGER">Organization Manager</option>
                        <option value="END_USER">End User</option>
                      </select>
                    </div>
                    {formErrors.role && (
                      <p className="mt-1 text-sm text-red-600">{formErrors.role}</p>
                    )}
                    <div className="mt-2 text-xs text-slate-500 space-y-1">
                      <p><strong>Admin:</strong> Full organization management access</p>
                      <p><strong>Manager:</strong> Can manage users and view reports</p>
                      <p><strong>End User:</strong> Basic user access</p>
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                    <Lock className="w-5 h-5 mr-2 text-blue-600" />
                    Account Security
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="password"
                        name="password"
                        type="password"
                        required
                        minLength={8}
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.password ? 'border-red-300' : 'border-slate-300'
                        }`}
                        placeholder="••••••••"
                      />
                      {formErrors.password && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                      )}
                      <p className="mt-1 text-xs text-slate-500">Minimum 8 characters</p>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        required
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                          formErrors.confirmPassword ? 'border-red-300' : 'border-slate-300'
                        }`}
                        placeholder="••••••••"
                      />
                      {formErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <div className="flex items-start">
                    <input
                      id="acceptTerms"
                      name="acceptTerms"
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
                    />
                    <label htmlFor="acceptTerms" className="ml-3 text-sm text-slate-700">
                      I agree to the{' '}
                      <Link to="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                        Privacy Policy
                      </Link>
                      <span className="text-red-500"> *</span>
                    </label>
                  </div>
                  {formErrors.acceptTerms && (
                    <p className="text-sm text-red-600">{formErrors.acceptTerms}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-r-transparent rounded-full animate-spin mr-2"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5 mr-2" />
                      Continue to Organization Setup
                    </>
                  )}
                </button>
              </>
            )}

            {currentStep === 'organization' && (
              <>
                {/* Organization Setup Form */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-slate-900 flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                    Organization Setup
                  </h3>

                  {/* Action Selection */}
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">Choose how you want to proceed:</p>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <label className={`relative cursor-pointer p-4 rounded-lg border-2 transition-colors ${
                        orgData.action === 'create' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'
                      }`}>
                        <input
                          type="radio"
                          name="action"
                          value="create"
                          checked={orgData.action === 'create'}
                          onChange={handleOrgInputChange}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <Plus className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                          <h4 className="font-semibold text-sm text-slate-900">Create New</h4>
                          <p className="text-xs text-slate-600 mt-1">Start fresh organization</p>
                        </div>
                      </label>

                      <label className={`relative cursor-pointer p-4 rounded-lg border-2 transition-colors ${
                        orgData.action === 'browse' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'
                      }`}>
                        <input
                          type="radio"
                          name="action"
                          value="browse"
                          checked={orgData.action === 'browse'}
                          onChange={handleOrgInputChange}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <Search className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                          <h4 className="font-semibold text-sm text-slate-900">Browse & Join</h4>
                          <p className="text-xs text-slate-600 mt-1">Find public organizations</p>
                        </div>
                      </label>

                      <label className={`relative cursor-pointer p-4 rounded-lg border-2 transition-colors ${
                        orgData.action === 'join' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white'
                      }`}>
                        <input
                          type="radio"
                          name="action"
                          value="join"
                          checked={orgData.action === 'join'}
                          onChange={handleOrgInputChange}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <Users className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                          <h4 className="font-semibold text-sm text-slate-900">Use Invite</h4>
                          <p className="text-xs text-slate-600 mt-1">Have an invite code</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Create Organization Form */}
                  {orgData.action === 'create' && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="organizationName" className="block text-sm font-medium text-slate-700 mb-2">
                          Organization Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="organizationName"
                          name="organizationName"
                          type="text"
                          required
                          value={orgData.organizationName}
                          onChange={handleOrgInputChange}
                          className={`w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.organizationName ? 'border-red-300' : 'border-slate-300'
                          }`}
                          placeholder="Your Company Name"
                        />
                        {formErrors.organizationName && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.organizationName}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="orgEmail" className="block text-sm font-medium text-slate-700 mb-2">
                          Institutional Email <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="orgEmail"
                          name="email"
                          type="email"
                          required
                          value={orgData.email}
                          onChange={handleOrgInputChange}
                          className={`w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.orgEmail ? 'border-red-300' : 'border-slate-300'
                          }`}
                          placeholder="contact@yourcompany.com"
                        />
                        {formErrors.orgEmail && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.orgEmail}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="industry" className="block text-sm font-medium text-slate-700 mb-2">
                            Industry <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="industry"
                            name="industry"
                            value={orgData.industry}
                            onChange={handleOrgInputChange}
                            className={`w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white ${
                              formErrors.industry ? 'border-red-300' : 'border-slate-300'
                            }`}
                          >
                            <option value="">Select Industry</option>
                            <option value={Sector.BANKING}>Banking</option>
                            <option value={Sector.TELECOMMUNICATIONS}>Telecommunications</option>
                            <option value={Sector.INSURANCE}>Insurance</option>
                            <option value={Sector.GOVERNMENT}>Government</option>
                            <option value={Sector.HEALTHCARE}>Healthcare</option>
                            <option value={Sector.EDUCATION}>Education</option>
                            <option value={Sector.ENERGY}>Energy</option>
                            <option value={Sector.MANUFACTURING}>Manufacturing</option>
                            <option value={Sector.RETAIL}>Retail</option>
                            <option value={Sector.LOGISTICS}>Logistics</option>
                            <option value={Sector.TECHNOLOGY}>Technology</option>
                            <option value={Sector.NGO}>NGO</option>
                            <option value={Sector.OTHER}>Other</option>
                          </select>
                          {formErrors.industry && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.industry}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="size" className="block text-sm font-medium text-slate-700 mb-2">
                            Organization Size <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="size"
                            name="size"
                            value={orgData.size}
                            onChange={handleOrgInputChange}
                            className={`w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white ${
                              formErrors.size ? 'border-red-300' : 'border-slate-300'
                            }`}
                          >
                            <option value="">Select Size</option>
                            <option value={OrganizationSize.MICRO}>1-5 employees</option>
                            <option value={OrganizationSize.SMALL}>6-50 employees</option>
                            <option value={OrganizationSize.MEDIUM}>51-250 employees</option>
                            <option value={OrganizationSize.LARGE}>251-1000 employees</option>
                            <option value={OrganizationSize.ENTERPRISE}>1000+ employees</option>
                          </select>
                          {formErrors.size && (
                            <p className="mt-1 text-sm text-red-600">{formErrors.size}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                          Description (Optional)
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={3}
                          value={orgData.description}
                          onChange={handleOrgInputChange}
                          className="w-full px-3 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                          placeholder="Brief description of your organization..."
                        />
                      </div>
                    </div>
                  )}

                  {/* Browse Organizations Form */}
                  {orgData.action === 'browse' && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="searchQuery" className="block text-sm font-medium text-slate-700 mb-2">
                          Search Organizations
                        </label>
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            id="searchQuery"
                            name="searchQuery"
                            type="text"
                            value={orgData.searchQuery}
                            onChange={handleOrgInputChange}
                            className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search by organization name..."
                          />
                        </div>
                      </div>

                      {/* Organization List */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-700">Available Organizations</h4>
                        {isLoadingOrgs ? (
                          <div className="text-center py-4">
                            <div className="inline-block w-6 h-6 border-2 border-blue-500 border-r-transparent rounded-full animate-spin"></div>
                            <p className="text-sm text-slate-600 mt-2">Loading organizations...</p>
                          </div>
                        ) : publicOrgs?.data?.length ? (
                          <div className="max-h-48 overflow-y-auto space-y-2">
                            {publicOrgs.data.map((org) => (
                              <label
                                key={org.id}
                                className={`block p-3 border rounded-lg cursor-pointer transition-colors ${
                                  orgData.selectedOrgId === org.id
                                    ? 'border-blue-500 bg-blue-50'
                                    : 'border-slate-200 hover:border-slate-300'
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="selectedOrgId"
                                  value={org.id}
                                  checked={orgData.selectedOrgId === org.id}
                                  onChange={handleOrgInputChange}
                                  className="sr-only"
                                />
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <h5 className="font-medium text-slate-900">{org.name}</h5>
                                    <p className="text-sm text-slate-600">{org.sector} • {org.size}</p>
                                    {org.description && (
                                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">{org.description}</p>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs text-slate-500">{org.memberCount} members</span>
                                    <Building2 className="w-4 h-4 text-slate-400" />
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-slate-500">
                            <Building2 className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-sm">No organizations found</p>
                            <p className="text-xs">Try a different search term</p>
                          </div>
                        )}
                        {formErrors.selectedOrgId && (
                          <p className="text-sm text-red-600">{formErrors.selectedOrgId}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Join Organization Form */}
                  {orgData.action === 'join' && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="inviteCode" className="block text-sm font-medium text-slate-700 mb-2">
                          Invitation Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          id="inviteCode"
                          name="inviteCode"
                          type="text"
                          required
                          value={orgData.inviteCode}
                          onChange={handleOrgInputChange}
                          className={`w-full px-3 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                            formErrors.inviteCode ? 'border-red-300' : 'border-slate-300'
                          }`}
                          placeholder="Enter your invitation code"
                        />
                        {formErrors.inviteCode && (
                          <p className="mt-1 text-sm text-red-600">{formErrors.inviteCode}</p>
                        )}
                        <p className="mt-1 text-xs text-slate-500">
                          Your organization administrator should provide you with this code
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep('account')}
                      className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium transition-colors"
                    >
                      Back to Account
                    </button>
                    <button
                      type="submit"
                      disabled={isOrgLoading}
                      className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors flex items-center justify-center"
                    >
                      {isOrgLoading ? (
                        'Setting up...'
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Complete Setup
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Skip Organization Button */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-slate-500">or</span>
                    </div>
                  </div>
                  
                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleSkipOrganization}
                      className="inline-flex items-center px-4 py-2 text-slate-600 hover:text-blue-600 text-sm font-medium transition-colors border border-slate-200 rounded-lg hover:border-blue-200 hover:bg-blue-50"
                    >
                      <span>Skip for now - I'll set up my organization later</span>
                    </button>
                    <p className="text-xs text-slate-500 mt-2">
                      You can always create or join an organization from your dashboard
                    </p>
                  </div>
                </div>
              </>
            )}

            {currentStep === 'account' && (
              <div className="text-center">
                <p className="text-sm text-slate-600">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
                    Sign in
                  </Link>
                </p>
              </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;