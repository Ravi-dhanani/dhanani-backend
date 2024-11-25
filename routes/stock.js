const express = require("express");
const Stock = require("../models/Stock");
const auth = require("../middlewares/auth");
const router = express.Router();

router.post("/add", auth, async (req, res) => {
  const { merchant, stockName, totalStock, stockPrice } = req.body;
  try {
    const stock = new Stock({
      merchant,
      stockName,
      totalStock,
      totalStockPrice: totalStock * stockPrice,
      stockPrice,
      givenStock: 0,
      admin: req.user.id,
      history: [
        {
          givenStock: 0,
          remainingStock: totalStock,
          totalStockPrice: totalStock * stockPrice,
        },
      ],
      time: new Date(),
    });
    await stock.save();
    res.status(201).json({ data: stock, message: "Stock added successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/list", auth, async (req, res) => {
  try {
    const query = req.user.role === "superAdmin" ? {} : { admin: req.user.id };
    const stocks = await Stock.find(query).populate("merchant");

    const response = stocks.map((stock) => {
      const availableStock = stock.totalStock - stock.givenStock;
      const totalValue = stock.totalStockPrice;
      const givenValue = stock.givenStock * stock.stockPrice;
      const availableValue = availableStock * stock.stockPrice;

      return {
        stockName: stock.stockName,
        merchant: stock.merchant,
        totalStock: stock.totalStock,
        givenStock: stock.givenStock,
        availableStock,
        stockPrice: stock.stockPrice,
        totalValue,
        givenValue,
        availableValue,
        history: stock.history,
        time: stock.time,
      };
    });

    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put("/update/:id", auth, async (req, res) => {
  const { givenStock, stockPrice } = req.body;

  try {
    const stock = await Stock.findOne({
      history: {
        $elemMatch: {
          _id: req.params.id,
        },
      },
    });

    if (!stock) {
      return res.status(404).json({ error: "Stock not found" });
    }

    let updatedTotalPrice = stock.stockPrice;
    if (stockPrice && stockPrice !== stock.stockPrice) {
      updatedTotalPrice = stockPrice;
    }

    const totalGivenStock = stock.givenStock + givenStock;

    if (totalGivenStock > stock.totalStock) {
      return res.status(400).json({
        error: "Cannot give more stock than the total available stock",
      });
    }

    const remainingStock = stock.totalStock - totalGivenStock;

    stock.givenStock = totalGivenStock;
    stock.stockPrice = updatedTotalPrice;
    stock.totalStockPrice = stock.totalStock * stock.stockPrice;
    stock.time = new Date();

    stock.history.push({
      givenStock,
      remainingStock,
      totalStockPrice: remainingStock * updatedTotalPrice,
      date: new Date(),
    });

    await stock.save();

    res.json({ data: stock, message: "Stock updated successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id);
    if (!stock) {
      return res.status(404).json({ error: "Stock not found" });
    }

    if (stock.givenStock > 0) {
      return res.status(400).json({
        error: "Cannot delete stock with given stock",
      });
    }

    await Stock.findByIdAndDelete(req.params.id);
    res.json({ message: "Stock deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const stock = await Stock.findById(req.params.id).populate("merchant");
    if (!stock) {
      return res.status(404).json({ error: "Stock not found" });
    }

    const availableStock = stock.totalStock - stock.givenStock;
    const availableValue = availableStock * stock.stockPrice;
    const totalValue = stock.totalStockPrice;

    const response = {
      stockName: stock.stockName,
      merchant: stock.merchant,
      totalStock: stock.totalStock,
      givenStock: stock.givenStock,
      availableStock,
      stockPrice: stock.stockPrice,
      totalValue,
      availableValue,
      history: stock.history,
      time: stock.time,
    };

    res.json(response);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
