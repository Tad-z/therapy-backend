import mongoose, { Model, Schema } from 'mongoose';
import { NotificationInt } from '../interface';

// Create a Mongoose schema
const notificationSchema: Schema<NotificationInt> = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  readStatus: {
    type: Boolean,
    default: false
  },
});

// Define and export the User model
const Notification: Model<NotificationInt> = mongoose.model<NotificationInt>('Notification', notificationSchema);
export default Notification;