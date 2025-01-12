import mongoose, { Model, Schema } from 'mongoose';
import { UserInt } from '../interface';


// Create a Mongoose schema
const userSchema: Schema<UserInt> = new mongoose.Schema({
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
});

// Define and export the User model
const User: Model<UserInt> = mongoose.model<UserInt>('User', userSchema);
export default User;
