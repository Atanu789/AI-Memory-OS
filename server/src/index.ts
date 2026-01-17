import dotenv from "dotenv";

// Load environment variables FIRST before any other imports
dotenv.config();

import express from "express";
import session from "express-session";
import MongoStore from "connect-mongo";
import cors from "cors";
import passport from "./config/passport";
import { connectDB } from "./config/database";
import authRoutes from "./routes/auth";
import apiRoutes from "./routes/api";
// import protectedRoutes from "./routes/protected";

// Connect to MongoDB
connectDB();

const app = express();

// Debug: Check if API keys are loaded
console.log('🔑 Environment check:');
console.log('  GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing');
console.log('  GITHUB_TOKEN:', process.env.GITHUB_TOKEN ? '✅ Set' : '❌ Missing');
console.log('  GITHUB_CLIENT_ID:', process.env.GITHUB_CLIENT_ID ? '✅ Set' : '❌ Missing');

// CORS configuration - Allow Electron and all localhost ports
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like Electron, mobile apps, curl)
      if (!origin) return callback(null, true);
      
      // Allow localhost on any port
      if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
      
      // Allow file:// protocol (Electron)
      if (origin.startsWith('file://')) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-secret-key-change-this-in-production",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl:
        process.env.MONGODB_URI ||
        "mongodb+srv://atanugm8_db_user:FqP8UhI7hMTQn5DJ@cluster0.ghoiydc.mongodb.net/ai-memory-os?retryWrites=true&w=majority",
      touchAfter: 24 * 3600, // lazy session update (in seconds)
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // true in production
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/auth", authRoutes);
app.use("/api", apiRoutes);
// app.use("/api", protectedRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "AI Memory OS API",
    version: "1.0.0",
    authenticated: req.isAuthenticated(),
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
