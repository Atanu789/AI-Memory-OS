import { Router } from "express";
import { isAuthenticated } from "../middleware/auth";

const router = Router();

// Example protected route - Get user profile
router.get("/profile", isAuthenticated, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// Example protected route with data - Dashboard
router.get("/dashboard", isAuthenticated, (req, res) => {
  const user: any = req.user;
  res.json({
    success: true,
    message: `Welcome ${user?.displayName || 'User'}!`,
    data: {
      // Add your dashboard data here
      recentActivity: [],
      stats: {},
    },
  });
});

export default router;
