require('dotenv').config();
const express = require('express');
const postRouter = express.Router();
const crypto = require('crypto');

const DriverPostModel = require("../models/driver-post-model.js");
const RiderPostModel = require("../models/rider-post-model.js");
const UserModel = require("../models/user-model.js");
const authJWT = require("../middleware/auth.js")

// POST /make-post
// POST /delete-post
// GET /get-posts
// POST /confirm-ride

postRouter.post('/make-post', async (req,res) =>{
  try {
    const postContent = {
      email: req.body.email,
      note: req.body.note,
      pickup: req.body.pickup,
      dropoff: req.body.dropoff,
      gas_money: req.body.gasMoney,
      date: req.body.date,
    }
    //validate driver before making post
    const email = postContent.email;
    const user = await UserModel.findOne({email});
    if(!user) res.status(400).send("Could not find user "+postContent.email).end();

    //determine if its a driver or rider posting
    if(user.driver) makeDriverPost(postContent, user, res);
    else if(user.rider) makeRiderPost(postContent, user, res);
  } catch (e) {
    console.log("Make post error: "+e);
    res.status(500).send(e).end();
  }

})

postRouter.post('/delete-post', async (req,res) =>{
  try {
    const deleteReq = {
      email: req.body.email,
      postID: req.body.post_id,
    }
    //validate deleter before deleting post
    const email = deleteReq.email;
    const user = await UserModel.findOne({email:email});
    if(!user) res.status(400).send("Could not find user "+deleteReq.email).end();

    if(user.driver){
      const post = await DriverPostModel.findOne({post_id:deleteReq.postID})
      if(!post) throw "Could not find post"
      if(post.poster_email == user.email){
        await DriverPostModel.deleteOne({post_id:deleteReq.postID})
      }
    }else if(user.rider){
      const post = await RiderPostModel.findOne({post_id:deleteReq.postID})
      if(!post) throw "Could not find post"
      if(post.poster_email == user.email){
        await RiderPostModel.deleteOne({post_id:deleteReq.postID})
      }
    }

  } catch (e) {
    console.log("Delete post error: "+e)
    res.status(500).send(e).end();
  }
})

postRouter.get('/get-posts', async(req,res)=>{
  try {
    const viewer = {
      email: req.body.email,
    }
    const user = await UserModel.findOne({email: viewer.email});
    if(user.driver){
      //rider posts for drivers
      const posts = await RiderPostModel.find();
      res.json(posts);
    }else if(user.rider){
      //driver posts for riders
      const posts = await DriverPostModel.find();
      res.json(posts);
    }
  } catch (e) {
    console.log("Error serving posts: "+e);
    res.status(500).send("Could not retrieve posts: "+e).end();

  }
})

postRouter.post('/confirm-ride', async(req,res)=>{
  try {
    const email = req.body.email;
    const postId = req.body.post_id;

    var post = await DriverPostModel.findOne({post_id:postId});
    //if a rider is interacting with a drivers post
    if(post){
      //track seats left in drivers car
      post.car_seats_taken += 1;
      if(post.car_seats_taken >= post.car_seats)
        post.ride_taken = true;
      post.save();
      //TODO: Logic to notify driver that someone has taken his ride
    }else if(!post){
      //if a driver is interacting with a riders post
      post = await RiderPostModel.findOne({post_id:postId});
      post.ride_taken=true;
    }

    res.status(200).send("Ride confirmed").end();
  } catch (e) {
    console.log("Take ride error: "+e);
    res.status(500).send("Could not confirm ride: "+e).end()
  }
})

async function makeDriverPost(content, user, res){
  try {
    //generate unique post ID
    const postID = await crypto.randomBytes(128)
      .toString('hex')
      .slice(0, 128);
    const name = user.first_name + " " + user.last_name;
    const car = user.driver.car + " " + user.driver.lp_number;
    const post = await DriverPostModel.create({
      post_id: postID,
      poster_email: content.email,
      poster_name: name,
      note: content.note,
      pickup: content.pickup,
      dropoff: content.dropoff,
      gas_money: content.gas_money,
      date: content.date,
      car: car,
    });
    res.status(200).send("Driver post made successfully").end();
  } catch (e) {
    console.log("Make driver post error: "+e);
    res.status(500).send(e).end();
  }
}

async function makeRiderPost(content, user, res){
  try {
    //generate unique post ID
    const postID = await crypto.randomBytes(128)
      .toString('hex')
      .slice(0, 128);
    const name = user.first_name + " " + user.last_name;
    const post = await RiderPostModel.create({
      post_id: postID,
      poster_email: content.email,
      poster_name: name,
      note: content.note,
      pickup: content.pickup,
      dropoff: content.dropoff,
      gas_money: content.gas_money,
      date: content.date,
    });
    res.status(200).send("Rider post made successfully").end();
  } catch (e) {
    console.log("Make rider post error: "+e);
    res.status(500).send(e).end();
  }
}

module.exports = postRouter;
