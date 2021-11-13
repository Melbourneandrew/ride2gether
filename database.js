const mongoose = require("mongoose");
require('dotenv').config();

//connect to db
module.exports.connect = function connect(URI){
  mongoose
    .connect(URI)
    .then(() => {
      console.log("DB connected");
    })
    .catch((err) => {
      console.log("DB connection failed: error " + err);
      process.exit(1);
    })
}
