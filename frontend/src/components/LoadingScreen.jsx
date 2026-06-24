import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Loader2, MoonStar } from 'lucide-react';

const SLEEP_QUOTES = [
  { text: "Sleep is the best meditation.", author: "Dalai Lama" },
  { text: "A good laugh and a long sleep are the best cures in the doctor's book.", author: "Irish Proverb" },
  { text: "Your future depends on your dreams, so go to sleep.", author: "Mesut Barazany" },
  { text: "The best bridge between despair and hope is a good night's sleep.", author: "E. Joseph Cossman" },
  { text: "Sleep is the golden chain that ties health and our bodies together.", author: "Thomas Dekker" },
  { text: "Each night, when I go to sleep, I die. And the next morning, when I wake up, I am reborn.", author: "Mahatma Gandhi" },
  { text: "True silence is the rest of the mind, and is to the spirit what sleep is to the body, nourishment and refreshment.", author: "William Penn" },
  { text: "Man should forget his anger before he lies down to sleep.", author: "Mahatma Gandhi" },
  { text: "Sleep plays a vital role in good health and well-being throughout your life.", author: "NIH" },
  { text: "Rest is not idleness, and to lie sometimes on the grass under trees... is by no means a waste of time.", author: "John Lubbock" }
];

const LoadingScreen = ({ message = "Synchronizing health data..." }) => {
  const [quote, setQuote] = useState({ text: "", author: "" });

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * SLEEP_QUOTES.length);
    setQuote(SLEEP_QUOTES[randomIndex]);
  }, []);

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-dark-200 transition-colors duration-300">
      <div className="max-w-md w-full px-6 flex flex-col items-center text-center space-y-8">
        
        {/* Animated Icon and Loader */}
        <div className="relative flex items-center justify-center">
          <motion.div 
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            className="p-5 rounded-3xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-650 dark:text-indigo-400 shadow-xl border border-indigo-100/50 dark:border-indigo-500/10"
          >
            <MoonStar className="h-10 w-10" />
          </motion.div>
          
          <div className="absolute -bottom-2 -right-2 p-1.5 rounded-full bg-white dark:bg-dark-100 shadow-md">
            <Loader2 className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
          </div>
        </div>

        {/* Loading text message */}
        <div className="space-y-2">
          <p className="text-sm font-semibold tracking-wide text-slate-500 dark:text-slate-400 uppercase">
            {message}
          </p>
        </div>

        {/* sleep quote block */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="p-6 rounded-2xl bg-white/40 dark:bg-slate-900/30 border border-slate-200/60 dark:border-slate-800/40 backdrop-blur-md shadow-sm relative overflow-hidden"
        >
          <span className="absolute top-2 left-3 text-4xl text-indigo-200/50 dark:text-indigo-950 font-serif pointer-events-none select-none">“</span>
          
          <p className="text-slate-700 dark:text-slate-300 text-sm italic font-medium leading-relaxed px-4">
            {quote.text}
          </p>
          <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-3 text-right">
            — {quote.author}
          </p>
          
          <span className="absolute bottom-[-10px] right-3 text-4xl text-indigo-200/50 dark:text-indigo-950 font-serif pointer-events-none select-none">”</span>
        </motion.div>

      </div>
    </div>
  );
};

export default LoadingScreen;
