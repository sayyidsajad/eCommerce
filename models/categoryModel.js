const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true,
  },
  description:{
    type:String,
    required:true
  }
});

module.exports = mongoose.model("Category", categorySchema);