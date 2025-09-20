import { optimizePrompt, optimizeBatch } from './promptOptimizer.js';

// Test cases for the enhanced rule-based optimization
const testPrompts = [
  "Could you please provide me with a comprehensive summary of the economic impacts of climate change on developing countries?",
  "I was wondering if you could explain the process in detail and also provide some examples along with the key concepts.",
  "It is requested that you analyze the data thoroughly and provide a detailed explanation of the results.",
  "Please give me a summary of the book along with its key themes and main characters.",
  "Could you please describe the economic impacts of climate change on developing countries in order to help me understand the situation better?",
  "I would like you to provide a comprehensive explanation of how machine learning works, and I was wondering if you could also include some practical examples.",
  "It should be noted that the process is quite complex and requires careful attention to detail.",
  "There are several important factors to consider when analyzing this data."
];

console.log("🧪 Testing Enhanced Rule-Based Prompt Optimization\n");

// Test optimization
console.log("\n📊 Testing Prompt Optimization:");
console.log("=" .repeat(50));

testPrompts.forEach((prompt, index) => {
  const result = optimizePrompt(prompt);
  
  console.log(`\nTest ${index + 1}:`);
  console.log(`Original: ${result.original}`);
  console.log(`Optimized: ${result.optimized}`);
  console.log(`Tokens saved: ${result.tokensSaved}`);
  console.log(`Quality score: ${result.qualityScore.toFixed(2)}`);
  console.log(`Optimizations: ${result.optimizations.join(', ')}`);
  console.log("-".repeat(40));
});

// Test batch optimization
console.log("\n🔄 Testing Batch Optimization:");
console.log("=" .repeat(50));

const batchResults = optimizeBatch(testPrompts.slice(0, 3));
batchResults.forEach((result, index) => {
  console.log(`\nBatch ${index + 1}:`);
  console.log(`Original: ${result.original}`);
  console.log(`Optimized: ${result.optimized}`);
  console.log(`Tokens saved: ${result.tokensSaved}`);
});

// Test specific optimization functions
console.log("\n🔧 Testing Individual Functions:");
console.log("=" .repeat(50));

import { 
  removePolitePhrasing, 
  removeStopWords, 
  convertPassiveToActive, 
  shortenExpressions,
  applyStructuredFormat,
  extractKeywords 
} from './promptOptimizer.js';

const testText = "Could you please provide me with a comprehensive explanation of the process in order to help me understand it better?";

console.log("\nOriginal text:", testText);
console.log("\n1. Remove polite phrasing:", removePolitePhrasing(testText, []));
console.log("\n2. Remove stop words:", removeStopWords(testText, []));
console.log("\n3. Convert passive to active:", convertPassiveToActive(testText, []));
console.log("\n4. Shorten expressions:", shortenExpressions(testText, []));
console.log("\n5. Apply structured format:", applyStructuredFormat(testText, []));
console.log("\n6. Extract keywords:", extractKeywords(testText, []));
