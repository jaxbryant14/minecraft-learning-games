// Token Manager for cross-device persistence
class TokenManager {
  constructor() {
    this.apiUrl = '/.netlify/functions/tokens';
  }

  // Get tokens for a user
  async getTokens(email) {
    try {
      console.log('🔄 Fetching tokens for:', email);
      // Add cache-busting parameter to ensure fresh data
      const timestamp = Date.now();
      const response = await fetch(`${this.apiUrl}?email=${encodeURIComponent(email)}&t=${timestamp}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        }
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Tokens fetched from server:', data.tokens);
      console.log('🔄 Server response data:', data);
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
      // Validate input
      if (typeof count !== 'number' || count < 0) {
        console.error('❌ Invalid token count:', count);
        throw new Error('Invalid token count');
      }
      
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
      console.log('🔄 Expected tokens:', count, 'Server returned:', data.tokens);
      
      // Validate server response
      if (typeof data.tokens !== 'number' || data.tokens < 0) {
        console.error('❌ Invalid server response:', data.tokens);
        throw new Error('Invalid server response');
      }
      
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