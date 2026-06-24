import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CircularProgress from '../components/CircularProgress';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Moon, 
  Activity, 
  Footprints, 
  Smile, 
  Heart, 
  AlertTriangle, 
  CheckCircle,
  Brain,
  Plus,
  Compass,
  Zap,
  Shield,
  Award
} from 'lucide-react';

const Dashboard = () => {
  const { authFetch } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_URL}/sleep/dashboard`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load dashboard metrics');
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-rose-500">
        <p className="text-lg font-semibold">{error}</p>
        <button onClick={fetchDashboardStats} className="mt-4 px-4 py-2 bg-indigo-600 rounded-xl text-white text-sm font-medium">
          Retry Loading
        </button>
      </div>
    );
  }

  const { streak, badges, latestEntry, user } = stats;
  const todayStr = new Date().toISOString().split('T')[0];
  const loggedToday = latestEntry && latestEntry.date === todayStr;

  // Personalized recommendations
  const getRecommendations = () => {
    const recs = [];
    if (!latestEntry) return recs;

    if (latestEntry.stressLevel > 8) {
      recs.push({
        id: 'stress',
        title: 'Calm Your Nervous System',
        icon: Brain,
        color: 'border-purple-300 dark:border-purple-500/20 bg-purple-500/5 text-purple-700 dark:text-purple-300',
        bullets: [
          'Meditation Exercises: Try 10 minutes of guided sleep meditation.',
          'Breathing Exercises: Practice the 4-7-8 method (Inhale 4s, Hold 7s, Exhale 8s).',
          'Stress Relief Tips: Turn off news and social media notifications 2 hours before bed.'
        ]
      });
    }

    if (latestEntry.sleepDuration < 6) {
      recs.push({
        id: 'sleep',
        title: 'Optimize Sleep Hygiene',
        icon: Moon,
        color: 'border-blue-300 dark:border-blue-500/20 bg-blue-500/5 text-blue-700 dark:text-blue-300',
        bullets: [
          'Sleep Hygiene Tips: Keep bedroom cool (18°C) and completely pitch dark.',
          'Healthy Bedtime Routine: Do a light read or warm bath. Set phone to "Do Not Disturb".',
          'Sleep Improvement Plan: Maintain a strict sleeping target, sleeping before 11 PM.'
        ]
      });
    }

    if (latestEntry.physicalActivity < 30) {
      recs.push({
        id: 'activity',
        title: 'Revitalize Movement',
        icon: Activity,
        color: 'border-emerald-300 dark:border-emerald-500/20 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300',
        bullets: [
          'Workout Suggestions: Complete 20 minutes of light aerobic/stretching routines.',
          'Walking Goals: Take a 15-minute post-dinner walk outside.',
          'Fitness Recommendations: Incrementally build steps towards a 10,000 target.'
        ]
      });
    }

    return recs;
  };

  const recommendations = getRecommendations();

  // Mood selector mapping
  const moodMap = {
    'Very Happy': { emoji: '😊', label: 'Very Happy', color: 'text-emerald-500 dark:text-emerald-400' },
    'Happy': { emoji: '🙂', label: 'Happy', color: 'text-indigo-500 dark:text-indigo-400' },
    'Neutral': { emoji: '😐', label: 'Neutral', color: 'text-slate-500 dark:text-slate-400' },
    'Sad': { emoji: '🙁', label: 'Sad', color: 'text-amber-500 dark:text-amber-400' },
    'Very Stressed': { emoji: '😫', label: 'Very Stressed', color: 'text-rose-500 dark:text-rose-400' }
  };

  // Badge icon selector helper
  const renderBadgeIcon = (iconName) => {
    switch (iconName) {
      case 'Moon': return <Moon className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />;
      case 'Shield': return <Shield className="h-6 w-6 text-purple-500 dark:text-purple-400" />;
      case 'Award': return <Award className="h-6 w-6 text-emerald-500 dark:text-emerald-400" />;
      case 'Flame': return <Flame className="h-6 w-6 text-rose-500 dark:text-rose-400" />;
      default: return <Award className="h-6 w-6 text-indigo-500 dark:text-indigo-400" />;
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto pb-24 md:pb-8">
      
      {/* Header welcome banner */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Hey, {user.name.split(' ')[0]} 👋
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1.5">
            Your customized health parameters and AI analysis are ready.
          </p>
        </div>
        
        {/* Streak indicator */}
        <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-indigo-50/50 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/40 shadow-lg shadow-indigo-950/5 dark:shadow-indigo-950/20 self-start md:self-auto">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500 animate-pulse">
            <Flame className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Health Streak</p>
            <p className="text-lg font-extrabold text-slate-900 dark:text-slate-100">{streak} Days Consecutively</p>
          </div>
        </div>
      </header>

      {/* Log Today Reminder Banner if not logged */}
      {!loggedToday && (
        <motion.div 
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="p-6 rounded-3xl bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/40 dark:to-purple-900/40 border border-indigo-100 dark:border-indigo-500/20 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl"
        >
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">How did you sleep last night?</h3>
            <p className="text-indigo-950/80 dark:text-indigo-200/80 text-sm mt-1">Keep your streak active and update the AI model with today's sleep logs.</p>
          </div>
          <button 
            onClick={() => navigate('/log')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/20 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Log Sleep Log
          </button>
        </motion.div>
      )}

      {/* CORE STATS GRID */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Sleep Score progress ring card */}
        <div className="lg:col-span-2 glass-panel-light dark:glass-panel-dark p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 flex flex-col sm:flex-row items-center justify-around gap-6 min-h-[220px]">
          <div className="space-y-3 text-center sm:text-left">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Overall Sleep Score</h3>
            <p className="text-xs text-slate-600 dark:text-slate-500 max-w-[200px]">Calculated based on duration, stress, mood, activity, and steps.</p>
            {latestEntry && (
              <span className="inline-block px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-600/10 text-indigo-650 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/15">
                Last Logged: {latestEntry.date}
              </span>
            )}
          </div>
          <CircularProgress score={latestEntry ? latestEntry.sleepScore : 0} />
        </div>

        {/* BMI Card */}
        <div className="glass-panel-light dark:glass-panel-dark p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 flex flex-col justify-between min-h-[220px]">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">BMI Index</h3>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">{user.bmi || 'N/A'}</p>
            </div>
            <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
              <Compass className="h-6 w-6" />
            </div>
          </div>
          <div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mt-4">
              <div 
                className="bg-indigo-500 h-2 rounded-full" 
                style={{ width: `${Math.min(100, ((user.bmi || 22) / 40) * 100)}%` }} 
              />
            </div>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase">Weight Range</span>
              <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
                {user.bmi < 18.5 ? 'Underweight' : user.bmi < 25 ? 'Normal Weight' : user.bmi < 30 ? 'Overweight' : 'Obese'}
              </span>
            </div>
          </div>
        </div>

        {/* Steps/Quality Mini-Stat grid */}
        <div className="glass-panel-light dark:glass-panel-dark p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 flex flex-col justify-between min-h-[220px]">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Today's Steps</h3>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white mt-3">
                {latestEntry ? latestEntry.dailySteps.toLocaleString() : '0'}
              </p>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 dark:text-emerald-400">
              <Footprints className="h-6 w-6" />
            </div>
          </div>
          <div>
            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 mt-4">
              <div 
                className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" 
                style={{ width: `${Math.min(100, ((latestEntry ? latestEntry.dailySteps : 0) / 10000) * 100)}%` }} 
              />
            </div>
            <div className="flex justify-between items-center mt-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-bold">Goal: 10,000 steps</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                {latestEntry ? Math.round((latestEntry.dailySteps / 10000) * 100) : 0}%
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* METRIC SPECS GRID */}
      {latestEntry && (
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Sleep Hours */}
          <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 flex items-center gap-4 shadow-sm">
            <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
              <Moon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Sleep Hours</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{latestEntry.sleepDuration} hrs</p>
            </div>
          </div>

          {/* Stress Level */}
          <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 flex items-center gap-4 shadow-sm">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500 dark:text-purple-400">
              <Zap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Stress Level</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{latestEntry.stressLevel} / 10</p>
            </div>
          </div>

          {/* Daily Activity */}
          <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 flex items-center gap-4 shadow-sm">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-550 dark:text-emerald-400">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Physical Activity</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{latestEntry.physicalActivity} mins</p>
            </div>
          </div>

          {/* Mood */}
          <div className="p-5 rounded-2xl bg-white/80 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800/80 flex items-center gap-4 shadow-sm">
            <div className="p-2.5 rounded-xl bg-pink-500/10 text-pink-500 dark:text-pink-400">
              <Smile className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Mood logged</p>
              <p className={`text-lg font-bold ${moodMap[latestEntry.mood]?.color || 'text-slate-900 dark:text-white'}`}>
                {moodMap[latestEntry.mood]?.emoji || '😐'} {latestEntry.mood}
              </p>
            </div>
          </div>

        </section>
      )}

      {/* MACHINE LEARNING CLASSIFIER ANALYSIS */}
      {latestEntry && (
        <section className="glass-panel-light dark:glass-panel-dark p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-600 text-white">
              <Brain className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Machine Learning Disorder Risk Assessment</h3>
          </div>
          
          <div className={`p-5 rounded-2xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-6
            ${latestEntry.predictionDisorder === 'None' 
              ? 'bg-emerald-500/5 border-emerald-500/20 dark:border-emerald-500/15' 
              : 'bg-rose-500/5 border-rose-500/20 dark:border-rose-500/15'
            }`}
          >
            <div className="flex items-start gap-4">
              {latestEntry.predictionDisorder === 'None' ? (
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                  <CheckCircle className="h-6 w-6" />
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mt-0.5">
                  <AlertTriangle className="h-6 w-6" />
                </div>
              )}
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Random Forest Classification Output</p>
                <h4 className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                  Sleep Disorder: <span className={latestEntry.predictionDisorder === 'None' ? 'text-emerald-650 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                    {latestEntry.predictionDisorder}
                  </span>
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                  Based on: {user.gender}, {user.age} yrs, {user.occupation}, BMI Category, sleep metrics, steps, and activity profiles.
                </p>
              </div>
            </div>

            <div className="flex gap-4 self-stretch md:self-auto justify-around border-t border-slate-200 dark:border-slate-800/40 md:border-t-0 pt-4 md:pt-0">
              <div className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center min-w-[100px] shadow-sm">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Confidence</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{latestEntry.predictionConfidence}%</p>
              </div>
              <div className="px-5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center min-w-[100px] shadow-sm">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Risk Level</p>
                <p className={`text-lg font-bold mt-0.5 ${
                  latestEntry.predictionRisk === 'Low' 
                    ? 'text-emerald-600 dark:text-emerald-400' 
                    : latestEntry.predictionRisk === 'Medium' 
                      ? 'text-amber-600 dark:text-amber-400' 
                      : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {latestEntry.predictionRisk}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ADVICE & ACHIEVEMENTS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Achievements / Badges Panel */}
        <section className="lg:col-span-1 glass-panel-light dark:glass-panel-dark p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 space-y-4">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-500 dark:text-indigo-400 animate-bounce" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Achievement Badges</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">Track at least 3 days of healthy habits to earn these trophies.</p>
          
          <div className="space-y-4 mt-4">
            {badges.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 text-xs bg-slate-50/50 dark:bg-transparent">
                No badges unlocked yet. Keep tracking to earn achievements!
              </div>
            ) : (
              badges.map(b => (
                <div key={b.id} className="flex items-center gap-4 p-3.5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/60 shadow-sm">
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-white">
                    {renderBadgeIcon(b.icon)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{b.name}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{b.description}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Personalized Recommendations Panel */}
        <section className="lg:col-span-2 glass-panel-light dark:glass-panel-dark p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 space-y-4">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-rose-500 dark:text-rose-400" />
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">AI Personalized Health Recommendations</h3>
          </div>
          
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="p-6 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-500 text-xs bg-slate-50/50 dark:bg-slate-950/20">
                ⭐ Awesome stats! No critical anomalies detected in your parameters today.
              </div>
            ) : (
              recommendations.map(rec => (
                <div key={rec.id} className={`p-5 rounded-2xl border ${rec.color} flex gap-4 shadow-sm`}>
                  <div className="p-2.5 rounded-xl bg-slate-950/5 dark:bg-slate-950/30 self-start">
                    <rec.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">{rec.title}</h4>
                    <ul className="mt-2 space-y-1.5 text-xs">
                      {rec.bullets.map((bullet, idx) => (
                        <li key={idx} className="list-disc list-inside text-slate-700 dark:text-slate-300">{bullet}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

      </div>

    </div>
  );
};

// Loading Skeletons
const DashboardSkeleton = () => (
  <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto pb-24 md:pb-8 animate-pulse">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-2">
        <div className="h-8 w-48 bg-slate-250 dark:bg-slate-800 rounded-lg" />
        <div className="h-4 w-72 bg-slate-250 dark:bg-slate-800 rounded-lg" />
      </div>
      <div className="h-16 w-52 bg-slate-250 dark:bg-slate-800 rounded-2xl" />
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="lg:col-span-2 h-[220px] bg-slate-200/50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800/80" />
      <div className="h-[220px] bg-slate-200/50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800/80" />
      <div className="h-[220px] bg-slate-200/50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800/80" />
    </div>

    <div className="h-44 bg-slate-200/50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800/80" />

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="h-60 bg-slate-200/50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800/80" />
      <div className="lg:col-span-2 h-60 bg-slate-200/50 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800/80" />
    </div>
  </div>
);

export default Dashboard;
