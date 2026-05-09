'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Zap, ArrowRight } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    // Show manual button as fallback after 3 seconds
    const buttonTimer = setTimeout(() => setShowButton(true), 3000);

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Attempt auto-redirect
    const redirectTimer = setTimeout(() => {
      console.log('Attempting auto-redirect...');
      router.push(token ? '/dashboard' : '/login');
    }, 2000);

    return () => {
      clearTimeout(buttonTimer);
      clearTimeout(redirectTimer);
    };
  }, [router]);

  const handleManualEnter = () => {
    const token = localStorage.getItem('token');
    router.push(token ? '/dashboard' : '/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#030712] relative overflow-hidden">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />

      <motion.div
        initial={{ scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center z-10"
      >
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-purple-600 mb-6 shadow-2xl shadow-orange-500/30"
        >
          <Zap className="w-10 h-10 text-white" />
        </motion.div>

        <motion.h1
          initial={{ y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-4xl font-bold bg-gradient-to-r from-orange-400 via-amber-300 to-purple-400 bg-clip-text text-transparent mb-3"
        >
          SK GROUPS
        </motion.h1>

        <motion.div
          initial={{ }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="space-y-4"
        >
          {!showButton ? (
            <p className="text-zinc-500 text-sm animate-pulse">
              Loading your workspace...
            </p>
          ) : (
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={handleManualEnter}
              className="px-6 py-2 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-sm hover:bg-white/10 transition-all flex items-center gap-2 mx-auto"
            >
              Enter Dashboard <ArrowRight className="w-4 h-4" />
            </motion.button>
          )}
        </motion.div>

        <motion.div
          initial={{ width: 0 }}
          animate={{ width: '100%' }}
          transition={{ delay: 0.5, duration: 1.5, ease: 'easeInOut' }}
          className="mt-6 h-0.5 bg-gradient-to-r from-orange-500 to-purple-600 rounded-full mx-auto max-w-48"
        />
      </motion.div>
    </div>
  );
}
