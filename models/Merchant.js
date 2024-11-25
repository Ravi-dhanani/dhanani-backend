const mongoose = require("mongoose");

const merchantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 10,
    validate: {
      validator: function (v) {
        return /^\d{10}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid mobile number!`,
    },
  },
  email: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: (props) => `${props.value} is not a valid email address!`,
    },
  },
  address: {
    type: String,
    required: true,
    trim: true,
  },
  adharCard: {
    type: String,
    required: true,
    minlength: 12,
    maxlength: 12,
    validate: {
      validator: function (v) {
        return /^\d{12}$/.test(v);
      },
      message: (props) => `${props.value} is not a valid Aadhaar card number!`,
    },
  },
  photos: {
    type: String,
  },
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("Merchant", merchantSchema);
