const mongoose = require("mongoose");

const rider_post = new mongoose.Schema({
  poster_email:{type: String},
  poster_name:{type: String},
  note:{type: String},
  pickup:{type: String},
  dropoff:{type: String},
  gas_money:{type: Number},
  date:{type: String},
  post_id:{type: String, unique:true},
  ride_taken:{type: Boolean, default:false},
})

module.exports = mongoose.model("rider_post", rider_post);
