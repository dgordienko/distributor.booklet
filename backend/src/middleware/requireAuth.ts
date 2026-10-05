import type { ErrorRequestHandler, RequestHandler } from "express";
import { auth } from "express-oauth2-jwt-bearer";

// Чтение каталога публично (его забирает Android-презентер без токена).
// Любые изменяющие запросы (POST/PUT/PATCH/DELETE) требуют валидный Auth0
// access-токен. Если Auth0 не настроен — запись закрыта (fail closed), а не
// открыта; для локальной разработки есть явный AUTH_DISABLED=true.
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

export function requireAuthForWrites(env: NodeJS.ProcessEnv = process.env): RequestHandler {
  if (env.AUTH_DISABLED === "true") {
    return (_req, _res, next) => next();
  }

  const issuerBaseURL = env.AUTH0_ISSUER_BASE_URL;
  const audience = env.AUTH0_AUDIENCE;

  if (!issuerBaseURL || !audience) {
    return (req, res, next) => {
      if (SAFE_METHODS.has(req.method)) return next();
      res.status(503).json({
        error: "Auth is not configured: set AUTH0_ISSUER_BASE_URL and AUTH0_AUDIENCE (or AUTH_DISABLED=true for local development)",
      });
    };
  }

  const verifyJwt = auth({ issuerBaseURL, audience });
  return (req, res, next) => {
    if (SAFE_METHODS.has(req.method)) return next();
    return verifyJwt(req, res, next);
  };
}

// Ошибки проверки токена приходят с status 401/403 — отдаём их как JSON.
export const authErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  const status = typeof err?.status === "number" ? err.status : undefined;
  if (status === 401 || status === 403) {
    res.status(status).json({ error: err.message ?? "Unauthorized" });
    return;
  }
  next(err);
};
