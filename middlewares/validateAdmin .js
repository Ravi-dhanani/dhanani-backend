const validateAdmin = async (req, res, next) => {
  try {
    // Admin ID should match the authenticated user
    if (!req.user || !req.user.role || req.user.role !== "admin") {
      return res.status(403).json({ error: "Access denied. Not an admin." });
    }
    req.adminId = req.user.id; // Add adminId to request object for reuse
    next();
  } catch (error) {
    res.status(400).json({ error: "Invalid admin credentials." });
  }
};

module.exports = validateAdmin;
