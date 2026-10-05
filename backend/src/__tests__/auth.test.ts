import { describe, expect, it } from "vitest";
import express from "express";
import request from "supertest";
import { authErrorHandler, requireAuthForWrites } from "../middleware/requireAuth";

function appWith(env: NodeJS.ProcessEnv) {
  const app = express();
  app.use("/api", requireAuthForWrites(env));
  app.get("/api/items", (_req, res) => res.json({ ok: true }));
  app.post("/api/items", (_req, res) => res.status(201).json({ ok: true }));
  app.delete("/api/items/1", (_req, res) => res.status(204).end());
  app.use(authErrorHandler);
  return app;
}

const configured = {
  AUTH0_ISSUER_BASE_URL: "https://tenant.example.auth0.com/",
  AUTH0_AUDIENCE: "https://booklet-api",
};

describe("requireAuthForWrites (Auth0 configured)", () => {
  it("keeps reads public", async () => {
    const res = await request(appWith(configured)).get("/api/items");
    expect(res.status).toBe(200);
  });

  it("rejects writes without a token", async () => {
    const app = appWith(configured);
    expect((await request(app).post("/api/items")).status).toBe(401);
    expect((await request(app).delete("/api/items/1")).status).toBe(401);
  });

  it("rejects writes with a malformed token", async () => {
    const res = await request(appWith(configured))
      .post("/api/items")
      .set("Authorization", "Bearer not-a-jwt");
    expect(res.status).toBe(401);
  });
});

describe("requireAuthForWrites (Auth0 not configured)", () => {
  it("fails closed for writes but keeps reads working", async () => {
    const app = appWith({});
    expect((await request(app).get("/api/items")).status).toBe(200);
    const res = await request(app).post("/api/items");
    expect(res.status).toBe(503);
    expect(res.body.error).toMatch(/AUTH0_AUDIENCE/);
  });
});

describe("requireAuthForWrites (AUTH_DISABLED=true)", () => {
  it("lets writes through for local development", async () => {
    const res = await request(appWith({ AUTH_DISABLED: "true" })).post("/api/items");
    expect(res.status).toBe(201);
  });
});
