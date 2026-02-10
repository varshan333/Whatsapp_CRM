const jwt = require('jsonwebtoken');
const { User } = require('../models');

const ACCESS_TOKEN_SECRET = process.env.JWT_ACCESS_TOKEN_SECRET || 'dev_access_secret';

async function authenticate(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, ACCESS_TOKEN_SECRET);
    const user = await User.findById(payload.sub).exec();
    if (!user) return res.status(401).json({ error: 'Unauthorized' });
    req.user = { id: user._id.toString(), role: user.role || 'agent' };
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

function authorize(roles = []) {
  if (typeof roles === 'string') roles = [roles];
  return (req, res, next) => {
    const role = (req.user && req.user.role) || 'agent';
    if (roles.length && !roles.includes(role)) return res.status(403).json({ error: 'Forbidden' });
    next();
  };
}

module.exports = { authenticate, authorize };
