import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
} from "recharts";

export default function AboutTab() {
  const [totalQueries, setTotalQueries] = useState(0);
  const [annualDcShare, setAnnualDcShare] = useState(0);
  const [avgQueryCO2, setAvgQueryCO2] = useState(0);

  const perQueryData = [
    { name: "Google median", value: 0.03 },
    { name: "Conservative est.", value: 2.0 },
    { name: "Common estimate", value: 3.5 },
  ];

  const datacenterTrend = [
    { year: 2020, value: 1.0 },
    { year: 2022, value: 1.2 },
    { year: 2024, value: 1.8 },
    { year: 2026, value: 2.0 },
    { year: 2028, value: 2.5 },
    { year: 2030, value: 3.0 },
  ];

  const trainingVsInference = [
    { phase: "Training (example)", value: 300000 },
    { phase: "Inference (annualized)", value: 120000 },
  ];

  useEffect(() => {
    let tq = 0;
    let aq = 0;
    let av = 0;
    const targetTQ = 1250000;
    const targetShare = 1.8;
    const targetCO2 = 0.8;

    const int = setInterval(() => {
      tq += Math.ceil(targetTQ / 60);
      aq = Math.min(aq + 0.03, targetShare);
      av = Math.min(av + 0.02, targetCO2);
      setTotalQueries(Math.min(tq, targetTQ));
      setAnnualDcShare(Number(aq.toFixed(2)));
      setAvgQueryCO2(Number(av.toFixed(2)));
      if (tq >= targetTQ && aq >= targetShare && av >= targetCO2) {
        clearInterval(int);
      }
    }, 40);

    return () => clearInterval(int);
  }, []);

  return (
    <div className="flex flex-col items-center justify-start w-full max-w-5xl mx-auto p-6 space-y-6">
      <motion.div
        className="card w-full text-left"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-bold text-green-700 mb-2">
          About Type-less — why it matters
        </h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.15 }}
          className="text-gray-700 leading-relaxed"
        >
          Type-less helps users shorten and clarify prompts for large AI models,
          reducing energy per request and the cumulative carbon impact. Below
          are representative figures and visualizations showing the
          environmental footprint of modern generative AI — numbers are pulled
          from recent reports and sources listed below.
        </motion.p>
      </motion.div>

      {/* Metrics cards */}
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          className="card p-6 text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-sm text-gray-500">Demo total queries</div>
          <div className="text-2xl font-extrabold mt-2">
            {totalQueries.toLocaleString()}
          </div>
          <div className="text-xs text-gray-500 mt-1">since launch (demo)</div>
        </motion.div>

        <motion.div
          className="card p-6 text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
        >
          <div className="text-sm text-gray-500">Avg CO₂ per query</div>
          <div className="text-2xl font-extrabold mt-2">
            {avgQueryCO2} gCO₂
          </div>
          <div className="text-xs text-gray-500 mt-1">illustrative average</div>
        </motion.div>

        <motion.div
          className="card p-6 text-center"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <div className="text-sm text-gray-500">
            Data-centre electricity share
          </div>
          <div className="text-2xl font-extrabold mt-2">{annualDcShare}%</div>
          <div className="text-xs text-gray-500 mt-1">
            of global electricity (example)
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card p-4 h-72">
          <h3 className="text-lg font-semibold mb-2">
            Per-query emissions (gCO₂)
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            Each AI query has a carbon footprint. Different studies give
            different numbers, shown side by side here.
          </p>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart
              data={perQueryData}
              margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis unit=" gCO₂" />
              <Tooltip formatter={(value) => `${value} gCO₂`} />
              <Bar dataKey="value" fill="#10B981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4 h-72">
          <h3 className="text-lg font-semibold mb-2">
            Data-centre share (trend)
          </h3>
          <p className="text-xs text-gray-500 mb-3">
            Datacentres already use ~2% of global electricity. AI growth may
            increase this over the next decade.
          </p>
          <ResponsiveContainer width="100%" height="85%">
            <LineChart
              data={datacenterTrend}
              margin={{ top: 10, right: 20, left: 0, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis unit="%" />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card w-full p-4">
        <h3 className="text-lg font-semibold mb-2">
          Training vs. inference (illustrative)
        </h3>
        <p className="text-xs text-gray-500 mb-3">
          Training a large AI model is extremely carbon-intensive. But inference
          (everyday usage) adds up too, often surpassing training over time.
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart
            data={trainingVsInference}
            margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="phase" />
            <YAxis />
            <Tooltip
              formatter={(value) => `${value.toLocaleString()} kgCO₂-e`}
            />
            <Bar dataKey="value" fill="#F97316" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sources */}
      <div className="card w-full p-4">
        <h4 className="text-md font-semibold mb-2">Data & sources</h4>
        <ul className="text-sm text-gray-600 list-disc pl-5 space-y-1">
          <li>
            <a
              href="https://cloud.google.com/blog/products/infrastructure/measuring-the-environmental-impact-of-ai-inference"
              className="underline text-blue-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              Google Cloud: measuring per-query emissions
            </a>
          </li>
          <li>
            <a
              href="https://smartly.ai/blog/the-carbon-footprint-of-chatgpt-how-much-co2-does-a-query-generate"
              className="underline text-blue-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              Independent estimates: ~2–4 gCO₂ per query
            </a>
          </li>
          <li>
            <a
              href="https://www.carbonbrief.org/ai-five-charts-that-put-data-centre-energy-use-and-emissions-into-context"
              className="underline text-blue-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              CarbonBrief & IEA: data-centre energy use trends
            </a>
          </li>
          <li>
            <a
              href="https://arxiv.org/html/2507.11417v1"
              className="underline text-blue-600"
              target="_blank"
              rel="noopener noreferrer"
            >
              Recent research on AI training vs inference emissions
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}
