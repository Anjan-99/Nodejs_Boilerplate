// Middleware to validate roles
const roleBaseMiddleware = (requiredRoles = []) => {
  return (req, res, next) => {
    const userRole = req.payload.role;
    if (requiredRoles.includes(userRole)) {
      next();
    } else {
      res.status(403).json({ error: "Unauthorized: NO ACCESS" });
    }
  };
};

module.exports = { roleBaseMiddleware };
