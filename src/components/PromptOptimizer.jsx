import React, { useState } from 'react';
import { optimizePrompt, optimizeBatch } from '../utils/promptOptimizer';
import './PromptOptimizer.css';

const PromptOptimizer = () => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);

  const handleOptimize = async () => {
    if (!prompt.trim()) return;
    
    setIsOptimizing(true);
    setError(null);
    
    try {
      const optimizationResult = optimizePrompt(prompt);
      setResult(optimizationResult);
      setHistory(prev => [optimizationResult, ...prev.slice(0, 9)]); // Keep last 10
    } catch (err) {
      setError('Optimization failed. Please try again.');
      console.error('Optimization failed:', err);
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleCopy = () => {
    if (result?.optimized) {
      navigator.clipboard.writeText(result.optimized);
    }
  };

  return (
    <div className="prompt-optimizer">
      <div className="header">
        <h1>🚀 Prompt Optimizer</h1>
        <p>Optimize your prompts for better efficiency and clarity</p>
      </div>

      <div className="input-section">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Enter your prompt here... (e.g., 'Please kindly write a very detailed summary of the meeting')"
          rows={4}
          className="prompt-input"
        />
        
        <div className="controls">
          
          <button 
            onClick={handleOptimize}
            disabled={isOptimizing || !prompt.trim()}
            className="optimize-btn"
          >
            {isOptimizing ? 'Optimizing...' : '�� Optimize'}
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ❌ Error: {error}
        </div>
      )}

      {result && (
        <div className="results-section">
          <div className="optimization-result">
            <h3>📝 Optimization Result</h3>
            <div className="prompt-comparison">
              <div className="prompt-original">
                <h4>Original:</h4>
                <p>{result.original}</p>
                <span className="token-count">{result.tokensBefore} tokens</span>
              </div>
              <div className="prompt-optimized">
                <h4>Optimized:</h4>
                <p>{result.optimized}</p>
                <span className="token-count">{result.tokensAfter} tokens</span>
              </div>
            </div>
            
            <button onClick={handleCopy} className="copy-btn">
              📋 Copy Optimized
            </button>
          </div>

          <div className="metrics-grid">
            <div className="metric-card">
              <h4>🎯 Token Savings</h4>
              <div className="metric-value">{result.tokensSaved}</div>
              <div className="metric-detail">
                {result.tokensBefore} → {result.tokensAfter}
              </div>
            </div>

            <div className="metric-card">
              <h4>🌍 Carbon Savings</h4>
              <div className="metric-value">
                {result.carbonSavings.co2Saved.toFixed(6)}g CO₂
              </div>
              <div className="metric-detail">
                {result.carbonSavings.kwhSaved.toFixed(6)} kWh saved
              </div>
            </div>

            <div className="metric-card">
              <h4>✅ Quality Score</h4>
              <div className="metric-value">
                {(result.qualityScore * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {result.optimizations.length > 0 && (
            <div className="optimizations-applied">
              <h4>🔧 Optimizations Applied:</h4>
              <ul>
                {result.optimizations.map((opt, index) => (
                  <li key={index}>{opt}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {history.length > 0 && (
        <div className="history-section">
          <h3>📊 Recent Optimizations</h3>
          <div className="history-stats">
            <div className="stat">
              <strong>Total Optimizations:</strong> {history.length}
            </div>
            <div className="stat">
              <strong>Total Tokens Saved:</strong> {history.reduce((sum, h) => sum + h.tokensSaved, 0)}
            </div>
            <div className="stat">
              <strong>Total CO₂ Saved:</strong> {history.reduce((sum, h) => sum + h.carbonSavings.co2Saved, 0).toFixed(6)}g
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptOptimizer;