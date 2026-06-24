import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import LoadingScreen from '../components/LoadingScreen';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Line, Bar, Pie, Radar } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Moon, 
  Activity, 
  Zap, 
  BarChart3, 
  Loader2, 
  HelpCircle 
} from 'lucide-react';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Filler,
  Tooltip,
  Legend
);

const Reports = () => {
  const { authFetch } = useAuth();
  const { theme } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchWeeklyReports = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_URL}/sleep/weekly`);
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Failed to load weekly analytics');
      setData(payload);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeeklyReports();
  }, []);

  if (loading) {
    return <LoadingScreen message="Generating Report Visualizations..." />;
  }

  if (error) {
    return (
      <div className="p-8 text-center text-rose-600 dark:text-rose-400">
        <p className="text-lg font-semibold">{error}</p>
        <button onClick={fetchWeeklyReports} className="mt-4 px-4 py-2 bg-indigo-600 rounded-xl text-white text-sm font-medium">
          Retry Loading
        </button>
      </div>
    );
  }

  if (!data.hasData || data.chartData.length === 0) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-3xl mt-12 bg-slate-100/50 dark:bg-slate-900/10">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Report Data Available</h2>
        <p className="text-sm">Please log sleep entries for at least a few days to view trends and charts.</p>
      </div>
    );
  }

  const { averages, moodDistribution, chartData } = data;
  const dates = chartData.map(d => d.date);

  // 1. Line Chart: Sleep Duration vs Date
  const lineChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Sleep Duration (Hours)',
        data: chartData.map(d => d.sleepDuration),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 3,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointRadius: 4
      }
    ]
  };

  // 2. Bar Chart: Stress Level vs Date
  const barChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Stress Level (1-10)',
        data: chartData.map(d => d.stressLevel),
        backgroundColor: 'rgba(168, 85, 247, 0.75)',
        borderColor: '#a855f7',
        borderWidth: 1.5,
        borderRadius: 8
      }
    ]
  };

  // 3. Area Chart: Daily Steps vs Date
  const areaChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Daily Steps',
        data: chartData.map(d => d.dailySteps),
        fill: true,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.15)',
        borderWidth: 3,
        tension: 0.3,
        pointBackgroundColor: '#10b981'
      }
    ]
  };

  // 4. Pie Chart: Mood Distribution
  const moodLabels = Object.keys(moodDistribution);
  const moodValues = Object.values(moodDistribution);
  const moodColors = {
    'Very Happy': 'rgba(16, 185, 129, 0.75)',
    'Happy': 'rgba(99, 102, 241, 0.75)',
    'Neutral': 'rgba(100, 116, 139, 0.75)',
    'Sad': 'rgba(245, 158, 11, 0.75)',
    'Very Stressed': 'rgba(244, 63, 94, 0.75)'
  };
  const pieColors = moodLabels.map(label => moodColors[label] || 'rgba(99, 102, 241, 0.75)');

  const pieChartData = {
    labels: moodLabels,
    datasets: [
      {
        data: moodValues,
        backgroundColor: pieColors,
        borderColor: theme === 'dark' ? 'rgba(15, 23, 42, 0.5)' : 'rgba(255, 255, 255, 0.8)',
        borderWidth: 2
      }
    ]
  };

  // 5. Radar Chart: Health Metrics
  // We normalize to a 10-point scale:
  // - Sleep duration (capped at 10)
  // - Sleep quality (1-10)
  // - Stress level (inverted: 11 - stress, so higher is better)
  // - Steps (steps / 1000, capped at 10)
  // - Physical Activity (minutes / 10, capped at 10)
  const radarMetrics = [
    averages.sleepDuration,
    averages.sleepQuality,
    11 - averages.stressLevel,
    Math.min(10, averages.totalSteps / 1000),
    Math.min(10, averages.sleepQuality * 0.9) // Proxied metric
  ];

  const radarChartData = {
    labels: ['Sleep Duration', 'Sleep Quality', 'Stress Relief', 'Steps Count (k)', 'Circadian Score'],
    datasets: [
      {
        label: 'Averages',
        data: radarMetrics,
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: '#6366f1',
        borderWidth: 2,
        pointBackgroundColor: '#6366f1'
      }
    ]
  };

  // Dynamic colors based on theme
  const isDark = theme === 'dark';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.06)';
  const tickColor = isDark ? '#94a3b8' : '#475569';
  const tooltipBg = isDark ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.95)';
  const tooltipBorder = isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(15, 23, 42, 0.1)';
  const tooltipText = isDark ? '#cbd5e1' : '#1e293b';

  // Chart configuration options for premium dark aesthetics
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        padding: 12,
        cornerRadius: 12,
        backgroundColor: tooltipBg,
        titleColor: isDark ? '#fff' : '#0f172a',
        bodyColor: tooltipText,
        borderWidth: 1,
        borderColor: tooltipBorder
      }
    },
    scales: {
      x: {
        grid: {
          color: gridColor
        },
        ticks: {
          color: tickColor,
          font: { size: 10, family: 'Outfit' }
        }
      },
      y: {
        grid: {
          color: gridColor
        },
        ticks: {
          color: tickColor,
          font: { size: 10, family: 'Outfit' }
        }
      }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false }
    },
    scales: {
      r: {
        grid: { color: gridColor },
        angleLines: { color: gridColor },
        pointLabels: {
          color: tickColor,
          font: { size: 10, family: 'Outfit', weight: 'bold' }
        },
        ticks: {
          display: false,
          max: 10
        }
      }
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8 space-y-8">
      
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Reports & Health Trends</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1.5">Statistical analysis of your sleep logs and lifestyle metrics over the past 7 records.</p>
        </div>
      </header>

      {/* AVERAGES DASHBOARD GRID */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Avg Sleep Duration */}
        <div className="p-5 rounded-3xl glass-panel-light dark:glass-panel-dark bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-500 dark:text-blue-400">
            <Moon className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Average Sleep Duration</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{averages.sleepDuration} hrs</p>
          </div>
        </div>

        {/* Avg Stress Level */}
        <div className="p-5 rounded-3xl glass-panel-light dark:glass-panel-dark bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-500 dark:text-purple-400">
            <Zap className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Average Stress Level</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{averages.stressLevel} / 10</p>
          </div>
        </div>

        {/* Avg Sleep Quality */}
        <div className="p-5 rounded-3xl glass-panel-light dark:glass-panel-dark bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Average Sleep Quality</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{averages.sleepQuality} / 10</p>
          </div>
        </div>

        {/* Total Steps */}
        <div className="p-5 rounded-3xl glass-panel-light dark:glass-panel-dark bg-white/40 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800/80 flex items-center gap-4">
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-550 dark:text-emerald-400">
            <Activity className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Total Logged Steps</p>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">{averages.totalSteps.toLocaleString()}</p>
          </div>
        </div>

      </section>

      {/* CHARTS CONTAINER GRID */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Line Chart: Sleep Duration vs Date */}
        <div className="lg:col-span-2 glass-panel-light dark:glass-panel-dark p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Sleep Duration vs Date</h3>
          <div className="h-64 relative">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Radar Chart: Health Metrics */}
        <div className="lg:col-span-1 glass-panel-light dark:glass-panel-dark p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Health Metrics Profile</h3>
          <div className="h-64 relative">
            <Radar data={radarChartData} options={radarOptions} />
          </div>
        </div>

        {/* Bar Chart: Stress Level vs Date */}
        <div className="lg:col-span-2 glass-panel-light dark:glass-panel-dark p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Stress Level vs Date</h3>
          <div className="h-64 relative">
            <Bar data={barChartData} options={chartOptions} />
          </div>
        </div>

        {/* Pie Chart: Mood Distribution */}
        <div className="lg:col-span-1 glass-panel-light dark:glass-panel-dark p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Mood Distribution</h3>
          <div className="h-64 relative flex items-center justify-center">
            <div className="w-48 h-48">
              <Pie data={pieChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'bottom', labels: { color: isDark ? '#94a3b8' : '#475569', font: { size: 9, family: 'Outfit' } } } } }} />
            </div>
          </div>
        </div>

        {/* Area Chart: Daily Steps vs Date */}
        <div className="lg:col-span-3 glass-panel-light dark:glass-panel-dark p-6 rounded-3xl border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 space-y-4">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Daily Steps vs Date (Area)</h3>
          <div className="h-64 relative">
            <Line data={areaChartData} options={chartOptions} />
          </div>
        </div>

      </section>

    </div>
  );
};

export default Reports;
