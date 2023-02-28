
const conn = require("../dbConnection/db");
const ObjectId = require('mongodb').ObjectId;
const md5 = require('md5');
const moment = require('moment')
const utils = require("../src/utils")

module.exports = {

  registerUser: (user) => {
    return new Promise(async (resolve, reject) => {
      let dbo = await conn;
      dbo.collection("users").find({ email: user.email }).toArray(async function (err, res) {
        if (res.length > 0) {
          resolve("email exist")
        }
        else {
          let userObject = utils.userObject()
          let password = user.password
          password = md5(password)
          delete user["password"]
          userObject.password = password
          userObject.email = user.email
          userObject.login_type = user.login_type
          userObject.account_state = "onboard"
          userObject.created_at = moment().toISOString()
          userObject.updated_at = moment().toISOString()
          dbo.collection("users").insertOne(userObject, function (err, resp) {
            if (err) {
              resolve("Something went wrong")
            }
            else {
              dbo.collection("users").findOne({ _id: new ObjectId(resp.insertedId) }, { projection: { password: 0 } }, async function (err1, result) {
                if (err1) {
                  resolve("Something went wrong")
                }
                else {
                  resolve(result)
                }
              })
            }
          })
        }
      });
    })
  },


  loginUser: (user) => {
    return new Promise(async (resolve, reject) => {
      let dbo = await conn;
      dbo.collection("users").findOne(user, { projection: { password: 0 } }, async function (err, result) {
        if (err) {
          reject("Invalid email or password!")
        }
        else {
          resolve(await result)
        }
      })
    })
  },

  updateAccount: (userId, data) => {
    return new Promise(async (resolve, reject) => {
      let dbo = await conn;
      data["updated_at"] = moment().toISOString()
      dbo.collection("users").updateOne({ _id: new ObjectId(userId) }, { $set: data }, function (err, res) {
        if (err) {
          resolve(err)
        }
        else {
          dbo.collection("users").findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } }, async function (err1, result) {
            if (err1) {
              resolve("Something went wrong")
            }
            else {
              resolve(result)
            }
          })
        }
      })
    })
  },

  getAccount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let dbo = await conn;
      dbo.collection("users").findOne({ _id: new ObjectId(userId) }, { projection: { password: 0 } }, async function (err, result) {
        if (err) {
          resolve(err)
        }
        else {
          resolve(await result)
        }
      })
    })
  },

  socialSignup: (user) => {
    return new Promise(async (resolve, reject) => {
      let dbo = await conn;
      dbo.collection("users").find({ email: user.email }).toArray(async function (err, res) {
        console.log('vvv   ', res)
        if (res.length > 0) {
          resolve(res)
        }
        else {
          let userObject = utils.userObject()
          userObject.email = user.email
          userObject.login_type = user.login_type
          userObject.user_name = user.username
          userObject.account_state = "onboard"
          userObject.profile_picture = user.profile_picture
          userObject.created_at = moment().toISOString()
          userObject.updated_at = moment().toISOString()
          dbo.collection("users").insertOne(userObject, function (err, resp) {
            if (err) {
              resolve("Something went wrong")
            }
            else {
              dbo.collection("users").findOne({ _id: new ObjectId(resp.insertedId) }, { projection: { password: 0 } }, async function (err1, result) {
                if (err1) {
                  resolve("Something went wrong")
                }
                else {
                  resolve([result])
                }
              })
            }
          })
        }
      });
    })
  },

  recoverPassword: (email) => {
    return new Promise(async (resolve, reject) => {
      let dbo = await conn;
      console.log(email)
      dbo.collection("users").findOne({ email: email }, async function (err, result) {
        if (result) {
          let subject = "Recover Password"
          const link = `https://regan-hiller-5521.netlify.app/?id=${result._id}`;
          sendEmail(email, subject, link)
          dbo.collection("users").updateOne({ email: email }, { $set: { updatedAt: moment().toISOString() } })
          resolve("Email Sent!")
        }
        else {
          resolve("Email does not exist!")
        }
      })
    })
  },

  updateProfile: (user) => {
    return new Promise(async (resolve, reject) => {
      let dbo = await conn;
      var myquery = { _id: new ObjectId(user._id) };
      delete user["_id"]
      user["updatedAt"] = moment().toISOString()
      var newvalues;
      console.log("ddd   ", user.password)
      if (user.password == "") {
        delete user["password"]
      }
      else {
        user.password = md5(user.password)
      }
      console.log("USER   ", user)
      newvalues = { $set: user };
      dbo.collection("users").updateOne(myquery, newvalues, function (err, res) {
        if (err) {
          resolve(err)
        }
        else {
          dbo.collection("users").findOne(myquery, { projection: { password: 0 } }, async function (err, result) {
            if (err) {
              resolve("Data fetching error!")
            }
            else {
              resolve(await result)
            }
          })
        }
      })
    })
  },

  updatePassword: (data) => {
    return new Promise(async (resolve, reject) => {
      let dbo = await conn;
      dbo.collection("users").findOne({ _id: new ObjectId(data._id) }, { projection: { updatedAt: 1 } }, async function (error, result) {
        var prevDate = moment(result.updatedAt).toISOString()
        var currentDate = moment().toISOString()
        var difference = moment(currentDate).diff(prevDate)
        var minutes = moment.duration(difference).asMinutes()
        if (minutes <= 20) {
          let pass = md5(data.password)
          newValue = {
            password: pass,
            updatedAt: moment().toISOString()
          }
          dbo.collection("users").updateOne({ _id: new ObjectId(data._id) }, { $set: newValue }, function (err, res) {
            if (err) {
              resolve("Something went wrong")
            }
            else {
              resolve("Password Updated!")
            }
          })
        }
        else {
          resolve("Link expired!")
        }
      })
    })
  },

  deleteAccount: (userId) => {
    return new Promise(async (resolve, reject) => {
      let dbo = await conn;
      dbo.collection("users").deleteOne({ _id: new ObjectId(userId) }, function (err, res) {
        if (err) {
          resolve(err)
        }
        else {
          resolve(res)
        }
      })
    })
  },

  getUserEmails: () => {
    return new Promise(async (resolve, reject) => {
      let dbo = await conn;
      dbo.collection("users").find({},{projection: {email: 1, _id: 0}}).toArray(function(err, result) {
        if (err) {
          reject(err)
        }
        else{
          resolve(result)
        }
      });
    })
  },

}