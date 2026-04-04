const jwt = require("jsonwebtoken");
const { users } = require("../config/simpleDB");

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = users.find(user => user._id === decoded.id);
      if (req.user) {
        const { password, ...userWithoutPassword } = req.user;
        req.user = userWithoutPassword;
      }
      next();
    } catch {
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  }
  if (!token) return res.status(401).json({ message: "Not authorized, no token" });
};

module.exports = { protect };
