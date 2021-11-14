const mongoose = require("mongoose");

const user = new mongoose.Schema({
  active: {type: Boolean, default:true},
  activation_code: {type: String},
  email: {type: String, unique: true},
  password: {type: String},
  token: {type: String},

  first_name: {type: String},
  last_name: {type: String},

  driver: mongoose.Schema.Types.Mixed,
  rider: mongoose.Schema.Types.Mixed,

})
//test model:



module.exports = mongoose.model("user", user);
