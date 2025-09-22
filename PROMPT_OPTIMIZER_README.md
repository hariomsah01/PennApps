# Enhanced Rule-Based Prompt Optimizer

A sophisticated React application that implements advanced rule-based techniques for optimizing AI prompts without requiring external APIs. This tool uses natural language processing to intelligently compress and improve prompts while maintaining their core meaning.

## 🚀 Features

### 1. **Polite/Redundant Phrasing Removal**
- Identifies and removes verbose phrases like "Could you please provide me with..."
- Converts indirect requests to direct instructions
- Eliminates filler words and politeness indicators

### 2. **Stop-Words and POS Tagging**
- Uses Compromise.js for natural language processing
- Removes low-information words based on strategy (conservative/balanced/aggressive)
- Identifies and removes adverbs, intensifiers, and filler words
- Strategy-based word filtering

### 3. **Passive Voice Conversion**
- Detects passive voice constructions
- Converts to active voice for clarity and conciseness
- Examples: "It is requested that..." → "Do..."

### 4. **Expression Shortening**
- Replaces long phrases with shorter equivalents
- Uses synonym mapping for common verbose expressions
- Examples: "in order to" → "to", "provide a comprehensive explanation" → "explain thoroughly"

### 5. **Structured Prompt Formatting**
- Converts multiple requests into structured formats
- Uses bullet points and semicolons for clarity
- Transforms questions into direct instructions

### 6. **Keyword Extraction (Aggressive Mode)**
- Extracts essential nouns, verbs, and proper nouns
- Filters out common words and stop-words
- Creates minimal keyword-based prompts
- Maintains action context (Explain, Summarize, Analyze, etc.)

## 🛠️ Technical Implementation

### Dependencies
- **React 18** - Modern React with hooks
- **Compromise.js** - Lightweight NLP library for browser
- **CSS3** - Modern styling with responsive design

### Core Functions

```javascript
// Main optimization function
optimizePrompt(prompt, strategy)

// Individual optimization techniques
removePolitePhrasing(text, optimizations)
removeStopWords(text, strategy, optimizations)
convertPassiveToActive(text, optimizations)
shortenExpressions(text, optimizations)
applyStructuredFormat(text, optimizations)
extractKeywords(text, optimizations)
```

### Optimization Strategies

1. **Conservative**: Minimal changes, removes only basic politeness
2. **Balanced**: Moderate optimization, removes common filler words
3. **Aggressive**: Maximum compression, includes keyword extraction

## 📊 Metrics and Analytics

The optimizer provides comprehensive metrics:

- **Token Count**: Before/after token estimation
- **Quality Score**: Algorithmic quality assessment (0.7-0.99)
- **Carbon Savings**: Environmental impact calculation
- **Optimization Log**: Detailed list of applied changes

## 🎯 Usage Examples

### Input:
```
"Could you please provide me with a comprehensive summary of the economic impacts of climate change on developing countries along with key themes and main factors?"
```

### Conservative Output:
```
"Provide summary of economic impacts of climate change on developing countries along with key themes and main factors"
```

### Balanced Output:
```
"Summarize economic impacts of climate change on developing countries; key themes; main factors"
```

### Aggressive Output:
```
"Summarize: climate change; economic impacts; developing countries; key themes; main factors"
```

## 🚀 Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm start
   ```

3. **Open browser:**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
src/
├── components/
│   ├── PromptOptimizer.js      # Main React component
│   └── PromptOptimizer.css     # Component styles
├── utils/
│   ├── promptOptimizer.js      # Core optimization logic
│   └── testOptimizer.js        # Test cases and examples
├── App.js                      # Main app component
└── App.css                     # Global styles
```

## 🔧 Customization

### Adding New Patterns
Extend the pattern libraries in `promptOptimizer.js`:

```javascript
const politePatterns = [
  {
    pattern: /your-regex-pattern/gi,
    replacement: 'replacement',
    description: 'Description of optimization'
  }
];
```

### Custom Stop Words
Modify the `stopWords` object to add domain-specific terms:

```javascript
const stopWords = {
  conservative: ['your', 'custom', 'words'],
  balanced: ['more', 'words'],
  aggressive: ['even', 'more', 'words']
};
```

## 🧪 Testing

Run the test suite to see optimization examples:

```javascript
import { testOptimizer } from './src/utils/testOptimizer.js';
// Run in browser console or Node.js
```

## 🌟 Key Benefits

1. **No External APIs**: Completely offline and private
2. **Fast Processing**: Rule-based approach is extremely fast
3. **Deterministic**: Same input always produces same output
4. **Customizable**: Easy to modify patterns and strategies
5. **Comprehensive**: Multiple optimization techniques in one tool
6. **Metrics**: Detailed analytics and quality scoring

## 🔮 Future Enhancements

- Machine learning-based pattern recognition
- Domain-specific optimization rules
- Advanced grammar analysis
- Multi-language support
- API integration for cloud processing

## 📝 License

This project is open source and available under the MIT License.

---

**Built with ❤️ using React and Compromise.js**
