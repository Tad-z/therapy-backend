import jwt from "jsonwebtoken";

export const generateAccessToken = (user: any, jwtKey: string) => {
    return jwt.sign(
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
  };
  
export const generateRefreshToken = (user: any, jwtKey: string) => {
    return jwt.sign(
      {
        userID: user._id,
      },
      jwtKey,
      {
        expiresIn: "7d",
      }
    );
  };