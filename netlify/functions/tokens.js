// In-memory storage for tokens (will reset when function restarts)
let tokenStorage = {};

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
      // Ignore cache-busting parameter 't'
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

    if (event.httpMethod === 'GET') {
      // Get tokens for user
      console.log('🔄 GET request - email:', email);
      console.log('🔄 All tokens from storage:', tokenStorage);
      const userTokens = tokenStorage[email] || 10; // Default 10 tokens for new users
      console.log('🔄 User tokens for', email, ':', userTokens);
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ tokens: userTokens })
      };
    } else if (event.httpMethod === 'POST') {
      // Update tokens for user
      const { tokens: newTokenCount } = JSON.parse(event.body);
      
      console.log('🔄 POST request - email:', email, 'newTokenCount:', newTokenCount);
      console.log('🔄 Current tokens before update:', tokenStorage);
      
      if (typeof newTokenCount !== 'number' || newTokenCount < 0) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Invalid token count' })
        };
      }

      tokenStorage[email] = newTokenCount;
      console.log('🔄 Updated tokens object:', tokenStorage);
      console.log('✅ Tokens saved successfully');

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