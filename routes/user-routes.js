require('dotenv').config();
const express = require('express');
const bcrypt = require("bcryptjs");
const userRouter = express.Router();
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
const nodemailer = require('nodemailer');


const TOKEN_HASH = process.env.TOKEN_HASH;

const User = require("../models/user-model.js")
const authJWT = require("../middleware/auth.js")

userRouter.post('/register', async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    if (!(email && password)) {
      res.status(400).send("Register input not complete {email,pword}").end();
    }

    //verify that the email is from UTDallas
    // const em = email.toLowerCase().split('@');
    // if (em[1] != 'utdallas.edu') {
    //   res.status(400).send("utdallas.edu email required").end();
    // }

    //User already exists. 409 conflict with target resource
    const userCheck = await User.findOne({
      email
    });
    if (userCheck) {
      return res.status(409).send('user already exists').end();
    }

    //Generate password
    const hashedPword = await bcrypt.hash(password, 10);

    //Generate token
    const token = await jwt.sign({
      email: email
    }, TOKEN_HASH);

    //generate activation code
    const activationCode = await crypto.randomBytes(128)
      .toString('hex')
      .slice(0, 128);
    //send activation email
    await sendActivationEmail(activationCode, email);
    //Save user
    const user = await User.create({
      activation_code: activationCode,
      email: email.toLowerCase(),
      password: hashedPword,
      token: token,
    });

    res.status(201).json(user).end();
  } catch (err) {
    console.log("Register error: " + err);
    res.status(500).send(err).end();
  }
})

userRouter.get("/activate/:code", async (req, res) => {
  try {
    const activationCode = req.params.code;
    const user = await User.findOne({
      activation_code: activationCode
    });
    user.active = true;
    user.save();
    res.status(200).send("User activated").end();
  } catch (e) {
    console.log("User activation error: " + e);
    res.status(500).send("User activation failed").end();
  }
})


userRouter.post("/login", async (req, res) => {
  try {
    console.log("New login from: " + req.body.email);
    const email = req.body.email;
    const password = req.body.password;

    if (!(email && password)) {
      res.status(400).send("Login input not complete {email,pword}").end();
    }

    //find user record
    const user = await User.findOne({
      email
    });
    if (!user) {
      console.log("User record could not be located (login)");
      res.status(501).send("User record could not be located (login)");
    }

    const correctPassword = await bcrypt.compare(password, user.password);
    console.log(correctPassword);

    //password is correct
    if (correctPassword) {
      const token = jwt.sign({
        email: email
      }, TOKEN_HASH);
      user.token = token;
      user.save(); //Adds token to user record in DB
      res.status(200).json(token);
    } else {
      //password is incorrect
      res.status(400).send("Wrong password").end();
    }

  } catch (err) {
    console.log(err);
    res.status(500).send(err).end();
  }
})

// //TODO: Add auth
userRouter.post('/new-driver', async (req, res) => {
  try {
    const driver = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      dl_number: req.body.dl_number,
      lp_number: req.body.lp_number,
      car: req.body.car,
      car_seats: req.body.car_seats,
      email: req.body.email,
    }

    const email = driver.email;
    const user = await User.findOne({
      email
    });
    //check that user is activated
    if(!user.active) throw "Driver not active";
    user.first_name = driver.first_name;
    user.last_name = driver.last_name;
    user.driver = driver;
    user.save();
    res.status(200).send("Driver record has been created").end();

  } catch (e) {
    console.log("Create driver error: "+e)
    res.status(500).send("Driver record could not be created: "+e).end();
  }
});

//TODO: Add auth
userRouter.post('/new-rider', async (req, res) => {
  try {
    const rider = {
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      email: req.body.email,
    }
    const email = rider.email;
    const user = await User.findOne({
      email:email
    });
    if(!user) throw "user not found";
    user.first_name = rider.first_name;
    user.last_name = rider.last_name;
    user.rider = rider;
    user.save();
    res.status(200).send("Rider record has been created").end();

  } catch (e) {
    console.log("New Rider error: "+e)
    res.status(500).send("Rider record could not be created").end();
  }

});

module.exports = userRouter;




async function sendActivationEmail(code, email) {

  const verifyMessage = `Click the link to verify: https://ride-2gether.herokuapp.com/user/activate/${code}`
  // const verifyMessage = `Click the link to verify: http://localhost:3000/user/activate/${code}`
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ride2getherutd@gmail.com',
      pass: 'Switzerland123!'
    }
  });

  const mailOptions = {
    from: 'ride2getherUTD@gmail.com',
    to: email,
    subject: 'Verify your Ride-2gether account!',
    text: verifyMessage
  };

  transporter.sendMail(mailOptions, function(error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}



/*
Routes:

/user/Register
req: {email, password}
res: 200, user (with token)

/user/login
req: {email, password}
res: 200, user (with token)

/user/new-Driver
req: {firstName, lastName, dlNumber, lpNumber}
res: 200

/
*/
