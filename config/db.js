import mongoose from "mongoose"

export function db() {
  mongoose
    .connect(process.env.URL)
    .then(() => {
      console.log("database connected")
    })
    .catch((error) => console.log(error))
}
