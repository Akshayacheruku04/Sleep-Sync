import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { MoonStar, Eye, EyeOff, Loader2 } from 'lucide-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Signup Form Fields
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: '',
    gender: 'Male',
    occupation: '',
    height: '',
    weight: '',
    rememberMe: false
  });

  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(formData.email, formData.password, formData.rememberMe);
      } else {
        await signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          age: Number(formData.age),
          gender: formData.gender,
          occupation: formData.occupation,
          height: Number(formData.height),
          weight: Number(formData.weight)
        });
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const occupationsList = [
    'Software Engineer',
    'Doctor',
    'Nurse',
    'Teacher',
    'Engineer',
    'Accountant',
    'Lawyer',
    'Salesperson',
    'Manager',
    'Scientist',
    'Student',
    'Other'
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4 relative overflow-hidden animated-gradient bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      
      {/* Decorative Blur Backgrounds */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

      {/* Main Glassmorphic Wrapper */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl glass-panel-dark p-8 md:p-10 rounded-3xl z-10 border border-slate-800/80 bg-slate-900/60"
      >
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <div className="p-3.5 rounded-2xl bg-indigo-600/80 text-white shadow-xl shadow-indigo-600/10 mb-3">
            <MoonStar className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </h2>
          <p className="text-sm text-slate-400 mt-1.5 text-center">
            {isLogin ? 'Access your AI-powered sleep tracker and coach' : 'Ask only once to calculate your metrics permanently'}
          </p>
        </div>

        {/* Error notification banner */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm font-medium"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleFormSubmit} className="space-y-5">
          {/* Sign Up Fields Grid */}
          {!isLogin && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="John Doe"
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Age</label>
                <input
                  type="number"
                  name="age"
                  required
                  min="1"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="30"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Occupation</label>
                <select
                  name="occupation"
                  value={formData.occupation}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="">Select Occupation</option>
                  {occupationsList.map(occ => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Height (cm)</label>
                <input
                  type="number"
                  name="height"
                  required
                  min="50"
                  value={formData.height}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="175"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Weight (kg)</label>
                <input
                  type="number"
                  name="weight"
                  required
                  min="10"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="70"
                />
              </div>
            </div>
          )}

          {/* Standard Fields (Login / Signup) */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 pr-10 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Remember Me checkbox */}
          {isLogin && (
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="h-4 w-4 rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500/20"
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-slate-400 font-medium select-none cursor-pointer">
                Remember Me
              </label>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
            ) : null}
            {isLogin ? 'Sign In' : 'Complete Setup'}
          </button>
        </form>

        {/* Switch mode button */}
        <div className="mt-6 text-center text-sm font-medium">
          <span className="text-slate-500">
            {isLogin ? "Don't have an account? " : "Already registered? "}
          </span>
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-4"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Auth;
