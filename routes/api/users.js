import express from "express"
import gravatar from "gravatar"
import { validation } from "../../validation/validator.js"
import User from "../../models/User.js"
import bcryptjs from "bcryptjs"
import jwt from "jsonwebtoken"
import passport from "passport"
import { authenticate_data } from "../../config/passport.js"
const router = express.Router()

router.get("/", () => {})

router.post("/register", async (req, res) => {
  try {
    const { email, name, password } = req.body
    const { errors, isValid } = validation(req.body)
    if (!isValid) {
      return res.status(400).json({ errors })
    }
    const userFound = await User.findOne({ email })
    if (userFound) {
      return res.status(400).json({
        message: "already user exits",
      })
    } else {
      const avatar = gravatar.url(
        req.body.email,
        { s: "100", r: "x", d: "retro" },
        true
      )

      const salt = await bcryptjs.genSalt(10)
      const hashPassword = await bcryptjs.hash(password, salt)
      const user = new User({
        name,
        email,
        password: hashPassword,
        avatar,
      })
      await user.save()
      return res.status(200).json(user)
    }
  } catch (error) {
    res.status(400).json({
      message: "registration failed ",
    })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const userFound = await User.findOne({ email })
    if (userFound) {
      const checkInfo = await bcryptjs.compare(password, userFound.password)
      if (checkInfo) {
        const payload = {
          id: userFound._id,
          name: userFound.name,
          avatar: userFound.avatar,
        }
        const token = jwt.sign(payload, process.env.SECRET, {
          expiresIn: "30d",
        })
        res.status(200).json({
          message: "success",
          token,
        })
      }
    } else {
      res.status(400).json({
        message: "user not exits",
      })
    }
  } catch (error) {
    res.status(400).json({
      message: "login failed ",
    })
  }
})

router.get("/current", authenticate_data, (req, res) => {
  const { name, email, _id } = req.user
  return res.status(200).json({
    msg: "success",
    name,
    email,
    id: _id,
  })
})
export default router
