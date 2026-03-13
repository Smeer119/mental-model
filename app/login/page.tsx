'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { motion } from 'framer-motion'
import { Mail, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [authError, setAuthError] = useState(false)

  useEffect(() => {
    // Check URL for auth error param client-side only
    const params = new URLSearchParams(window.location.search)
    if (params.get('error')) setAuthError(true)
  }, [])

  const handleGoogleLogin = async () => {
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: {
          prompt: 'select_account',
        },
      },
    })
    if (error) {
      console.error('Login error:', error.message)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#efebf0] flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/50 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl animate-pulse" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="w-full max-w-md bg-white/70 backdrop-blur-xl rounded-[2.5rem] p-10 shadow-2xl shadow-purple-500/10 border border-white/50 relative z-10"
      >
        {/* Logo Section (Finn the Blob) */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-32 h-32 flex flex-col items-center justify-center mb-4">
            <motion.div
              animate={{ y: [0, -5, 0], scale: [1, 1.02, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative w-20 h-28 bg-gradient-to-b from-[#a3b2f8] via-[#8fa3f8] to-[#714efe] rounded-t-full shadow-lg flex flex-col items-center pt-8"
            >
              {/* Eyes */}
              <div className="flex space-x-4 mb-2">
                <div className="w-3 h-3 bg-gray-900 rounded-full" />
                <div className="w-3 h-3 bg-gray-900 rounded-full" />
              </div>
              {/* Smile */}
              <div className="w-4 h-2 border-b-[2px] border-gray-900 rounded-b-full" />
            </motion.div>
            <div className="w-28 h-4 bg-black/10 rounded-full blur-md -mt-2" />
          </div>

          <h1 className="text-3xl font-bold text-[#1c1c1e] tracking-tight mb-2">MentalWell</h1>
          <p className="text-gray-500 font-medium">Your personal mental health companion</p>
        </div>

        {/* Error Message */}
        {authError && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center space-x-3 text-red-600"
          >
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">Authentication failed. Please try again.</p>
          </motion.div>
        )}

        {/* Auth Buttons */}
        <div className="space-y-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center space-x-3 bg-white border border-gray-200 py-4 rounded-2xl font-bold text-[#1c1c1e] shadow-sm hover:bg-gray-50 transition-all disabled:opacity-60"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google"
              className="w-5 h-5"
            />
            <span>{loading ? 'Connecting...' : 'Continue with Google'}</span>
          </motion.button>

          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white/70 px-2 text-gray-400">or use email</span>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center space-x-3 bg-[#714efe] py-4 rounded-2xl font-bold text-white shadow-lg shadow-purple-500/30 hover:bg-[#5d3fd3] transition-all"
          >
            <Mail className="w-5 h-5" />
            <span>Sign in with Email</span>
          </motion.button>
        </div>

        <p className="mt-8 text-center text-sm text-gray-400">
          By continuing, you agree to our <br />
          <span className="text-[#714efe] font-medium cursor-pointer">Terms of Service</span>
          {' '}and{' '}
          <span className="text-[#714efe] font-medium cursor-pointer">Privacy Policy</span>
        </p>
      </motion.div>
    </div>
  )
}
