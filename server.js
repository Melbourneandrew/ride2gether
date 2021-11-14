require('dotenv').config();
const express = require('express');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const cors = require('cors')


const userRouter = require("./routes/user-routes.js")
const postRouter = require("./routes/post-routes.js")
const User = require("./models/user-model.js")
const db = require("./database.js")

const TOKEN_HASH = process.env.TOKEN_HASH;
const DB_URI = process.env.DB_URI;

//connect to mongodb
db.connect(DB_URI);

const app = express();
app.use(express.json());
app.use(cors());
//Routes for user registration, login, and designating driver and rider information
app.use('/user', userRouter);
//Users interacting with posts. Includes making, getting, deleting,
app.use('/post', postRouter);


var port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server running on port: ${port}`)
});
