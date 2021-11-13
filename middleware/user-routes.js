require('dotenv').config();
const express = require('express');
const bcrypt = require("bcryptjs");
const userRouter = express.Router();
const jwt = require("jsonwebtoken");
const crytpo = require('crypto');
const nodemailer = require('nodemailer');


const TOKEN_HASH = process.env.TOKEN_HASH;

const User = require("../models/user-model.js")

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
userRouter.post('/user/register', async (req, res) => {
  try {
    const {
      email,
      password
    } = req.body;
    email = email.toLowerCase();

    if (!(email && password)) {
      res.status(400).send("Register input not complete {email,pword}");
    }

    const em = email.split('@');
    if(em[1] != 'utdallas.edu'){
      res.status(400).send("utdallas.edu email required");
    }

    //User already exists. 409 conflict with target resource
    const userCheck = await User.findOne({
      email
    });
    if (userCheck) {
      return res.status(409).send('user already exists');
    }

    //Generate password
    hashedPword = await bcrypt.hash(password, 10);

    //Generate token
    const token = await jwt.sign({
      email: email
    }, TOKEN_HASH);

    //send Activation Email
    sendActivationEmail(email);
    //Save user
    const user = await User.create({
      active: false,
      activation_code: activationCode,
      email: email.toLowerCase(),
      password: hashedPword,
      token: token,
    });

    res.status(201).json(user);
  } catch (err) {
    console.log("Register error: " + err);
    res.status(500).send(err);
  }
})

userRouter.get("/activate/:code", async(req,res) => {
    try {
      const activationCode = req.params.code;
      const user = await User.findOne({activationCode});
      user.active = true;
      user.save();
      res.status(200).send("User activated");
    } catch (e) {
      console.log("User activation error: "+e);
      res.status(500).send("User activation failed");
    }
})


userRouter.post("/login", async (req, res) => {
  try {
    console.log("New login from: " + req.body.email);
    const {
      email,
      password
    } = req.body;

    if (!(email && password)) {
      res.status(400).send("Login input not complete {email,pword}");
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
      res.status(200).json(user);
    } else {
      //password is incorrect
      res.status(400).send("Wrong password");
    }




  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
})
//
// //TODO: Add auth
userRouter.post('/new-driver', async (req, res) => {
  try {
    const driver = {
      first_name: firstName,
      last_name: lastName,
      dl_number: dlNumber,
      lp_number: lpNumber,
      car: car,
      email: email,
    }

    const user = await User.findOne({
      email
    });
    user.first_name = driver.first_name;
    user.last_name = driver.last_name;
    user.driver = driver;
    user.save();
    res.status(200).send("Driver record has been created")

  } catch (e) {
    res.status(500).send("Driver record could not be created")
  }
});

//TODO: Add auth
userRouter.post('/new-rider', async (req, res) => {
  try {
    const rider = {
      first_name: firstName,
      last_name: lastName,
      email: email,
    }

    const user = await User.findOne({
      email
    });
    user.first_name = rider.first_name;
    user.last_name = rider.last_name;
    user.rider = rider;
    user.save();
    res.status(200).send("Rider record has been created")

  } catch (e) {
    res.status(500).send("Rider record could not be created")
  }

});

module.exports = userRouter;




async function sendActivationEmail(email){
  const activationCode = await crypto.randomBytes(128)
  .toString('hex')
  .slice(0,128);
  const verifyMessage = `Click the link to verify: https://ride-2gether.herokuapp.com/user/activate/${activationCode}`

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

  transporter.sendMail(mailOptions, function(error, info){
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent: ' + info.response);
    }
  });
}
