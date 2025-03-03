import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { FileText, Upload, Calendar, BarChart2, PieChart, TrendingUp, User, LogOut } from 'lucide-react';

interface PlanUsage {
  current: number;
  limit: number;
  percentage: number;
}

interface DailyData {
  dates: string[];
  jobPosts: number[];
  jdsUploaded: number[];
  resumesProcessed: number[];
}

interface Stats {
  jobPosts: number;
  jdsUploaded: number;
  resumesProcessed: number;
  lastActive: string | null;
  planUsage: PlanUsage;
  dailyData: DailyData;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  plan: string;
  usageLimit: number;
  currentUsage: number;
}

function UsageDashboard() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<'daily' | 'monthly'>('daily');

  // Check authentication
  const token = localStorage.getItem('jobflow_token');
  const userString = localStorage.getItem('jobflow_user');
  
  useEffect(() => {
    if (!token || !userString) return;

    // Parse user data
    const user = JSON.parse(userString);
    setUserData(user);

    // Fetch user usage stats
    const fetchUsageStats = async () => {
      setIsLoading(true);
      try {
        // Updated to match backend routes
        const response = await fetch('http://127.0.0.1:5000/api/user/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch usage stats');
        }

        const data = await response.json();
        // Matching backend data structure
        setStats(data.stats);
      } catch (error) {
        console.error('Error fetching usage stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsageStats();
  }, [token, userString]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('jobflow_token');
    localStorage.removeItem('jobflow_user');
    window.location.href = '/login';
  };

  const renderUsageChart = () => {
    if (!stats?.dailyData) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-white/5 rounded-lg">
          <BarChart2 className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-gray-400">No usage data available</p>
        </div>
      );
    }

    const { dates, jobPosts, jdsUploaded, resumesProcessed } = stats.dailyData;
    
    if (dates.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64 bg-white/5 rounded-lg">
          <BarChart2 className="w-12 h-12 text-gray-400 mb-2" />
          <p className="text-gray-400">No usage data available for this timeframe</p>
        </div>
      );
    }

    // Calculate the max value to set the height scale
    const maxValue = Math.max(
      ...jobPosts,
      ...jdsUploaded,
      ...resumesProcessed
    );

    return (
      <div className="w-full overflow-x-auto pr-4">
        <div className="min-w-[600px] h-64">
          <div className="flex h-full items-end space-x-2">
            {dates.map((date, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex justify-around items-end h-56">
                  <div 
                    className="w-4 bg-purple-500 rounded-t"
                    style={{ height: `${(jobPosts[index] / (maxValue || 1)) * 100}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-gray-800 text-white text-xs rounded p-1">
                      {jobPosts[index]}
                    </div>
                  </div>
                  <div 
                    className="w-4 bg-blue-500 rounded-t"
                    style={{ height: `${(jdsUploaded[index] / (maxValue || 1)) * 100}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-gray-800 text-white text-xs rounded p-1">
                      {jdsUploaded[index]}
                    </div>
                  </div>
                  <div 
                    className="w-4 bg-green-500 rounded-t"
                    style={{ height: `${(resumesProcessed[index] / (maxValue || 1)) * 100}%` }}
                  >
                    <div className="opacity-0 group-hover:opacity-100 absolute bottom-full mb-2 bg-gray-800 text-white text-xs rounded p-1">
                      {resumesProcessed[index]}
                    </div>
                  </div>
                </div>
                <div className="text-xs text-gray-400 mt-2 whitespace-nowrap">{date}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-center mt-4 space-x-6">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-300">Job Posts</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-300">JDs Uploaded</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            <span className="text-sm text-gray-300">Resumes Processed</span>
          </div>
        </div>
      </div>
    );
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden shadow-2xl p-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-white">Loading usage data...</p>
          </div>
        ) : (
          <>
            {/* Header with user info and logout */}
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center">
                <div className="bg-purple-600 rounded-full p-3 mr-4">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{userData?.name || 'User'}</h2>
                  <p className="text-gray-400">{userData?.email}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>
            </div>

            {/* Usage progress */}
            <div className="bg-white/5 rounded-lg p-4 mb-8">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-white font-medium">Usage {userData?.plan || ''}</h3>
                <span className="text-sm text-gray-400">
                  {userData?.currentUsage || 0} / {userData?.usageLimit || 'Unlimited'}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2.5 rounded-full" 
                  style={{ 
                    width: stats?.planUsage 
                      ? `${Math.min(100, stats.planUsage.percentage)}%` 
                      : '0%' 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Last activity: {stats?.lastActive ? formatDate(stats.lastActive) : 'N/A'}
              </p>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-900/40 to-purple-800/40 rounded-xl p-6 border border-purple-500/20">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-300 text-sm mb-1">Job Posts Created</p>
                    <h3 className="text-white text-3xl font-bold">{stats?.jobPosts || 0}</h3>
                  </div>
                  <div className="bg-purple-500/20 p-2 rounded-lg">
                    <FileText className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/40 rounded-xl p-6 border border-blue-500/20">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-300 text-sm mb-1">JDs Uploaded</p>
                    <h3 className="text-white text-3xl font-bold">{stats?.jdsUploaded || 0}</h3>
                  </div>
                  <div className="bg-blue-500/20 p-2 rounded-lg">
                    <Upload className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-900/40 to-green-800/40 rounded-xl p-6 border border-green-500/20">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-gray-300 text-sm mb-1">Resumes Processed</p>
                    <h3 className="text-white text-3xl font-bold">{stats?.resumesProcessed || 0}</h3>
                  </div>
                  <div className="bg-green-500/20 p-2 rounded-lg">
                    <FileText className="w-6 h-6 text-green-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Usage chart */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-white">Usage Over Time</h3>
                <div className="flex bg-white/5 rounded-lg p-1">
                  <button
                    onClick={() => setTimeframe('daily')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      timeframe === 'daily'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Daily
                  </button>
                  <button
                    onClick={() => setTimeframe('monthly')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      timeframe === 'monthly'
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    Monthly
                  </button>
                </div>
              </div>
              {renderUsageChart()}
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
              <div className="flex justify-center items-center h-32">
                <p className="text-gray-400">Coming soon: Activity logs and detailed usage history</p>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default UsageDashboard;