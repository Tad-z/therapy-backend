import User from "../models/user";
import { Request, Response } from 'express';
import { sendNotificationToUser } from "../services/firebase";

export const broadcast = async (req: Request, res: Response) => {
    try {
      const message = req.body;
  
      // Find all users with device tokens
      const users = await User.find({ deviceToken: { $exists: true } });
  
      if (!users || users.length === 0) {
        return res.status(404).json({ message: 'No users found.' });
      }
  
      const results = [];
      
      for (const user of users) {
        const result = await sendNotificationToUser(
          user,
          { title: message.title, body: message.body }
        );
  
        results.push({
          userId: user._id.toString(),
          email: user.email,
          ...result
        });
      }
  
      return res.status(200).json({
        message: 'Notifications sent to all users.',
        results
      });
  
    } catch (error) {
      console.error('Error broadcasting notification:', error);
      return res.status(500).json({ 
        message: 'Internal server error',
        error: error.message 
      });
    }
  };