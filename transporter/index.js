const buildDevTransporter = require('./devtransporter');
const buildProdTransporter = require('./prodtransporter');

// const dotenv = require('dotenv').config();
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

const cloudwatchTransporter = () => {
console.log(process.env.NODE_ENV);
let logger = null;
if (process.env.NODE_ENV === 'development') {
  logger = buildDevTransporter();
} else {
  logger = buildProdTransporter();
}
}
module.exports = cloudwatchTransporter;