import { useState, useCallback } from 'react';
import { optimizePrompt } from '../utils/promptOptimizer';
import { api } from '../utils/api';

export const usePromptOptimizer = () => {
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  const optimize = useCallback(async (prompt, strategy = 'balanced', useApi = false) => {
    setIsOptimizing(true);
    setError(null);
    
    try {
      let result;
      
      if (useApi) {
        // Use backend API
        result = await api.optimizePrompt(prompt, strategy);
      } else {
        // Use local optimization with delay for realism
        await new Promise(resolve => setTimeout(resolve, 1000));
        result = optimizePrompt(prompt, strategy);
      }
      
      // Add to history
      setHistory(prev => [result, ...prev.slice(0, 49)]); // Keep last 50
      
      return result;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  const optimizeBatch = useCallback(async (prompts, strategy = 'balanced', useApi = false) => {
    setIsOptimizing(true);
    setError(null);
    
    try {
      let results;
      
      if (useApi) {
        results = await api.optimizeBatch(prompts, strategy);
      } else {
        await new Promise(resolve => setTimeout(resolve, 1500));
        results = prompts.map(prompt => optimizePrompt(prompt, strategy));
      }
      
      // Add to history
      setHistory(prev => [...results, ...prev.slice(0, 49 - results.length)]);
      
      return results;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsOptimizing(false);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return {
    optimize,
    optimizeBatch,
    isOptimizing,
    history,
    error,
    clearHistory
  };
};