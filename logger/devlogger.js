const { json } = require("express");
const { format, createLogger, transports } = require("winston");
const winston = require("winston");
const {
  transport: cloudWatchTransport,
} = require("../transporter/devtransporter");

const { timestamp, combine, printf, errors, label } = format;

const buildDevLogger = () => {
  const logFormat = printf(({ level, message, timestamp, stack, meta }) => {
    const logData = {
      timestamp,
      message,
      level: level.toUpperCase(),
      spanContext: {
        traceId: meta?.traceId,
        spanId: meta?.spanId,
        traceFlags: meta?.traceFlags,
      },
      attributes: {
        "http.method": meta?.httpMethod,
        "http.status_code": meta?.statusCode,
        "http.path": meta?.httpPath,
        userDetails: meta?.userDetails,
      },
      stack,
    };

    return JSON.stringify(logData);
  });
  return createLogger({
    format: combine(
      //   format.colorize(),
      timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
      errors({ stack: true }),
      logFormat
    ),
    defaultMeta: { service: "user-service" },
    transports: [
      new transports.Console(),
      // new winston.transports.File({ filename: "error.log", level: "error" }),
      // new winston.transports.File({ filename: "combined.log" }),
      cloudWatchTransport,
    ],
  });
};

module.exports = buildDevLogger;
