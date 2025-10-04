// src/middleware/authMiddleware.js
export function requireAdmin(req, res, next) {
  if (req.session && req.session.adminId) {
    return next();
  }
  return res.status(401).json({ message: 'Unauthorized: Admin login required' });
}