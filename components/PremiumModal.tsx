'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Lock, Zap, CheckCircle2, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function PremiumModal({ isOpen, onClose }: PremiumModalProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    try {
      // 1. Create Order
      const res = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: 100 }), // ₹1 for testing
      });
      const order = await res.json();

      if (order.error) throw new Error(order.error);

      // 2. Open Razorpay Checkout
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_live_S9jUB1Unazfmhx', // Fallback to provided key
        amount: order.amount,
        currency: order.currency,
        name: "Mindcore Premium",
        description: "Unlock Advanced Analytics & Features",
        order_id: order.id,
        handler: async function (response: any) {
          // 3. Verify Payment
          const verifyRes = await fetch('/api/payment/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            }),
          });
          const verifyData = await verifyRes.json();

          if (verifyData.success) {
            onClose();
            router.refresh();
          } else {
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: "User",
          email: "user@example.com",
        },
        theme: {
          color: "#714efe",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Payment Error:', error);
      alert('Error initiating payment: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl p-8 text-center"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center text-[#714efe]">
                <Zap className="w-6 h-6 fill-current" strokeWidth={2.5} />
              </div>
              <button 
                onClick={onClose}
                className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-3xl font-black text-gray-900 mb-2 tracking-tight">Go Premium</h2>
            <p className="text-gray-500 mb-8 font-medium">
              Unlock deep insights and personalized wellness reports.
            </p>

            <div className="space-y-4 mb-8">
              {[
                "Advanced Mood Analytics",
                "Emotional Trend Reports",
                "Clinical History Tracking",
                "Priority Support"
              ].map((feat, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-2xl border border-gray-100">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-sm font-semibold text-gray-700">{feat}</span>
                </div>
              ))}
            </div>

            <div className="bg-[#714efe]/5 rounded-3xl p-6 border border-[#714efe]/10 mb-8">
               <div className="flex items-baseline justify-center gap-1">
                 <span className="text-4xl font-black text-[#714efe]">₹499</span>
                 <span className="text-gray-400 font-bold">/month</span>
               </div>
               <p className="text-[10px] text-[#714efe] font-bold uppercase tracking-widest mt-2">Special Launch Offer</p>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full py-5 bg-[#714efe] text-white rounded-[1.5rem] font-black uppercase tracking-widest text-sm shadow-xl shadow-purple-500/30 hover:bg-[#5f3ddb] transition-all flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>Upgrade Now <Zap className="w-4 h-4 fill-white" /></>
              )}
            </button>
            <p className="mt-4 text-[10px] text-gray-400 font-bold uppercase tracking-widest">Secure Payment via Razorpay</p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
