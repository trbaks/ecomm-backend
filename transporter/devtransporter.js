const WinstonCloudWatch = require('winston-cloudwatch');
const AWS = require('aws-sdk');
// const AWS = require('@aws-sdk/client-cloudwatch-logs');
require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });
// console.log(process.env)
// Configure AWS credentials
AWS.config.update({
  accessKeyId: process.env.ACCESS_KEY_ID,
  secretAccessKey: process.env.YOUR_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

// Create a new WinstonCloudWatch instance
const cloudWatchTransport = new WinstonCloudWatch({
  logGroupName: process.env.LOG_GROUP_NAME,
  logStreamName: process.env.LOG_STREAM_NAME,
  awsAccessKeyId: AWS.config.credentials.accessKeyId,
  awsSecretKey: AWS.config.credentials.secretAccessKey,
  awsRegion: AWS.config.region,
  jsonMessage: true,
});

module.exports = {
  transport: cloudWatchTransport,
};
