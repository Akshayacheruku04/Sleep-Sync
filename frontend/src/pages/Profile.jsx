import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import { 
  User, 
  Calendar, 
  Flame, 
  Moon, 
  Award,
  ChevronRight,
  Shield,
  Activity,
  Footprints,
  Compass,
  ArrowRight,
  Loader2
} from 'lucide-react';

const Profile = () => {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Password change states
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '' });
  const [pwdLoading, setPwdLoading] = useState(false);
  const [pwdSuccess, setPwdSuccess] = useState('');
  const [pwdError, setPwdError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');
    setPwdLoading(true);

    try {
      const res = await authFetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(passwords)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update password');

      setPwdSuccess('Password changed successfully!');
      setPasswords({ currentPassword: '', newPassword: '' });
    } catch (err) {
      setPwdError(err.message);
    } finally {
      setPwdLoading(false);
    }
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_URL}/sleep/dashboard`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load profile details');
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  if (loading) {
    return <LoadingScreen message="Retrieving your profile statistics..." />;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-rose-600 dark:text-rose-400">
        <p className="text-lg font-semibold">{error}</p>
        <button onClick={fetchProfileData} className="mt-4 px-4 py-2 bg-indigo-600 rounded-xl text-white text-sm font-medium">
          Retry Loading
        </button>
      </div>
    );
  }

  const { streak, badges, latestEntry, user } = stats;
  
  // Format account created date
  const createdDate = new Date(user.createdAt).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Calculate BMI category details
  const getBmiDetails = (bmi) => {
    if (!bmi) return { label: 'N/A', color: 'text-slate-400', desc: 'No height/weight parameters logged.' };
    if (bmi < 18.5) return { label: 'Underweight', color: 'text-amber-400', desc: 'Slightly below standard threshold. Focus on nutritional intake.' };
    if (bmi < 25) return { label: 'Normal Weight', color: 'text-emerald-400', desc: 'Excellent. Your weight and height parameters align perfectly.' };
    if (bmi < 30) return { label: 'Overweight', color: 'text-amber-400', desc: 'Mildly above average. Incorporate daily physical activity.' };
    return { label: 'Obese', color: 'text-rose-400', desc: 'Significantly above average. Consult with health coaches on targets.' };
  };

  const bmiDetails = getBmiDetails(user.bmi);

  // Badge specifications (including locked ones to display them elegantly)
  const allBadgesSpec = [
    { id: 'early_sleeper', name: 'Early Sleeper', description: 'Log a bedtime before 11 PM for at least 3 days.', icon: 'Moon', color: 'from-blue-500/20 to-indigo-500/20 text-indigo-400 border-indigo-500/30' },
    { id: 'stress_master', name: 'Stress Master', description: 'Keep stress levels at 3 or below for at least 3 days.', icon: 'Shield', color: 'from-purple-500/20 to-indigo-500/20 text-purple-400 border-purple-500/30' },
    { id: 'sleep_champion', name: 'Sleep Champion', description: 'Rate your sleep quality 8/10 or higher for 3 days.', icon: 'Award', color: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/30' },
    { id: 'fitness_enthusiast', name: 'Fitness Enthusiast', description: 'Hit 10k steps or 45 mins activity for 3 days.', icon: 'Flame', color: 'from-rose-500/20 to-orange-500/20 text-rose-400 border-rose-500/30' }
  ];

  const renderBadgeIcon = (iconName, unlocked) => {
    const opacity = unlocked ? 'opacity-100' : 'opacity-30 grayscale';
    switch (iconName) {
      case 'Moon': return <Moon className={`h-8 w-8 text-indigo-400 ${opacity}`} />;
      case 'Shield': return <Shield className={`h-8 w-8 text-purple-400 ${opacity}`} />;
      case 'Award': return <Award className={`h-8 w-8 text-emerald-400 ${opacity}`} />;
      case 'Flame': return <Flame className={`h-8 w-8 text-rose-400 ${opacity}`} />;
      default: return <Award className={`h-8 w-8 text-indigo-400 ${opacity}`} />;
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto pb-24 md:pb-8 space-y-8">
      
      {/* Page Header */}
      <header className="mb-4">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">My Profile & Achievements</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1.5">View your calculated BMI index, lifestyle statistics, and unlockable health badges.</p>
      </header>

      {/* USER PROFILE INFO CARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Metadata */}
        <section className="md:col-span-1 glass-panel-light dark:glass-panel-dark p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 text-center flex flex-col items-center justify-center space-y-4">
          <div className="h-24 w-24 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-indigo-600/10">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user.name}</h2>
            <p className="text-xs text-slate-500 font-medium capitalize mt-0.5">{user.role} Account</p>
          </div>
          <div className="w-full border-t border-slate-200 dark:border-slate-800/60 pt-4 flex flex-col gap-2.5 text-left text-xs">
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span>Age</span>
              <span className="font-semibold text-slate-900 dark:text-white">{user.age} yrs</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span>Gender</span>
              <span className="font-semibold text-slate-900 dark:text-white">{user.gender}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span>Occupation</span>
              <span className="font-semibold text-slate-900 dark:text-white">{user.occupation}</span>
            </div>
            <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
              <span>Created</span>
              <span className="font-semibold text-slate-900 dark:text-white">{createdDate}</span>
            </div>
          </div>
        </section>

        {/* Right Column: Key Summary Stats */}
        <section className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          {/* Total Sleep Logs */}
          <div className="p-6 rounded-3xl glass-panel-light dark:glass-panel-dark bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between">
            <h3 className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total entries</h3>
            <p className="text-4xl font-extrabold text-slate-900 dark:text-white mt-4">{user.totalEntries}</p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-2">Days of health tracking logged</span>
          </div>

          {/* Current Sleep Score */}
          <div className="p-6 rounded-3xl glass-panel-light dark:glass-panel-dark bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between">
            <h3 className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Current Score</h3>
            <p className="text-4xl font-extrabold text-indigo-650 dark:text-indigo-400 mt-4">
              {latestEntry ? latestEntry.sleepScore : '0'}<span className="text-xs text-slate-500 dark:text-slate-400 font-normal">/100</span>
            </p>
            <span className="text-[10px] text-slate-550 dark:text-slate-400 font-medium mt-2 uppercase tracking-wide">
              Category: {latestEntry ? latestEntry.sleepScoreCategory : 'None'}
            </span>
          </div>

          {/* Current Streak */}
          <div className="p-6 rounded-3xl glass-panel-light dark:glass-panel-dark bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 flex flex-col justify-between">
            <h3 className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Active Streak</h3>
            <p className="text-4xl font-extrabold text-orange-500 dark:text-orange-400 mt-4 flex items-center gap-1.5">
              {streak} <Flame className="h-6 w-6 text-orange-500 animate-pulse" />
            </p>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-2">Consecutive days tracking sleep</span>
          </div>

          {/* BMI Analysis sub-card */}
          <div className="sm:col-span-3 p-6 rounded-3xl glass-panel-light dark:glass-panel-dark bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <Compass className="h-7 w-7" />
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">BMI Index Analysis</p>
                <h4 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                  BMI: {user.bmi} | Category: <span className={bmiDetails.color}>{bmiDetails.label}</span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{bmiDetails.desc}</p>
              </div>
            </div>
          </div>

        </section>

      </div>

      {/* BADGES ACHIEVEMENT SYSTEM */}
      <section className="glass-panel-light dark:glass-panel-dark p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Award className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            System Badges & Achievements
          </h3>
          <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">Consistency is key to a healthy lifestyle. Complete tracking objectives to earn badges.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {allBadgesSpec.map(spec => {
            // Check if badge is unlocked
            const isUnlocked = badges.some(b => b.id === spec.id);
            return (
              <div 
                key={spec.id}
                className={`p-5 rounded-2xl border flex items-center gap-4 transition-all duration-300
                  ${isUnlocked 
                    ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-500/25 shadow-lg' 
                    : 'bg-slate-50 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800/60 opacity-60'
                  }
                `}
              >
                <div className={`p-4 rounded-xl flex items-center justify-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800`}>
                  {renderBadgeIcon(spec.icon, isUnlocked)}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{spec.name}</h4>
                    {isUnlocked ? (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold uppercase tracking-wider">
                        Unlocked
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-605 dark:text-slate-400 text-[9px] font-bold uppercase tracking-wider">
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{spec.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* PASSWORD CHANGE PANEL */}
      <section className="glass-panel-light dark:glass-panel-dark p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 space-y-6">
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Shield className="h-6 w-6 text-indigo-650 dark:text-indigo-400" />
            Security & Credentials
          </h3>
          <p className="text-slate-605 dark:text-slate-400 text-xs mt-1">Change your account credentials directly on the website.</p>
        </div>

        {pwdSuccess && (
          <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-sm font-medium">
            {pwdSuccess}
          </div>
        )}

        {pwdError && (
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300 text-sm font-medium">
            {pwdError}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">Current Password</label>
            <input
              type="password"
              required
              value={passwords.currentPassword}
              onChange={(e) => setPasswords(prev => ({ ...prev, currentPassword: e.target.value }))}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-955 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">New Password (Min 6 chars)</label>
            <input
              type="password"
              required
              value={passwords.newPassword}
              onChange={(e) => setPasswords(prev => ({ ...prev, newPassword: e.target.value }))}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div className="sm:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={pwdLoading}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg disabled:bg-slate-800"
            >
              {pwdLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Update Password
            </button>
          </div>
        </form>
      </section>

    </div>
  );
};

export default Profile;
