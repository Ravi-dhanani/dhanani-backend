const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const authRoutes = require("./routes/auth");
const merchantRoutes = require("./routes/merchant");
const stockRoutes = require("./routes/stock");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5353;

// Middleware
app.use(bodyParser.json());
app.use(cors());
app.get("/", (req, res) => {
  res.send("Hello World");
});
// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection failed:", err));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.use("/api/auth", authRoutes);
app.use("/api/merchants", merchantRoutes);
app.use("/api/stocks", stockRoutes);
