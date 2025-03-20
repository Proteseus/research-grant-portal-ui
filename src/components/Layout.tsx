import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/auth';
import { Bell, FileText, Home, LogOut, User, Users, BarChart3, Megaphone } from 'lucide-react';

function Layout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'ADMIN';
  const isActive = (path: string) => location.pathname === path;

  const navigationItems = isAdmin
    ? [
        { path: '/', icon: BarChart3, label: 'Dashboard' },
        { path: '/admin/proposals', icon: FileText, label: 'Proposals' },
        { path: '/admin/calls', icon: Megaphone, label: 'Calls' },
        { path: '/admin/users', icon: Users, label: 'Users' },
      ]
    : [
        { path: '/', icon: Home, label: 'Dashboard' },
        { path: '/proposals', icon: FileText, label: 'Proposals' },
        { path: '/profile', icon: User, label: 'Profile' },
      ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <FileText className="h-8 w-8 text-indigo-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">ResearchGrants</span>
              </div>
            </div>
            <div className="flex items-center">
              <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
                <Bell className="h-6 w-6" />
              </button>
              <div className="ml-3">
                <span className="text-sm font-medium text-gray-700">{user?.fullName}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar and Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm h-[calc(100vh-4rem)] p-4">
          <nav className="space-y-1">
            {navigationItems.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center px-4 py-2 text-gray-700 rounded-md ${
                  isActive(path)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5 mr-3" />
                {label}
              </Link>
            ))}
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md w-full"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Logout
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;