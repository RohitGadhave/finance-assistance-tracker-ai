import { Request, Response } from "express";
import { UserModel } from "../models/user.model";
import { userSchema } from "../utils/user.validator";
import { config } from "../config/env";
import { generateSignToken } from "../services/jwt.service";

// Create a new user
export const createUser = async (req: Request, res: Response) => {
  try {
    const { error, value } = userSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });
    const data = {
      email: value.email,
      username: value.email.split("@")[0],
      uid: "",
    };
    const user = await UserModel.findOneAndUpdate(
      { email: value.email },
      data,
      {
        upsert: true,
        new: true,
      }
    );
    // if(!user){
    //   const user = new UserModel(data);
    //   await user.save();
    // }
    data.uid = user?._id.toString();
    res.cookie("_UID", JSON.stringify(data), {
      httpOnly: true,
      secure: true, // ensures it's sent only over HTTPS
      sameSite: "strict", // or "Lax" depending on your flow
    });
    const token = generateSignToken(user);
    res.status(201).json({token,user,data});
  } catch (err) {
    res.status(500).json({ error: "Failed to create user", details: err });
  }
};

// Get all users
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await UserModel.find();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users", details: error });
  }
};

// Get user by ID
export const getUserById = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user", details: error });
  }
};

// Update user by ID
export const updateUser = async (req: Request, res: Response) => {
  try {
    const { error, value } = userSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const user = await UserModel.findByIdAndUpdate(req.params.id, value, {
      new: true,
      runValidators: true,
    });
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Failed to update user", details: err });
  }
};

// Delete user by ID
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await UserModel.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user", details: error });
  }
};

export const logout = (req: Request, res: Response) => {
  res.clearCookie(config.cookieUserKey); // name of your cookie
  res.send("Cookie cleared!");
};
