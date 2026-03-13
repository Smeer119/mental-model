'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle2, Lock, Zap } from 'lucide-react'
import { useRouter } from 'next/navigation'

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    }
  }, []);

  const [isSimulating, setIsSimulating] = useState(false)

  const handleUpgrade = async () => {
    setLoading(true)
    try {
      const isPlaceholder = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.includes('PLACEHOLDER');

      if (isPlaceholder) {
        setIsSimulating(true)
        // Wait 3 seconds to show the fake Razorpay screen
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        const verifyResp = await fetch('/api/razorpay/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            razorpay_order_id: 'dummy_order_id', 
            razorpay_payment_id: 'dummy_payment_id', 
            razorpay_signature: 'dummy_signature',
            is_dummy: true 
          })
        });
        
        const result = await verifyResp.json();
        if (result.status === 'success') {
          setIsSimulating(false)
          onClose();
          router.refresh();
        }
      } else {
        // ... rest of real logic
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {isSimulating ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative w-[400px] h-[550px] bg-[#fdfdfd] rounded-xl overflow-hidden shadow-2xl flex flex-col items-center justify-center p-8 border border-gray-200"
            >
               <div className="absolute top-0 left-0 w-full h-[60px] bg-[#222] flex items-center px-6 justify-between">
                  <span className="text-white font-bold text-lg italic">Razorpay</span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
               </div>
               
               <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-blue-500/20">
                  <div className="text-4xl">💎</div>
               </div>
               
               <h3 className="text-xl font-bold text-gray-800 mb-2">Mental Well PRO</h3>
               <p className="text-gray-400 mb-8">₹499.00</p>
               
               <div className="w-full space-y-4 mb-8">
                  <div className="h-1 bg-gray-100 w-full overflow-hidden">
                    <motion.div 
                      initial={{ x: "-100%" }}
                      animate={{ x: "100%" }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="h-full w-1/2 bg-blue-600"
                    />
                  </div>
                  <p className="text-center text-sm font-medium text-blue-600 animate-pulse">Contacting Banking Server...</p>
               </div>
               
               <div className="mt-12 text-center">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mb-4">Secured by Razorpay</p>
                  <img src="https://razorpay.com/assets/razorpay-logo-white.svg" className="h-4 invert opacity-30" alt="logo" />
               </div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                    <Zap className="w-6 h-6 text-purple-600 fill-purple-600" />
                  </div>
                  <button 
                    onClick={onClose}
                    className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <h2 className="text-3xl font-bold text-gray-900 mb-2">Upgrade to Premium</h2>
                <p className="text-gray-500 mb-8">Unlock the full power of Mental Well for a calm and balanced life.</p>

                <div className="space-y-4 mb-8">
                  {[
                    "Unlock all 5 mindfulness games",
                    "Detailed mood analytics & trends",
                    "Personalized wellness plans",
                    "Priority AI chat support"
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>
                      <span className="text-gray-700 font-medium">{feature}</span>
                    </div>
                  ))}
                </div>

                <div className="bg-purple-50 rounded-3xl p-6 mb-8 border border-purple-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-purple-600 font-bold uppercase tracking-wider">Lifetime Access</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-black text-gray-900">₹499</span>
                        <span className="text-gray-400 font-medium">one-time</span>
                      </div>
                    </div>
                    <div className="bg-white px-3 py-1 rounded-full text-xs font-bold text-purple-600 shadow-sm">
                      LIMITED OFFER
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleUpgrade}
                  disabled={loading}
                  className="w-full py-4 bg-[#714efe] text-white rounded-2xl font-bold text-lg shadow-lg shadow-purple-500/30 hover:bg-[#5f3ddb] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? 'Processing...' : (
                    <>
                      Upgrade Now <Zap className="w-5 h-5 fill-white" />
                    </>
                  )}
                </button>
                
                <p className="text-center text-xs text-gray-400 mt-4 font-medium uppercase tracking-widest">
                  Secure payment with Razorpay
                </p>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  )
}
