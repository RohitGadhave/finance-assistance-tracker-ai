import Joi from "joi";

export const userSchema = Joi.object({
  // username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  userId:Joi.string()
});
