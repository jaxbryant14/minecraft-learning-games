# Learning Game Portal with Cross-Device Token Persistence

This project provides a learning game portal with multiplication and coding games, featuring cross-device token persistence using Netlify Functions.

## Features

- **Cross-Device Token Persistence**: Tokens are stored on the server and persist across different devices and browsers
- **Netlify Identity Integration**: User authentication with email-based token tracking
- **Offline Fallback**: Falls back to localStorage when the server is unavailable
- **Multiplication Game**: Practice multiplication with token rewards
- **Coding Game**: JavaScript coding practice environment

## Setup Instructions

### 1. Deploy to Netlify

1. Push your code to a Git repository (GitHub, GitLab, etc.)
2. Connect your repository to Netlify
3. Set the build settings:
   - Build command: (leave empty)
   - Publish directory: `fun-edu-games`
4. Deploy the site

### 2. Configure Netlify Identity

1. In your Netlify dashboard, go to Site settings > Identity
2. Enable Identity service
3. Configure registration settings (invite-only or open)
4. Set up email templates if desired

### 3. Environment Variables (Optional)

If you want to use a different database solution, you can set environment variables in Netlify:
- `DATABASE_URL` - For external database connections
- `JWT_SECRET` - For custom JWT signing

## How It Works

### Token Storage
- Tokens are stored in a JSON file on the server using Netlify Functions
- Each user's tokens are associated with their email address
- New users start with 10 tokens by default

### API Endpoints
- `GET /.netlify/functions/tokens` - Retrieve tokens for a user
- `POST /.netlify/functions/tokens` - Update tokens for a user

### Fallback System
- If the server is unavailable, the app falls back to localStorage
- This ensures the game continues to work even during server issues

## File Structure

```
fun-edu-games/
├── index.html              # Main portal page
├── game.html               # Multiplication game
├── coding-game.html        # JavaScript coding game
├── js/
│   └── token-manager.js    # Token management API client
├── netlify/
│   └── functions/
│       └── tokens.js       # Server-side token API
├── netlify.toml           # Netlify configuration
└── README.md              # This file
```

## Usage

1. Enter the passcode (1002) to access the portal
2. Sign up/sign in with Netlify Identity
3. Play games to earn and spend tokens
4. Tokens will persist across different devices and sessions

## Customization

### Adding New Games
1. Create a new HTML file for your game
2. Include the token manager script: `<script src="js/token-manager.js"></script>`
3. Use the token manager API to handle token operations

### Database Options
The current implementation uses a simple JSON file. For production use, consider:
- MongoDB Atlas
- Supabase
- Firebase Firestore
- PostgreSQL with Netlify Functions

## Troubleshooting

### Tokens Not Persisting
- Check that Netlify Functions are enabled
- Verify the function is deployed correctly
- Check browser console for API errors

### Authentication Issues
- Ensure Netlify Identity is properly configured
- Check email verification settings
- Verify site URL settings in Netlify dashboard 