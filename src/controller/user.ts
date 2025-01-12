import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/user"; 

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

    bcrypt.hash(req.body.password, 10, async (err, hash) => {
      if (err) {
        console.log(err);
      } else {
        const newUser = new User({
          fullName: req.body.fullName.toLowerCase(),
          email: req.body.email,
          password: hash,
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
      const token = jwt.sign(
        {
          fullName: user.fullName,
          userID: user._id,
          email: user.email
        },
        jwtKey,
        {
          expiresIn: "1h",
        }
      );
      return res.status(200).json({
        message: `Authentication successful`,
        token: token,
      });
    }
    return res.status(401).json({
      message: `email or password incorrect`,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "Internal server error",
    });
  }
};