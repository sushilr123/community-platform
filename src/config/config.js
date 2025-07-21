require('dotenv').config();

module.exports = {
  // Server Configuration
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  
  // Database Configuration
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/community-platform',
  
  // Authentication Configuration
  JWT_SECRET: process.env.JWT_SECRET,
  SESSION_SECRET: process.env.SESSION_SECRET,
  JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
  
  // GitHub Configuration
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  
  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // Session Configuration
  SESSION_MAX_AGE: process.env.SESSION_MAX_AGE || 24 * 60 * 60 * 1000, // 24 hours
  
  // Security
  BCRYPT_SALT_ROUNDS: process.env.BCRYPT_SALT_ROUNDS || 12,
};
