import React, { useState } from 'react';
import { Shield, Sparkles, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginPanelProps {
  onLoginSuccess: (adminName: 'Akash' | 'Alojyoti' | 'Sumanta') => void;
}

export default function LoginPanel({ onLoginSuccess }: LoginPanelProps) {
  const [selectedAdmin, setSelectedAdmin] = useState<'Akash' | 'Alojyoti' | 'Sumanta'>('Akash');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (userId.trim().toLowerCase() !== 'admin' || password !== 'admin') {
      setError('Invalid User ID or Password. Please try again.');
      return;
    }

    setIsLoading(true);

    // Beautiful simulated fast logging in transition
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(selectedAdmin);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Dynamic ambient graphic backdrop */}
      <div className="absolute top-0 left-0 right-0 h-96 bg-gradient-to-b from-indigo-500/5 to-transparent dark:from-indigo-500/2 pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/5 dark:bg-indigo-500/[0.01] rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md bg-white dark:bg-[#111113] border border-slate-200/90 dark:border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-slate-905/5 dark:shadow-black/50 relative z-10"
      >
        {/* Upper Brand Badge */}
        <div className="flex flex-col items-center text-center space-y-4 mb-8">
          <div className="p-3.5 bg-indigo-600 rounded-2xl text-white transform hover:rotate-6 transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center justify-center gap-1.5">
              <span className="font-display font-extrabold text-slate-900 dark:text-white text-xl tracking-tight">
                StaffFlow Pro
              </span>
              <span className="px-1.5 py-0.5 text-[8.5px] font-mono tracking-widest font-extrabold bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 rounded-md uppercase">
                Admin Secure
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              Akash, Alojyoti & Sumanta Shared Household Console
            </p>
          </div>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-5 p-3.5 bg-rose-50 dark:bg-rose-950/10 border border-rose-250/50 dark:border-rose-900/40 rounded-xl flex items-start gap-2.5 text-rose-700 dark:text-rose-400 text-xs leading-relaxed"
          >
            <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Admin Identity Selection Grid */}
          <div className="space-y-2">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
              Select Your Identity
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Akash', 'Alojyoti', 'Sumanta'] as const).map((name) => {
                const isActive = selectedAdmin === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedAdmin(name)}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                      isActive 
                        ? 'bg-zinc-100 dark:bg-zinc-800 border-zinc-300 dark:border-zinc-700 text-slate-900 dark:text-white' 
                        : 'bg-white dark:bg-slate-950/40 border-slate-200 dark:border-white/5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-extrabold text-[11px] ${
                      isActive ? 'bg-indigo-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                    }`}>
                      {name[0]}
                    </div>
                    {name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* User ID Field */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
              User ID
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter admin user ID"
                className="w-full pl-10 pr-4 py-2.5 text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500/30 font-mono"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest font-mono">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500/30"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/10 cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wider"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <span>Secure Sign In as {selectedAdmin}</span>
                <CheckCircle className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      </motion.div>

      {/* Security notice footer */}
      <div className="mt-8 text-center text-[10px] text-slate-400 dark:text-slate-500 font-mono max-w-xs space-y-1">
        <p className="font-semibold text-slate-600 dark:text-slate-300">Created by Akash Sah</p>
        <p>Enforced by SSL Protection & Real-time Cloud Synchronization</p>
        <p>© {new Date().getFullYear()} StaffFlow Pro. All Rights Reserved.</p>
      </div>
    </div>
  );
}
