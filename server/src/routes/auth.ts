import { Router } from "express";
import passport from "../config/passport";
import { isAuthenticated } from "../middleware/auth";

const router = Router();

// @route   GET /auth/github
// @desc    Redirect to GitHub OAuth
// @access  Public
router.get("/github", passport.authenticate("github"));

// @route   GET /auth/github/callback
// @desc    GitHub OAuth callback
// @access  Public
router.get(
  "/github/callback",
  passport.authenticate("github", {
    failureRedirect: process.env.CLIENT_URL || "http://localhost:5173",
  }),
  (req, res) => {
    // Successful authentication
    // Send HTML page that tells user to go back to the app
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Successful</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              color: white;
            }
            .container {
              text-align: center;
              padding: 40px;
              background: rgba(255, 255, 255, 0.1);
              border-radius: 20px;
              backdrop-filter: blur(10px);
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            }
            .success-icon {
              font-size: 64px;
              margin-bottom: 20px;
            }
            h1 {
              font-size: 32px;
              margin: 0 0 10px 0;
            }
            p {
              font-size: 18px;
              opacity: 0.9;
              margin: 10px 0;
            }
            .close-btn {
              margin-top: 30px;
              padding: 15px 30px;
              background: white;
              color: #667eea;
              border: none;
              border-radius: 10px;
              font-size: 16px;
              font-weight: 600;
              cursor: pointer;
              transition: transform 0.2s;
            }
            .close-btn:hover {
              transform: scale(1.05);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✓</div>
            <h1>Authentication Successful!</h1>
            <p>You have been successfully authenticated.</p>
            <p>You can close this tab and return to the AI Memory OS application.</p>
            <button class="close-btn" onclick="window.close()">Close This Tab</button>
          </div>
          <script>
            // Auto-close after 3 seconds
            setTimeout(() => {
              window.close();
            }, 3000);
          </script>
        </body>
      </html>
    `);
  }
);

// @route   GET /auth/user
// @desc    Get current authenticated user
// @access  Private
router.get("/user", isAuthenticated, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// @route   GET /auth/logout
// @desc    Logout user
// @access  Private
router.get("/logout", (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.clearCookie("connect.sid");
      res.json({ success: true, message: "Logged out successfully" });
    });
  });
});

// @route   GET /auth/status
// @desc    Check authentication status
// @access  Public
router.get("/status", (req, res) => {
  res.json({
    authenticated: req.isAuthenticated(),
    user: req.isAuthenticated() ? req.user : null,
  });
});

export default router;
