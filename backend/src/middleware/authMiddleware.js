// src/middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../services/jwtService.js';

export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, token missing' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (_err) {
    return res.status(401).json({ message: 'Not authorized, token invalid' });
  }
};
