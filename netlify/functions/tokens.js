const fs = require('fs').promises;
const path = require('path');

// Simple file-based database for tokens
const TOKENS_FILE = path.join(__dirname, '../../data/tokens.json');

// Ensure data directory exists
async function ensureDataDir() {
  const dataDir = path.dirname(TOKENS_FILE);
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

// Load tokens from file
async function loadTokens() {
  try {
    await ensureDataDir();
    const data = await fs.readFile(TOKENS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist, return empty object
    return {};
  }
}

// Save tokens to file
async function saveTokens(tokens) {
  await ensureDataDir();
  await fs.writeFile(TOKENS_FILE, JSON.stringify(tokens, null, 2));
}

exports.handler = async function(event, context) {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: ''
    };
  }

  try {
    let email;
    
    if (event.httpMethod === 'GET') {
      // For GET requests, email comes from query parameters
      email = event.queryStringParameters?.email;
    } else {
      // For POST requests, email comes from body
      const body = JSON.parse(event.body || '{}');
      email = body.email;
    }
    
    if (!email) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email is required' })
      };
    }

    const tokens = await loadTokens();

    if (event.httpMethod === 'GET') {
      // Get tokens for user
      const userTokens = tokens[email] || 10; // Default 10 tokens for new users
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ tokens: userTokens })
      };
    } else if (event.httpMethod === 'POST') {
      // Update tokens for user
      const { tokens: newTokenCount } = JSON.parse(event.body);
      
      if (typeof newTokenCount !== 'number' || newTokenCount < 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid token count' })
        };
      }

      tokens[email] = newTokenCount;
      await saveTokens(tokens);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ tokens: newTokenCount })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
}; 