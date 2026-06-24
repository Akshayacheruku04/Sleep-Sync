import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  LayoutDashboard, 
  PlusCircle, 
  History, 
  MessageSquare, 
  User, 
  Sun, 
  Moon, 
  LogOut, 
  MoonStar
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const menuItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Log Sleep', path: '/log', icon: PlusCircle },
    { name: 'Reports', path: '/reports', icon: History },
    { name: 'AI Coach', path: '/coach', icon: MessageSquare },
    { name: 'History', path: '/history', icon: History },
    { name: 'Profile', path: '/profile', icon: User },
  ];

  // We filter out reports and history duplicate routes for sidebar cleanly:
  // Let's keep Dashboard, Log Sleep, Coach, History, Profile in sidebar.
  const sidebarItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Log Sleep', path: '/log', icon: PlusCircle },
    { name: 'Reports & Trends', path: '/reports', icon: History }, // Can show charts
    { name: 'AI Coach', path: '/coach', icon: MessageSquare },
    { name: 'History Log', path: '/history', icon: History },
    { name: 'My Profile', path: '/profile', icon: User },
  ];

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 h-screen fixed left-0 top-0 border-r transition-colors duration-300
        bg-white border-slate-200 text-slate-700 dark:bg-dark-200 dark:border-slate-800/80 dark:text-slate-300">
        
        {/* Logo / Brand */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-200 dark:border-slate-800">
          <div className="p-2 rounded-xl bg-indigo-600 text-white animate-pulse">
            <MoonStar className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-wide">SleepSync <span className="text-indigo-600 dark:text-indigo-400">AI</span></h1>
            <span className="text-xs text-slate-500 font-medium">Smart Sleep Coach</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {sidebarItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium tracking-wide transition-all duration-200
                ${isActive 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white'
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </NavLink>
          ))}
        </nav>

        {/* Footer / Account Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 space-y-4">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 hover:bg-slate-100 dark:border-slate-800 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 transition-colors"
          >
            <span className="flex items-center gap-2">
              {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-600" />}
              {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
            </span>
            <div className={`w-8 h-4 rounded-full p-0.5 transition-colors ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-300'}`}>
              <div className={`w-3 h-3 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-4' : 'translate-x-0'}`} />
            </div>
          </button>

          {/* User Profile Summary */}
          {user && (
            <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-100 dark:bg-slate-800/30">
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                <p className="text-xs text-slate-500 truncate capitalize">{user.role}</p>
              </div>
            </div>
          )}

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 dark:text-rose-400 dark:hover:text-rose-300 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* MOBILE BOTTOM NAVIGATION */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 h-16 border-t bg-white border-slate-200 dark:bg-dark-200 dark:border-slate-800/80 flex items-center justify-around px-2 pb-safe">
        {sidebarItems.slice(0, 5).map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200
              ${isActive ? 'text-indigo-650 dark:text-indigo-400 scale-110' : 'text-slate-500 dark:text-slate-400'}
            `}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] mt-1 font-medium truncate max-w-full">{item.name.split(' ')[0]}</span>
          </NavLink>
        ))}
        {/* Mobile menu trigger for Profile/Settings & Actions */}
        <NavLink
          to="/profile"
          className={({ isActive }) => `
            flex flex-col items-center justify-center w-12 h-12 rounded-xl transition-all duration-200
            ${isActive ? 'text-indigo-650 dark:text-indigo-400 scale-110' : 'text-slate-500 dark:text-slate-400'}
          `}
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] mt-1 font-medium">Profile</span>
        </NavLink>
      </div>
    </>
  );
};

export default Sidebar;
