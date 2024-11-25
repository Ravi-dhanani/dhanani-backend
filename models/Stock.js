const mongoose = require("mongoose");

const stockSchema = new mongoose.Schema({
  merchant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Merchant",
    required: true,
  },
  stockName: { type: String, required: true },
  totalStock: { type: Number, required: true },
  totalStockPrice: { type: Number, required: true },
  givenStock: { type: Number, default: 0 },
  stockPrice: { type: Number, required: true },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  history: [
    {
      date: { type: Date, default: Date.now },
      givenStock: Number,
      remainingStock: Number,
      totalStockPrice: Number,
    },
  ],
  time: { type: Date, default: Date.now },
});
stockSchema.pre("save", function (next) {
  this.totalStockPrice = this.totalStock * this.stockPrice; // Calculate and store total stock price
  next();
});

module.exports = mongoose.model("Stock", stockSchema);
