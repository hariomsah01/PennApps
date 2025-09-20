import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:4000";

export default function StatsTab() {
  const [stats, setStats] = useState({
    users: 0,
    co2_saved_kg: 0,
    prompts_optimized: 0,
    energy_saved_kwh: 0,
    impact_score: 0,
    tokens_saved: 0,
    miles_saved: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const res = await fetch(`${API_BASE}/api/stats`, { credentials: "include" });
        if (!res.ok) throw new Error("Failed to load stats");
        const data = await res.json();
        if (mounted) setStats(data);
      } catch (err) {
        console.warn("stats fetch err", err);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    const iv = setInterval(load, 10000);
    return () => { mounted = false; clearInterval(iv); };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center p-6">
      <motion.h2
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-2xl font-bold text-green-700 mb-6"
      >
        🌱 Global Impact
      </motion.h2>

      {/* Highlight Row */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div className="card p-6 text-center bg-green-50 border border-green-200">
          <div className="text-sm text-gray-500">CO₂ saved</div>
          <div className="text-2xl font-extrabold mt-2">
            {stats.co2_saved_kg >= 1
              ? `${stats.co2_saved_kg.toFixed(6)} kg`
              : `${(stats.co2_saved_kg * 1000).toFixed(3)} g`}
          </div>
          <div className="text-xs text-gray-500 mt-1">Avoided emissions</div>
        </motion.div>

        <motion.div className="card p-6 text-center bg-green-50 border border-green-200">
          <div className="text-sm text-gray-500">Tokens saved</div>
          <div className="text-2xl font-extrabold mt-2">
            {stats.tokens_saved.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">Efficiency gains</div>
        </motion.div>

        <motion.div className="card p-6 text-center bg-green-50 border border-green-200">
          <div className="text-sm text-gray-500">Miles saved</div>
          <div className="text-2xl font-extrabold mt-2">
            {stats.miles_saved.toFixed(3)}
          </div>
          <div className="text-xs text-gray-500 mt-1">Car travel equivalent</div>
        </motion.div>
      </div>

      {/* Secondary Stats */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div className="card p-6 text-center">
          <div className="text-sm text-gray-500">Users</div>
          <div className="text-2xl font-extrabold mt-2">{stats.users.toLocaleString()}</div>
          <div className="text-xs text-gray-500 mt-1">Registered users</div>
        </motion.div>

        <motion.div className="card p-6 text-center">
          <div className="text-sm text-gray-500">Prompts optimized</div>
          <div className="text-2xl font-extrabold mt-2">
            {stats.prompts_optimized.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">Total optimizations recorded</div>
        </motion.div>

        <motion.div className="card p-6 text-center">
          <div className="text-sm text-gray-500">Energy saved</div>
          <div className="text-2xl font-extrabold mt-2">
            {stats.energy_saved_kwh.toFixed(6)} kWh
          </div>
          <div className="text-xs text-gray-500 mt-1">Electricity reduced</div>
        </motion.div>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-1 gap-4 mt-4">
        <motion.div className="card p-6 text-center">
          <div className="text-sm text-gray-500">Impact score</div>
          <div className="text-2xl font-extrabold mt-2">
            {Number(stats.impact_score).toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-gray-500 mt-1">Composite metric</div>
        </motion.div>
      </div>

      {loading && <div className="text-sm text-gray-500 mt-4">Loading stats...</div>}
    </div>
  );
}
