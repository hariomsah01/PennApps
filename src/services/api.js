const API_BASE_URL = process.env.REACT_APP_API_URL || (process.env.NODE_ENV === 'production' ? '/api' : 'http://localhost:5001/api');

class ApiService {
  constructor() {
    this.sessionId = this.getOrCreateSessionId();
    this.user = this.getStoredUser();
  }

  getOrCreateSessionId() {
    let sessionId = localStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = this.generateSessionId();
      localStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  generateSessionId() {
    return 'session_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }

  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }

  setUser(user) {
    this.user = user;
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }

  async createSession() {
    try {
      const response = await fetch(`${API_BASE_URL}/session/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userAgent: navigator.userAgent,
          ipAddress: 'unknown' // Will be handled by server
        })
      });

      const data = await response.json();
      if (data.success) {
        this.sessionId = data.sessionId;
        localStorage.setItem('sessionId', this.sessionId);
      }
      return data;
    } catch (error) {
      console.error('Error creating session:', error);
      return { success: false, error: error.message };
    }
  }

  async saveOptimization(optimizationData) {
    try {
      const response = await fetch(`${API_BASE_URL}/optimization/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...optimizationData,
          sessionId: this.sessionId
        })
      });

      return await response.json();
    } catch (error) {
      console.error('Error saving optimization:', error);
      return { success: false, error: error.message };
    }
  }

  async getOptimizationHistory(page = 1, limit = 20) {
    try {
      // Use user ID if authenticated, otherwise use session ID
      const identifier = this.user ? this.user._id : this.sessionId;
      const response = await fetch(
        `${API_BASE_URL}/optimization/history/${identifier}?page=${page}&limit=${limit}&type=${this.user ? 'user' : 'session'}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching optimization history:', error);
      return { success: false, error: error.message };
    }
  }

  async getSessionStats() {
    try {
      // Use user ID if authenticated, otherwise use session ID
      const identifier = this.user ? this.user._id : this.sessionId;
      const response = await fetch(
        `${API_BASE_URL}/optimization/stats/${identifier}?type=${this.user ? 'user' : 'session'}`
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching session stats:', error);
      return { success: false, error: error.message };
    }
  }

  async getGlobalStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/optimization/global-stats`);
      return await response.json();
    } catch (error) {
      console.error('Error fetching global stats:', error);
      return { success: false, error: error.message };
    }
  }

  async updateSessionActivity() {
    try {
      const response = await fetch(`${API_BASE_URL}/session/${this.sessionId}/activity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      return await response.json();
    } catch (error) {
      console.error('Error updating session activity:', error);
      return { success: false, error: error.message };
    }
  }

  // Authentication methods
  async register(email, password, username) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, username })
      });
      return await response.json();
    } catch (error) {
      console.error('Error registering:', error);
      return { success: false, error: error.message };
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      
      if (data.success) {
        this.setUser(data.user);
        // Link session to user
        await this.linkSessionToUser(data.user._id);
      }
      
      return data;
    } catch (error) {
      console.error('Error logging in:', error);
      return { success: false, error: error.message };
    }
  }

  async logout() {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      // Clear user data and generate new session ID
      this.setUser(null);
      this.sessionId = this.generateSessionId();
      localStorage.setItem('sessionId', this.sessionId);
      
      return await response.json();
    } catch (error) {
      console.error('Error logging out:', error);
      return { success: false, error: error.message };
    }
  }

  async linkSessionToUser(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/session/${this.sessionId}/link-user`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId })
      });
      return await response.json();
    } catch (error) {
      console.error('Error linking session to user:', error);
      return { success: false, error: error.message };
    }
  }

  isAuthenticated() {
    return !!this.user;
  }
}

export default new ApiService();
