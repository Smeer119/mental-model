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

// ─── Voice Overlay (Fast Gemini Live Style) ──────────────────────────────────
type VoiceState = "idle" | "listening" | "thinking" | "speaking";

function VoiceOverlay({ onClose }: { onClose: () => void }) {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [transcript, setTranscript] = useState("");
  const [finnSays, setFinnSays] = useState("");
  const [statusText, setStatusText] = useState("Tap mic to start");
  const [history, setHistory] = useState<{ role: string; text: string }[]>([]);

  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isActiveRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // High-speed sentence streaming
  const speechQueueRef = useRef<string[]>([]);
  const isSpeakingRef = useRef(false);

  useEffect(() => {
    isActiveRef.current = true;
    return () => {
      isActiveRef.current = false;
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
      abortControllerRef.current?.abort();
    };
  }, []);

  const processSpeechQueue = useCallback(() => {
    if (!isActiveRef.current || isSpeakingRef.current || speechQueueRef.current.length === 0) return;

    const sentence = speechQueueRef.current.shift();
    if (!sentence) return;

    isSpeakingRef.current = true;
    const utter = new SpeechSynthesisUtterance(sentence);
    synthRef.current = utter;

    const voices = window.speechSynthesis.getVoices();
    const preferred = voices.find(v => v.name.includes("Google") || v.name.includes("Samantha")) ?? voices[0];
    if (preferred) utter.voice = preferred;
    utter.rate = 1.0;
    utter.pitch = 1.0;

    utter.onstart = () => {
      setVoiceState("speaking");
      setStatusText("Finn is speaking...");
    };

    utter.onend = () => {
      isSpeakingRef.current = false;
      if (speechQueueRef.current.length > 0) {
        processSpeechQueue();
      } else if (voiceState !== "thinking") {
        // Only return to listening if we aren't still receiving tokens
        setFinnSays("");
        startListening();
      }
    };

    utter.onerror = () => {
      isSpeakingRef.current = false;
      processSpeechQueue();
    };

    window.speechSynthesis.speak(utter);
  }, [voiceState]);

  const sendToAI = useCallback(async (userText: string) => {
    if (!isActiveRef.current || !userText.trim()) return;

    setVoiceState("thinking");
    setStatusText("Finn is thinking...");
    setTranscript("");
    setFinnSays("");
    speechQueueRef.current = [];
    isSpeakingRef.current = false;

    abortControllerRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userText, history }),
        signal: abortControllerRef.current.signal,
      });

      if (!res.ok || !res.body) throw new Error("Stream failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulatedSentence = "";
      let fullResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const dataStr = line.slice(6).trim();
            if (dataStr === "[DONE]") break;
            
            try {
              const { token } = JSON.parse(dataStr);
              if (token) {
                fullResponse += token;
                accumulatedSentence += token;
                setFinnSays(prev => prev + token);

                // Detect sentence endings for fast TTS
                if (/[.!?]\s*$/.test(accumulatedSentence) && accumulatedSentence.trim().length > 10) {
                  speechQueueRef.current.push(accumulatedSentence.trim());
                  accumulatedSentence = "";
                  if (!isSpeakingRef.current) processSpeechQueue();
                }
              }
            } catch {}
          }
        }
      }

      // Add any remaining text
      if (accumulatedSentence.trim()) {
        speechQueueRef.current.push(accumulatedSentence.trim());
        if (!isSpeakingRef.current) processSpeechQueue();
      }

      setHistory(prev => [...prev, { role: "user", text: userText }, { role: "ai", text: fullResponse }]);
      
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setStatusText("Finn had a hiccup. Tap mic to retry.");
        setVoiceState("idle");
      }
    }
  }, [history, processSpeechQueue]);

  const startListening = useCallback(() => {
    if (!isActiveRef.current) return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    window.speechSynthesis.cancel();
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = window.navigator.language || "en-US";
    recognition.interimResults = true;

    recognition.onstart = () => {
      setVoiceState("listening");
      setStatusText("Listening...");
    };

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1];
      const text = result[0].transcript;
      setTranscript(text);
      if (result.isFinal) {
        recognition.stop();
        sendToAI(text);
      }
    };

    recognition.onerror = () => {
      setVoiceState("idle");
      setStatusText("Tap mic to speak");
    };

    recognition.start();
  }, [sendToAI]);

  const stopEverything = () => {
    recognitionRef.current?.stop();
    window.speechSynthesis.cancel();
    abortControllerRef.current?.abort();
    setVoiceState("idle");
    setStatusText("Tap mic to start");
    setTranscript("");
    setFinnSays("");
    speechQueueRef.current = [];
    isSpeakingRef.current = false;
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[#0a0a10]" />
      <button onClick={handleClose} className="absolute top-6 left-6 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-all z-10">
        <X className="w-5 h-5" />
      </button>
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1">
        <span className="text-white/90 font-semibold text-sm tracking-wide">Finn · Live Voice</span>
        <div className="flex items-center gap-1.5">
          <motion.div animate={{ backgroundColor: voiceState === "speaking" ? "#00c896" : voiceState === "listening" ? "#a64fca" : voiceState === "thinking" ? "#5a9fd4" : "#555" }} className="w-1.5 h-1.5 rounded-full" />
          <span className="text-white/40 text-[10px] uppercase tracking-widest">{statusText}</span>
        </div>
      </div>

      <div className="relative flex flex-col items-center justify-center gap-8 z-10 px-8 w-full max-w-sm">
        {/* Orb */}
        <div className="relative w-52 h-52 flex items-center justify-center">
          {[0, 1, 2].map((i) => (
            <motion.div key={i} animate={voiceState !== "idle" ? { scale: [1, 1.25 + i * 0.12, 1], opacity: [0.08, 0.22, 0.08] } : { scale: 1, opacity: 0.04 }} transition={{ duration: 2.2, repeat: Infinity, delay: i * 0.4 }} className={cn("absolute inset-0 rounded-full blur-2xl", voiceState === "speaking" ? "bg-[#00c896]" : voiceState === "listening" ? "bg-[#a64fca]" : "bg-[#5a9fd4]")} />
          ))}

          <motion.div animate={voiceState === "speaking" ? { scale: [1, 1.06, 0.97, 1.04, 1], y: [0, -6, 2, -4, 0] } : voiceState === "listening" ? { scale: [1, 1.04, 1] } : { scale: [1, 1.02, 1] }} transition={{ duration: voiceState === "speaking" ? 0.5 : 3, repeat: Infinity }} className={cn("relative w-44 h-44 rounded-full bg-gradient-to-br shadow-2xl flex items-center justify-center overflow-hidden border border-white/10", voiceState === "speaking" ? "from-[#00c896] via-[#00b087] to-[#009978]" : voiceState === "listening" ? "from-[#a64fca] via-[#7c5ce7] to-[#6c5ce7]" : "from-[#3a3a4a] via-[#2a2a3a] to-[#1a1a2a]")}>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/5" />
            {voiceState === "speaking" && (
              <div className="flex items-end justify-center gap-1 h-10">
                {[...Array(7)].map((_, i) => (
                  <motion.div key={i} animate={{ height: [6, 20 + Math.random() * 16, 6] }} transition={{ duration: 0.3, repeat: Infinity, delay: i * 0.06 }} className="w-1.5 rounded-full bg-white/80" />
                ))}
              </div>
            )}
            {(voiceState === "idle" || voiceState === "listening" || voiceState === "thinking") && (
              <motion.div animate={{ scale: voiceState === "thinking" ? [1, 1.2, 1] : 1, opacity: voiceState === "thinking" ? [0.5, 1, 0.5] : 1 }} transition={{ duration: 1, repeat: Infinity }} className="w-5 h-5 rounded-full bg-white" />
            )}
          </motion.div>
        </div>

        <div className="min-h-[60px] text-center px-4">
          <AnimatePresence mode="wait">
            {transcript && voiceState === "listening" && <motion.p key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/70 text-sm italic">"{transcript}"</motion.p>}
            {finnSays && (voiceState === "speaking" || voiceState === "thinking") && <motion.p key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/90 text-sm">{finnSays}</motion.p>}
          </AnimatePresence>
        </div>

        <div className="flex items-center gap-6">
          <button onClick={() => { stopEverything(); startListening(); }} className={cn("w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-2xl", voiceState === "listening" ? "bg-[#a64fca]" : voiceState === "speaking" ? "bg-[#00c896]" : "bg-white/15")}>
            {voiceState === "speaking" ? <Volume2 className="w-7 h-7 text-white" /> : <Mic className="w-7 h-7 text-white" />}
          </button>
        </div>
      </div>
    </motion.div>
  );

  function handleClose() {
    stopEverything();
    onClose();
  }
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
      setMessages((prev) => [...prev, { role: "ai", text: "Finn had a momentary lapse. Try again?" }]);
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
      <div className="flex flex-col h-screen bg-gradient-to-b from-[#efebf0] to-[#f8f7f9] text-gray-900 font-sans">
        <header className="flex items-center justify-between px-6 py-4 bg-white/40 backdrop-blur-xl sticky top-0 z-10 border-b border-white/20 shadow-sm">
          <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-white/60 transition-colors">
            <ChevronLeft className="w-6 h-6 text-gray-700" />
          </Link>
          <h1 className="text-sm font-semibold text-gray-800">Mindcore AI</h1>
          <motion.button onClick={() => setShowLive(true)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#a64fca] to-[#6c5ce7] text-white text-[11px] font-bold shadow-md shadow-[#6c5ce7]/30">
            <Zap className="w-3.5 h-3.5" />
            <span>Live</span>
          </motion.button>
        </header>

        <main className="flex-1 overflow-y-auto px-6 py-4 scroll-smooth" ref={scrollRef}>
          <div className="flex flex-col items-center justify-center pt-8 text-center">
            <div className="relative w-32 h-32 mb-4">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#cbbcf6] to-[#fbc2eb] blur-2xl opacity-30" />
              <div className="relative w-full h-full rounded-full bg-white flex items-center justify-center border border-white/40 shadow-xl">
                <div className="w-3 h-3 rounded-full bg-[#6c5ce7] animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-semibold text-gray-800">Mindcore AI</h2>
            <p className="text-gray-500 font-light text-sm">Empathetic support for your journey.</p>
          </div>

          <div className="space-y-6 pb-20 mt-8">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={cn("max-w-[85%] p-4 rounded-3xl text-[15px] shadow-sm",
                    msg.role === "user" ? "bg-[#6c5ce7] text-white ml-auto rounded-tr-sm" : "bg-white text-gray-800 mr-auto rounded-tl-sm")}>
                  {msg.text}
                </motion.div>
              ))}
            </AnimatePresence>
            {isTyping && <div className="text-xs text-gray-400 italic">Finn is thinking...</div>}
          </div>
        </main>

        {/* ─── Upgraded Input Search Bar from KokonutUI ────────────────────────── */}
        <footer className="p-4 bg-transparent">
          <div className="max-w-xl w-full mx-auto">
            <div className={cn(
              "relative flex flex-col rounded-2xl transition-all duration-200 w-full text-left bg-white shadow-xl shadow-black/5 ring-1 ring-black/5",
              isFocused && "ring-black/10"
            )}>
              <div className="overflow-y-auto max-h-[200px]">
                <Textarea
                  ref={textareaRef}
                  value={inputVal}
                  placeholder="Share what's on your mind..."
                  className="w-full rounded-2xl rounded-b-none px-5 py-4 bg-transparent border-none text-gray-800 placeholder:text-gray-400 resize-none focus-visible:ring-0 leading-[1.4]"
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  onChange={(e) => { setInputVal(e.target.value); adjustHeight(); }}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                />
              </div>

              <div className="h-14 bg-gray-50/50 rounded-b-2xl flex items-center justify-between px-3 border-t border-black/[0.03]">
                <div className="flex items-center gap-2">
                  {/* Voice Mic Button */}
                  <button onClick={toggleListening} className={cn("p-2.5 rounded-xl transition-all", isListening ? "bg-red-500 text-white" : "bg-black/5 text-gray-400 hover:text-[#6c5ce7]")}>
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </button>
                  
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-500 text-xs font-medium">
                    <Globe className="w-3.5 h-3.5" />
                    <span>Mindcore Context</span>
                  </button>
                </div>
                
                <button onClick={() => handleSend()} disabled={!inputVal.trim() || isSending}
                  className={cn("p-3 rounded-xl transition-all shadow-lg", inputVal.trim() ? "bg-[#6c5ce7] text-white shadow-[#6c5ce7]/20" : "bg-black/5 text-gray-300")}>
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        {showLive && <VoiceOverlay onClose={() => setShowLive(false)} />}
      </AnimatePresence>
    </>
  );
}
