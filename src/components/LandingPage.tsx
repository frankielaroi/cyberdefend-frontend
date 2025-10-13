import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
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
        {Array.from({ length: 20 }).map((_, i) => (
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
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      {/* Header */}
      <header className="relative z-10 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className={`flex items-center transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
              <div className="relative h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl animate-pulse opacity-75" />
                <svg className="h-6 w-6 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                DefendX
              </h1>
            </div>
            <div className={`flex items-center space-x-4 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
              <Link 
                to="/login" 
                className="text-slate-300 hover:text-white font-medium transition-all duration-300 hover:scale-105 relative group"
              >
                Sign In
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity -z-10" />
              </Link>
              <Link 
                to="/register" 
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-blue-500/25 relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative z-10">Get Started</span>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center relative z-10">
            <div className={`transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="inline-block mb-6">
                <span className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full px-6 py-2 text-sm font-medium text-blue-300 backdrop-blur-sm">
                  Security Assessment Platform
                </span>
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold mb-8 leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent animate-pulse">
                  Defend Your Organization
                </span>
                <br />
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                  Against Cyber Threats
                </span>
              </h1>
              
              <p className="text-xl text-slate-300 mb-12 max-w-3xl mx-auto leading-relaxed">
                Modern security platform powered by smart technology. Check your security health, 
                test your defenses, and protect your organization with enterprise-grade security.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
                <Link 
                  to="/register" 
                  className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-medium text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
                  <span className="relative z-10 flex items-center gap-2">
                    Start Free Assessment
                  </span>
                </Link>
                <Link 
                  to="/csi-directory" 
                  className="group relative border-2 border-slate-600 hover:border-blue-500 text-slate-300 hover:text-white px-8 py-4 rounded-xl font-medium text-lg transition-all duration-300 transform hover:scale-105 backdrop-blur-sm overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative z-10 flex items-center gap-2">
                    View Security Rankings
                  </span>
                </Link>
              </div>

              {/* Animated Security Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { value: '99.9%', label: 'Security Coverage', delay: '0s' },
                  { value: '500+', label: 'Companies Trust Us', delay: '0.2s' },
                  { value: '24/7', label: 'Protection Active', delay: '0.4s' },
                  { value: '<1ms', label: 'Fast Response', delay: '0.6s' }
                ].map((stat, index) => (
                  <div 
                    key={index}
                    className="group cursor-pointer"
                    style={{ animationDelay: stat.delay }}
                  >
                    <div className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform">
                      {stat.value}
                    </div>
                    <div className="text-slate-400 text-sm">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Floating Security Elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Hexagon Pattern */}
            <div className="absolute top-20 left-10 w-20 h-20 border border-blue-500/30 rotate-45 animate-spin" style={{ animationDuration: '20s' }} />
            <div className="absolute top-40 right-20 w-16 h-16 border border-purple-500/30 rotate-12 animate-pulse" />
            <div className="absolute bottom-40 left-20 w-12 h-12 border border-green-500/30 rotate-45 animate-bounce" />
            
            {/* Code-like Elements */}
            <div className="absolute top-32 right-32 text-blue-400/30 font-mono text-xs animate-pulse">
              {'<security>'}
            </div>
            <div className="absolute bottom-32 left-32 text-green-400/30 font-mono text-xs animate-pulse">
              {'</protected>'}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 bg-slate-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Advanced Security Arsenal
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Military-grade cybersecurity tools designed for the digital battlefield. 
              Assess, protect, and defend with cutting-edge technology.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* DefendX Assessment */}
            <div className="group relative bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 hover:border-blue-500/50 transition-all duration-500 transform hover:scale-105 overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
              
              <div className="relative z-10">
                <div className="h-16 w-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-blue-500/25 transition-all">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-blue-300 transition-colors">
                  DefendX Assessment
                </h3>
                
                <p className="text-slate-300 mb-6 leading-relaxed">
                  AI-powered cybersecurity assessment engine. Generate your Cyber Safety Index (CSI) 
                  with quantum-grade analysis and real-time threat modeling.
                </p>
                
                <div className="space-y-3">
                  {[
                    'Neural network threat analysis',
                    'Real-time vulnerability scanning',
                    'Predictive risk modeling',
                    'Industry-grade benchmarking'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-slate-300 group-hover:text-white transition-colors">
                      <div className="w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mr-3 animate-pulse" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* DefendX+ Protection */}
            <div className="group relative bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 hover:border-purple-500/50 transition-all duration-500 transform hover:scale-105 overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
              
              <div className="relative z-10">
                <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-purple-500/25 transition-all">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-300 transition-colors">
                  DefendX+ Protection
                </h3>
                
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Advanced threat hunting platform with autonomous defense systems. 
                  Deploy AI-driven phishing simulations and zero-trust monitoring.
                </p>
                
                <div className="space-y-3">
                  {[
                    'Autonomous threat hunting',
                    'Deep-fake phishing simulation',
                    'Quantum-encrypted monitoring',
                    'Zero-trust architecture'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-slate-300 group-hover:text-white transition-colors">
                      <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full mr-3 animate-pulse" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* CSI Directory */}
            <div className="group relative bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 hover:border-green-500/50 transition-all duration-500 transform hover:scale-105 overflow-hidden">
              {/* Animated Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-blue-500 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700" />
              
              <div className="relative z-10">
                <div className="h-16 w-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-green-500/25 transition-all">
                  <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-300 transition-colors">
                  CSI Intelligence Hub
                </h3>
                
                <p className="text-slate-300 mb-6 leading-relaxed">
                  Global cybersecurity intelligence network. Access real-time threat landscapes, 
                  security rankings, and competitive analysis powered by blockchain verification.
                </p>
                
                <div className="space-y-3">
                  {[
                    'Global threat intelligence',
                    'Real-time security rankings',
                    'Blockchain-verified scores',
                    'Competitive analysis engine'
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center text-sm text-slate-300 group-hover:text-white transition-colors">
                      <div className="w-2 h-2 bg-gradient-to-r from-green-400 to-blue-400 rounded-full mr-3 animate-pulse" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cyber Warfare Dashboard Section */}
      <section className="relative py-32 bg-slate-900/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                Real-Time Threat Intelligence
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Live battlefield metrics from our global defense network. 
              See how we're protecting organizations worldwide.
            </p>
          </div>

          {/* Animated Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                value: '99.97%', 
                label: 'Threat Neutralization',
                color: 'from-green-400 to-blue-500',
                trend: '+0.03%'
              },
              { 
                value: '1,247', 
                label: 'Organizations Protected',
                color: 'from-blue-400 to-purple-500',
                trend: '+127 this month'
              },
              { 
                value: '<0.001s', 
                label: 'AI Response Time',
                color: 'from-purple-400 to-pink-500',
                trend: 'Quantum Speed'
              },
              { 
                value: '24/7/365', 
                label: 'Neural Monitoring',
                color: 'from-pink-400 to-red-500',
                trend: 'Always Active'
              }
            ].map((stat, index) => (
              <div 
                key={index}
                className="group relative bg-slate-800/40 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 hover:border-slate-600 transition-all duration-500 cursor-pointer overflow-hidden"
                style={{ animationDelay: `${index * 0.2}s` }}
              >
                {/* Animated Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity`} />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
                
                <div className="relative z-10 text-center">
                  <div className={`text-3xl md:text-4xl font-bold bg-gradient-to-r ${stat.color} bg-clip-text text-transparent mb-2 group-hover:scale-110 transition-transform`}>
                    {stat.value}
                  </div>
                  <div className="text-slate-300 font-medium mb-2">{stat.label}</div>
                  <div className="text-xs text-slate-500 font-mono">{stat.trend}</div>
                </div>

                {/* Pulse Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${stat.color} opacity-0 group-hover:opacity-5 animate-pulse`} />
              </div>
            ))}
          </div>

          {/* Live Activity Feed */}
          <div className="mt-20 bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              Live Security Operations Center
            </h3>
            
            <div className="space-y-4 font-mono text-sm">
              {[
                { time: '14:23:47', action: 'THREAT NEUTRALIZED', target: 'Phishing attempt blocked', severity: 'HIGH', color: 'text-red-400' },
                { time: '14:23:45', action: 'SCAN COMPLETED', target: 'Financial Services Org', severity: 'INFO', color: 'text-blue-400' },
                { time: '14:23:42', action: 'AI MODEL UPDATED', target: 'Neural defense patterns', severity: 'SUCCESS', color: 'text-green-400' },
                { time: '14:23:38', action: 'ANOMALY DETECTED', target: 'Network traffic analysis', severity: 'MEDIUM', color: 'text-yellow-400' }
              ].map((log, index) => (
                <div 
                  key={index}
                  className="flex items-center justify-between p-3 bg-slate-900/50 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-colors"
                  style={{ animationDelay: `${index * 0.5}s` }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-slate-500">[{log.time}]</span>
                    <span className={`font-bold ${log.color}`}>{log.action}</span>
                    <span className="text-slate-300">{log.target}</span>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    log.severity === 'HIGH' ? 'bg-red-500/20 text-red-300' :
                    log.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-300' :
                    log.severity === 'SUCCESS' ? 'bg-green-500/20 text-green-300' :
                    'bg-blue-500/20 text-blue-300'
                  }`}>
                    {log.severity}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-32 bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block mb-6">
            <span className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-full px-6 py-2 text-sm font-medium text-red-300 backdrop-blur-sm animate-pulse">
              Cyber Threats Evolving Daily
            </span>
          </div>

          <h2 className="text-5xl md:text-6xl font-bold mb-8">
            <span className="bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
              Join the Cyber Defense
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Revolution
            </span>
          </h2>
          
          <p className="text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Don't wait for the next breach. Deploy military-grade cybersecurity today 
            and protect your organization with AI-powered defense systems.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16">
            <Link 
              to="/register" 
              className="group relative bg-gradient-to-r from-red-600 via-red-500 to-orange-500 hover:from-red-500 hover:via-red-400 hover:to-orange-400 text-white px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-110 shadow-2xl hover:shadow-red-500/25 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse" />
              <span className="relative z-10 flex items-center gap-3">
                Deploy Defense Now
                <svg className="w-6 h-6 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
            
            <Link 
              to="/csi-directory" 
              className="group relative border-2 border-slate-600 hover:border-blue-400 text-slate-300 hover:text-white px-12 py-6 rounded-2xl font-bold text-xl transition-all duration-300 transform hover:scale-110 backdrop-blur-sm overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="relative z-10 flex items-center gap-3">
                View Threat Intel
              </span>
            </Link>
          </div>

          {/* Security Guarantee */}
          <div className="inline-flex items-center gap-4 bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 px-8 py-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-300 font-semibold">Quantum-Encrypted</span>
            </div>
            <div className="w-px h-6 bg-slate-600" />
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-blue-300 font-semibold">AI-Powered</span>
            </div>
            <div className="w-px h-6 bg-slate-600" />
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse" />
              <span className="text-purple-300 font-semibold">Military-Grade</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black/90 backdrop-blur-xl border-t border-slate-800/50 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-6">
                <div className="relative h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl animate-pulse opacity-75" />
                  <svg className="h-7 w-7 text-white relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                  DefendX
                </h3>
              </div>
              <p className="text-slate-300 leading-relaxed max-w-md">
                Next-generation cybersecurity platform powered by artificial intelligence. 
                Protecting organizations worldwide with military-grade defense systems.
              </p>
              
              {/* Social Links */}
              <div className="flex gap-4 mt-8">
                {['Twitter', 'LinkedIn', 'Facebook', 'Instagram'].map((platform, index) => (
                  <div 
                    key={index}
                    className="px-4 py-2 bg-slate-800/50 backdrop-blur-xl rounded-xl flex items-center justify-center hover:bg-slate-700/50 transition-all cursor-pointer group border border-slate-700/50 hover:border-blue-500/50"
                  >
                    <span className="text-sm text-slate-400 group-hover:text-white transition-colors">{platform}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-blue-300">Defense Systems</h4>
              <ul className="space-y-3 text-slate-400">
                <li><Link to="/register" className="hover:text-white transition-colors flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full" />
                  DefendX Assessment
                </Link></li>
                <li><Link to="/register" className="hover:text-white transition-colors flex items-center gap-2">
                  <div className="w-1 h-1 bg-purple-400 rounded-full" />
                  DefendX+ Protection
                </Link></li>
                <li><Link to="/csi-directory" className="hover:text-white transition-colors flex items-center gap-2">
                  <div className="w-1 h-1 bg-green-400 rounded-full" />
                  CSI Intelligence Hub
                </Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-6 text-purple-300">Command Center</h4>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2">
                  <div className="w-1 h-1 bg-red-400 rounded-full" />
                  Mission Control
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2">
                  <div className="w-1 h-1 bg-yellow-400 rounded-full" />
                  Tactical Support
                </a></li>
                <li><a href="#" className="hover:text-white transition-colors flex items-center gap-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full" />
                  Security Briefings
                </a></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Section */}
          <div className="border-t border-slate-800/50 mt-12 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="text-slate-400 text-sm font-mono">
                &copy; 2025 DefendX. Classified Defense Technology.
              </div>
              
              <div className="flex items-center gap-6 text-sm text-slate-500">
                <a href="#" className="hover:text-slate-300 transition-colors">Security Protocol</a>
                <a href="#" className="hover:text-slate-300 transition-colors">Data Classification</a>
                <a href="#" className="hover:text-slate-300 transition-colors">Threat Intelligence</a>
              </div>
            </div>
            
            {/* Security Status */}
            <div className="mt-6 flex justify-center">
              <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/30 rounded-full px-4 py-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-300 text-xs font-medium">SECURITY STATUS: OPERATIONAL</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;