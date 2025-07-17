const CrashReport = require('../models/crashReport');

const errorHandler = async (err, req, res, next) => {
  const status = err.status || 500;

  /*
  // List of known errors to skip from DB logging
  const SKIP_ERRORS = [
    'TokenExpiredError',
    'JsonWebTokenError',
    'NotBeforeError',
    'ValidationError',
    'CastError'
  ];

  // Optional: you can also check known error messages
  const SKIP_MESSAGES = [
    'jwt expired',
    'invalid token',
    'jwt malformed'
  ];
  */
  // Should we log this error?
  // Should we log this error?
  /*const shouldLog =
    (status >= 500 || ![400, 401, 403, 404].includes(status)) &&
    !SKIP_ERRORS.includes(err.name) &&
    !SKIP_MESSAGES.includes(err.message?.toLowerCase());
  */
  const shouldLog = (status >= 500 || ![400, 401, 403, 404].includes(status));

  if (shouldLog) {
    try {
      await CrashReport.create({
        userId: req?.user?._id || null,
        sessionId: req.headers['x-session-id'] || null,
        appVersion: req.headers['x-app-version'] || null,
        platform: 'backend',
        environment: process.env.NODE_ENV || 'production',

        errorType: err.name || 'Error',
        errorMessage: err.message,
        stackTrace: err.stack,

        filePath: (err.stack || '').split('\n')[1]?.trim().match(/\(([^)]+)\)/)?.[1] || null,

        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
        locale: req.headers['accept-language'] || null,

        metadata: {
          method: req.method,
          url: req.originalUrl,
          body: req.body,
          query: req.query,
        },
        occurredAt: new Date()
      });
    } catch (loggingError) {
      console.error('⚠️ Failed to log crash to CrashReport:', loggingError);
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error('🔴 Error:', err);
  }

  res.status(status).json({
    success: false,
    message: err.message || 'Something went wrong.'
  });
};

module.exports = errorHandler;
