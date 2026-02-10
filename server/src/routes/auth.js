const express = require('express');
const { z } = require('zod');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { nanoid } = require('../utils/id');
const { sendResetEmail } = require('../utils/email');
const { User, RefreshToken } = require('../models');

const router = express.Router();

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET || 'dev_access_secret';
const REFRESH_TOKEN_SECRET = process.env.JWT_REFRESH_TOKEN_SECRET || 'dev_refresh_secret';
const ACCESS_EXPIRES = process.env.ACCESS_TOKEN_EXPIRY || '900s';
const REFRESH_EXPIRES = process.env.REFRESH_TOKEN_EXPIRY || '7d';

// validation schemas
const signupSchema = z.object({
  fullName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  agreeToTerms: z.boolean(),
});

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) });

// Helpers
function signAccessToken(user) {
  return jwt.sign({ sub: user.id, email: user.email }, ACCESS_TOKEN_SECRET, { expiresIn: ACCESS_EXPIRES });
}

function signRefreshToken(tokenId, userId) {
  return jwt.sign({ tid: tokenId, sub: userId }, REFRESH_TOKEN_SECRET, { expiresIn: REFRESH_EXPIRES });
}

function setRefreshCookie(res, token) {
  const cookieOpts = {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === 'true',
    sameSite: 'lax',
    domain: process.env.COOKIE_DOMAIN || 'localhost',
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  };
  res.cookie('refreshToken', token, cookieOpts);
}

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const parsed = signupSchema.parse(req.body);
  const exists = await User.findOne({ email: parsed.email }).exec();
  if (exists) return res.status(409).json({ error: 'Email already registered' });

  const passwordHash = await bcrypt.hash(parsed.password, 10);
  const user = await User.create({ name: parsed.fullName, email: parsed.email, passwordHash });

  const accessToken = signAccessToken(user);
  const refreshId = 'r_' + nanoid(12);
  const refreshToken = signRefreshToken(refreshId, user._id.toString());
  await RefreshToken.create({ tokenId: refreshId, userId: user._id });

  setRefreshCookie(res, refreshToken);

  res.status(201).json({ user: { id: user._id, fullName: user.name, email: user.email }, accessToken });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Validation failed', details: err.errors });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const parsed = loginSchema.parse(req.body);
  const user = await User.findOne({ email: parsed.email }).exec();
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(parsed.password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const accessToken = signAccessToken(user);
  const refreshId = 'r_' + nanoid(12);
  const refreshToken = signRefreshToken(refreshId, user._id.toString());
  await RefreshToken.create({ tokenId: refreshId, userId: user._id });

  setRefreshCookie(res, refreshToken);

  res.json({ user: { id: user._id, fullName: user.name, email: user.email }, accessToken });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Validation failed', details: err.errors });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST /api/auth/logout
router.post('/logout', async (req, res) => {
  const token = req.cookies && req.cookies.refreshToken;
  if (token) {
    try {
      const payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
      const tid = payload.tid;
      await RefreshToken.findOneAndUpdate({ tokenId: tid }, { revoked: true }).exec();
    } catch (e) {
      // ignore
    }
  }
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
});

// POST /api/auth/refresh
router.post('/refresh', async (req, res) => {
  const token = req.cookies && req.cookies.refreshToken;
  if (!token) return res.status(401).json({ error: 'No refresh token' });
  try {
    const payload = jwt.verify(token, REFRESH_TOKEN_SECRET);
    const tid = payload.tid;
    const stored = await RefreshToken.findOne({ tokenId: tid, revoked: false }).exec();
    if (!stored) return res.status(401).json({ error: 'Invalid refresh token' });

    // rotate: revoke old token, create new
    stored.revoked = true;
    await stored.save();

    const newTid = 'r_' + nanoid(12);
    const newRefresh = signRefreshToken(newTid, payload.sub);
    await RefreshToken.create({ tokenId: newTid, userId: payload.sub });
    setRefreshCookie(res, newRefresh);

    const user = await User.findById(payload.sub).exec();
    if (!user) return res.status(401).json({ error: 'Invalid user' });

    const accessToken = signAccessToken(user);
    res.json({ accessToken, user: { id: user._id, fullName: user.name, email: user.email } });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const schema = z.object({ email: z.string().email() });
  try {
    const { email } = schema.parse(req.body);
    const user = await User.findOne({ email }).exec();
    if (user) {
      const token = nanoid(24);
      user.resetToken = token;
      user.resetTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour
      await user.save();
      sendResetEmail(user.email, token);
    }
    // Always return success (avoid user enumeration)
    res.json({ message: 'If this email is registered, a reset link was sent' });
  } catch (err) {
    return res.status(400).json({ error: 'Invalid email' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const schema = z.object({ token: z.string().min(1), password: z.string().min(8) });
  try {
    const { token, password } = schema.parse(req.body);
  const user = await User.findOne({ resetToken: token, resetTokenExpiry: { $gt: Date.now() } }).exec();
  if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

  user.passwordHash = await bcrypt.hash(password, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();
  // Revoke refresh tokens for user
  await RefreshToken.updateMany({ userId: user._id }, { revoked: true }).exec();

  res.json({ message: 'Password updated' });
  } catch (err) {
    if (err.name === 'ZodError') return res.status(400).json({ error: 'Validation failed', details: err.errors });
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
    const user = await User.findById(payload.sub).exec();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    res.json({ id: user._id, fullName: user.name, email: user.email });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
