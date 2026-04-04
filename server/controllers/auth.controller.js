const jwt = require("jsonwebtoken");
const { findUser, createUser } = require("../config/simpleDB");
const bcrypt = require("bcryptjs");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });

const register = async (req, res) => {
  try {
    const { name, email, password, shopName, language, phone } = req.body;
    if (!name || !email || !password || !shopName)
      return res.status(400).json({ message: "Please fill all required fields" });

    const exists = findUser(email);
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = createUser({ name, email, password: hashedPassword, shopName, language, phone });
    
    res.status(201).json({
      _id: user._id, name: user.name, email: user.email,
      shopName: user.shopName, language: user.language,
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = findUser(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user._id, name: user.name, email: user.email,
        shopName: user.shopName, language: user.language,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getProfile = async (req, res) => {
  const user = findUser(req.user.email);
  if (user) {
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

const updateProfile = async (req, res) => {
  try {
    const user = findUser(req.user.email);
    if (!user) return res.status(404).json({ message: "User not found" });
    
    user.name = req.body.name || user.name;
    user.shopName = req.body.shopName || user.shopName;
    user.language = req.body.language || user.language;
    user.phone = req.body.phone || user.phone;
    if (req.body.password) user.password = await bcrypt.hash(req.body.password, 12);
    
    const updated = createUser(user);
    const { password, ...updatedWithoutPassword } = updated;
    
    res.json({
      ...updatedWithoutPassword,
      token: generateToken(updated._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { register, login, getProfile, updateProfile };
