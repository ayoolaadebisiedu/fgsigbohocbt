import express from "express";
import session from "express-session";
import { registerRoutes } from "./routes";

const app = express();

declare module 'http' {
    interface IncomingMessage {
        rawBody: unknown
    }
}
app.use(express.json({
    verify: (req, _res, buf) => {
        req.rawBody = buf;
    }
}));
app.use(express.urlencoded({ extended: false }));

// Basic session setup for admin login
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret";
app.use(
    session({
        secret: SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 24 * 60 * 60 * 1000 },
    })
);

app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
        capturedJsonResponse = bodyJson;
        return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
        const duration = Date.now() - start;
        if (path.startsWith("/api")) {
            let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
            if (capturedJsonResponse) {
                logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
            }

            if (logLine.length > 80) {
                logLine = logLine.slice(0, 79) + "…";
            }

            console.log(logLine);
        }
    });

    next();
});

// We need to await this in obtaining the app, but since we can't top-level await in all envs easily without modules
// We will export a function or promise, OR just duplicate the logic slightly. 
// Actually, registerRoutes is async, so we might need to export a promise or init function.
// However, looking at original server/index.ts, it does:
// (async () => { const server = await registerRoutes(app); ... })();
// So we should probably export a function that returns the initialized app and server.

export async function createApp() {
    const server = await registerRoutes(app);
    return { app, server };
}

// For Vercel, we might just need the app, but registerRoutes adds routes to it.
// If registerRoutes is purely side-effecting on app, we could simpler.
// But it returns a server (http.Server).
