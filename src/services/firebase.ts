import * as admin from "firebase-admin";
import { MulticastMessage } from "firebase-admin/messaging";
import * as path from "path";
import { NotificationDataInt, UserInt } from "../interface";
import Notification from "../models/notification";

// Path to your service account key file


// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: "therapy-notis",
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      clientEmail: "firebase-adminsdk-98wj9@therapy-notis.iam.gserviceaccount.com"
    })
  });
}
  
async function sendNotificationToUser(user: UserInt, messageData: NotificationDataInt) {
    if (!user || !user.deviceToken || user.deviceToken.length === 0) {
      return { error: "User has no device tokens or is invalid." };
    }

    if (!messageData.title || !messageData.body) {
      return { error: "Message title and body are required." };
    }
  
    const { title, body } = messageData;
    const message: MulticastMessage = {
        notification: { title, body },
        tokens: user.deviceToken,
      };
  
    try {
      const response = await admin.messaging().sendEachForMulticast(message);
      if (response.successCount > 0) {
        const notification = new Notification({
          userId: user._id,
          title,
          body,
        });
        const result = await notification.save();
        if (!result) {
          console.error("Error saving notification to database");
        }
        console.log("Notification saved to database:", result);
      }
      return {
        success_count: response.successCount,
        failure_count: response.failureCount,
        message: "Notifications processed",
      };
    } catch (error) {
      console.error("Error sending notification:", error);
      return { error: error.message };
    }
  }

export { sendNotificationToUser };