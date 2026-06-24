import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  Moon, 
  Smile, 
  Activity, 
  Footprints, 
  Zap, 
  Coffee, 
  Tv, 
  Calendar, 
  Clock,
  Loader2,
  CheckCircle2
} from 'lucide-react';

const DailyEntry = () => {
  const { authFetch } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const todayStr = new Date().toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    date: todayStr,
    sleepDuration: 7.0,
    sleepQuality: 7,
    stressLevel: 5,
    physicalActivity: 30,
    dailySteps: 7000,
    mood: 'Neutral',
    screenTime: '',
    coffeeIntake: '',
    bedTime: '22:30',
    wakeUpTime: '06:30'
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMoodSelect = (mood) => {
    setFormData(prev => ({
      ...prev,
      mood
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      
      const payload = {
        date: formData.date,
        sleepDuration: Number(formData.sleepDuration),
        sleepQuality: Number(formData.sleepQuality),
        stressLevel: Number(formData.stressLevel),
        physicalActivity: Number(formData.physicalActivity),
        dailySteps: Number(formData.dailySteps),
        mood: formData.mood,
        bedTime: formData.bedTime || null,
        wakeUpTime: formData.wakeUpTime || null,
        screenTime: formData.screenTime !== '' ? Number(formData.screenTime) : undefined,
        coffeeIntake: formData.coffeeIntake !== '' ? Number(formData.coffeeIntake) : undefined
      };

      const res = await authFetch(`${API_URL}/sleep/entry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save entry');

      setSuccess(true);
      setTimeout(() => {
        navigate('/');
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const moods = [
    { name: 'Very Happy', emoji: '😊', bg: 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/20 text-emerald-600 dark:text-emerald-400 select-bg-emerald-500/20' },
    { name: 'Happy', emoji: '🙂', bg: 'bg-indigo-500/10 hover:bg-indigo-500/20 border-indigo-500/20 text-indigo-600 dark:text-indigo-400 select-bg-indigo-500/20' },
    { name: 'Neutral', emoji: '😐', bg: 'bg-slate-500/10 hover:bg-slate-500/20 border-slate-300 dark:border-slate-500/20 text-slate-700 dark:text-slate-400 select-bg-slate-500/20' },
    { name: 'Sad', emoji: '🙁', bg: 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-600 dark:text-amber-400 select-bg-amber-500/20' },
    { name: 'Very Stressed', emoji: '😫', bg: 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/20 text-rose-600 dark:text-rose-400 select-bg-rose-500/20' }
  ];

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto pb-24 md:pb-8">
      
      {/* Page Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Log Daily Sleep Metrics</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1.5">Enter your parameters to calculate your Sleep Score and test for health disorder risks.</p>
      </header>

      {/* Main glass card */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel-light dark:glass-panel-dark p-6 md:p-8 rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 relative shadow-xl"
      >
        {success && (
          <div className="absolute inset-0 bg-slate-50/95 dark:bg-slate-950/90 rounded-3xl z-20 flex flex-col items-center justify-center text-center p-6">
            <CheckCircle2 className="h-16 w-16 text-emerald-500 dark:text-emerald-400 animate-bounce" />
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-4">Metrics Logged Successfully!</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">Calculating your score and updating ML predictions...</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-300 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 1. Date selector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                <Calendar className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                Date
              </label>
              <input
                type="date"
                name="date"
                required
                max={todayStr}
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* 2. Core sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-slate-200 dark:border-slate-800/60 pt-6">
            
            {/* Sleep Duration slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <Moon className="h-4 w-4 text-blue-500 dark:text-blue-400" />
                  Sleep Duration
                </label>
                <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{formData.sleepDuration} hrs</span>
              </div>
              <input
                type="range"
                name="sleepDuration"
                min="3"
                max="14"
                step="0.1"
                value={formData.sleepDuration}
                onChange={handleInputChange}
                className="w-full accent-blue-600 bg-slate-200 dark:bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Average recommendation is 7 to 9 hours of sleep nightly.</p>
            </div>

            {/* Sleep Quality slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <Smile className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                  Sleep Quality (1-10)
                </label>
                <span className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">{formData.sleepQuality} / 10</span>
              </div>
              <input
                type="range"
                name="sleepQuality"
                min="1"
                max="10"
                step="1"
                value={formData.sleepQuality}
                onChange={handleInputChange}
                className="w-full accent-indigo-600 bg-slate-200 dark:bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">1 indicates severely disrupted sleep; 10 is deep and peaceful.</p>
            </div>

            {/* Stress Level slider */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                  <Zap className="h-4 w-4 text-purple-500 dark:text-purple-400" />
                  Stress Level (1-10)
                </label>
                <span className="text-sm font-extrabold text-purple-600 dark:text-purple-400">{formData.stressLevel} / 10</span>
              </div>
              <input
                type="range"
                name="stressLevel"
                min="1"
                max="10"
                step="1"
                value={formData.stressLevel}
                onChange={handleInputChange}
                className="w-full accent-purple-600 bg-slate-200 dark:bg-slate-800 h-2 rounded-lg cursor-pointer"
              />
              <p className="text-[10px] text-slate-500">Lower stress levels contribute to higher sleep scores.</p>
            </div>

            {/* Physical Activity input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <Activity className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                Physical Activity (Minutes)
              </label>
              <input
                type="number"
                name="physicalActivity"
                min="0"
                required
                value={formData.physicalActivity}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="30"
              />
            </div>

            {/* Steps Count input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                <Footprints className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
                Daily Steps Count
              </label>
              <input
                type="number"
                name="dailySteps"
                min="0"
                required
                value={formData.dailySteps}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="7000"
              />
            </div>

          </div>

          {/* 3. Mood Selector */}
          <div className="border-t border-slate-200 dark:border-slate-800/60 pt-6 space-y-3">
            <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Mood Today</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {moods.map((moodItem) => {
                const isSelected = formData.mood === moodItem.name;
                return (
                  <button
                    key={moodItem.name}
                    type="button"
                    onClick={() => handleMoodSelect(moodItem.name)}
                    className={`flex flex-col items-center justify-center p-4 rounded-2xl border text-center transition-all duration-200
                      ${moodItem.bg}
                      ${isSelected 
                        ? 'border-indigo-500 bg-indigo-500/20 ring-2 ring-indigo-500/20 scale-105 font-bold' 
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-600 dark:text-slate-400'
                      }
                    `}
                  >
                    <span className="text-3xl mb-2">{moodItem.emoji}</span>
                    <span className="text-xs truncate max-w-full">{moodItem.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. Optional Fields */}
          <div className="border-t border-slate-200 dark:border-slate-800/60 pt-6 space-y-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-300">Optional Parameters (Helps analyze lifestyle trends)</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Coffee Intake */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  <Coffee className="h-4 w-4 text-amber-500" />
                  Coffee / Caffeine Intake (Cups)
                </label>
                <input
                  type="number"
                  name="coffeeIntake"
                  min="0"
                  value={formData.coffeeIntake}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="0"
                />
              </div>

              {/* Screen Time */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  <Tv className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                  Screen Time before Sleep (Minutes)
                </label>
                <input
                  type="number"
                  name="screenTime"
                  min="0"
                  value={formData.screenTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                  placeholder="30"
                />
              </div>

              {/* Bed Time */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  Bedtime Target
                </label>
                <input
                  type="time"
                  name="bedTime"
                  value={formData.bedTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              {/* Wake Up Time */}
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider mb-2">
                  <Clock className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  Wakeup Time
                </label>
                <input
                  type="time"
                  name="wakeUpTime"
                  value={formData.wakeUpTime}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

            </div>

          </div>

          {/* Submit Action */}
          <div className="border-t border-slate-200 dark:border-slate-800/60 pt-6 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold transition-all shadow-lg shadow-indigo-600/10 disabled:bg-slate-800 disabled:text-slate-600 disabled:shadow-none"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
              Save Metrics
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};

export default DailyEntry;
