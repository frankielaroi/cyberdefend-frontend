import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { WrenchIcon, ClockIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

interface MaintenanceModeProps {
  estimatedTime?: string;
  contactEmail?: string;
  message?: string;
}

const MaintenanceMode: React.FC<MaintenanceModeProps> = ({
  estimatedTime = 'Unknown',
  contactEmail = 'support@cyberdefend.com',
  message = 'We are currently performing scheduled maintenance to improve your experience.',
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [dots, setDots] = useState('');

  // Animate dots for loading effect
  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? '' : prev + '.'));
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Track time elapsed
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs}h ${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden flex flex-col">
      {/* Animated Background */}
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
          }}
        />
        
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-r from-orange-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

        {/* Floating Particles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl w-full">
          {/* Logo/Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-lg opacity-75 animate-pulse" />
                <div className="relative h-20 w-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center shadow-2xl">
                  <WrenchIcon className="h-10 w-10 text-white animate-bounce" />
                </div>
              </div>
            </div>

            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-blue-200 to-white bg-clip-text text-transparent">
              Under Maintenance
            </h1>

            <p className="text-xl text-slate-300 mb-8 leading-relaxed">
              {message}
            </p>

            {/* Loading Animation */}
            <div className="flex justify-center items-center mb-12">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 border-4 border-slate-700 rounded-full" />
                <div className="absolute inset-0 border-4 border-transparent border-t-blue-500 border-r-purple-500 rounded-full animate-spin" />
              </div>
            </div>

            <p className="text-lg text-slate-300 animate-pulse">
              Systems updating{dots}
            </p>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            {/* Estimated Time */}
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-blue-500/50 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-500/20 border border-blue-500/30">
                    <ClockIcon className="h-6 w-6 text-blue-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">Estimated Time</h3>
                  <p className="text-blue-200">{estimatedTime}</p>
                </div>
              </div>
            </div>

            {/* Contact Support */}
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-purple-500/50 transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-purple-500/20 border border-purple-500/30">
                    <EnvelopeIcon className="h-6 w-6 text-purple-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white mb-1">Questions?</h3>
                  <a 
                    href={`mailto:${contactEmail}`}
                    className="text-purple-200 hover:text-purple-100 transition-colors"
                  >
                    {contactEmail}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Time Elapsed */}
          <div className="text-center mb-12">
            <div className="bg-slate-800/40 backdrop-blur-xl rounded-xl border border-slate-700/30 p-4 inline-block">
              <p className="text-sm text-slate-400 mb-1">Maintenance Duration</p>
              <p className="text-2xl font-mono font-bold text-green-400">{formatTime(timeElapsed)}</p>
            </div>
          </div>

          {/* Status Message */}
          <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-2xl p-6 text-center mb-12">
            <p className="text-sm text-slate-300">
              Our team is working hard to bring DefendX back online with enhanced features and improved performance.
            </p>
          </div>

          {/* Social Links / Additional Info */}
          <div className="text-center space-y-4">
            <p className="text-sm text-slate-400">
              Check our status page for real-time updates
            </p>
            <div className="flex justify-center gap-4">
              <a 
                href="#"
                className="text-slate-400 hover:text-blue-400 transition-colors text-sm"
              >
                Status Page
              </a>
              <span className="text-slate-600">•</span>
              <a 
                href="#"
                className="text-slate-400 hover:text-blue-400 transition-colors text-sm"
              >
                Twitter
              </a>
              <span className="text-slate-600">•</span>
              <a 
                href="#"
                className="text-slate-400 hover:text-blue-400 transition-colors text-sm"
              >
                Blog
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 border-t border-slate-700/30 bg-slate-900/50 backdrop-blur-xl py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-slate-400">
            DefendX © 2025 - Protecting Organizations Worldwide
          </p>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceMode;
