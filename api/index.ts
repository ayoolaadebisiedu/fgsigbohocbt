import { createApp } from "../server/app";

// Vercel Serverless Function entry point
export default async function handler(req: any, res: any) {
    const { app } = await createApp();
    // Pass the request to the Express app
    app(req, res);
}
