import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

export const BackupLayout: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLoaded, setIsLoaded] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Determine active tab based on path
  const isAgentsTab = location.pathname.includes('/agents');
  
  // Get the base path for backup routes
  const basePath = location.pathname.includes('/dashboard') ? '/dashboard/backup' : '/backup';

  useEffect(() => {
    setIsLoaded(true);
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
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

      <div className={`relative z-10 py-10 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/50 py-6 mb-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col space-y-6">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                Backup Management
              </h1>
              
              {/* Navigation Tabs */}
              <div className="flex space-x-1">
                <button
                  onClick={() => navigate(basePath)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    !isAgentsTab 
                      ? 'bg-slate-700/50 text-white shadow-lg backdrop-blur-xl border border-slate-600/50' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                  }`}
                >
                  Backups
                </button>
                <button
                  onClick={() => navigate(`${basePath}/agents`)}
                  className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                    isAgentsTab 
                      ? 'bg-slate-700/50 text-white shadow-lg backdrop-blur-xl border border-slate-600/50' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/30'
                  }`}
                >
                  Backup Agents
                </button>
              </div>
            </div>
          </div>
        </header>
        <main>
          <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};