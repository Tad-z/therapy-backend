import mongoose, { Model, Schema } from 'mongoose';
import { roleInt, UserInt } from '../interface';


// Create a Mongoose schema
const userSchema: Schema<UserInt> = new mongoose.Schema({
  image: {
    type: String,
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  refreshToken: {
    type: String,
  },
  deviceToken: {
    type: [String],
  },
  role: {
    type: String,
    enum: roleInt,
    default: roleInt.PATIENT
  }
});

// Define and export the User model
const User: Model<UserInt> = mongoose.model<UserInt>('User', userSchema);
export default User;
