const demoMiddleware = async (req, res, next) => {
  try {
    const user = req.user;

    // Check if the user is a demo account
    if (user && user.isDemoAccount) {
      // Allow GET requests, but block everything else (POST, PUT, PATCH, DELETE)
      if (req.method !== "GET") {
        return res.status(403).json({
          message: "Action forbidden: This is a demo account with read-only access.",
        });
      }
    }

    next();
  } catch (error) {
    console.error("Demo Middleware Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = demoMiddleware;
