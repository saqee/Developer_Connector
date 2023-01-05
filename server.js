import express from "express"
import dotenv from "dotenv"
import users from "./routes/api/users.js"
import posts from "./routes/api/posts.js"
import profile from "./routes/api/profile.js"
import { db } from "./config/db.js"
import passport from "passport"

dotenv.config()
const app = express()
db()

app.use(express.json())

app.use("/api/users", users)
app.use("/api/posts", posts)
app.use("/api/profile", profile)
app.listen(process.env.PORT, () => {
  console.log("server")
})
