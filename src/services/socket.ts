import { Server, Socket } from "socket.io";
import mongoose from "mongoose";
import Session from "../models/session";
import { roleInt, statusInt } from "../interface";
import Chat from "../models/chat";
import User from "../models/user";

export const setupSocket = (io: Server) => {
  io.use(async (socket, next) => {
    const sessionId = socket.handshake.query.sessionId as string;
    const userId = socket.handshake.query.userId as string;

    try {
      const [session, user] = await Promise.all([
        Session.findById(sessionId).exec(),
        User.findById(userId).exec(),
      ]);

      if (!session || !user) {
        return next(
          new Error("Authentication error: User or session not found")
        );
      }

      if (Date.now() >= new Date(session.endTime).getTime()) {
        return next(new Error("Authentication error: The session has ended."));
      }

      const isTherapist = user.role === roleInt.THERAPIST;
      const isPatient = !user.role || user.role === roleInt.PATIENT;

      if (!isTherapist && !isPatient) {
        return next(new Error("Authentication error: Unauthorized user"));
      }

      if (session.status !== statusInt.STARTED) {
        return next(new Error("Authentication error: Session not active"));
      }

      socket.data.session = session;
      socket.data.user = user;
      socket.data.isTherapist = isTherapist;
      next();
    } catch (error) {
      console.error("Authentication error:", error);
      return next(new Error("Authentication error"));
    }
  });

  io.on("connection", (socket) => {
    const { session, user, isTherapist } = socket.data;
    const role = isTherapist ? "Therapist" : "Patient";

    console.log(`${role} connected to session: ${session._id}`);
    socket.join(session._id.toString());

    // Handle session timer
    const remainingTime = Math.max(0, session.endTime.getTime() - Date.now());
    socket.emit("session_timer", { remainingTime });

    // Set up a periodic check for session end
    const sessionEndCheckInterval = setInterval(() => {
      if (Date.now() >= session.endTime.getTime()) {
        clearInterval(sessionEndCheckInterval); // Clear the interval to stop further checks
        io.to(session._id.toString()).emit("session_ended", {
          message: "The session has ended.",
        });
      }
    }, 1000); // Check every second

    socket.on("reconnect", () => {
      console.log(`User reconnected: ${socket.data.user._id}`);
    });

    socket.on("send_message", async (data) => {
      if (Date.now() >= session.endTime.getTime()) {
        return socket.emit("error", {
          message: "Cannot send messages. The session has ended.",
        });
      }
      const { text } = data;

      if (typeof text !== "string" || !text.trim()) {
        return socket.emit("error", { message: "Invalid message text." });
      }

      try {
        const message = {
          sessionId: session._id,
          senderId: user._id,
          senderName: user.fullName,
          text,
          timestamp: new Date(),
        };

        await Chat.create(message);
        io.to(session._id.toString()).emit("receive_message", message);
      } catch (error) {
        console.error("Error saving message:", error);
        socket.emit("error", { message: "Failed to send message." });
      }
    });

    // Broadcast typing status
    socket.on("typing", ({ sessionId }) => {
      socket.to(sessionId).emit("user_typing", {
        userId: user._id,
        name: user.fullName,
      });
    });

    socket.on("stop_typing", ({ sessionId }) => {
      socket.to(sessionId).emit("user_stopped_typing", { userId: user._id });
    });

    socket.on("disconnect", () => {
      if (!session || !user) {
        console.error("User or session missing during disconnect.");
        return;
      }
      clearInterval(sessionEndCheckInterval);
      console.log(`User disconnected from session: ${session._id}`);
      socket.to(session._id.toString()).emit("user_disconnected", {
        userId: user._id,
        role,
        timestamp: new Date(),
      });
    });
  });
};
