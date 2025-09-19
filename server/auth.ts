import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import createMemoryStore from "memorystore";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  // Validate SESSION_SECRET at startup
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is required');
  }

  const MemoryStore = createMemoryStore(session);
  const isProduction = process.env.NODE_ENV === 'production';
  
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000,
    }),
    cookie: {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(
      { usernameField: 'email' }, // Use email instead of username
      async (email, password, done) => {
        try {
          const user = await storage.getUserByEmail(email);
          if (!user || !(await comparePasswords(password, user.password))) {
            return done(null, false, { message: 'Email atau password salah' });
          }
          return done(null, user);
        } catch (error) {
          return done(error);
        }
      }
    )
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Register endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const { email, password, username, firstName, lastName } = req.body;

      if (!email || !password || !username) {
        return res.status(400).json({ message: "Email, password, dan username diperlukan" });
      }

      // Check if user already exists
      const existingUserByEmail = await storage.getUserByEmail(email);
      const existingUserByUsername = await storage.getUserByUsername(username);

      if (existingUserByEmail) {
        return res.status(400).json({ message: "Email sudah terdaftar" });
      }

      if (existingUserByUsername) {
        return res.status(400).json({ message: "Username sudah digunakan" });
      }

      // Check if this is the first user, make them admin
      const existingUsers = await storage.getAllUsers();
      const isFirstUser = existingUsers.length === 0;

      // Create new user
      const user = await storage.createUser({
        email,
        username,
        password: await hashPassword(password),
        firstName: firstName || null,
        lastName: lastName || null,
        isAdmin: isFirstUser // First user becomes admin
      });

      // Login user automatically
      req.login(user, (err) => {
        if (err) return next(err);
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).json({ message: "Gagal mendaftar" });
    }
  });

  // Login endpoint
  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) return next(err);
      if (!user) {
        return res.status(401).json({ message: info?.message || "Email atau password salah" });
      }
      
      req.login(user, (err) => {
        if (err) return next(err);
        const { password: _, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.json({ message: "Berhasil logout" });
    });
  });

  // Get current user endpoint
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Belum login" });
    }
    const { password: _, ...userWithoutPassword } = req.user as SelectUser;
    res.json(userWithoutPassword);
  });
}

// Authentication middleware
export function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Login diperlukan" });
  }
  next();
}

// Admin authentication middleware (session-based)
export function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Login diperlukan" });
  }
  
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Akses admin diperlukan" });
  }
  
  next();
}

// Admin key authentication middleware (key-based)
export function requireAdminKey(req: any, res: any, next: any) {
  const adminKey = process.env.ADMIN_KEY;
  
  if (!adminKey) {
    console.error("ADMIN_KEY environment variable not set");
    return res.status(500).json({ message: "Server configuration error" });
  }

  // Check for Authorization header with Bearer token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Admin key required" });
  }

  const providedKey = authHeader.substring(7); // Remove 'Bearer ' prefix
  
  if (providedKey !== adminKey) {
    return res.status(403).json({ message: "Invalid admin key" });
  }
  
  next();
}

// Flexible authentication middleware (supports both admin key and session)
export function requireAdminKeyOrSession(req: any, res: any, next: any) {
  const adminKey = process.env.ADMIN_KEY;
  const authHeader = req.headers.authorization;
  
  // Check for admin key authentication first
  if (adminKey && authHeader && authHeader.startsWith('Bearer ')) {
    const providedKey = authHeader.substring(7);
    if (providedKey === adminKey) {
      req.isAdminKeyAuth = true;
      return next();
    }
  }
  
  // Fall back to session authentication
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  req.isAdminKeyAuth = false;
  next();
}