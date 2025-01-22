import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user";
import { generateAccessToken, generateRefreshToken } from "../logic/user";
import { roleInt } from "../interface";
import cloudinary from "../services/cloudinary";

const validateEmail = (email: string): boolean => {
  const regex = new RegExp(
    "([a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)"
  );
  const testEmail = regex.test(email);
  return testEmail;
};

export const createUser = async (req: Request, res: Response) => {
  if (!req.body) {
    return res.status(400).json({
      message: "Missing required fields",
    });
  }

  if (validateEmail(req.body.email) === false) {
    return res.status(401).json({
      message: "Email Address is not valid",
    });
  }

  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      return res.status(409).json({
        message: "User already exists",
      });
    }
    let role = req.body.role;


    if (role && !Object.values(roleInt).includes(role)) {
      return res.status(400).json({ error: "Invalid role provided" });
    }


    role = role || roleInt.PATIENT;
    bcrypt.hash(req.body.password, 10, async (err, hash) => {
      if (err) {
        console.log(err);
      } else {
        const newUser = new User({
          fullName: req.body.fullName.toLowerCase(),
          email: req.body.email,
          password: hash,
          role,
        });

        try {
          const result = await newUser.save();

          if (result) {
            console.log(result);
            res.status(200).json({
              result,
              message: "You have signed up successfully",
            });
          } else {
            console.log("Error occurred");
            res.status(400).json({
              message: "An error occurred",
            });
          }
        } catch (error) {
          console.log(error);
          res.status(500).json({
            message: "Internal server error",
          });
        }
      }
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await User.find();
    res.status(200).json({
      users,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const addUserImage = async (req: Request, res: Response) => {
  try {
    const userId  = req.user?.userID;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        message: "Image is required",
      });
    }

    const user = await User.findById(userId).exec();
    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const fileStr = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

    // Upload to cloudinary
    const result = await cloudinary.uploader.upload(fileStr);

    // Update user image
    user.image = result.secure_url;
    await user.save();

    return res.status(200).json({
      message: "Image updated successfully",
      image: user.image
    });

  } catch (error) {
    console.error("Error updating image:", error);
    return res.status(500).json({
      message: "Error updating image",
      error: error.message
    });
  }
};


    

export const logIn = async (req: Request, res: Response) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    }).exec();
    if (!user) {
      return res.status(401).json({
        message: `email or password is incorrect`,
      });
    }
    const result = await bcrypt.compare(req.body.password, user.password);
    if (!result) {
      return res.status(401).json({
        message: `email or password incorrect`,
      });
    } else if (result) {
      const jwtKey = process.env.JWT_KEY;
      if (!jwtKey) {
        throw new Error("JWT secret key is missing in environment variables.");
      }
      const accessToken = generateAccessToken(user, jwtKey);
      const refreshToken = generateRefreshToken(user, jwtKey);

      // Store refreshToken in the database or a secure storage
      user.refreshToken = refreshToken;
      await user.save();

      return res.status(200).json({
        message: `Authentication successful`,
        accessToken: accessToken,
        refreshToken: refreshToken,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json({
      message: "Refresh token is required",
    });
  }

  try {
    const jwtKey = process.env.JWT_KEY;
    if (!jwtKey) {
      throw new Error("JWT secret key is missing in environment variables.");
    }

    const decoded = jwt.verify(token, jwtKey) as any;
    const user = await User.findById(decoded.userID).exec();
    if (!user || user.refreshToken !== token) {
      return res.status(403).json({
        message: "Invalid refresh token",
      });
    }

    const newAccessToken = generateAccessToken(user, jwtKey);
    const newRefreshToken = generateRefreshToken(user, jwtKey);

    // Update refreshToken in the database or secure storage
    user.refreshToken = newRefreshToken;

    // Update device tokens
    const deviceToken = req.body.deviceToken;
    if (deviceToken && !user.deviceToken.includes(deviceToken)) {
      user.deviceToken.push(deviceToken);
    }

    await user.save();

    return res.status(200).json({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    });
  } catch (error) {
    console.log(error);
    return res.status(403).json({
      message: "Invalid refresh token",
    });
  }
};
