const mongoose = require("mongoose");

const driver_post = new mongoose.Schema({
  poster_email:{type: String},
  poster_name:{type: String},
  car:{type:String},
  car_seats:{type: Number, default: 3},
  car_seats_taken:{type: Number, default: 0},
  note:{type: String},
  pickup:{type: String},
  dropoff:{type: String},
  gas_money:{type: Number},
  date:{type: String},
  post_id:{type: String, unique:true},
  ride_taken:{type: Boolean, default:false},
})
module.exports = mongoose.model("driver_post", driver_post);
