# 🚀 Quick Start Guide

## Your authentication system is ready! Follow these steps:

### Step 1: Set Up GitHub OAuth App

1. Go to: https://github.com/settings/developers
2. Click **"New OAuth App"**
3. Fill in the form:
   ```
   Application name: AI Memory OS
   Homepage URL: http://localhost:5173
   Authorization callback URL: http://localhost:3000/auth/github/callback
   ```
4. Click **"Register application"**
5. Copy your **Client ID** and **Client Secret**

### Step 2: Update Environment Variables

Open `server/.env` and replace:
```env
GITHUB_CLIENT_ID=your_actual_client_id_from_github
GITHUB_CLIENT_SECRET=your_actual_client_secret_from_github
```

### Step 3: Start the Server

```bash
cd server
npm run dev
```

You should see:
```
✅ MongoDB Connected Successfully
🚀 Server is running on http://localhost:3000
```

### Step 4: Test Authentication

Open your browser and visit:
- http://localhost:3000 - Should show API info
- http://localhost:3000/auth/status - Check auth status
- http://localhost:3000/auth/github - Start GitHub login

---

## 📚 API Endpoints

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/auth/github` | Start GitHub OAuth | No |
| GET | `/auth/github/callback` | OAuth callback | No |
| GET | `/auth/status` | Check auth status | No |
| GET | `/auth/user` | Get current user | Yes |
| GET | `/auth/logout` | Logout | No |

---

## 🔧 Integration with Client

### Login Button
```typescript
const handleLogin = () => {
  window.location.href = 'http://localhost:3000/auth/github';
};
```

### Check Authentication
```typescript
const checkAuth = async () => {
  const res = await fetch('http://localhost:3000/auth/status', {
    credentials: 'include'
  });
  const data = await res.json();
  return data.authenticated;
};
```

### Get User Profile
```typescript
const getUser = async () => {
  const res = await fetch('http://localhost:3000/auth/user', {
    credentials: 'include'
  });
  if (!res.ok) throw new Error('Not authenticated');
  const data = await res.json();
  return data.user;
};
```

### Logout
```typescript
const handleLogout = async () => {
  await fetch('http://localhost:3000/auth/logout', {
    credentials: 'include'
  });
  // Redirect or update UI
};
```

---

## 🛡️ Security Features

✅ Session-based authentication with MongoDB store  
✅ Secure HTTP-only cookies  
✅ CORS protection  
✅ Password-less authentication (GitHub OAuth only)  
✅ Automatic session expiry (7 days)  

---

## 📁 Project Structure

```
server/
├── src/
│   ├── config/
│   │   ├── database.ts      # MongoDB connection
│   │   └── passport.ts      # Passport GitHub strategy
│   ├── middleware/
│   │   └── auth.ts          # Authentication middleware
│   ├── models/
│   │   └── User.ts          # User schema
│   ├── routes/
│   │   └── auth.ts          # Auth endpoints
│   ├── types/
│   │   └── express.d.ts     # TypeScript definitions
│   └── index.ts             # Main server file
├── .env                     # Environment variables (DO NOT COMMIT)
├── .env.example             # Example env file
└── AUTH_README.md           # Detailed documentation
```

---

## 🐛 Troubleshooting

### MongoDB Connection Error
- Check if your IP is whitelisted in MongoDB Atlas
- Verify connection string is correct

### GitHub OAuth Fails
- Ensure callback URL matches exactly: `http://localhost:3000/auth/github/callback`
- Check that Client ID and Secret are correct

### Session Not Persisting
- Make sure you're using `credentials: 'include'` in fetch requests
- Check browser cookies are enabled

### CORS Errors
- Verify CLIENT_URL in .env matches your frontend URL
- Ensure credentials are being sent with requests

---

## 📝 Next Steps

1. ✅ Set up GitHub OAuth app
2. ✅ Update .env with credentials
3. ✅ Start the server
4. 🔲 Integrate login in your client
5. 🔲 Protect your routes with `isAuthenticated` middleware
6. 🔲 Customize user profile as needed

---

Need help? Check `AUTH_README.md` for detailed documentation!
