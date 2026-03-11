import { useAuth } from '../context/AuthContext';
import { LogOut, User, Activity, Settings, Bell, Shield } from 'lucide-react';

const Dashboard = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="bg-secondary/50 border-b border-white/10 sticky top-0 z-10 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">SomnoAI Lab</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/5">
              <Bell className="w-5 h-5" />
            </button>
            <div className="h-6 w-px bg-white/10 mx-2"></div>
            <div className="flex items-center space-x-3">
              <div className="text-sm text-right hidden sm:block">
                <p className="font-medium">{user?.email}</p>
                <p className="text-gray-400 text-xs">Administrator</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center border border-primary/30">
                <User className="w-5 h-5 text-primary" />
              </div>
            </div>
            <button 
              onClick={signOut}
              className="ml-4 p-2 text-gray-400 hover:text-red-400 transition-colors rounded-full hover:bg-red-400/10"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
            <p className="text-gray-400 mt-1">Welcome back to the SomnoAI Digital Sleep Lab control center.</p>
          </div>
          <div className="flex space-x-3">
            <button className="px-4 py-2 bg-secondary border border-white/10 rounded-lg text-sm font-medium hover:bg-white/5 transition-colors flex items-center">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </button>
            <button className="px-4 py-2 bg-primary rounded-lg text-sm font-medium text-white hover:bg-primary/90 transition-colors flex items-center shadow-lg shadow-primary/20">
              <Shield className="w-4 h-4 mr-2" />
              Security Logs
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-secondary/30 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">Active Sessions</h3>
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="text-4xl font-light tracking-tight">24</div>
            <div className="mt-2 text-sm text-emerald-400 flex items-center">
              <span className="font-medium">+12%</span>
              <span className="text-gray-500 ml-2">from last week</span>
            </div>
          </div>

          <div className="bg-secondary/30 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">Security Events</h3>
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <div className="text-4xl font-light tracking-tight">0</div>
            <div className="mt-2 text-sm text-gray-500 flex items-center">
              <span className="font-medium text-emerald-400">All clear</span>
              <span className="ml-2">in the last 24 hours</span>
            </div>
          </div>

          <div className="bg-secondary/30 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-400 font-medium">System Status</h3>
              <div className="p-2 bg-primary/10 text-primary rounded-lg">
                <Settings className="w-5 h-5" />
              </div>
            </div>
            <div className="text-4xl font-light tracking-tight text-emerald-400">Online</div>
            <div className="mt-2 text-sm text-gray-500 flex items-center">
              <span>All services operational</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-secondary/20 border border-white/5 rounded-2xl overflow-hidden backdrop-blur-sm">
          <div className="px-6 py-5 border-b border-white/5 flex justify-between items-center bg-secondary/40">
            <h3 className="text-lg font-medium">Recent System Activity</h3>
            <button className="text-sm text-primary hover:text-primary/80 transition-colors">View all</button>
          </div>
          <div className="divide-y divide-white/5">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="px-6 py-4 flex items-center hover:bg-white/[0.02] transition-colors">
                <div className="w-2 h-2 rounded-full bg-emerald-400 mr-4"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-200">System check completed successfully</p>
                  <p className="text-xs text-gray-500 mt-1">Automated routine maintenance</p>
                </div>
                <div className="text-xs text-gray-500 font-mono">
                  {new Date(Date.now() - i * 3600000).toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
