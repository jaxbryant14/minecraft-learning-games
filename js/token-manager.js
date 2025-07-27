// Token Manager for cross-device persistence
class TokenManager {
  constructor() {
    this.apiUrl = '/.netlify/functions/tokens';
  }

  // Get tokens for a user
  async getTokens(email) {
    try {
      console.log('🔄 Fetching tokens for:', email);
      const response = await fetch(`${this.apiUrl}?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Tokens fetched from server:', data.tokens);
      return data.tokens;
    } catch (error) {
      console.error('❌ Error fetching tokens:', error);
      console.log('🔄 Falling back to localStorage');
      // Fallback to localStorage for offline/error scenarios
      return this.getLocalTokens(email);
    }
  }

  // Set tokens for a user
  async setTokens(email, count) {
    try {
      console.log('🔄 Setting tokens for:', email, 'to:', count);
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, tokens: count })
      });

      console.log('📡 Response status:', response.status);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Tokens saved to server:', data.tokens);
      // Also update localStorage as backup
      this.setLocalTokens(email, count);
      return data.tokens;
    } catch (error) {
      console.error('❌ Error setting tokens:', error);
      console.log('🔄 Falling back to localStorage');
      // Fallback to localStorage for offline/error scenarios
      this.setLocalTokens(email, count);
      return count;
    }
  }

  // Local storage fallback methods
  getLocalTokens(email) {
    const key = email ? `tokens_${email}` : 'tokens_guest';
    const tokens = localStorage.getItem(key);
    if (tokens === null) {
      const defaultTokens = 10;
      localStorage.setItem(key, defaultTokens);
      return defaultTokens;
    }
    return parseInt(tokens, 10);
  }

  setLocalTokens(email, count) {
    const key = email ? `tokens_${email}` : 'tokens_guest';
    localStorage.setItem(key, count);
  }

  // Update token display
  updateTokenDisplay(email, elementId = 'token-count') {
    this.getTokens(email).then(tokens => {
      const element = document.getElementById(elementId);
      if (element) {
        element.textContent = tokens;
      }
    });
  }
}

// Create global instance
window.tokenManager = new TokenManager(); 