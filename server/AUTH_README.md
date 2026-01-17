# GitHub Authentication System Setup

## Overview
This server implements GitHub OAuth authentication using Passport.js.

## Setup Instructions

### 1. Create GitHub OAuth App
1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: AI Memory OS
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:3000/auth/github/callback`
4. Click "Register application"
5. Copy your **Client ID** and **Client Secret**

### 2. Configure Environment Variables
1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update `.env` with your credentials:
   ```env
   GITHUB_CLIENT_ID=your_actual_client_id
   GITHUB_CLIENT_SECRET=your_actual_client_secret
   SESSION_SECRET=generate_a_random_string_here
   ```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start the Server
```bash
npm run dev
```

## API Endpoints

### Authentication Routes

#### `GET /auth/github`
- **Description**: Redirects user to GitHub OAuth login
- **Access**: Public
- **Usage**: `window.location.href = 'http://localhost:3000/auth/github'`

#### `GET /auth/github/callback`
- **Description**: GitHub OAuth callback (handled automatically)
- **Access**: Public

#### `GET /auth/user`
- **Description**: Get current authenticated user
- **Access**: Private (requires authentication)
- **Response**:
  ```json
  {
    "success": true,
    "user": {
      "_id": "...",
      "githubId": "...",
      "username": "...",
      "displayName": "...",
      "email": "...",
      "avatar": "...",
      "profileUrl": "..."
    }
  }
  ```

#### `GET /auth/status`
- **Description**: Check if user is authenticated
- **Access**: Public
- **Response**:
  ```json
  {
    "authenticated": true,
    "user": { ... }
  }
  ```

#### `GET /auth/logout`
- **Description**: Logout user and destroy session
- **Access**: Public
- **Response**:
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

## Using Authentication in Your Client

### Login
```typescript
// Redirect to GitHub OAuth
window.location.href = 'http://localhost:3000/auth/github';
```

### Check Auth Status
```typescript
const checkAuth = async () => {
  const response = await fetch('http://localhost:3000/auth/status', {
    credentials: 'include'
  });
  const data = await response.json();
  return data.authenticated;
};
```

### Get User
```typescript
const getUser = async () => {
  const response = await fetch('http://localhost:3000/auth/user', {
    credentials: 'include'
  });
  const data = await response.json();
  return data.user;
};
```

### Logout
```typescript
const logout = async () => {
  await fetch('http://localhost:3000/auth/logout', {
    credentials: 'include'
  });
  window.location.href = '/';
};
```

## Protected Routes

Use the `isAuthenticated` middleware for protected routes:

```typescript
import { isAuthenticated } from './middleware/auth';

router.get('/protected', isAuthenticated, (req, res) => {
  res.json({ user: req.user });
});
```

## Database Schema

### User Model
- `githubId` (String, required, unique): GitHub user ID
- `username` (String, required): GitHub username
- `displayName` (String, required): Display name
- `email` (String, optional): Email address
- `avatar` (String, optional): Avatar URL
- `profileUrl` (String, optional): GitHub profile URL
- `accessToken` (String, optional): GitHub access token
- `createdAt` (Date): Account creation timestamp
- `updatedAt` (Date): Last update timestamp

## Security Notes

1. **Never commit `.env` file** - it's already in `.gitignore`
2. **Use strong SESSION_SECRET** in production
3. **Enable HTTPS** in production (set `NODE_ENV=production`)
4. **Update CORS origin** to your production domain
5. **Rotate secrets regularly**

## Troubleshooting

### "Unauthorized" error
- Make sure you're sending credentials: `credentials: 'include'` in fetch
- Check CORS configuration matches your client URL

### OAuth callback fails
- Verify callback URL matches exactly in GitHub OAuth app settings
- Check CLIENT_URL and CALLBACK_URL in `.env`

### Session not persisting
- Verify MongoDB connection is successful
- Check cookie settings (httpOnly, secure, sameSite)
