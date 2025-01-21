import { Schema } from "mongoose";

export type UserInt = {
  _id: Schema.Types.ObjectId;
  fullName: string;
  email: string;
  password: string;
  refreshToken?: string
  deviceToken?: string[];
  role: roleInt;
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

export type SessionInt = {
    userId: Schema.Types.ObjectId; // Reference to the user
    name: string; // Name of the client
    age: number; // Age of the client
    contact: string; // Contact number of the client
    residence: string; // Residence of the client
    maritalStatus: maritalStatusInt; // Enum for marital status
    reason: reasonInt; // Enum for reason of session
    additionalInfo?: string; // Optional field for additional case details
    date: Date; // Date of the session
    startTime: string; // Start time of the session
    endTime: string; // End time of the session
    status: statusInt; // Enum for status of the session
    startedAt?: Date; // Start time of the session
  }

export type ChatInt = {
    sessionId: Schema.Types.ObjectId; // Reference to the session
    sender: string; // ID of the sender
    text: string; // Message text
    timestamp: Date; // Timestamp of the message
  };

export enum maritalStatusInt {
    SINGLE = "Single",
    MARRIED = "Married",
    DIVORCED = "Divorced",
  }

export enum reasonInt {
    PERSONAL = "Personal Growth",
    RELATIONSHIP = "Relationship Issues",
    EDUCATION = "Educational Issues",
    OTHERS = "Others",
  }

export enum statusInt {
  PENDING = "Pending",
  STARTED = "Started",
  COMPLETED = "Completed",
  CANCELLED = "Cancelled",
}

export enum roleInt {
  ADMIN = "Admin",
  USER = "User",
}