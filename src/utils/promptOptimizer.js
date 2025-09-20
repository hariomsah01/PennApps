import nlp from 'compromise';

// Enhanced Rule-Based Prompt Optimization
export const optimizePrompt = (prompt) => {
  let optimized = prompt;
  const optimizations = [];
  
  // Step 1: Remove polite/redundant phrasing
  optimized = removePolitePhrasing(optimized, optimizations);
  
  // Step 2: Remove stop-words and low-information words
  optimized = removeStopWords(optimized, optimizations);
  
  // Step 3: Convert passive voice to active
  optimized = convertPassiveToActive(optimized, optimizations);
  
  // Step 4: Shorten expressions and use synonyms
  optimized = shortenExpressions(optimized, optimizations);
  
  // Step 5: Apply structured prompt format
  optimized = applyStructuredFormat(optimized, optimizations);
  
  // Clean whitespace and punctuation
  optimized = optimized.replace(/\s+/g, ' ').trim();
  optimized = optimized.replace(/^,\s*/, ''); // Remove leading comma
  optimized = optimized.replace(/\?\s*$/, ''); // Remove trailing question mark
  optimized = optimized.replace(/\s+/g, ' ').trim(); // Clean up again
  
  // Calculate metrics
  const tokensBefore = Math.ceil(prompt.length / 4);
  const tokensAfter = Math.ceil(optimized.length / 4);
  const tokensSaved = tokensBefore - tokensAfter;
  
  // Calculate carbon savings
  const carbonBefore = calculateCarbon(tokensBefore);
  const carbonAfter = calculateCarbon(tokensAfter);
  
  return {
    original: prompt,
    optimized,
    tokensBefore,
    tokensAfter,
    tokensSaved,
    qualityScore: calculateQualityScore(prompt, optimized),
    carbonSavings: {
      co2Saved: carbonBefore.co2 - carbonAfter.co2,
      kwhSaved: carbonBefore.kwh - carbonAfter.kwh
    },
    optimizations,
    timestamp: new Date().toISOString()
  };
};

// 1. Remove polite/redundant phrasing
const removePolitePhrasing = (text, optimizations) => {
  const politePatterns = [
    {
      pattern: /\b(could you please|could you kindly|would you please|would you kindly)\s+/gi,
      replacement: '',
      description: 'Removed polite request phrases'
    },
    {
      pattern: /\b(I was wondering if you could|I would like you to|I need you to)\s+/gi,
      replacement: '',
      description: 'Removed indirect request phrases'
    },
    {
      pattern: /\b(please provide me with|please give me|please share)\s+(a\s+)?(comprehensive|detailed|thorough)?\s*(summary|explanation|analysis)\s+of\s+/gi,
      replacement: 'Summarize ',
      description: 'Simplified polite requests with summary'
    },
    {
      pattern: /\b(provide me with|give me|share)\s+(a\s+)?(comprehensive|detailed|thorough)?\s*(summary|explanation|analysis)\s+of\s+/gi,
      replacement: 'Summarize ',
      description: 'Simplified requests with summary'
    },
    {
      pattern: /\b(it is requested that you|it is required that you)\s+(kindly\s+)?(provide me with|give me|share)\s+(a\s+)?(comprehensive|detailed|thorough)?\s*(summary|explanation|analysis)\s+of\s+/gi,
      replacement: 'Summarize ',
      description: 'Simplified formal requests with summary'
    },
    {
      pattern: /\bit is requested that you\s+(kindly\s+)?(provide me with|give me|share)\s+(a\s+)?(very\s+)?(detailed|comprehensive|thorough)\s+(and\s+)?(detailed|comprehensive|thorough)?\s+(explanation|summary|analysis)\s+of\s+/gi,
      replacement: 'Explain ',
      description: 'Simplified formal requests with explanation'
    },
    {
      pattern: /\b(comprehensive|detailed|thorough)\s+(summary|explanation|analysis)\s+of\s+/gi,
      replacement: 'Summarize ',
      description: 'Simplified verbose descriptions'
    },
    {
      pattern: /\bprovide me with\s+(a\s+)?(detailed|comprehensive|thorough)\s+(explanation|summary|analysis)\s+of\s+/gi,
      replacement: 'Explain ',
      description: 'Simplified provide requests with explanation'
    },
    {
      pattern: /\bprovide me with\s+(a\s+)?(detailed|comprehensive|thorough)\s+and\s+(detailed|comprehensive|thorough)\s+(explanation|summary|analysis)\s+of\s+/gi,
      replacement: 'Explain ',
      description: 'Simplified provide requests with multiple adjectives'
    },
    {
      pattern: /\b(in order to|so as to)\s+/gi,
      replacement: 'to ',
      description: 'Shortened purpose phrases'
    },
    {
      pattern: /\bas soon as possible\b/gi,
      replacement: 'ASAP',
      description: 'Abbreviated urgency phrase'
    }
  ];
  
  let result = text;
  politePatterns.forEach(({ pattern, replacement, description }) => {
    if (result.match(pattern)) {
      result = result.replace(pattern, replacement);
      optimizations.push(description);
    }
  });
  
  return result;
};

// 2. Remove stop-words and low-information words
const removeStopWords = (text, optimizations) => {
  let result = text;
  
  // Balanced stop-words list
  const stopWords = ['please', 'kindly', 'very', 'really', 'hi', 'hello', 'just', 'basically', 'hey', 'there'];
  
  // Remove politeness indicators
  const politenessWords = ['please', 'kindly', 'thank you', 'thanks', 'hi', 'hello', 'hey', 'there'];
  politenessWords.forEach(word => {
    if (stopWords.includes(word)) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      if (result.match(regex)) {
        result = result.replace(regex, '');
        optimizations.push(`Removed politeness indicator "${word}"`);
      }
    }
  });
  
  // Remove intensifiers
  const intensifiers = ['really', 'very', 'extremely', 'highly', 'super', 'quite', 'rather'];
  intensifiers.forEach(intensifier => {
    if (stopWords.includes(intensifier)) {
      const regex = new RegExp(`\\b${intensifier}\\b`, 'gi');
      if (result.match(regex)) {
        result = result.replace(regex, '');
        optimizations.push(`Removed intensifier "${intensifier}"`);
      }
    }
  });
  
  return result;
};

// 3. Convert passive voice to active
const convertPassiveToActive = (text, optimizations) => {
  const doc = nlp(text);
  
  // Common passive voice patterns
  const passivePatterns = [
    {
      pattern: /\b(it is requested that|it is required that|it is needed that)\s+(.+)/gi,
      replacement: '$2',
      description: 'Converted passive request to active'
    },
    {
      pattern: /\b(it should be noted that|it is important to note that)\s+(.+)/gi,
      replacement: 'Note: $2',
      description: 'Converted passive note to active'
    },
    {
      pattern: /\b(it can be seen that|it is evident that|it is clear that)\s+(.+)/gi,
      replacement: '$2',
      description: 'Converted passive observation to active'
    },
    {
      pattern: /\b(there is|there are)\s+(.+)/gi,
      replacement: '$2 exists',
      description: 'Converted existential to direct statement'
    }
  ];
  
  let result = text;
  passivePatterns.forEach(({ pattern, replacement, description }) => {
    if (result.match(pattern)) {
      result = result.replace(pattern, replacement);
      optimizations.push(description);
    }
  });
  
  return result;
};

// 4. Shorten expressions and use synonyms
const shortenExpressions = (text, optimizations) => {
  const phraseReplacements = [
    {
      pattern: /\bprovide a comprehensive explanation\b/gi,
      replacement: 'explain thoroughly',
      description: 'Shortened verbose explanation phrase'
    },
    {
      pattern: /\bprovide a detailed analysis\b/gi,
      replacement: 'analyze',
      description: 'Shortened analysis phrase'
    },
    {
      pattern: /\bgive me a summary\b/gi,
      replacement: 'summarize',
      description: 'Shortened summary request'
    },
    {
      pattern: /\bexplain in detail\b/gi,
      replacement: 'explain',
      description: 'Removed redundant detail qualifier'
    },
    {
      pattern: /\bwith respect to\b/gi,
      replacement: 'regarding',
      description: 'Shortened formal phrase'
    },
    {
      pattern: /\bin the event that\b/gi,
      replacement: 'if',
      description: 'Shortened conditional phrase'
    },
    {
      pattern: /\bprior to\b/gi,
      replacement: 'before',
      description: 'Shortened temporal phrase'
    },
    {
      pattern: /\bsubsequent to\b/gi,
      replacement: 'after',
      description: 'Shortened temporal phrase'
    }
  ];
  
  let result = text;
  phraseReplacements.forEach(({ pattern, replacement, description }) => {
    if (result.match(pattern)) {
      result = result.replace(pattern, replacement);
      optimizations.push(description);
    }
  });
  
  return result;
};

// 5. Apply structured prompt format
const applyStructuredFormat = (text, optimizations) => {
  // Detect multiple requests or clauses
  const conjunctionPatterns = [
    /\b(along with|as well as|and also|plus)\b/gi,
    /\b(in addition to|furthermore|moreover|additionally)\b/gi
  ];
  
  let result = text;
  
  // Convert list structures to bullet format
  if (result.match(conjunctionPatterns[0]) || result.match(conjunctionPatterns[1])) {
    // Split on conjunctions and restructure
    result = result.replace(conjunctionPatterns[0], ';');
    result = result.replace(conjunctionPatterns[1], ';');
    
    // Clean up and format as structured list
    result = result.replace(/;\s*/g, '; ').trim();
    optimizations.push('Converted to structured format');
  }
  
  // Convert question format to direct format
  const questionPatterns = [
    /\bcan you\s+(.+)\?/gi,
    /\bcould you\s+(.+)\?/gi,
    /\bwould you\s+(.+)\?/gi
  ];
  
  questionPatterns.forEach(pattern => {
    if (result.match(pattern)) {
      result = result.replace(pattern, '$1');
      optimizations.push('Converted question to direct instruction');
    }
  });
  
  return result;
};

// 6. Keyword extraction approach
const extractKeywords = (text, optimizations) => {
  const doc = nlp(text);
  
  // Extract nouns and main verbs
  const nouns = doc.match('#Noun').out('array');
  const verbs = doc.match('#Verb').out('array');
  const properNouns = doc.match('#ProperNoun').out('array');
  
  // Filter out common words
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
  const filteredNouns = nouns.filter(word => 
    word.length > 2 && !commonWords.includes(word.toLowerCase())
  );
  const filteredVerbs = verbs.filter(word => 
    word.length > 2 && !commonWords.includes(word.toLowerCase())
  );
  
  // Combine keywords
  const keywords = [...new Set([...properNouns, ...filteredNouns, ...filteredVerbs])];
  
  if (keywords.length > 0) {
    // Determine action from context
    let action = 'Explain';
    if (text.toLowerCase().includes('summarize') || text.toLowerCase().includes('summary')) {
      action = 'Summarize';
    } else if (text.toLowerCase().includes('analyze') || text.toLowerCase().includes('analysis')) {
      action = 'Analyze';
    } else if (text.toLowerCase().includes('describe') || text.toLowerCase().includes('description')) {
      action = 'Describe';
    }
    
    const keywordString = `${action}: ${keywords.join('; ')}`;
    optimizations.push('Extracted keywords and restructured');
    return keywordString;
  }
  
  return text;
};

// Calculate quality score based on optimization effectiveness
const calculateQualityScore = (original, optimized) => {
  const compressionRatio = optimized.length / original.length;
  const wordCountReduction = (original.split(' ').length - optimized.split(' ').length) / original.split(' ').length;
  
  // Higher score for better compression while maintaining readability
  let score = 0.8; // Base score
  
  if (compressionRatio < 0.8) score += 0.1; // Good compression
  if (compressionRatio < 0.6) score += 0.05; // Excellent compression
  if (wordCountReduction > 0.2) score += 0.05; // Good word reduction
  
  return Math.min(0.99, Math.max(0.7, score));
};

// Carbon footprint calculation
const calculateCarbon = (tokens) => {
  const FLOPS_PER_TOKEN = 40e9;
  const JOULES_PER_FLOP = 2.5e-11;
  const GRID_INTENSITY = 350; // gCO2/kWh
  
  const flops = tokens * FLOPS_PER_TOKEN;
  const joules = flops * JOULES_PER_FLOP;
  const kwh = joules / 3.6e6;
  const co2 = kwh * GRID_INTENSITY;
  
  return { kwh, co2 };
};

// Batch optimization for multiple prompts
export const optimizeBatch = (prompts) => {
  return prompts.map(prompt => optimizePrompt(prompt));
};

// Get optimization statistics
export const getOptimizationStats = (results) => {
  const totalTokensSaved = results.reduce((sum, result) => sum + result.tokensSaved, 0);
  const totalCo2Saved = results.reduce((sum, result) => sum + result.carbonSavings.co2Saved, 0);
  const avgQualityScore = results.reduce((sum, result) => sum + result.qualityScore, 0) / results.length;
  
  return {
    totalOptimizations: results.length,
    totalTokensSaved,
    totalCo2Saved,
    avgQualityScore,
    avgTokensSaved: totalTokensSaved / results.length
  };
};

// Export individual functions for testing
export {
  removePolitePhrasing,
  removeStopWords,
  convertPassiveToActive,
  shortenExpressions,
  applyStructuredFormat,
  extractKeywords
};