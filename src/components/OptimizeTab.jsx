import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";

const taglines = [
  "✂️ Prompt Shortener — keep it concise.",
  "🌍 Carbon-Friendly Mode — save energy.",
  "✨ Clarity Improver — say it better.",
  "⚡ Efficiency Booster — faster prompts.",
];

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

// simple token estimator: 1 token ≈ 4 characters
function estimateTokens(text) {
  if (!text) return 0;
  const trimmed = text.replace(/\s+/g, " ").trim();
  if (trimmed.length === 0) return 0;
  return Math.max(1, Math.ceil(trimmed.length / 4));
}

// token -> kWh: 0.0003 kWh per 1000 tokens => 3e-7 kWh/token
const KWH_PER_TOKEN = 0.0003 / 1000;
const GRID_KGCO2_PER_KWH =
  parseFloat(process.env.REACT_APP_GRID_KGCO2_PER_KWH) || 0.45;

export default function OptimizeTab() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  const [tokensBefore, setTokensBefore] = useState(0);
  const [tokensAfter, setTokensAfter] = useState(0);
  const [co2SavedKg, setCo2SavedKg] = useState(0);
  const [triggerCount, setTriggerCount] = useState(false);

  const messagesRef = useRef(null);

  useEffect(() => {
    const iv = setInterval(() => {
      setTaglineIndex((t) => (t + 1) % taglines.length);
    }, 3000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // format CO2 dynamically
  function formatCO2(kg) {
    if (kg >= 1) return `${kg.toFixed(6)} kg`;
    const g = kg * 1000;
    if (g >= 1) return `${g.toFixed(3)} g`;
    return `${(g * 1000).toFixed(2)} mg`;
  }

  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages((prev) => [...prev, { text: input, sender: "user" }]);

    const tb = estimateTokens(input);
    setTokensBefore(tb);

    setInput("");
    setIsTyping(true);

    setTimeout(async () => {
      let optimized = input
        .replace(/\b(the|and|a|an|that|please|kindly|just)\b/gi, "")
        .replace(/\s+/g, " ")
        .trim();

      const originalLen = optimized.length;
      const targetLen = Math.max(10, Math.floor(originalLen * 0.75));
      if (optimized.length > targetLen)
        optimized = optimized.slice(0, targetLen).trim();

      const ta = estimateTokens(optimized);
      const tokensSaved = Math.max(0, tb - ta);

      // ✅ If nothing was saved, just say it's already optimal
      if (tb === ta) {
        setMessages((prev) => [
          ...prev,
          { text: "✅ Your prompt is already optimal!", sender: "bot" },
        ]);
        setIsTyping(false);
        return;
      }

      const kwhSaved = tokensSaved * KWH_PER_TOKEN;
      const co2Kg = kwhSaved * GRID_KGCO2_PER_KWH;

      setTokensAfter(ta);
      setCo2SavedKg(co2Kg);

      setTriggerCount(true);
      setTimeout(() => setTriggerCount(false), 1200);

      setMessages((prev) => [
        ...prev,
        { text: "🌍 Optimized Suggestion: " + optimized, sender: "bot" },
      ]);

      setIsTyping(false);

      try {
        await fetch(`${API_BASE}/api/optimize`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            prompt: input,
            optimized_prompt: optimized,
            tokens_before: tb,
            tokens_after: ta,
          }),
        });
        // notify stats tab immediately
        window.dispatchEvent(new CustomEvent("stats-updated"));
      } catch (err) {
        console.warn("failed to POST /api/optimize", err);
      }
    }, 1000 + Math.random() * 700);
  };

  return (
    <div className="flex flex-col h-[80vh] w-full max-w-4xl mx-auto">
      {/* Hero Bubble */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="card text-center mb-6 bg-green-50 border border-green-200"
      >
        <h2 className="text-2xl font-bold text-green-700 mb-2">
          🌍 Eco-Friendly Prompt Optimizer
        </h2>
        <AnimatePresence mode="wait">
          <motion.p
            key={taglineIndex}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="text-gray-600"
          >
            {taglines[taglineIndex]}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* Chat + Counters */}
      <motion.div className="flex flex-col flex-1 card overflow-hidden">
        <div ref={messagesRef} className="flex-1 space-y-3 overflow-y-auto p-4">
          {messages.length === 0 && !isTyping && (
            <p className="text-center text-gray-400 italic">
              Start typing to get eco-optimized suggestions 🌱
            </p>
          )}
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: msg.sender === "user" ? 40 : -40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className={`px-4 py-3 rounded-xl shadow max-w-sm ${
                msg.sender === "user"
                  ? "bg-green-500 text-white self-end ml-auto"
                  : "bg-gray-100 text-gray-800 self-start"
              }`}
            >
              {msg.text}
            </motion.div>
          ))}

          {isTyping && (
            <motion.div className="px-4 py-3 rounded-xl shadow bg-gray-200 text-gray-600 self-start inline-flex items-center gap-2">
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-150"></span>
              <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce delay-300"></span>
            </motion.div>
          )}
        </div>

        {(tokensBefore > 0 || tokensAfter > 0) && (
          <div className="grid grid-cols-3 gap-4 p-4 border-t bg-gray-50">
            <div className="bg-white p-3 rounded-lg shadow text-center">
              <p className="text-xl font-bold text-gray-800">
                {triggerCount ? (
                  <CountUp end={tokensBefore} duration={1} />
                ) : (
                  tokensBefore
                )}
              </p>
              <p className="text-sm text-gray-600">Tokens before</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow text-center">
              <p className="text-xl font-bold text-gray-800">
                {triggerCount ? (
                  <CountUp end={tokensAfter} duration={1} />
                ) : (
                  tokensAfter
                )}
              </p>
              <p className="text-sm text-gray-600">Tokens after</p>
            </div>
            <div className="bg-white p-3 rounded-lg shadow text-center">
              <p className="text-xl font-bold text-gray-800">
                {triggerCount ? (
                  <CountUp end={co2SavedKg} decimals={6} duration={1.4} />
                ) : (
                  formatCO2(co2SavedKg)
                )}
              </p>
              <p className="text-sm text-gray-600">CO₂ saved</p>
            </div>
          </div>
        )}

        <div className="flex gap-3 p-3 border-t bg-white/60 backdrop-blur-lg">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your prompt..."
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-400 outline-none shadow-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={handleSend}
            className="px-5 py-3 bg-green-500 text-white font-semibold rounded-xl shadow hover:bg-green-600"
          >
            Send
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
