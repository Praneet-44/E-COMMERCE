const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'fashionhub-super-secret-key';

const authMiddleware = (roles = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authorization token required.' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;

      if (roles.length && !roles.includes(decoded.role)) {
        return res.status(430).json({ message: 'Access denied: insufficient permissions.' }); // use 403 or custom, let's use 403 standard, wait the code was using 403
      }
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
  };
};

module.exports = authMiddleware;
