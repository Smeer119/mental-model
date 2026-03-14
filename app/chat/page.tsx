"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronLeft, Send, Mic, MicOff } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function ChatPage() {
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState("Puck");
  const scrollRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const voices = ["Puck", "Charon", "Kore", "Fenrir", "Aoede"];

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (text: string = input) => {
    if (!text.trim() || isSending) return;

    const userMsg = { role: "user" as const, text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);
    setIsSending(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: text, 
          history: messages,
        }),
      });

      // Always parse the JSON - our API returns error details even on error status
      const data = await response.json();

      if (!response.ok || !data.response) {
        setMessages((prev) => [...prev, { role: "ai", text: data.response || "Something went wrong. Please try again." }]);
        return;
      }

      setMessages((prev) => [...prev, { role: "ai", text: data.response }]);

    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => [...prev, { role: "ai", text: "I'm having trouble connecting. Please check the server logs." }]);
    } finally {
      setIsTyping(false);
      setIsSending(false);
    }
  };

  const playAudio = (base64Data: string) => {
    const audioSrc = `data:audio/wav;base64,${base64Data}`;
    if (audioRef.current) {
      audioRef.current.pause();
    }
    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    audio.play().catch(e => console.error("Error playing audio:", e));
  };

  const cycleVoice = () => {
    const currentIndex = voices.indexOf(selectedVoice);
    const nextIndex = (currentIndex + 1) % voices.length;
    setSelectedVoice(voices[nextIndex]);
  };

  const toggleListening = () => {
    if (isSending) return; // Don't allow mic while sending
    if (!isListening) {
      startListening();
    } else {
      stopListening();
    }
  };

  const startListening = () => {
    if (typeof window !== "undefined" && ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      const lang = window.navigator.language || "en-US";
      recognition.lang = lang;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        if (event.results[event.results.length - 1].isFinal) {
          handleSend(transcript);
        } else {
          setInput(transcript);
        }
      };
      recognition.start();
    } else {
      alert("Speech recognition is not supported in this browser.");
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-[#efebf0] to-[#f8f7f9] text-gray-900 font-sans">
      {/* Background Decorative Blobs */}
      <div className="absolute top-[10%] left-[-10%] w-64 h-64 bg-[#cbbcf6]/20 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[20%] right-[-10%] w-80 h-80 bg-[#fbc2eb]/20 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/40 backdrop-blur-xl sticky top-0 z-10 border-b border-white/20 shadow-sm">
        <Link href="/" className="p-2 -ml-2 rounded-full hover:bg-white/60 transition-colors">
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </Link>
        <div className="flex flex-col items-center">
          <h1 className="text-sm font-semibold text-gray-800">Mindcore AI</h1>
          <div className="flex items-center space-x-1">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Online</span>
          </div>
        </div>
        <button 
          onClick={cycleVoice}
          className="px-3 py-1.5 rounded-xl bg-[#cbbcf6]/30 border border-[#cbbcf6]/50 text-[10px] font-bold text-[#6c5ce7] hover:bg-[#cbbcf6]/50 transition-all flex items-center space-x-1"
        >
          <span>Voice:</span>
          <span className="bg-[#6c5ce7] text-white px-1.5 py-0.5 rounded-md">{selectedVoice}</span>
        </button>
      </header>

      {/* Main Chat Area */}
      <main className="flex-1 overflow-y-auto px-6 py-4 space-y-8 scroll-smooth" ref={scrollRef}>
        <div className="flex flex-col items-center justify-center pt-8 space-y-6">
          {/* Animated Orb (Finn) */}
          <div className="relative w-40 h-40">
            {/* Outer Glows */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                animate={{
                  scale: (isTyping || isListening) ? [1, 1.2, 1] : [1, 1.1, 1],
                  opacity: (isTyping || isListening) ? [0.2, 0.4, 0.2] : [0.1, 0.2, 0.1],
                }}
                transition={{
                  duration: 3 + i,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#cbbcf6] via-[#e6e2ea] to-[#fbc2eb] blur-2xl"
              />
            ))}
            
            <motion.div
              animate={{
                scale: isTyping || isListening ? [1, 1.05, 1] : [1, 1.02, 1],
                y: [0, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="relative w-full h-full rounded-full bg-gradient-to-br from-[#cbbcf6] via-[#e2d9f3] to-[#fbc2eb] shadow-[0_20px_50px_rgba(203,188,246,0.3)] flex items-center justify-center overflow-hidden border border-white/40 group"
            >
              {/* Glass Reflection */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-white/10" />
              <div className="absolute top-[10%] left-[20%] w-[40%] h-[20%] bg-white/20 rounded-full blur-md" />
              
              {/* Finn's "Core" */}
              <motion.div 
                animate={{
                  boxShadow: isTyping || isListening 
                    ? ["0 0 20px rgba(255,255,255,0.8)", "0 0 40px rgba(255,255,255,1)", "0 0 20px rgba(255,255,255,0.8)"]
                    : ["0 0 10px rgba(255,255,255,0.4)", "0 0 20px rgba(255,255,255,0.6)", "0 0 10px rgba(255,255,255,0.4)"]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-4 h-4 rounded-full bg-white z-20"
              />

              {/* Visualizer Lines */}
              {(isListening || isTyping) && (
                <div className="absolute flex items-end justify-center space-x-1 bottom-10 inset-x-0">
                  {[...Array(8)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [4, Math.random() * 20 + 10, 4] }}
                      transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.05 }}
                      className="w-1 bg-white/60 rounded-full"
                    />
                  ))}
                </div>
              )}
            </motion.div>
          </div>

          <div className="text-center space-y-2">
            <motion.h2 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-2xl font-semibold text-gray-800 tracking-tight"
            >
              <span className="bg-gradient-to-r from-[#a64fca] to-[#6c5ce7] bg-clip-text text-transparent">Finn</span> is here to listen
            </motion.h2>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-gray-500 font-light"
            >
              How are you feeling right now?
            </motion.p>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-6 pb-20">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: msg.role === "user" ? 20 : -20, y: 10 }}
                animate={{ opacity: 1, x: 0, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={cn(
                  "max-w-[85%] p-4 rounded-3xl text-[15px] leading-relaxed shadow-sm",
                  msg.role === "user" 
                    ? "bg-[#6c5ce7] text-white ml-auto rounded-tr-sm" 
                    : "bg-white/80 backdrop-blur-md text-gray-800 mr-auto rounded-tl-sm border border-white/40"
                )}
              >
                {msg.text}
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white/60 backdrop-blur-md p-4 rounded-2xl mr-auto rounded-tl-none border border-white/40 w-16 flex justify-center shadow-sm"
            >
              <div className="flex space-x-1.5">
                {[0, 150, 300].map((delay) => (
                  <motion.div
                    key={delay}
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: delay / 1000 }}
                    className="w-1.5 h-1.5 bg-[#a64fca]/40 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Input Bar */}
      <footer className="p-6 bg-gradient-to-t from-[#f8f7f9] via-[#f8f7f9] to-transparent sticky bottom-0">
        <div className="relative flex items-center gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && !isSending && handleSend()}
              placeholder={isSending ? "Finn is thinking..." : "Tell me what's on your mind..."}
              disabled={isSending}
              className="w-full bg-white border border-gray-100/50 rounded-2xl py-4 pl-5 pr-12 shadow-[0_8px_30px_rgb(0,0,0,0.04)] focus:outline-none focus:ring-2 focus:ring-[#cbbcf6]/50 transition-all text-gray-700 placeholder:text-gray-400 font-light"
            />
            <button
              onClick={toggleListening}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-xl transition-all",
                isListening ? "bg-red-500 text-white scale-110 shadow-lg shadow-red-200" : "text-gray-400 hover:text-[#6c5ce7]"
              )}
            >
              {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
            </button>
          </div>
          
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isSending}
            className="p-4 rounded-2xl bg-[#6c5ce7] text-white disabled:bg-gray-200 disabled:text-gray-400 shadow-lg shadow-[#6c5ce7]/20 transition-all hover:scale-105 active:scale-95 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </footer>
    </div>
  );
}
