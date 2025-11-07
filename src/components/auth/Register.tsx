import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useRegisterMutation } from '../../store/api/authApi';
import { useCreateOrganizationMutation, useJoinOrganizationMutation, useGetOrganizationsQuery } from '../../store/api/organizationApi';
import { useTransferAnonymousAssessmentMutation } from '../../store/api/realDefendXApi';
import { useAppDispatch } from '../../store/hooks';
import { setCredentials } from '../../store/slices/authSlice';
import { clearAnonymousSession, getAnonymousAssessmentResult } from '../../utils/anonymousSession';
import { Shield, User, Mail, Phone, Lock, CheckCircle, Users, Building2, Plus, Search, Eye, EyeOff } from 'lucide-react';
import type { UserRole } from '../../types';
import { Sector, OrganizationSize } from '../../types';

type RegistrationStep = 'account' | 'organization';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const [register, { isLoading, error }] = useRegisterMutation();
  const [createOrganization, { isLoading: isCreatingOrg, error: createOrgError }] = useCreateOrganizationMutation();
  const [joinOrganization, { isLoading: isJoiningOrg, error: joinOrgError }] = useJoinOrganizationMutation();
  const [transferAssessment] = useTransferAnonymousAssessmentMutation();
  
  const [currentStep, setCurrentStep] = useState<RegistrationStep>('account');
  const [userCredentials, setUserCredentials] = useState<any>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [hasAnonymousAssessment, setHasAnonymousAssessment] = useState(false);

  // Get anonymous assessment data from navigation state or session storage
  const fromAnonymousAssessment = location.state?.fromAnonymousAssessment;
  const anonymousSessionId = location.state?.sessionId;
  const anonymousAssessmentId = location.state?.assessmentId;
  
  // Also check session storage for completed anonymous assessment
  
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
    
    // Check for anonymous assessment
    const checkAnonymousAssessment = () => {
      const hasStateAssessment = location.state?.sessionId && location.state?.assessmentId;
      const storedResult = getAnonymousAssessmentResult();
      setHasAnonymousAssessment(hasStateAssessment || !!storedResult);
    };
    
    checkAnonymousAssessment();
    
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

  // Helper function to handle assessment transfer with loading state and error handling
  const handleAssessmentTransfer = async (
    sessionId: string,
    assessmentId: string,
    userId: string,
    organizationId: string,
    authToken?: string
  ) => {
    try {
      // Wait a moment to ensure Redux state is updated with the new token
      if (authToken) {
        // If token is provided, it will be used by the API slice from Redux
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      await transferAssessment({
        sessionId,
        userId,
        organizationId,
      }).unwrap();
      
      // Clear anonymous session data
      clearAnonymousSession();
      
      // Navigate to assessment results
      navigate(`/dashboard`);
      return true;
    } catch (err: any) {
      console.error('Failed to transfer assessment:', err);
      // Show error message to user
      setFormErrors(prev => ({
        ...prev,
        transfer: 'Failed to transfer assessment. You can try again from the dashboard.'
      }));
      return false;
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

      // If there is a completed anonymous assessment in session storage, transfer it now
      if (!fromAnonymousAssessment) {
        const storedResult = getAnonymousAssessmentResult();
        const sessionToTransfer = storedResult?.sessionId;
        const assessmentToTransfer = storedResult?.assessmentId;
        const organizationId = result.user?.organizationId || result.user?.organization?.id;
        
        if (sessionToTransfer && assessmentToTransfer && result.user?.id && organizationId) {
          const transferred = await handleAssessmentTransfer(
            sessionToTransfer,
            assessmentToTransfer,
            result.user.id,
            organizationId,
            result.access_token
          );
          if (transferred) return;
        }
      }
      
      // If coming from anonymous assessment, transfer it to the authenticated user
      if (fromAnonymousAssessment && anonymousSessionId && result.user?.id) {
        const organizationId = result.user?.organizationId || result.user?.organization?.id;
        if (organizationId) {
          const transferred = await handleAssessmentTransfer(
            anonymousSessionId,
            anonymousAssessmentId || '',
            result.user.id,
            organizationId,
            result.access_token
          );
          if (transferred) return;
        }
      }

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
      let organizationId: string | undefined;

      // Create or join organization based on selected action
      if (orgData.action === 'create') {
        console.log('Creating new organization...');
        const createResult = await createOrganization({
          name: orgData.organizationName,
          sector: orgData.industry as any,
          email: orgData.email,
          size: orgData.size as any,
          description: orgData.description,
        }).unwrap();
        organizationId = createResult.id;
        console.log('Organization created successfully with ID:', organizationId);
      } else if (orgData.action === 'join') {
        console.log('Joining organization with invite code...');
        const joinResult = await joinOrganization({
          inviteCode: orgData.inviteCode,
        }).unwrap();
        organizationId = joinResult.data?.organization?.id;
        console.log('Joined organization with ID:', organizationId);
      } else if (orgData.action === 'browse') {
        console.log('Joining selected organization...');
        const joinResult = await joinOrganization({
          organizationId: orgData.selectedOrgId,
        }).unwrap();
        organizationId = joinResult.data?.organization?.id || orgData.selectedOrgId;
        console.log('Joined selected organization with ID:', organizationId);
      }

      if (!organizationId) {
        console.error('Organization ID not available after creation/join');
        throw new Error('Failed to get organization ID');
      }

      // Handle anonymous assessment transfer
      let assessmentTransferred = false;

      // First check for stored anonymous assessment result
      console.log('Checking for stored anonymous assessment...');
      const storedResult = getAnonymousAssessmentResult();
      if (storedResult?.sessionId && storedResult?.assessmentId && userCredentials?.user?.id) {
        console.log('Found stored anonymous assessment, attempting transfer...');
        assessmentTransferred = await handleAssessmentTransfer(
          storedResult.sessionId,
          storedResult.assessmentId,
          userCredentials.user.id,
          organizationId,
          userCredentials.access_token
        );
      }

      // If no stored result was transferred, check for assessment from navigation state
      if (!assessmentTransferred && fromAnonymousAssessment && anonymousSessionId && userCredentials?.user?.id) {
        console.log('Found anonymous assessment from navigation, attempting transfer...');
        assessmentTransferred = await handleAssessmentTransfer(
          anonymousSessionId,
          anonymousAssessmentId || '',
          userCredentials.user.id,
          organizationId,
          userCredentials.access_token
        );
      }

      // Navigate based on whether an assessment was transferred
      if (assessmentTransferred) {
        console.log('Assessment transferred successfully, navigating to results...');
        // Navigation to results is handled by handleAssessmentTransfer
        return;
      }

      console.log('No assessment to transfer or transfer not needed, navigating to dashboard...');
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
                      <label htmlFor="firstName" className="block text-sm font-medium text-slate-300 mb-2">
                        First Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-slate-400 backdrop-blur-sm transition-all duration-200 ${
                          formErrors.firstName ? 'border-red-400/50' : 'border-slate-600/50'
                        }`}
                        placeholder="John"
                      />
                      {formErrors.firstName && (
                        <p className="mt-1 text-sm text-red-400">{formErrors.firstName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-slate-300 mb-2">
                        Last Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-slate-400 backdrop-blur-sm transition-all duration-200 ${
                          formErrors.lastName ? 'border-red-400/50' : 'border-slate-600/50'
                        }`}
                        placeholder="Doe"
                      />
                      {formErrors.lastName && (
                        <p className="mt-1 text-sm text-red-400">{formErrors.lastName}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                        Email Address <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`w-full pl-12 pr-4 py-3 bg-slate-700/50 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-slate-400 backdrop-blur-sm transition-all duration-200 ${
                            formErrors.email ? 'border-red-400/50' : 'border-slate-600/50'
                          }`}
                          placeholder="admin@yourcompany.com"
                        />
                      </div>
                      {formErrors.email && (
                        <p className="mt-1 text-sm text-red-400">{formErrors.email}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                        Phone Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-slate-400 backdrop-blur-sm transition-all duration-200"
                          placeholder="+233 XX XXX XXXX"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-2">
                      Role <span className="text-red-400">*</span>
                    </label>
                    <div className="relative">
                      <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 z-10" />
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        className={`w-full pl-12 pr-4 py-3 bg-slate-700/50 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white appearance-none backdrop-blur-sm transition-all duration-200 ${
                          formErrors.role ? 'border-red-400/50' : 'border-slate-600/50'
                        }`}
                      >
                        <option value="ORG_ADMIN" className="bg-slate-700 text-white">Organization Administrator</option>
                        <option value="ORG_MANAGER" className="bg-slate-700 text-white">Organization Manager</option>
                        <option value="END_USER" className="bg-slate-700 text-white">End User</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {formErrors.role && (
                      <p className="mt-1 text-sm text-red-400">{formErrors.role}</p>
                    )}
                    <div className="mt-3 p-3 bg-slate-700/30 rounded-lg border border-slate-600/30 backdrop-blur-sm">
                      <div className="text-xs text-slate-400 space-y-1">
                        <p><strong className="text-slate-300">Admin:</strong> Full organization management access</p>
                        <p><strong className="text-slate-300">Manager:</strong> Can manage users and view reports</p>
                        <p><strong className="text-slate-300">End User:</strong> Basic user access</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Password Section */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Lock className="w-5 h-5 mr-2 text-purple-400" />
                    Account Security
                  </h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                        Password <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          minLength={8}
                          value={formData.password}
                          onChange={handleInputChange}
                          className={`w-full px-4 pr-12 py-3 bg-slate-700/50 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-slate-400 backdrop-blur-sm transition-all duration-200 ${
                            formErrors.password ? 'border-red-400/50' : 'border-slate-600/50'
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {formErrors.password && (
                        <p className="mt-1 text-sm text-red-400">{formErrors.password}</p>
                      )}
                      <p className="mt-2 text-xs text-slate-400">Minimum 8 characters</p>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                        Confirm Password <span className="text-red-400">*</span>
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full px-4 pr-12 py-3 bg-slate-700/50 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-slate-400 backdrop-blur-sm transition-all duration-200 ${
                            formErrors.confirmPassword ? 'border-red-400/50' : 'border-slate-600/50'
                          }`}
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      {formErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-400">{formErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <div className="flex items-start p-4 bg-slate-700/30 rounded-xl border border-slate-600/30 backdrop-blur-sm">
                    <input
                      id="acceptTerms"
                      name="acceptTerms"
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      className="mt-1 h-4 w-4 text-purple-500 focus:ring-purple-500 border-slate-600 rounded bg-slate-700/50"
                    />
                    <label htmlFor="acceptTerms" className="ml-3 text-sm text-slate-300 leading-relaxed">
                      I agree to the{' '}
                      <Link to="/terms" className="text-purple-400 hover:text-purple-300 font-medium transition-colors underline underline-offset-2">
                        Terms of Service
                      </Link>
                      {' '}and{' '}
                      <Link to="/privacy" className="text-purple-400 hover:text-purple-300 font-medium transition-colors underline underline-offset-2">
                        Privacy Policy
                      </Link>
                      <span className="text-red-400 ml-1">*</span>
                    </label>
                  </div>
                  {formErrors.acceptTerms && (
                    <p className="text-sm text-red-400">{formErrors.acceptTerms}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-r-transparent rounded-full animate-spin mr-3"></div>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <User className="w-5 h-5 mr-3" />
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
                  <h3 className="text-lg font-semibold text-white flex items-center">
                    <Building2 className="w-5 h-5 mr-2 text-purple-400" />
                    Organization Setup
                  </h3>

                  {/* Anonymous Assessment Notice */}
                  {hasAnonymousAssessment && (
                    <div className="mb-6 bg-blue-500/10 border border-blue-400/30 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Shield className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-blue-300 font-medium mb-1">Anonymous Assessment Detected</h4>
                          <p className="text-sm text-slate-400">
                            We found your recent assessment results. Complete your organization setup to view your full results and insights.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Selection */}
                  <div className="space-y-4">
                    <p className="text-sm text-slate-400">Choose how you want to proceed:</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <label className={`relative cursor-pointer p-6 rounded-xl border-2 transition-all duration-200 backdrop-blur-sm ${
                        orgData.action === 'create'
                          ? 'border-purple-400 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                          : 'border-slate-600/50 bg-slate-700/30 hover:border-slate-500/70 hover:bg-slate-700/50'
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
                          <Plus className={`w-8 h-8 mx-auto mb-3 ${orgData.action === 'create' ? 'text-purple-400' : 'text-slate-400'}`} />
                          <h4 className={`font-semibold text-sm mb-2 ${orgData.action === 'create' ? 'text-white' : 'text-slate-300'}`}>Create Organization</h4>
                          <p className="text-xs text-slate-400">Create a new organization for your team</p>
                        </div>
                      </label>

                      <label className={`relative cursor-pointer p-6 rounded-xl border-2 transition-all duration-200 backdrop-blur-sm ${
                        orgData.action === 'browse'
                          ? 'border-purple-400 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                          : 'border-slate-600/50 bg-slate-700/30 hover:border-slate-500/70 hover:bg-slate-700/50'
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
                          <Search className={`w-8 h-8 mx-auto mb-3 ${orgData.action === 'browse' ? 'text-purple-400' : 'text-slate-400'}`} />
                          <h4 className={`font-semibold text-sm mb-2 ${orgData.action === 'browse' ? 'text-white' : 'text-slate-300'}`}>Browse & Join</h4>
                          <p className="text-xs text-slate-400">Find public organizations</p>
                        </div>
                      </label>

                      <label className={`relative cursor-pointer p-6 rounded-xl border-2 transition-all duration-200 backdrop-blur-sm ${
                        orgData.action === 'join'
                          ? 'border-purple-400 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                          : 'border-slate-600/50 bg-slate-700/30 hover:border-slate-500/70 hover:bg-slate-700/50'
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
                          <Users className={`w-8 h-8 mx-auto mb-3 ${orgData.action === 'join' ? 'text-purple-400' : 'text-slate-400'}`} />
                          <h4 className={`font-semibold text-sm mb-2 ${orgData.action === 'join' ? 'text-white' : 'text-slate-300'}`}>Use Invite</h4>
                          <p className="text-xs text-slate-400">Have an invite code</p>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Create Organization Form */}
                  {orgData.action === 'create' && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="organizationName" className="block text-sm font-medium text-slate-300 mb-2">
                          Organization Name <span className="text-red-400">*</span>
                        </label>
                        <input
                          id="organizationName"
                          name="organizationName"
                          type="text"
                          required
                          value={orgData.organizationName}
                          onChange={handleOrgInputChange}
                          className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-slate-400 backdrop-blur-sm transition-all duration-200 ${
                            formErrors.organizationName ? 'border-red-400/50' : 'border-slate-600/50'
                          }`}
                          placeholder="Your Company Name"
                        />
                        {formErrors.organizationName && (
                          <p className="mt-1 text-sm text-red-400">{formErrors.organizationName}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="orgEmail" className="block text-sm font-medium text-slate-300 mb-2">
                          Institutional Email <span className="text-red-400">*</span>
                        </label>
                        <input
                          id="orgEmail"
                          name="email"
                          type="email"
                          required
                          value={orgData.email}
                          onChange={handleOrgInputChange}
                          className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-slate-400 backdrop-blur-sm transition-all duration-200 ${
                            formErrors.orgEmail ? 'border-red-400/50' : 'border-slate-600/50'
                          }`}
                          placeholder="contact@yourcompany.com"
                        />
                        {formErrors.orgEmail && (
                          <p className="mt-1 text-sm text-red-400">{formErrors.orgEmail}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="industry" className="block text-sm font-medium text-slate-300 mb-2">
                            Industry <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <select
                              id="industry"
                              name="industry"
                              value={orgData.industry}
                              onChange={handleOrgInputChange}
                              className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white appearance-none backdrop-blur-sm transition-all duration-200 ${
                                formErrors.industry ? 'border-red-400/50' : 'border-slate-600/50'
                              }`}
                            >
                              <option value="" className="bg-slate-700 text-white">Select Industry</option>
                              <option value={Sector.BANKING} className="bg-slate-700 text-white">Banking</option>
                              <option value={Sector.TELECOMMUNICATIONS} className="bg-slate-700 text-white">Telecommunications</option>
                              <option value={Sector.INSURANCE} className="bg-slate-700 text-white">Insurance</option>
                              <option value={Sector.GOVERNMENT} className="bg-slate-700 text-white">Government</option>
                              <option value={Sector.HEALTHCARE} className="bg-slate-700 text-white">Healthcare</option>
                              <option value={Sector.EDUCATION} className="bg-slate-700 text-white">Education</option>
                              <option value={Sector.ENERGY} className="bg-slate-700 text-white">Energy</option>
                              <option value={Sector.MANUFACTURING} className="bg-slate-700 text-white">Manufacturing</option>
                              <option value={Sector.RETAIL} className="bg-slate-700 text-white">Retail</option>
                              <option value={Sector.LOGISTICS} className="bg-slate-700 text-white">Logistics</option>
                              <option value={Sector.TECHNOLOGY} className="bg-slate-700 text-white">Technology</option>
                              <option value={Sector.NGO} className="bg-slate-700 text-white">NGO</option>
                              <option value={Sector.OTHER} className="bg-slate-700 text-white">Other</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          {formErrors.industry && (
                            <p className="mt-1 text-sm text-red-400">{formErrors.industry}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="size" className="block text-sm font-medium text-slate-300 mb-2">
                            Organization Size <span className="text-red-400">*</span>
                          </label>
                          <div className="relative">
                            <select
                              id="size"
                              name="size"
                              value={orgData.size}
                              onChange={handleOrgInputChange}
                              className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white appearance-none backdrop-blur-sm transition-all duration-200 ${
                                formErrors.size ? 'border-red-400/50' : 'border-slate-600/50'
                              }`}
                            >
                              <option value="" className="bg-slate-700 text-white">Select Size</option>
                              <option value={OrganizationSize.MICRO} className="bg-slate-700 text-white">1-5 employees</option>
                              <option value={OrganizationSize.SMALL} className="bg-slate-700 text-white">6-50 employees</option>
                              <option value={OrganizationSize.MEDIUM} className="bg-slate-700 text-white">51-250 employees</option>
                              <option value={OrganizationSize.LARGE} className="bg-slate-700 text-white">251-1000 employees</option>
                              <option value={OrganizationSize.ENTERPRISE} className="bg-slate-700 text-white">1000+ employees</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                              <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          {formErrors.size && (
                            <p className="mt-1 text-sm text-red-400">{formErrors.size}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                          Description (Optional)
                        </label>
                        <textarea
                          id="description"
                          name="description"
                          rows={3}
                          value={orgData.description}
                          onChange={handleOrgInputChange}
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-slate-400 backdrop-blur-sm transition-all duration-200 resize-none"
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
                          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                          <input
                            id="searchQuery"
                            name="searchQuery"
                            type="text"
                            value={orgData.searchQuery}
                            onChange={handleOrgInputChange}
                            className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-slate-400 backdrop-blur-sm transition-all duration-200"
                            placeholder="Search by organization name..."
                          />
                        </div>
                      </div>

                      {/* Organization List */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-medium text-slate-300">Available Organizations</h4>
                        {isLoadingOrgs ? (
                          <div className="text-center py-6">
                            <div className="inline-block w-6 h-6 border-2 border-purple-500 border-r-transparent rounded-full animate-spin"></div>
                            <p className="text-sm text-slate-400 mt-2">Loading organizations...</p>
                          </div>
                        ) : publicOrgs?.data?.length ? (
                          <div className="max-h-48 overflow-y-auto space-y-2">
                            {publicOrgs.data.map((org) => (
                              <label
                                key={org.id}
                                className={`block p-4 border rounded-xl cursor-pointer transition-all duration-200 backdrop-blur-sm ${
                                  orgData.selectedOrgId === org.id
                                    ? 'border-purple-400 bg-purple-500/10 shadow-lg shadow-purple-500/20'
                                    : 'border-slate-600/50 bg-slate-700/30 hover:border-slate-500/70 hover:bg-slate-700/50'
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
                                    <h5 className={`font-medium mb-1 ${orgData.selectedOrgId === org.id ? 'text-white' : 'text-slate-300'}`}>{org.name}</h5>
                                    <p className="text-sm text-slate-400">{org.sector} • {org.size}</p>
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
                          <p className="text-sm text-red-400">{formErrors.selectedOrgId}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Join Organization Form */}
                  {orgData.action === 'join' && (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="inviteCode" className="block text-sm font-medium text-slate-300 mb-2">
                          Invitation Code <span className="text-red-400">*</span>
                        </label>
                        <input
                          id="inviteCode"
                          name="inviteCode"
                          type="text"
                          required
                          value={orgData.inviteCode}
                          onChange={handleOrgInputChange}
                          className={`w-full px-4 py-3 bg-slate-700/50 border rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-slate-400 backdrop-blur-sm transition-all duration-200 ${
                            formErrors.inviteCode ? 'border-red-400/50' : 'border-slate-600/50'
                          }`}
                          placeholder="Enter your invitation code"
                        />
                        {formErrors.inviteCode && (
                          <p className="mt-1 text-sm text-red-400">{formErrors.inviteCode}</p>
                        )}
                        <p className="mt-2 text-xs text-slate-400">
                          Your organization administrator should provide you with this code
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep('account')}
                      className="flex-1 py-3 bg-slate-700/50 text-slate-300 rounded-xl hover:bg-slate-600/50 font-medium transition-all duration-200 backdrop-blur-sm border border-slate-600/50 hover:border-slate-500/70"
                    >
                      Back to Account
                    </button>
                    <button
                      type="submit"
                      disabled={isOrgLoading}
                      className="flex-1 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-purple-500/25 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {isOrgLoading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-r-transparent rounded-full animate-spin mr-3"></div>
                          Setting up...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-3" />
                          Complete Setup
                        </>
                      )}
                    </button>
                  </div>

                  {/* Skip Organization Button */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-600/50" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-3 bg-slate-800/80 text-slate-400 rounded-full backdrop-blur-sm">or</span>
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={handleSkipOrganization}
                      className="inline-flex items-center px-6 py-3 text-slate-400 hover:text-purple-400 text-sm font-medium transition-all duration-200 border border-slate-600/50 rounded-xl hover:border-purple-400/50 hover:bg-purple-500/10 backdrop-blur-sm"
                    >
                      <span>Skip for now - I'll set up my organization later</span>
                    </button>
                    <p className="text-xs text-slate-500 mt-3">
                      You can always create or join an organization from your dashboard
                    </p>
                  </div>
                </div>
              </>
            )}

            {currentStep === 'account' && (
              <div className="text-center">
                <p className="text-sm text-slate-400">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-purple-400 hover:text-purple-300 transition-colors underline underline-offset-2">
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