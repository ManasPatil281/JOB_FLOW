import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Briefcase, ArrowRight } from 'lucide-react';

function Navigation() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <nav className="bg-black/30 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center">
            <Briefcase className="w-8 h-8 text-purple-400" />
            <span className="ml-2 text-xl font-bold text-white">JobFlow AI</span>
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            {isHome ? (
              <>
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                <a href="#benefits" className="text-gray-300 hover:text-white transition-colors">Benefits</a>
              </>
            ) : (
              <>
                <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
              </>
            )}
            {isHome ? (
              <Link to="/dashboard" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation