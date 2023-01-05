import validator from "validator"
import { isEmpty } from "./isEmpty.js"
export function validation(data) {
  let errors = {}
  data.name = !isEmpty(data.name) ? data.name : ""
  data.email = !isEmpty(data.email) ? data.email : ""
  data.password = !isEmpty(data.password) ? data.password : ""
  data.password2 = !isEmpty(data.password) ? data.password : ""
  if (!validator.isLength(data.name, { min: 2, max: 30 })) {
    errors.name = "name must be greater than two"
  }

  if (!validator.isEmail(data.email)) {
    errors.email = "email field invalid"
  }
  if (validator.isEmpty(data.email)) {
    errors.email = "email field required"
  }
  if (validator.isEmpty(data.password)) {
    errors.password = "password field required"
  }
  if (!validator.isLength(data.password, { min: 2, max: 30 })) {
    errors.password = "password must be greater than two"
  }
  if (!validator.equals(data.password, data.password2)) {
    errors.password = "password not match"
  }
  return {
    errors,
    isValid: isEmpty(errors),
  }
}
