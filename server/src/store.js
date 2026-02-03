// Simple in-memory stores for demo purposes. Replace with DB in production.
const users = {}; // keyed by user id
const refreshTokens = {}; // keyed by refresh id

module.exports = { users, refreshTokens };
