import { Schema } from "mongoose";

export type UserInt = {
  fullName: string;
  email: string;
  password: string;
  refreshToken: string
  deviceToken: string[];
};

export type DecodedTokenInt = {
    fullName: string;
    userID: string;
    email: string,
  }