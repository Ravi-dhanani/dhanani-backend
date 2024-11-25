const express = require("express");
const Merchant = require("../models/Merchant");
const Stock = require("../models/Stock");
const auth = require("../middlewares/auth");
const router = express.Router();

router.post("/add", auth, async (req, res) => {
  try {
    const existingMerchant = await Merchant.findOne({
      $or: [
        { name: req.body.name },
        { mobile: req.body.mobile },
        { adharCard: req.body.adharCard },
      ],
    });

    if (existingMerchant) {
      return res.status(400).json({
        error:
          "Merchant with the same name and mobile number or Aadhaar card already exists.",
      });
    }

    const merchant = new Merchant({
      ...req.body,
      admin: req.user.id,
    });
    await merchant.save();
    res
      .status(201)
      .json({ data: merchant, message: "Merchant added successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
router.get("/list", auth, async (req, res) => {
  const merchants = await Merchant.find();
  res.json(merchants);
});

router.put("/:id", auth, async (req, res) => {
  try {
    const updated = await Merchant.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    res.json({ data: updated, message: "Merchant updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const stocks = await Stock.find({ merchant: req.params.id });

    if (stocks.length > 0) {
      return res.status(400).json({
        error: "Cannot delete merchant. Associated stocks exist.",
      });
    }

    await Merchant.findByIdAndDelete(req.params.id);
    res.json({ message: "Merchant deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
