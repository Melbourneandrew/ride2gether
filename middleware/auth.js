const jwt = require("jsonwebtoken");
require('dotenv').config();
const TOKEN_HASH = process.env.TOKEN_HASH;


const verifyJWT = async function(req,res,next){
  //Different ways tokens can be sent.
  const token =
  req.body.token || req.query.token || req.header("x-access-token");
  const email =
  req.body.email || req.query.email;

  try {
    const decodedToken = await jwt.verify(token, TOKEN_HASH);

    if(!decodedToken.email == email) throw "token and user do not match";
    next();
  } catch (e) {
    console.log("Token auth error: "+e);
    res.status(400).send("JWT error")
  }
}

module.exports = verifyJWT;
