import { Request, Response } from 'express';
import Session from '../models/session';
import { predefinedTimeSlots } from '../utils/helpers';

export const createSession = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      name,
      age,
      contact,
      residence,
      maritalStatus,
      reason,
      additionalInfo,
      date,
      startTime,
      endTime,
    } = req.body;

    const userId = req.user.userID;
    const dateOnly = new Date(new Date(date).toISOString().split('T')[0]);

    // Create and save the session
    const session = new Session({
      userId,
      name,
      age,
      contact,
      residence,
      maritalStatus,
      reason,
      additionalInfo,
      date: dateOnly,
      startTime,
      endTime,
    });

    await session.save();

    return res.status(201).json({
      message: 'Session created successfully.',
      session,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while creating the session.', error });
  }
};

export const getAvailableSlots = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: 'Date is required.' });
    }

    // Get all sessions for the given date
    const sessions = await Session.find({ date: new Date(date as string) });

    // Get predefined time slots
    const timeSlots = predefinedTimeSlots();

    // Filter out booked slots
    const availableSlots = timeSlots.filter((slot) => {
      return !sessions.some(
        (session) =>
          session.startTime === slot.startTime && session.endTime === slot.endTime
      );
    });

    return res.status(200).json({ availableSlots });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching available slots.', error });
  }
};

export const getUserSessions = async (req: Request, res: Response): Promise<Response> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: 'User ID is required.' });
    }

    const sessions = await Session.find({ userId });

    return res.status(200).json({ sessions });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching user sessions.', error });
  }
};

export const updateSession = async (req: Request, res: Response): Promise<Response> => {
    try {
        if (Object.keys(req.body).length === 0) {
          return res.status(400).json({
            message: "Data to update can not be empty!",
          });
        }
        const { sessionId } = req.params;

        if (!sessionId) {
            return res.status(400).json({ message: 'Session ID is required.' });
        }

        await Session.findByIdAndUpdate(sessionId, req.body).then((data) => {
          if (!data) {
            return res.status(400).json({
              message: `Cannot update Session with id=${sessionId}. Maybe Session was not found!`,
            });
          } else res.status(200).json({ message: "Session was updated successfully." });
        });
      } catch (err) {
        console.log(err.message);
        res.json("error");
      }
    }
