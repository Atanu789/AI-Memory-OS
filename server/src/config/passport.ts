import passport from "passport";
import { Strategy as GitHubStrategy, Profile } from "passport-github2";
import User, { IUser } from "../models/User";

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";
const CALLBACK_URL =
  process.env.CALLBACK_URL || "http://localhost:3000/auth/github/callback";

// Only configure GitHub strategy if credentials are provided
if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: CALLBACK_URL,
        scope: ["user:email"],
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: Profile,
        done: (error: any, user?: any) => void
      ) => {
        try {
          // Check if user already exists
          let user = await User.findOne({ githubId: profile.id });

          if (user) {
            // Update existing user
            user.username = profile.username || user.username;
            user.displayName = profile.displayName || user.displayName;
            user.avatar = profile.photos?.[0]?.value || user.avatar;
            user.profileUrl = profile.profileUrl || user.profileUrl;
            user.email =
              profile.emails?.[0]?.value || user.email;
            user.accessToken = accessToken;
            await user.save();
          } else {
            // Create new user
            user = await User.create({
              githubId: profile.id,
              username: profile.username,
              displayName: profile.displayName,
              email: profile.emails?.[0]?.value,
              avatar: profile.photos?.[0]?.value,
              profileUrl: profile.profileUrl,
              accessToken: accessToken,
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );
} else {
  console.warn("⚠️  GitHub OAuth credentials not configured!");
  console.warn("   Set GITHUB_CLIENT_ID and GITHUB_CLIENT_SECRET in .env");
  console.warn("   See SETUP.md for instructions");
}

// Serialize user for session
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

// Deserialize user from session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id).select("-accessToken");
    done(null, user);
  } catch (error) {
    done(error);
  }
});

export default passport;
