import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import LoadingScreen from '../components/LoadingScreen';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  MoonStar, 
  Loader2, 
  User, 
  Sparkles,
  HelpCircle
} from 'lucide-react';

const Coach = () => {
  const { authFetch, user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  // Quick prompt chips
  const promptChips = [
    "I sleep only 5 hours.",
    "I feel tired every morning.",
    "Can coffee affect my sleep quality?",
    "Why does high stress lower my sleep score?"
  ];

  const fetchChatHistory = async () => {
    try {
      setInitialLoading(true);
      const res = await authFetch(`${API_URL}/coach/history`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to retrieve conversation');
      setMessages(data.messages || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, []);

  // Autoscroll to bottom when messages list changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSendMessage = async (text) => {
    if (!text || text.trim() === '') return;
    setInput('');
    setError('');
    
    // Add user message locally
    const newUserMessage = { role: 'user', content: text, timestamp: new Date() };
    setMessages(prev => [...prev, newUserMessage]);
    
    setLoading(true);

    try {
      const res = await authFetch(`${API_URL}/coach/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to get coach reply');

      // Update history from backend
      setMessages(data.history || []);
    } catch (err) {
      setError(err.message || 'Failed to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage(input);
  };

  if (initialLoading) {
    return <LoadingScreen message="Connecting to your AI Sleep Coach..." />;
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto h-[calc(100vh-4rem)] md:h-screen flex flex-col pb-20 md:pb-8">
      
      {/* Header section */}
      <header className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-indigo-600 dark:text-indigo-400 animate-pulse" />
            AI Sleep Coach
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">
            Discuss your sleep habits, stress, and lifestyle with our Gemini-powered health expert.
          </p>
        </div>
      </header>

      {/* Main chat window container */}
      <div className="flex-1 glass-panel-light dark:glass-panel-dark border border-slate-200 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/40 rounded-3xl flex flex-col overflow-hidden">
        
        {/* Chat message display area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {initialLoading ? (
            <div className="h-full flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 max-w-md mx-auto space-y-4">
              <div className="p-4 rounded-3xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                <MoonStar className="h-10 w-10 animate-bounce" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Meet your AI Sleep Coach</h3>
              <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed">
                I can give you customized advice on sleep hygiene, early bedtime triggers, exercise routines, and relaxation tips.
              </p>
              
              <div className="w-full pt-4 space-y-2">
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-left mb-2">Suggested prompts:</p>
                <div className="flex flex-wrap gap-2">
                  {promptChips.map((chip, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendMessage(chip)}
                      className="px-3.5 py-2 text-xs text-left rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500/50 hover:bg-indigo-600/5 transition-colors"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => {
                const isUser = msg.role === 'user';
                return (
                  <div 
                    key={index}
                    className={`flex gap-3 max-w-[85%] ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
                  >
                    {/* Avatar */}
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs text-white
                      ${isUser 
                        ? 'bg-indigo-600' 
                        : 'bg-gradient-to-tr from-purple-500 to-indigo-500'
                      }`}
                    >
                      {isUser ? user.name.charAt(0).toUpperCase() : <Sparkles className="h-4 w-4" />}
                    </div>

                    {/* Speech bubble */}
                    <div className={`p-4 rounded-2xl text-sm leading-relaxed whitespace-pre-line
                      ${isUser 
                        ? 'bg-indigo-600 text-white rounded-tr-none' 
                        : 'bg-white dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 text-slate-800 dark:text-slate-300 rounded-tl-none shadow-sm'
                      }`}
                    >
                      {/* Markdown support fallback (handling basic bold tags) */}
                      {msg.content}
                    </div>
                  </div>
                );
              })}

              {/* Typing indicator */}
              {loading && (
                <div className="flex gap-3 mr-auto max-w-[85%]">
                  <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white">
                    <Sparkles className="h-4 w-4 animate-spin" />
                  </div>
                  <div className="p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 rounded-tl-none flex items-center gap-1.5 py-3 shadow-sm">
                    <div className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="h-2 w-2 rounded-full bg-slate-400 dark:bg-slate-600 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input box */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/60 bg-slate-50/50 dark:bg-slate-950/20">
          <form onSubmit={handleFormSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="Ask anything about your sleep..."
              className="flex-1 px-4 py-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600"
            >
              <Send className="h-5 w-5" />
            </button>
          </form>
        </div>

      </div>

    </div>
  );
};

export default Coach;
