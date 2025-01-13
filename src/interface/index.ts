import { Schema } from "mongoose";

export type UserInt = {
  _id: Schema.Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  refreshToken?: string
  deviceToken?: string[];
};

export type DecodedTokenInt = {
    fullName: string;
    userID: string;
    email: string,
  }

  export type NotificationInt = {
    _id: Schema.Types.ObjectId;
    userId: Schema.Types.ObjectId;
    title: string;
    body: string;
    readStatus: boolean
  };

  export type NotificationDataInt = {
    title: string;
    body: string;
  };