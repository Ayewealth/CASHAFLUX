import express, { type Express } from "express";
import path from "path";

export function serveStatic(app: Express) {
  const dist = path.resolve(process.cwd(), "dist/client");
  app.use(express.static(dist));
  app.use("*", (_req, res) => {
    res.sendFile(path.join(dist, "index.html"));
  });
}
