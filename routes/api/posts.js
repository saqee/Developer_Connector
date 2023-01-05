import express from "express"
import { authenticate_data } from "../../config/passport.js"
import User from "../../models/User.js"
import Post from "../../models/Post.js"
const router = express.Router()

//like a post

router.post("/like/:id", authenticate_data, async (req, res) => {
  let postMatch = await Post.findById(req.params.id)

  if (postMatch.likes.length > 0) {
    return res.json("already liked this post")
  } else {
    postMatch.likes = Post({ user: req.user.id })
    await postMatch.save()
    return res.json(postMatch)
  }
})

router.post("/unlike/:id", authenticate_data, async (req, res) => {
  let postMatch = await Post.findById(req.params.id)

  if (!postMatch.likes.some((data) => data.user.toString() == req.user.id)) {
    return res.json("already liked this post")
  }
  postMatch.likes = postMatch.likes.filter((like) => {
    return like.user.toString() !== req.user.id
  })

  await postMatch.save()
  return res.json(postMatch)
})

router.get("/", authenticate_data, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 })
    res.json(posts)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

router.post("/", authenticate_data, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")

    const newPost = new Post({
      text: req.body.text,
      name: user.name,
      avatar: user.avatar,
      user: req.user.id,
    })

    const post = await newPost.save()

    res.json(post)
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})

router.delete("/:id", authenticate_data, async (req, res) => {
  try {
    const matchUser = await User.findById(req.user.id)
    if (!matchUser) {
      res.status(500).send("Server Error")
    } else {
      const posts = await Post.findByIdAndDelete(req.params.id).sort({
        date: -1,
      })
      res.json(posts)
    }
  } catch (err) {
    console.error(err.message)
    res.status(500).send("Server Error")
  }
})
export default router
