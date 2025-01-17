import { Request, Response } from 'express';
import Session from '../models/session';
import { predefinedTimeSlots } from '../utils/helpers';

export const createSession = async (req: Request, res: Response): Promise<Response> => {
  try {
    const {
      userId,
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

    const dateOnly = new Date(date.toISOString().split('T')[0]);

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
      dateOnly,
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

