const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    phone_number: {
      type: Number,
      required: true,
    },
    address: [
      {
        name: {
          type: String,
        },
        housename: {
          type: String,
        },
        city: {
          type: String,
        },
        state: {
          type: String,
        },
        phone: {
          type: Number,
        },
        pincode: {
          type: Number,
        },
      },
    ],
    password: {
      type: String,
      required: true,
    },
    confirm_password: {
      type: String,
      required: true,
    },
    verified: {
      type: Boolean,
    },
    wallet: {
      type: Number,
      default: 0,
    },
    walletHistory: [
      {
        date: {
          type: Date,
        },
        amount: {
          type: Number,
        },
        description: {
          type: String,
        },
      },
    ],
    blocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
