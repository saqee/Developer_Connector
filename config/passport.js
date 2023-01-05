/* import passportjwt from "passport-jwt"
import passport from "passport"
import { ExtractJwt, Strategy } from "passport-jwt"
import User from "../models/User.js"
var opts = {}

opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken()
opts.jwtFromRequest = function (req) {
  var token = null
  if (req && req.headers) {
    token = req.headers.authorization
  }
  return token
}
opts.secretOrKey = "secret"

export const passportToken = () => {
  console.log(
    passport.use(
      new passportjwt.Strategy(opts, function (jwt_payload, done) {
        console.log(opts, jwt_payload)
        User.findOne({ id: jwt_payload.id }, function (err, user) {
          if (err) {
            return done(err, false)
          }
          if (user) {
            console.log(user)
            return done(null, user)
          } else {
            return done(null, false)
            // or you could create a new account
          }
        })
      })
    )
  )
}
 */

import Jwt from "jsonwebtoken"
import User from "../models/User.js"
export async function authenticate_data(req, res, next) {
  let token
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]
    if (!token) {
      console.log("no token")
    }
    let docoded = Jwt.verify(token, process.env.SECRET)
    console.log(docoded.id)
    req.user = await User.findById(docoded.id).select("-password")
  }
  next()
}
