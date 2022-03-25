var express = require('express');
var router = express.Router();
const userHelper = require("../helper/userHelper");
const generateToken = require("../helper/generateToken")
const md5 = require("md5")
const utils = require("../src/utils")

router.get('/', function (req, res, next) {
  res.send('respond with a resource test again updated');
});

router.get('/check-token', async function (req, res) {
  let scheme = req.headers.authorization.split(" ")[0]
  let token = req.headers.authorization.split(" ")[1]
  console.log(scheme, "     \n", token)
  const checkToken = await utils.verifyJwtToke(token)
})

router.post('/register-user', async function (req, res) {
  let response = await userHelper.registerUser(req.body)
  if (response == "email exist") {
    res.send({
      success: false,
      status: 409,
      message: "Email already exists! Please try another.",
    })
  }
  else if (response?.email) {
    let token = await generateToken(response)
    res.status(200).send({
      success: true,
      token: token,
      data: response
    })
  }
  else {
    res.send({
      status: false,
      message: response,
      status: 403
    })
  }
})

router.post('/login-user', async function (req, res) {
  let user = {
    email: req.body.email,
    password: md5(req.body.password)
  }
  let response = await userHelper.loginUser(user)
  if (response?.email) {
    let token = await generateToken(response)
    res.send({
      success: true,
      data: response,
      token: token,
    })
  }
  else {
    res.send({
      message: "Invalid email or password",
      success: false,
      status: 401
    })
  }
});

router.post('/update-account', async function (req, res) {
  let token = req.headers.authorization.split(" ")[1]
  let verifyToken = await utils.verifyJwtToke(token)
  if (verifyToken?.data) {
    let user_id = verifyToken?.data?.[0]?._id
    let response = await userHelper.updateAccount(user_id, req.body)
    if (response?._id) {
      res.status(200).send({
        success: true,
        data: response
      })
    }
    else {
      res.status(401).send({
        success: false,
        message: response
      })
    }
  }
  else {
    res.status(401).send({
      success: false,
      message: 'Invalid token'
    })
  }
});

router.get('/get-account', async function (req, res) {
  let token = req.headers.authorization.split(" ")[1]
  if (token) {
    let verifyToken = await utils.verifyJwtToke(token)
    if (verifyToken?.data) {
      let user_id = verifyToken?.data?.[0]?._id
      let response = await userHelper.getAccount(user_id)
      if (response?._id) {
        let token = await generateToken(response)
        res.status(200).send({
          success: true,
          data: response,
          token: token
        })
      }
      else {
        res.status(401).send({
          success: false,
          message: response
        })
      }
    }
    else {
      res.status(401).send({
        success: false,
        message: 'Invalid token'
      })
    }
  }
  else {
    res.status(401).send({
      success: false,
      message: 'Invalid token'
    })
  }
});

router.post('/social-auth', async function (req, res) {
  let response = await userHelper.socialSignup(req.body)
  if (response?.[0]?.email) {
    let token = await generateToken(response)
    res.status(200).send({
      success: true,
      token: token,
      data: response?.[0]
    })
  }
  else {
    res.send({
      status: false,
      message: response,
      status: 403
    })
  }
})

module.exports = router;
