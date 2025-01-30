import { Request, Response } from "express";
import Session from "../models/session";
import { predefinedTimeSlots } from "../utils/helpers";
import { statusInt } from "../interface";

export const createSession = async (
  req: Request,
  res: Response
): Promise<Response> => {
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
    console.log(date);
    const dateOnly = new Date(new Date(date).toISOString().split("T")[0]);

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
      message: "Session created successfully.",
      session,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        message: "An error occurred while creating the session.",
        error,
      });
  }
};

export const getAvailableSlots = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required." });
    }

    // Get all sessions for the given date
    const sessions = await Session.find({ date: new Date(date as string) });

    // Get predefined time slots
    const timeSlots = predefinedTimeSlots();

    // Filter out booked slots
    const availableSlots = timeSlots.filter((slot) => {
      return !sessions.some(
        (session) =>
          session.startTime === slot.startTime &&
          session.endTime === slot.endTime
      );
    });

    return res.status(200).json({ availableSlots });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        message: "An error occurred while fetching available slots.",
        error,
      });
  }
};

export const getUserSessions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    const sessions = await Session.find({ userId });

    return res.status(200).json({ sessions });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({
        message: "An error occurred while fetching user sessions.",
        error,
      });
  }
};

export const updateSession = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    if (Object.keys(req.body).length === 0) {
      return res.status(400).json({
        message: "Data to update can not be empty!",
      });
    }
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required." });
    }

    await Session.findByIdAndUpdate(sessionId, req.body).then((data) => {
      if (!data) {
        return res.status(400).json({
          message: `Cannot update Session with id=${sessionId}. Maybe Session was not found!`,
        });
      } else
        res.status(200).json({ message: "Session was updated successfully." });
    });
  } catch (err) {
    console.log(err.message);
    res.json("error");
  }
};

export const getSessionStatus = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required." });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    const userId = req.user?.userID;
    if (session.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to access this session." });
    }

    // Check if the session is currently active
    const now = new Date();
    const isSessionActive =
      now >= new Date(session.startTime) && now <= new Date(session.endTime);

    return res.status(200).json({
      isSessionActive,
      sessionDetails: {
        sessionId: session._id,
        startTime: session.startTime,
        endTime: session.endTime,
        userId: session.userId,
      },
    });
  } catch (error) {
    console.error("Error fetching session status:", error);
    return res
      .status(500)
      .json({
        message: "An error occurred while checking session status.",
        error,
      });
  }
};

export const startSession = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { sessionId } = req.body;

    // Validate input
    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required." });
    }

    // Fetch session from the database
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found." });
    }

    const userId = req.user?.userID;
    if (session.userId.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to start this session." });
    }

    const now = new Date();
    console.log({now})
const sessionStartTime = new Date(`${session.date}T${session.startTime}`);
    console.log({sessionStartTime})
const sessionEndTime = new Date(`${session.date}T${session.endTime}`);
    console.log({sessionEndTime})

const isSessionActive = now >= sessionStartTime && now <= sessionEndTime;

    if (!isSessionActive) {
      return res
        .status(400)
        .json({
          message: "You can only start the session during the scheduled time.",
        });
    }

    if (session.status === statusInt.STARTED) {
      return res
        .status(400)
        .json({ message: "The session has already been started." });
    }

    // Start the session
    session.status = statusInt.STARTED;
    session.startedAt = now;
    await session.save();

    return res.status(200).json({
      message: "Session started successfully.",
      sessionDetails: {
        sessionId: session._id,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        startedAt: session.startedAt,
      },
    });
  } catch (error) {
    console.error("Error starting session:", error);
    return res
      .status(500)
      .json({
        message: "An error occurred while starting the session.",
        error,
      });
  }
};
