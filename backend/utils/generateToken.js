const jwt = require('jsonwebtoken');

const generateToken = (payload, expiresIn = '30d') => {
  const secret = process.env.JWT_SECRET || 'medicare_default_secret_2026';
  return jwt.sign(payload, secret, { expiresIn });
};

module.exports = generateToken;

