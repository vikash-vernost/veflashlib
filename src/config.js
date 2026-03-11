const path = require("path");
const dotenv = require("dotenv");
dotenv.config({ path: path.join(__dirname, '../.env') });

const env = process.env.NODE_ENV || 'development';

const config = {
  development: {
    storedApiKey: process.env.API_KEY
  },

  production: {
    apiBaseUrl: process.env.API_KEY
  }
};

module.exports = config[env];