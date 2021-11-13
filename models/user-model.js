const mongoose = require("mongoose");

const user = new mongoose.Schema({
  email: {type: String, unique: true},
  password: {type: String},
  token: {type: String},

  first_name: {type: String},
  last_name: {type: String},
})

module.exports = mongoose.model("user", user);
