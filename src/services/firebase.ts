import * as admin from "firebase-admin";
import { MulticastMessage } from "firebase-admin/messaging";
import * as path from "path";

// Path to your service account key file
const serviceAccountPath = path.join(__dirname, "firebase_service_account.json");
const PROJECT_ID = "betting-msgs";

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(require(serviceAccountPath)),
  });
}
  
async function sendNotificationToUser(user, messageData) {
    if (!user || !user.device_tokens || user.device_tokens.length === 0) {
      return { error: "User has no device tokens or is invalid." };
    }
  
    const { title, body } = messageData;
    const message: MulticastMessage = {
        notification: { title, body },
        tokens: user.device_tokens,
      };
  
    try {
      const response = await admin.messaging().sendEachForMulticast(message);
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