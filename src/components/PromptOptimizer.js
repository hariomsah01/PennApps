import React, { useState } from 'react';
import { optimizePrompt, optimizeBatch } from '../utils/promptOptimizer.js';
import './PromptOptimizer.css';

const PromptOptimizer = () => {
  const [inputPrompt, setInputPrompt] = useState('');
  const [strategy, setStrategy] = useState('balanced');
  const [result, setResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleOptimize = async () => {
    if (!inputPrompt.trim()) return;
    
    setIsLoading(true);
    try {
      const optimizationResult = optimizePrompt(inputPrompt, strategy);
      setResult(optimizationResult);
    } catch (error) {
      console.error('Optimization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBatchOptimize = async () => {
    const prompts = inputPrompt.split('\n').filter(p => p.trim());
    if (prompts.length === 0) return;
    
    setIsLoading(true);
    try {
      const batchResults = optimizeBatch(prompts, strategy);
      setResult({ batchResults, isBatch: true });
    } catch (error) {
      console.error('Batch optimization error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const examplePrompts = [
    "Could you please provide me with a comprehensive summary of the economic impacts of climate change on developing countries?",
    "I was wondering if you could explain the process in detail and also provide some examples along with the key concepts.",
    "It is requested that you analyze the data thoroughly and provide a detailed explanation of the results."
  ];

  const loadExample = (example) => {
    setInputPrompt(example);
  };

  return (
    <div className="prompt-optimizer">
      <h2>Enhanced Rule-Based Prompt Optimizer</h2>
      
      <div className="strategy-selector">
        <label htmlFor="strategy">Optimization Strategy:</label>
        <select 
          id="strategy" 
          value={strategy} 
          onChange={(e) => setStrategy(e.target.value)}
        >
          <option value="conservative">Conservative</option>
          <option value="balanced">Balanced</option>
          <option value="aggressive">Aggressive</option>
        </select>
      </div>

      <div className="input-section">
        <label htmlFor="prompt">Enter your prompt:</label>
        <textarea
          id="prompt"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Enter your prompt here... (For batch processing, separate prompts with new lines)"
          rows="6"
        />
        
        <div className="example-prompts">
          <h4>Example Prompts:</h4>
          {examplePrompts.map((example, index) => (
            <button
              key={index}
              className="example-btn"
              onClick={() => loadExample(example)}
            >
              Load Example {index + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="action-buttons">
        <button 
          onClick={handleOptimize} 
          disabled={isLoading || !inputPrompt.trim()}
          className="optimize-btn"
        >
          {isLoading ? 'Optimizing...' : 'Optimize Prompt'}
        </button>
        
        <button 
          onClick={handleBatchOptimize} 
          disabled={isLoading || !inputPrompt.trim()}
          className="batch-btn"
        >
          {isLoading ? 'Processing...' : 'Batch Optimize'}
        </button>
      </div>

      {result && (
        <div className="results">
          <h3>Optimization Results</h3>
          
          {result.isBatch ? (
            <div className="batch-results">
              {result.batchResults.map((batchResult, index) => (
                <div key={index} className="batch-item">
                  <h4>Prompt {index + 1}</h4>
                  <div className="result-content">
                    <div className="original">
                      <strong>Original:</strong> {batchResult.original}
                    </div>
                    <div className="optimized">
                      <strong>Optimized:</strong> {batchResult.optimized}
                    </div>
                    <div className="metrics">
                      <span>Tokens saved: {batchResult.tokensSaved}</span>
                      <span>Quality score: {batchResult.qualityScore.toFixed(2)}</span>
                    </div>
                    <div className="optimizations">
                      <strong>Optimizations:</strong> {batchResult.optimizations.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="single-result">
              <div className="result-content">
                <div className="original">
                  <strong>Original:</strong> {result.original}
                </div>
                <div className="optimized">
                  <strong>Optimized:</strong> {result.optimized}
                </div>
                <div className="metrics">
                  <div className="metric">
                    <span className="label">Tokens before:</span>
                    <span className="value">{result.tokensBefore}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Tokens after:</span>
                    <span className="value">{result.tokensAfter}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Tokens saved:</span>
                    <span className="value highlight">{result.tokensSaved}</span>
                  </div>
                  <div className="metric">
                    <span className="label">Quality score:</span>
                    <span className="value">{result.qualityScore.toFixed(2)}</span>
                  </div>
                  <div className="metric">
                    <span className="label">CO2 saved:</span>
                    <span className="value">{result.carbonSavings.co2Saved.toFixed(6)}g</span>
                  </div>
                </div>
                <div className="optimizations">
                  <strong>Applied optimizations:</strong>
                  <ul>
                    {result.optimizations.map((opt, index) => (
                      <li key={index}>{opt}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PromptOptimizer;
