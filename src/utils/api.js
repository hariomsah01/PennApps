const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000';

export const api = {
  
  optimizePrompt: async (prompt, strategy = 'balanced') => {
    const response = await fetch(`${API_BASE_URL}/api/optimize`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt, strategy })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  },

  saveResult: async (result) => {
    const response = await fetch(`${API_BASE_URL}/api/save`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(result)
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    return response.json();
  }
};
