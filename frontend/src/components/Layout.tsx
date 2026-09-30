import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { Shield, LogOut, Settings, History, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-surface border-b border-gray-800 p-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center flex-wrap gap-4">
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 text-accent font-bold text-2xl hover:text-indigo-400 focus:outline-none focus:ring-2 focus:ring-accent rounded px-2 py-1">
            <Shield size={32} />
            QuietGuard
          </Link>
          
          {user && (
            <nav className="flex gap-4 flex-wrap">
              <Link to="/dashboard" className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded focus:outline-none focus:ring-2 focus:ring-accent">
                <LayoutDashboard /> Dashboard
              </Link>
              <Link to="/alerts" className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded focus:outline-none focus:ring-2 focus:ring-accent">
                <History /> History
              </Link>
              <Link to="/settings" className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded focus:outline-none focus:ring-2 focus:ring-accent">
                <Settings /> Settings
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-2 hover:bg-gray-800 p-2 rounded text-danger focus:outline-none focus:ring-2 focus:ring-danger">
                <LogOut /> Sign Out
              </button>
            </nav>
          )}
        </div>
      </header>
      
      <main className="flex-1 flex flex-col p-4">
        <div className="max-w-5xl mx-auto w-full flex-1">
          <Outlet />
        </div>
      </main>
      
      <footer className="p-6 text-center text-gray-500 bg-surface text-sm border-t border-gray-800">
        <div className="max-w-5xl mx-auto">
          <p>QuietGuard is a local sound detection tool. It is not a replacement for professional monitoring services or emergency services.</p>
        </div>
      </footer>
    </div>
  );
};