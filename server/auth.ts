import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { storage } from "./storage";
import { type User as SelectUser } from "@shared/schema";

declare global {
    namespace Express {
        interface User extends SelectUser { }
    }
}

export function setupAuth(app: Express) {
    const sessionSettings: session.SessionOptions = {
        secret: process.env.SESSION_SECRET || "khiyatma-default-secret",
        resave: false,
        saveUninitialized: false,
        store: storage.sessionStore,
        cookie: {
            secure: process.env.NODE_ENV === "production",
            maxAge: 24 * 60 * 60 * 1000, // 24 hours
        }
    };

    app.use(session(sessionSettings));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.use(
        new LocalStrategy({ passReqToCallback: true }, async (req, username, password, done) => {
            try {
                const user = await storage.getUserByUsername(username);
                // In a real app, use bcrypt for password comparison
                if (!user || user.password !== password) {
                    return done(null, false, { message: "Nom d'utilisateur ou mot de passe incorrect." });
                }

                // SECURITY: Verify that the user belongs to the current tenant
                const currentTenant = (req as any).tenant;
                
                if (currentTenant) {
                    // 1. Check if the user belongs to this tenant
                    if (user.tenantId !== currentTenant.id) {
                        console.warn(`Unauthorized login attempt: User ${username} (T:${user.tenantId}) tried to log into T:${currentTenant.id}`);
                        return done(null, false, { message: "Vous n'êtes pas autorisé à vous connecter sur cet établissement." });
                    }
                    
                    // 2. Check if the tenant is active
                    if (!currentTenant.isActive) {
                        console.warn(`Blocked login for suspended tenant: ${currentTenant.subdomain}`);
                        return done(null, false, { message: "Cet établissement est suspendu. Veuillez contacter l'administrateur." });
                    }
                }

                return done(null, user);
            } catch (err) {
                return done(err);
            }
        }),
    );

    passport.serializeUser((user: SelectUser, done) => {
        done(null, user.id);
    });

    passport.deserializeUser(async (id: number, done) => {
        try {
            const user = await storage.getUser(id);
            if (!user) return done(null, false);
            done(null, user);
        } catch (err) {
            done(err);
        }
    });

    app.post("/api/login", passport.authenticate("local"), (req, res) => {
        res.json(req.user);
    });

    app.post("/api/logout", (req, res, next) => {
        req.logout((err) => {
            if (err) return next(err);
            res.sendStatus(200);
        });
    });

    app.get("/api/user", (req, res) => {
        if (!req.isAuthenticated()) return res.sendStatus(401);
        res.json(req.user);
    });
}
