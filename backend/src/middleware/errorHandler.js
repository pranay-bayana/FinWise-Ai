// src/middleware/errorHandler.js
export const errorHandler = (err, req, res, _next) => {
  const status = err.statusCode || 500;
  if (status >= 500) {
    console.error('🛑 Error:', err);
  }
  const message = err.message || 'Internal Server Error';
  res.status(status).json({ message });
};
