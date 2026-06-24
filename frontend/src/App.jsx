import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';

// Pages
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import DailyEntry from './pages/DailyEntry';
import Reports from './pages/Reports';
import Coach from './pages/Coach';
import History from './pages/History';
import Profile from './pages/Profile';

// App Layout for private routes
const MainLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300
      dark:bg-dark-200 dark:text-slate-100 flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 md:ml-64 min-h-screen pb-16 md:pb-0">
        {children}
      </main>
    </div>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          {/* Public Auth Routes */}
          <Route path="/auth" element={<Auth />} />

          {/* Protected Application Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/log" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <DailyEntry />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reports" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Reports />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/coach" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Coach />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <History />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <MainLayout>
                  <Profile />
                </MainLayout>
              </ProtectedRoute>
            } 
          />
          
          {/* Redirect / Fallback */}
          <Route path="*" element={<Auth />} />
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
