// roleBaseMiddleware.js

// Define your middleware function
const roleBaseMiddleware = (requiredRole) => {
  return (req, res, next) => {
    // Get the role from the previous payload (assuming it's stored in req.user.role)
    const userRole = req.payload.role;
    // Compare the user's role with the required role
    if (userRole === requiredRole) {
      // User has the required role, proceed to the next middleware or route handler
      next();
    } else {
      // User does not have the required role, return an error response
      res.status(403).json({ error: "Unauthorized" });
    }
  };
};

module.exports = {roleBaseMiddleware};
