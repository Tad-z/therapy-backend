import mongoose, { Model, Schema } from "mongoose";
import {
  SessionInt,
  maritalStatusInt,
  reasonInt,
  statusInt,
} from "../interface";

// Create a Mongoose schema
const sessionSchema: Schema<SessionInt> = new mongoose.Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    age: {
      type: Number,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    residence: {
      type: String,
      required: true,
    },
    maritalStatus: {
      type: String,
      enum: maritalStatusInt,
      required: true,
    },
    reason: {
      type: String,
      enum: reasonInt,
      required: true,
    },
    additionalInfo: {
      type: String,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: statusInt,
      default: statusInt.PENDING,
    },
    startedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Define and export the Session model
const Session: Model<SessionInt> = mongoose.model<SessionInt>(
  "Session",
  sessionSchema
);
export default Session;
