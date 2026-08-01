'use strict';

const express = require('express');
const evaluationsRouter = require('./routes/evaluations');

const API_VERSION = '1.0.1';

function createApp() {
  const app = express();

  app.use(express.json({
    strict: true,
  }));

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  app.get('/version', (_req, res) => {
    res.status(200).json({ version: API_VERSION });
  });

  app.use('/evaluations', evaluationsRouter);

  app.use((err, _req, res, next) => {
    if (err instanceof SyntaxError && Object.prototype.hasOwnProperty.call(err, 'body')) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'The request body is invalid.',
          details: [
            {
              field: 'body',
              message: 'Request body must be valid JSON.',
            },
          ],
        },
      });
    }
    return next(err);
  });

  return app;
}

module.exports = { createApp };
