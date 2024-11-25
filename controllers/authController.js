const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  const { username, password, role } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({ username, password: hashedPassword, role });
    await user.save();
    if (role === "admin") {
      res
        .status(201)
        .json({ message: "Admin register successfully", Admin: user });
    } else {
      res
        .status(201)
        .json({ message: "Super Admin register successfully", Admin: user });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );
    if (user.role === "admin") {
      res.status(200).json({
        token: token,
        message: "Admin Sign in successfully",
        admin: user,
      });
    } else {
      res.status(200).json({
        token: token,
        message: "Super Admin Sign in successfully",
        admin: user,
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
