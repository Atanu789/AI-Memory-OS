import "express-session";
import { IUser } from "../models/User";

// Extend Express Session
declare module "express-session" {
  interface SessionData {
    passport?: {
      user?: string;
    };
  }
}

// Extend Express Request
declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

export {};
