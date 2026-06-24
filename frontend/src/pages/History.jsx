import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Trash2, 
  Download, 
  FileSpreadsheet, 
  FileText, 
  ChevronLeft, 
  ChevronRight, 
  Loader2,
  Calendar,
  Sparkles,
  User,
  AlertTriangle
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const History = () => {
  const { authFetch, user } = useAuth();
  const [entries, setEntries] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await authFetch(`${API_URL}/sleep/history?search=${search}&page=${page}&limit=8`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to retrieve logs');
      
      setEntries(data.entries || []);
      setTotalPages(data.pagination.pages || 1);
      setTotalRecords(data.pagination.total || 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [page, search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset page on new search
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this log entry?')) return;
    setDeletingId(id);

    try {
      const res = await authFetch(`${API_URL}/sleep/entry/${id}`, {
        method: 'DELETE'
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete record');
      
      // Refresh
      fetchHistory();
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  };

  // CSV Report Exporter
  const handleExportCSV = () => {
    if (entries.length === 0) return;
    
    // Header columns
    const headers = [
      'Date', 'Sleep Duration (hrs)', 'Sleep Quality (1-10)', 'Stress Level (1-10)',
      'Physical Activity (mins)', 'Daily Steps', 'Mood', 'Coffee Intake (cups)',
      'Screen Time (mins)', 'Bedtime', 'Wakeup Time', 'Sleep Score', 'Sleep Score Category',
      'Predicted Disorder', 'Risk Level'
    ];

    const rows = entries.map(e => [
      e.date,
      e.sleepDuration,
      e.sleepQuality,
      e.stressLevel,
      e.physicalActivity,
      e.dailySteps,
      e.mood,
      e.coffeeIntake !== null ? e.coffeeIntake : 'N/A',
      e.screenTime !== null ? e.screenTime : 'N/A',
      e.bedTime || 'N/A',
      e.wakeUpTime || 'N/A',
      e.sleepScore,
      e.sleepScoreCategory,
      e.predictionDisorder,
      e.predictionRisk
    ]);

    // Construct CSV String
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(row => row.map(val => `"${val}"`).join(','))].join('\n');

    // Trigger Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `sleepsync_report_${user.name.split(' ')[0].toLowerCase()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // PDF Report Exporter using jspdf + autoTable
  const handleExportPDF = () => {
    if (entries.length === 0) return;

    const doc = new jsPDF();
    
    // Document Title and styling
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(99, 102, 241); // Brand Indigo color
    doc.text("SleepSync AI", 14, 20);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text("Intelligent Sleep & Lifestyle Report", 14, 26);
    doc.text(`Generated for: ${user.name} | Date: ${new Date().toLocaleDateString()}`, 14, 32);

    // Divider Line
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 36, 196, 36);

    // User Profile Stats Sub-section
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59);
    doc.text("User Parameters summary:", 14, 44);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Age: ${user.age} yrs`, 14, 50);
    doc.text(`Occupation: ${user.occupation}`, 60, 50);
    doc.text(`BMI Score: ${user.bmi}`, 120, 50);

    // Auto Table mapping
    const tableColumns = ['Date', 'Duration', 'Quality', 'Stress', 'Steps', 'Mood', 'Score', 'Prediction'];
    const tableRows = entries.map(e => [
      e.date,
      `${e.sleepDuration}h`,
      `${e.sleepQuality}/10`,
      `${e.stressLevel}/10`,
      e.dailySteps.toLocaleString(),
      e.mood,
      e.sleepScore,
      `${e.predictionDisorder} (${e.predictionRisk})`
    ]);

    doc.autoTable({
      startY: 56,
      head: [tableColumns],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [99, 102, 241], fontStyle: 'bold' },
      styles: { fontSize: 8, font: 'helvetica' },
      columnStyles: {
        7: { cellWidth: 'wrap' }
      }
    });

    // Save File
    doc.save(`sleepsync_report_${user.name.split(' ')[0].toLowerCase()}.pdf`);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto pb-24 md:pb-8 space-y-8">
      
      {/* Page Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">History Log & Export</h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1.5">
            {user.role === 'Admin' 
              ? 'Administrator View: Browse, analyze, and manage all system sleep records.' 
              : 'Search, filter, and export your personal historical sleep logs.'}
          </p>
        </div>

        {/* Export Buttons */}
        {entries.length > 0 && (
          <div className="flex gap-3 self-start md:self-auto">
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-semibold transition-colors"
            >
              <FileSpreadsheet className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />
              Export CSV
            </button>
            <button
              onClick={handleExportPDF}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-indigo-500/20 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-colors shadow-lg shadow-indigo-600/15"
            >
              <FileText className="h-4 w-4 text-white" />
              Download PDF Report
            </button>
          </div>
        )}
      </header>

      {/* Control bar (Search & Meta) */}
      <section className="flex flex-col sm:flex-row items-center gap-4">
        <div className="w-full sm:max-w-md relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-450 dark:text-slate-500 h-5 w-5" />
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by date, mood, category, prediction..."
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-white dark:bg-slate-900/40 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400 font-medium self-start sm:self-auto pt-1 sm:pt-0">
          Showing {entries.length} of {totalRecords} logged days
        </div>
      </section>

      {/* TABLE / CARD DISPLAY */}
      <section className="glass-panel-light dark:glass-panel-dark border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400 gap-3">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="text-sm font-medium">Fetching history logs...</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-20 text-center text-slate-500 dark:text-slate-400 max-w-sm mx-auto space-y-3">
              <Calendar className="h-10 w-10 text-slate-300 dark:text-slate-700 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No records found</h3>
              <p className="text-xs leading-relaxed">We couldn't find any sleep entries matching your query. Adjust filters or log today's metrics.</p>
            </div>
          ) : (
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-slate-100/50 dark:bg-slate-955/40 dark:bg-slate-955/40 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  {user.role === 'Admin' && <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">User</th>}
                  <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Date</th>
                  <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Sleep Hours</th>
                  <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Quality</th>
                  <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Stress</th>
                  <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Steps</th>
                  <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Mood</th>
                  <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">Sleep Score</th>
                  <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">ML Prediction</th>
                  <th className="px-6 py-4 font-bold text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                {entries.map(e => (
                  <tr key={e._id} className="hover:bg-slate-50 dark:hover:bg-slate-800/10 transition-colors">
                    {user.role === 'Admin' && (
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 rounded-full bg-indigo-500/10 text-indigo-650 dark:text-indigo-400 flex items-center justify-center font-bold text-[10px]">
                            {e.userId?.name?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 max-w-[120px] truncate block" title={e.userId?.email}>
                            {e.userId?.name || 'Unknown User'}
                          </span>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{e.date}</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{e.sleepDuration} hrs</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{e.sleepQuality} / 10</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{e.stressLevel} / 10</td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300">{e.dailySteps.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300">
                        {e.mood}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{e.sleepScore}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border
                        ${e.predictionDisorder === 'None'
                          ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : 'bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {e.predictionDisorder}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(e._id)}
                        disabled={deletingId === e._id}
                        className="p-2 rounded-lg text-slate-400 dark:text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-50"
                      >
                        {deletingId === e._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 dark:bg-slate-950/20 border-t border-slate-200 dark:border-slate-800">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Page {page} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/40 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </section>

    </div>
  );
};

export default History;
