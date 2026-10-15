/**
 * Auth + Profile HTTP Controllers
 *
 * Each handler validates the request, delegates to the auth service, and lets
 * AppError instances bubble up to the global Express error handler (which maps
 * them to proper HTTP status codes).
 */
import * as authService from '../services/authService.js';

/** Extract the Bearer token from an Authorization header, or null. */
export function bearerToken(req) {
  const header = req.headers?.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7).trim() : null;
}

/** POST /api/auth/register */
export async function register(req, res, next) {
  try {
    const result = await authService.registerUser({
      name: req.body?.name,
      email: req.body?.email,
      role: req.body?.role,
      department: req.body?.department,
      studentId: req.body?.studentId,
      password: req.body?.password
    });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/login */
export async function login(req, res, next) {
  try {
    const result = await authService.loginUser({
      identifier: req.body?.identifier,
      password: req.body?.password
    });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/forgot-password */
export async function forgotPassword(req, res, next) {
  try {
    const result = await authService.sendPasswordReset(req.body?.email);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

/** GET /api/auth/me — returns the caller's campus user. */
export async function me(req, res, next) {
  try {
    const user = await authService.getSessionUser(bearerToken(req));
    res.json({ user });
  } catch (err) {
    next(err);
  }
}

/** PATCH /api/profile — update the caller's own profile. */
export async function updateProfile(req, res, next) {
  try {
    // The Bearer token establishes WHO is calling; the affected row is always
    // the caller's own (server-enforced ownership).
    const caller = await authService.getSessionUser(bearerToken(req));
    const user = await authService.updateProfile(caller.id, req.body || {});
    res.json({ user });
  } catch (err) {
    next(err);
  }
}