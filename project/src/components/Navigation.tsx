import React from 'react'; 
import { Link, useLocation, useNavigate } from 'react-router-dom'; 
import { Briefcase, ArrowRight, LogOut, UserCircle } from 'lucide-react';

function Navigation({ isAuthenticated, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';
  
  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      // Fallback if onLogout prop isn't provided
      localStorage.setItem('isAuthenticated', 'false');
    }
    navigate('/landing');
  };

  return (
    <nav className="bg-black/30 backdrop-blur-lg border-b border-white/10 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to={isAuthenticated ? '/' : '/landing'} className="flex items-center">
            <Briefcase className="w-8 h-8 text-purple-400" />
            <span className="ml-2 text-xl font-bold text-white">JobFlow AI</span>
          </Link>
          
          <div className="hidden md:flex items-center space-x-8">
            {isAuthenticated ? (
              isHome ? (
                // Authenticated user on home page
                <>
                  <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                  <a href="#benefits" className="text-gray-300 hover:text-white transition-colors">Benefits</a>
                  <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
                  <Link to="/user-dashboard" className="text-gray-300 hover:text-white transition-colors flex items-center">
                    <UserCircle className="w-5 h-5 mr-1" />
                    My Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </button>
                </>
              ) : (
                // Authenticated user on other pages
                <>
                  <Link to="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
                  <Link to="/dashboard" className="text-gray-300 hover:text-white transition-colors">Dashboard</Link>
                  <Link to="/user-dashboard" className="text-gray-300 hover:text-white transition-colors flex items-center">
                    <UserCircle className="w-5 h-5 mr-1" />
                    My Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Logout
                  </button>
                </>
              )
            ) : (
              // Not authenticated
              <>
                <Link to="/landing" className="text-gray-300 hover:text-white transition-colors">About</Link>
                <Link to="/login" className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center">
                  Get Started <ArrowRight className="ml-2 w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;