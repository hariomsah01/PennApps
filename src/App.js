import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import OptimizeTab from "./components/OptimizeTab";
import StatsTab from "./components/StatsTab";
import AboutTab from "./components/AboutTab";
import "./index.css";

const tabs = [
  { key: "optimize", label: "Optimize" },
  { key: "stats", label: "Stats" },
  { key: "about", label: "About Us" },
];

function Navbar({ activeTab, setActiveTab }) {
  const { currentUser, logout } = useAuth();

  return (
    <motion.header
      className="navbar flex justify-between items-center px-6 py-4 bg-green-600 text-white shadow-md"
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
    >
      <h1 className="logo text-xl font-bold">🌍 Type-less</h1>

      <nav className="flex gap-4">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            className={`nav-btn px-4 py-2 rounded-lg transition ${
              activeTab === tab.key
                ? "bg-white text-green-600"
                : "bg-green-500 hover:bg-green-400"
            }`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="flex gap-3 items-center">
        {currentUser ? (
          <>
            <span className="text-sm">{currentUser.email}</span>
            <button
              onClick={logout}
              className="bg-white text-green-600 px-3 py-1 rounded hover:bg-gray-100"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              className="bg-white text-green-600 px-3 py-1 rounded hover:bg-gray-100"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="bg-white text-green-600 px-3 py-1 rounded hover:bg-gray-100"
            >
              Signup
            </Link>
          </>
        )}
      </div>
    </motion.header>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState("optimize");

  const renderTab = () => {
    switch (activeTab) {
      case "optimize":
        return <OptimizeTab />;
      case "stats":
        return <StatsTab />;
      case "about":
        return <AboutTab />;
      default:
        return <OptimizeTab />;
    }
  };

  return (
    <div className="app-container min-h-screen flex flex-col">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="tab-content flex-1 p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderTab()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
