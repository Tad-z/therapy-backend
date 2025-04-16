import e, { Request, Response } from "express";
import Session from "../models/session";
import { predefinedTimeSlots } from "../utils/helpers";
import { roleInt, statusInt } from "../interface";
import User from "../models/user";

export const createSession = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const {
      therapistId,
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

    // Basic field validation
    if (!therapistId || !name || !age || !contact || !residence || !maritalStatus || !reason || !date || !startTime || !endTime) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Validate date formats
    const parsedDate = new Date(date);
    const parsedStartTime = new Date(startTime);
    const parsedEndTime = new Date(endTime);

    if (isNaN(parsedDate.getTime()) || isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
      return res.status(400).json({
        message: "Invalid date or time format",
      });
    }

    // Check if date is in the future
    if (parsedDate < new Date()) {
      return res.status(400).json({
        message: "Session date must be in the future",
      });
    }

    const userId = req.user.userID;

    const session = new Session({
      userId,
      therapistId,
      name,
      age,
      contact,
      residence,
      maritalStatus,
      reason,
      additionalInfo,
      date: parsedDate,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
    });

    await session.save();

    return res.status(201).json({
      message: "Session created successfully.",
      session,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while creating the session.",
      error,
    });
  }
};

// export const getAvailableSlots = async (
//   req: Request,
//   res: Response
// ): Promise<Response> => {
//   try {
//     const { date } = req.query;

//     if (!date) {
//       return res.status(400).json({ message: "Date is required." });
//     }

//     // Get all sessions for the given date
//     const sessions = await Session.find({ date: new Date(date as string) });

//     // Get predefined time slots
//     const timeSlots = predefinedTimeSlots();

//     // Filter out booked slots
//     const availableSlots = timeSlots.filter((slot) => {
//       return !sessions.some(
//         (session) =>
//           session.startTime === slot.startTime &&
//           session.endTime === slot.endTime
//       );
//     });

//     return res.status(200).json({ availableSlots });
//   } catch (error) {
//     console.error(error);
//     return res.status(500).json({
//       message: "An error occurred while fetching available slots.",
//       error,
//     });
//   }
// };

export const getAvailableSlots = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const { date, therapistId } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required." });
    }

    if (!therapistId) {
      return res.status(400).json({ message: "Therapist ID is required." });
    }

    const dateStr = date as string;
    const dateOnlyStr = new Date(dateStr).toISOString().split("T")[0]; // "YYYY-MM-DD"

    const startOfDay = new Date(`${dateOnlyStr}T00:00:00.000Z`);
    const endOfDay = new Date(`${dateOnlyStr}T23:59:59.999Z`);

    // Fetch sessions for the given therapist and date
    const sessions = await Session.find({
      therapistId,
      startTime: { $gte: startOfDay, $lte: endOfDay },
    });


    const timeSlots = predefinedTimeSlots();

    // Filter out slots that are already booked by the therapist
    const availableSlots = timeSlots.filter((slot) => {
      const slotStart = new Date(`${dateOnlyStr}T${slot.startTime}:00Z`);
      const slotEnd = new Date(`${dateOnlyStr}T${slot.endTime}:00Z`);

      return !sessions.some((session) => {
        const sessionStartUTC = new Date(session.startTime).getTime();
        const sessionEndUTC = new Date(session.endTime).getTime();
        return (
          sessionStartUTC === slotStart.getTime() &&
          sessionEndUTC === slotEnd.getTime()
        );
      });
    });

    return res.status(200).json({ availableSlots });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while fetching available slots.",
      error,
    });
  }
};

export const getAllSessions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    const sessions = await Session.find();
    // Fetch therapist details for each session
    const sessionsWithTherapistDetails = await Promise.all(
      sessions.map(async (session) => {
        const therapist = await User.findById(session.therapistId);
        return {
          ...session.toObject(),
          therapistDetails: therapist
            ? {
                fullName: therapist.fullName,
                email: therapist.email,
              }
            : null,
        };
      })
    );

    return res.status(200).json({ sessions: sessionsWithTherapistDetails });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while fetching all sessions.",
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

    const userSessions = await Session.find({ userId });

    // Fetch therapist details for each session
    const userSessionsWithTherapistDetails = await Promise.all(
      userSessions.map(async (session) => {
        const therapist = await User.findById(session.therapistId);
        return {
          ...session.toObject(),
          therapistDetails: therapist
            ? {
                fullName: therapist.fullName,
                email: therapist.email,
              }
            : null,
        };
      })
    );

    return res.status(200).json({ sessions: userSessionsWithTherapistDetails });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
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
    const { sessionId } = req.params;
    const updateData = req.body;

    // Validate input
    if (!sessionId) {
      return res.status(400).json({ 
        message: "Session ID is required." 
      });
    }

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        message: "Data to update cannot be empty!"
      });
    }

    // Handle date fields if present
    if (updateData.startTime) {
      updateData.startTime = new Date(updateData.startTime);
    }
    if (updateData.endTime) {
      updateData.endTime = new Date(updateData.endTime);
    }
    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    const session = await Session.findByIdAndUpdate(
      sessionId,
      updateData,
      { new: true } // Return updated document
    );

    if (!session) {
      return res.status(404).json({
        message: `Session with id=${sessionId} not found`
      });
    }

    return res.status(200).json({
      message: "Session updated successfully",
      session
    });

  } catch (error) {
    console.error("Update session error:", error);
    return res.status(500).json({
      message: "An error occurred while updating the session",
      error: error.message
    });
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
    return res.status(500).json({
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

    if (!sessionId) {
      return res.status(400).json({ message: "Invalid Session ID." });
    }

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

    const therapistId = session.therapistId;
    if (!therapistId) {
      return res
        .status(400)
        .json({ message: "Therapist ID is invalid or missing." });
    }
    const therapist = await User.findById(therapistId);
    if (!therapist) {
      return res
        .status(404)
        .json({ message: "Therapist not found for the session" });
    }
    if (therapist.role != roleInt.THERAPIST) {
      return res.status(400).json({ message: "User is not a therapist" });
    }

    // Convert `now` to Nigerian time (Africa/Lagos, UTC+1)
    // const nowUTC = new Date();
    // // const nowNigeria = new Date(nowUTC.toLocaleString("en-US", { timeZone: "Africa/Lagos" }));

    // // The session startTime and endTime are already in Nigerian time
    // const sessionDate = new Date(session.date).toISOString().split("T")[0]; // "YYYY-MM-DD"
    // const sessionStartTime = new Date(`${sessionDate}T${session.startTime}:00`); // Already Nigeria time
    // const sessionEndTime = new Date(`${sessionDate}T${session.endTime}:00`);   // Already Nigeria time
    // const nowUTC = new Date();

    // The session startTime and endTime are already in UTC time
    // const sessionStartTime = new Date(
    //   `${session.date}T${session.startTime}:00`
    // );
    // const sessionEndTime = new Date(`${session.date}T${session.endTime}:00`);

    // console.log({ nowUTC, sessionStartTime, sessionEndTime });

    // if (nowUTC < sessionStartTime || nowUTC > sessionEndTime) {
    //   return res.status(400).json({
    //     message: "You can only start the session during the scheduled time.",
    //   });
    // }
    const nowUTC = new Date();

    const sessionStartTime = new Date(session.startTime); // no need to construct
    const sessionEndTime = new Date(session.endTime);

    console.log({ nowUTC, sessionStartTime, sessionEndTime });

    if (nowUTC < sessionStartTime || nowUTC > sessionEndTime) {
      return res.status(400).json({
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
    session.startedAt = nowUTC;
    await session.save();

    return res.status(200).json({
      message: "Session started successfully.",
      sessionDetails: {
        sessionId: session._id,
        startTime: session.startTime,
        endTime: session.endTime,
        status: session.status,
        startedAt: session.startedAt,
        therapistDetails: {
          therapistId,
          fullName: therapist.fullName,
          email: therapist.email,
        },
      },
    });
  } catch (error) {
    console.error("Error starting session:", error.message);
    return res.status(500).json({
      message: "An error occurred while starting the session.",
      error: error.message,
    });
  }
};

export const deleteAllSessions = async (
  req: Request,
  res: Response
): Promise<Response> => {
  try {
    await Session.deleteMany({});
    return res
      .status(200)
      .json({ message: "All sessions deleted successfully." });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "An error occurred while deleting sessions.",
      error,
    });
  }
};
