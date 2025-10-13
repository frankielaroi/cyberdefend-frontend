import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useResetPasswordMutation } from '../../store/api/authApi';
import { Shield, Lock, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [resetPassword, { isLoading }] = useResetPasswordMutation();
  
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [token, setToken] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    const tokenFromUrl = searchParams.get('token');
    if (!tokenFromUrl) {
      setError('Invalid or missing security token');
      return;
    }
    setToken(tokenFromUrl);
    
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [searchParams]);

  const validateForm = () => {
    if (!formData.password) {
      setError('Password is required');
      return false;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    if (!token) {
      setError('Invalid reset token');
      return;
    }

    try {
      await resetPassword({
        token,
        password: formData.password,
      }).unwrap();
      
      setIsSuccess(true);
    } catch (err: any) {
      const errorMessage = err?.data?.message || 'Failed to reset password. Please try again.';
      setError(errorMessage);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
        {/* Animated Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          {/* Success Grid Pattern */}
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(34, 197, 94, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(34, 197, 94, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              transform: `translate(${mousePosition.x * 0.005}px, ${mousePosition.y * 0.005}px)`
            }}
          />
          
          {/* Success Particles */}
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-green-400 rounded-full opacity-30 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
          
          {/* Success Gradient Orbs */}
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className={`max-w-md w-full relative z-10 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Success Header */}
          <div className="text-center mb-12">
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-blue-600 rounded-3xl mb-6 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-blue-500 rounded-3xl animate-pulse opacity-75" />
              <CheckCircle className="w-14 h-14 text-white relative z-10" />
              
              {/* Success Animation */}
              <div className="absolute inset-0 border-2 border-green-400 rounded-3xl animate-ping opacity-30" />
              <div className="absolute inset-2 border border-blue-400 rounded-2xl animate-pulse opacity-50" />
            </div>
            
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-green-200 to-white bg-clip-text text-transparent">
                Security Protocol Updated
              </span>
            </h1>
            <p className="text-slate-300 text-lg">Access credentials successfully reconfigured</p>
          </div>

          {/* Success Message */}
          <div className="relative bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 via-blue-500 to-green-500 rounded-t-2xl" />
            
            <div className="relative z-10 text-center space-y-6">
              <div className="p-6 bg-green-500/10 border border-green-500/30 rounded-2xl backdrop-blur-sm">
                <p className="text-green-300 font-medium">
                  Password successfully updated. Your account is now secure with your new password.
                </p>
              </div>
              
              <div className="space-y-4 text-slate-300">
                <p className="text-sm leading-relaxed">
                  ✅ New password saved<br />
                  ✅ Old password removed<br />
                  ✅ Security clearance updated
                </p>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => navigate('/login')}
                className="group relative w-full py-4 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white rounded-xl font-medium text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">Continue to Dashboard</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
        {/* Animated Background Effects - Error State */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div 
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `
                linear-gradient(rgba(239, 68, 68, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(239, 68, 68, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: '50px 50px',
              transform: `translate(${mousePosition.x * 0.005}px, ${mousePosition.y * 0.005}px)`
            }}
          />
          
          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-red-400 rounded-full opacity-20 animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
          
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-red-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse" />
        </div>

        <div className={`max-w-md w-full relative z-10 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          <div className="text-center mb-12">
            <div className="relative inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-red-500 to-orange-600 rounded-3xl mb-6 shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-red-400 to-orange-500 rounded-3xl animate-pulse opacity-75" />
              <AlertCircle className="w-14 h-14 text-white relative z-10" />
              
              <div className="absolute inset-0 border-2 border-red-400 rounded-3xl animate-ping opacity-30" />
            </div>
            
            <h1 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-red-200 to-white bg-clip-text text-transparent">
                Security Token Invalid
              </span>
            </h1>
            <p className="text-slate-300 text-lg">Access credentials compromised or expired</p>
          </div>

          <div className="relative bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500 rounded-t-2xl" />
            
            <div className="relative z-10 text-center space-y-6">
              <div className="p-6 bg-red-500/10 border border-red-500/30 rounded-2xl backdrop-blur-sm">
                <p className="text-red-300 font-medium">
                  🚨 The security token is invalid, expired, or has been compromised.
                </p>
              </div>
              
              <div className="space-y-4 text-slate-300">
                <p className="text-sm leading-relaxed">
                  🔄 Initiate new recovery protocol<br />
                  ⚠️ Previous tokens have been neutralized
                </p>
              </div>
            </div>

            <div className="mt-8 space-y-4">
              <Link
                to="/forgot-password"
                className="group relative w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white rounded-xl font-medium text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-red-500/25 overflow-hidden flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">🔄 Request New Protocol</span>
              </Link>
              
              <Link
                to="/login"
                className="group relative w-full py-4 bg-slate-900/50 border-2 border-slate-600 hover:border-red-500 text-slate-300 hover:text-white rounded-xl font-medium text-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm overflow-hidden flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">🔙 Return to Base</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 overflow-hidden">
      {/* Animated Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(147, 51, 234, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(147, 51, 234, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            transform: `translate(${mousePosition.x * 0.005}px, ${mousePosition.y * 0.005}px)`
          }}
        />
        
        {Array.from({ length: 35 }).map((_, i) => (
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
        
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className={`max-w-md w-full relative z-10 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {/* Header */}
        <div className="text-center mb-12">
          <div className="relative inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-6 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-400 to-blue-500 rounded-2xl animate-pulse opacity-75" />
            <Shield className="w-12 h-12 text-white relative z-10" />
            
            <div className="absolute inset-0 border-2 border-purple-400 rounded-2xl animate-ping opacity-30" />
            <div className="absolute inset-2 border border-blue-400 rounded-xl animate-pulse opacity-50" />
          </div>
          
          <h1 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
              Reset Your Password
            </span>
          </h1>
          <p className="text-slate-300 text-lg">Create a new password for your account</p>
          
          <div className="inline-flex items-center gap-2 mt-4 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <span className="text-purple-300 text-sm font-medium">SECURE CONNECTION</span>
          </div>
        </div>

        {/* Reset Form */}
        <div className="relative bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 hover:opacity-100 transition-opacity animate-pulse" />
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500 rounded-t-2xl" />
          
          <div className="relative z-10">
            {/* Security Alert */}
            {error && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                  <p className="text-red-300 text-sm font-medium">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* New Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  New Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-purple-400 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-12 py-4 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500/50 focus:bg-slate-900/70 transition-all backdrop-blur-sm"
                    placeholder="••••••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 hover:text-purple-400 transition-colors"
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-blue-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <p className="text-xs text-slate-400 font-mono">Minimum 8 characters required</p>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Confirm Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-hover:text-blue-400 transition-colors" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full pl-12 pr-12 py-4 bg-slate-900/50 border border-slate-600/50 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-slate-900/70 transition-all backdrop-blur-sm"
                    placeholder="••••••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 hover:text-blue-400 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <p className="text-xs text-slate-400 font-mono">🔄 Confirm cipher authentication</p>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl font-medium text-lg transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg hover:shadow-purple-500/25 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Updating Password...
                    </>
                  ) : (
                    <>
                      Update Password
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Back Link */}
            <div className="mt-8 text-center">
              <Link 
                to="/login" 
                className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors group flex items-center justify-center gap-2"
              >
                <span className="group-hover:underline">Return to Command Center</span>
              </Link>
            </div>

            {/* Security Features */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              {[
                { label: 'Encrypted' },
                { label: 'Instant' },
                { label: 'Secure' }
              ].map((feature, index) => (
                <div key={index} className="p-3 bg-slate-900/30 rounded-xl border border-slate-700/30">
                  <div className="text-xs text-slate-400 font-medium">{feature.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}