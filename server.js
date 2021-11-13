require('dotenv').config();
const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const userRoutes = require("./middleware/user-routes.js")
const User = require("./models/user-model.js")

const TOKEN_HASH = process.env.TOKEN_HASH;

//connect to db
mongoose
  .connect(process.env.DB_URI)
  .then(() => {
    console.log("DB connected");
  })
  .catch((err) => {
    console.log("DB connection failed: error " + err);
    process.exit(1);
  })

const app = express();
app.use(express.json());
app.use('/user', userRoutes)


var port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running on port: ${port}`)
});
