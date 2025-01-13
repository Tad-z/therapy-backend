import { sendNotificationToUser } from "../services/firebase";

export const notifySpecificUsers = async (users: any[], messageData) => {
    const results = [];
  
    for (const user of users) {
      try {
        const result = await sendNotificationToUser(user, messageData);
        
        results.push({
          userId: user._id.toString(),
          email: user.email,
          ...result
        });
      } catch (error) {
        console.error(`Error sending notification to user ${user._id}:`, error);
        results.push({
          userId: user._id?.toString() || 'unknown',
          email: user.email || 'unknown',
          error: error.message
        });
      }
    }
  
    return results;
  };