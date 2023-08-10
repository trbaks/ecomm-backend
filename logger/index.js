const buildDevLogger = require('./devlogger');
const buildProdLogger = require('./prodlogger');
// const dotenv = require('dotenv').config();
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

// console.log(process.env.NODE_ENV);
let logger = null;
if (process.env.NODE_ENV === 'development') {
  logger = buildDevLogger();
} else {
  logger = buildProdLogger();
}

module.exports = logger;