"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { ChevronLeft, Send, Mic, MicOff, Zap, X, Volume2, Globe } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Textarea } from "@/components/ui/textarea";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { cn } from "@/lib/utils";

// ─── Fast Duplex Voice Overlay (Gemini Live Style) ───────────────────────────
type VoiceState = "idle" | "listening" | "thinking" | "speaking";

function VoiceOverlay({ onClose }: { onClose: () => void }) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [finnSays, setFinnSays] = useState("");
  const [history, setHistory] = useState<{ role: string; text: string }[]>([]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isActiveRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isActiveRef.current = true;
    startListening(); 
    return () => {
      isActiveRef.current = false;
      stopEverything();
    };
  }, []);

  const interruptFinn = useCallback(() => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setVoiceState("listening");
      setFinnSays("");
    }
    abortControllerRef.current?.abort();
  }, []);

  const speakResponse = useCallback((text: string) => {
    if (!isActiveRef.current) return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(text);
    synthRef.current = utter;

    const voices = window.speechSynthesis.getVoices();
    utter.voice = voices.find(v => v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Enhanced")) || voices[0];
    utter.rate = 1.05;

    utter.onstart = () => {
      if (!isActiveRef.current) return;
      setVoiceState("speaking");
      setFinnSays(text);
    };

    utter.onend = () => {
      if (!isActiveRef.current) return;
      setVoiceState("listening");
      setFinnSays("");
    };

    window.speechSynthesis.speak(utter);
  }, []);

  const sendToAI = useCallback(async (userText: string) => {
    if (!isActiveRef.current || !userText.trim()) return;

    setVoiceState("thinking");
    setTranscript("");
    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history }),
        signal: abortControllerRef.current.signal,
      });

      if (!isActiveRef.current) return;
      const data = await res.json();
      const aiText = data.response;

      if (aiText) {
        setHistory(prev => [...prev, { role: "user", text: userText }, { role: "ai", text: aiText }]);
        speakResponse(aiText);
      } else {
        setVoiceState("listening");
      }
    } catch (err: any) {
      if (err.name !== "AbortError") setVoiceState("listening");
    }
  }, [history, speakResponse]);

  const startListening = useCallback(() => {
    if (!isActiveRef.current) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      if (!isActiveRef.current) return;
      setVoiceState("listening");
    };

    recognition.onspeechstart = () => {
      interruptFinn();
    };

    recognition.onresult = (event: any) => {
      if (!isActiveRef.current) return;
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;
      setTranscript(text);

      if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
      if (result.isFinal) {
        silenceTimerRef.current = setTimeout(() => {
          sendToAI(text);
        }, 1200);
      }
    };

    recognition.onerror = () => {
      if (isActiveRef.current) setVoiceState("idle");
    };

    recognition.start();
  }, [sendToAI, interruptFinn]);

  const stopEverything = () => {
    recognitionRef.current?.stop();
    window.speechSynthesis.cancel();
    abortControllerRef.current?.abort();
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-[#1a1025] overflow-hidden">
      <div className="absolute top-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 z-20">
        <span className="text-[#cbbcf6]/60 text-[10px] uppercase tracking-[0.2em] font-medium">Finn Live Loop</span>
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full", voiceState === "listening" ? "bg-[#a64fca] shadow-[0_0_10px_#a64fca]" : voiceState === "speaking" ? "bg-green-400 shadow-[0_0_10px_#4ade80]" : "bg-blue-400")} />
          <span className="text-white text-xs font-semibold">{voiceState.toUpperCase()}</span>
        </div>
      </div>

      <button onClick={onClose} className="absolute top-8 right-8 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all z-20">
        <X className="w-5 h-5" />
      </button>

      <div className="relative flex flex-col items-center gap-12 text-center px-6">
        <div className="relative w-64 h-64 flex items-center justify-center">
          <motion.div animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 4, repeat: Infinity }}
            className={cn("absolute inset-0 rounded-full blur-[80px]", voiceState === "listening" ? "bg-[#a64fca]" : voiceState === "speaking" ? "bg-green-400" : "bg-blue-400")} />
          
          <motion.div animate={voiceState === "speaking" ? { scale: [1, 1.08, 1], y: [0, -4, 0] } : { scale: [1, 1.02, 1] }} transition={{ duration: 0.4, repeat: Infinity }}
            className={cn("relative w-48 h-48 rounded-full shadow-2xl flex items-center justify-center border border-white/10", voiceState === "listening" ? "bg-[#6c5ce7]" : voiceState === "speaking" ? "bg-green-500" : "bg-blue-600")}>
            
            {voiceState === "listening" && <div className="flex gap-1 items-end h-8">{[...Array(5)].map((_, i) => <motion.div key={i} animate={{ height: [4, 20, 4] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }} className="w-1.5 bg-white/60 rounded-full" />)}</div>}
            {voiceState === "speaking" && <Volume2 className="w-10 h-10 text-white animate-pulse" />}
            {voiceState === "thinking" && <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />}
          </motion.div>
        </div>

        <div className="space-y-4 max-w-sm">
          <AnimatePresence mode="wait">
            {transcript && <motion.p key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[#cbbcf6]/60 text-lg font-light italic">"{transcript}"</motion.p>}
            {finnSays && <motion.p key="f" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-white text-xl font-medium">{finnSays}</motion.p>}
          </AnimatePresence>
        </div>
      </div>

      <div className="absolute bottom-16 flex flex-col items-center gap-4">
        <p className="text-white/20 text-[11px] tracking-widest uppercase">Speak naturally. He is listening.</p>
        <div className="w-1 h-12 bg-gradient-to-b from-white/20 to-transparent rounded-full" />
      </div>
    </motion.div>
  );
}

// ─── Main Chat Page ───────────────────────────────────────────────────────────
export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [inputVal, setInputVal] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showLive, setShowLive] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({ minHeight: 52, maxHeight: 200 });

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const handleSend = async (text: string = inputVal) => {
    if (!text.trim() || isSending) return;
    const userMsg = { role: "user" as const, text };
    setMessages((prev) => [...prev, userMsg]);
    setInputVal("");
    adjustHeight(true);
    setIsTyping(true);
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages }),
      });
      const data = await response.json();
      if (data.response) setMessages((prev) => [...prev, { role: "ai", text: data.response }]);
    } catch {
      setMessages((prev) => [...prev, { role: "ai", text: "Finn had a moment. Please try again." }]);
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  const toggleListening = () => {
    if (isSending) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const text = event.results[0][0].transcript;
      if (event.results[0].isFinal) handleSend(text);
      else setInputVal(text);
    };
    recognition.start();
  };

  return (
    <>
      <div className="flex flex-col h-screen bg-[#efebf0] text-gray-900 font-sans">
        <header className="flex items-center justify-between px-6 py-5 bg-white/60 backdrop-blur-xl border-b border-white/20 sticky top-0 z-10">
          <Link href="/" className="p-2 rounded-xl hover:bg-white/40 transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-800" />
          </Link>
          <span className="text-base font-semibold text-gray-900 tracking-tight">Mindcore AI</span>
          <motion.button onClick={() => setShowLive(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-black text-white text-[13px] font-bold shadow-xl">
            <Zap className="w-4 h-4 fill-white" strokeWidth={0} />
            <span>LIVE Voice</span>
          </motion.button>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-4 scroll-smooth" ref={scrollRef}>
          <div className="flex flex-col items-center justify-center pt-10 text-center pb-12">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} 
              className="relative w-32 h-32 mb-5">
               <img 
                 src="/mascot.png" 
                 alt="Finn Mascot" 
                 className="w-full h-full object-contain relative z-10" 
               />
               <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }} transition={{ duration: 3, repeat: Infinity }} 
                 className="absolute inset-0 rounded-full bg-[#6c5ce7] blur-2xl" />
            </motion.div>
            <h2 className="text-2xl font-bold text-gray-900">Finn is here to help</h2>
            <p className="text-gray-500 text-[15px] font-light max-w-xs mx-auto mt-1 leading-relaxed">
              Find clarity and peace with our calming AI conversation.
            </p>
          </div>

          <div className="space-y-6 max-w-2xl mx-auto">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={cn("max-w-[85%] p-5 rounded-[2rem] text-[15px] shadow-sm leading-relaxed",
                    msg.role === "user" ? "bg-[#6c5ce7] text-white ml-auto rounded-tr-none shadow-[#6c5ce7]/10" : "bg-white text-gray-800 mr-auto rounded-tl-none border border-black/5 shadow-black/5")}>
                  {msg.text}
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && <div className="text-[11px] text-[#6c5ce7] font-semibold uppercase tracking-widest px-4">Finn is reflecting...</div>}
          </div>
        </main>

        <footer className="p-6 bg-gradient-to-t from-[#efebf0] to-transparent sticky bottom-0">
          <div className="max-w-2xl w-full mx-auto">
            <div className={cn("relative flex flex-col rounded-[2rem] transition-all duration-500 bg-white/80 backdrop-blur-2xl shadow-2xl ring-1 ring-black/5", isFocused && "ring-[#6c5ce7]/30 shadow-[#6c5ce7]/5")}>
              <Textarea
                ref={textareaRef}
                value={inputVal}
                placeholder="What's happening?"
                className="w-full rounded-[2rem] border-none px-7 py-6 bg-transparent text-gray-900 placeholder:text-gray-400 focus-visible:ring-0 text-base leading-relaxed min-h-[64px]"
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onChange={(e) => { setInputVal(e.target.value); adjustHeight(); }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              />
              <div className="h-16 bg-gray-50/20 rounded-b-[2rem] flex items-center justify-between px-5 border-t border-black/[0.03]">
                <div className="flex gap-2.5">
                   <button onClick={toggleListening} className={cn("p-3 rounded-2xl transition-all shadow-sm", isListening ? "bg-red-500 text-white" : "bg-white border border-black/5 text-gray-400 hover:text-[#6c5ce7]")}>
                    {isListening ? <MicOff className="w-5 h-5" strokeWidth={2.5} /> : <Mic className="w-5 h-5" strokeWidth={2} />}
                  </button>
                  <div className="flex items-center gap-2 px-4 py-1.5 rounded-2xl bg-[#cbbcf6]/20 border border-[#cbbcf6]/30 text-[#6c5ce7] text-[10px] font-bold uppercase tracking-[0.1em]">
                    <Zap className="w-3.5 h-3.5 fill-[#6c5ce7]" />
                    <span>Live Context</span>
                  </div>
                </div>
                <button onClick={() => handleSend()} disabled={!inputVal.trim()} className={cn("p-3.5 rounded-2xl transition-all shadow-md", inputVal.trim() ? "bg-[#6c5ce7] shadow-[#6c5ce7]/20 text-white" : "bg-gray-100 text-gray-300")}>
                  <Send className="w-5 h-5" strokeWidth={2.5} />
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <AnimatePresence>{showLive && <VoiceOverlay onClose={() => setShowLive(false)} />}</AnimatePresence>
    </>
  );
}
