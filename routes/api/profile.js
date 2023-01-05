import express from "express"
import User from "../../models/User.js"
import Profile from "../../models/Profile.js"
import { authenticate_data } from "../../config/passport.js"
import normalizeUrl from "normalize-url"
const router = express.Router()

router.get("/", async (req, res) => {
  try {
    let profile = await Profile.find({}).populate("user", ["name", "avatar"])
    return res.status(200).json(profile)
  } catch (error) {
    return res.status(404).json("errors comes from server")
  }
})

router.get("/user/:userId", async (req, res) => {
  try {
    let profile = await Profile.find({ user: req.params.userId })
    return res.status(200).json(profile)
  } catch (error) {
    return res.status(404).json("errors comes from server")
  }
})
router.get("/", authenticate_data, async (req, res) => {
  try {
    let errors = {}
    let profile = await Profile.findOne({ user: req.user.id })
    if (!profile) {
      errors.noProfile = "profile not found"
      return res.status(404).json(errors)
    }
    return res.json(profile)
  } catch (error) {
    return res.status(400).json(error)
  }
})
router.post("/", authenticate_data, async (req, res) => {
  const {
    website,
    youtube,
    twitter,
    instagram,
    linkedin,
    facebook,
    // spread the rest of the fields we don't need to check
    ...rest
  } = req.body
  let skillset = req.body.skills?.split(",").map((skill) => skill)
  let profileFields = {
    user: req.user.id,
    website: website !== "" ? normalizeUrl(website, { forceHttps: true }) : "",
    website: website,
    skills: skillset,
    ...rest,
  }
  const socialFields = { youtube, twitter, instagram, linkedin, facebook }
  for (const [key, value] of Object.entries(socialFields)) {
    console.log(value)
    if (value && value.length >= 0) {
      socialFields[key] = normalizeUrl(value, { forceHttps: true })
      //console.log((socialFields[key] = value))
    }
  }
  profileFields.social = socialFields
  try {
    // Using upsert option (creates new doc if no match is found):
    let profile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $set: profileFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    )
    return res.json(profile)
  } catch (err) {
    console.error(err.message)
    return res.status(500).send("Server Error")
  }
})

router.post("/experience", authenticate_data, async (req, res) => {
  let profileMatch = await Profile.findOne({ user: req.user.id })
  if (!profileMatch) {
    return res.status(500).send("No User Found")
  } else {
    const { title, company, description, to, from } = req.body

    profileMatch.experience.unshift({ title, company, description, to, from })
    await profileMatch.save()
    return res.json(profileMatch)
  }
})

router.post("/education", authenticate_data, async (req, res) => {
  let profileMatch = await Profile.findOne({ user: req.user.id })
  if (!profileMatch) {
    return res.status(500).send("No User Found")
  } else {
    const { school, degree, fieldofstudy, from } = req.body
    profileMatch.education.unshift({ school, degree, fieldofstudy, from })
    await profileMatch.save()
    return res.status(200).json(profileMatch)
  }
})

router.delete("/education/:edu_id", authenticate_data, async (req, res) => {
  let profileMatch = await Profile.findOne({ user: req.user.id })
  profileMatch.education = profileMatch.education.filter((fill) => {
    return fill._id.toString() !== req.params.edu_id
  })
  await profileMatch.save()
  return res.json(profileMatch)
})

router.delete("/experience/:exp_id", authenticate_data, async (req, res) => {
  let profileMatch = await Profile.findOne({ user: req.user.id })
  profileMatch.experience = profileMatch.experience.filter((fill) => {
    return fill._id.toString() !== req.params.edu_id
  })
  await profileMatch.save()
  return res.json(profileMatch)
})

export default router
