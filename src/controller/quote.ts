import Quote from "../models/quote";
import { Request, Response } from "express";

export const postQuote = async (req: Request, res: Response) => {
    try {
        const { text } = req.body;
        if (!text) {
            return res.status(400).json({ message: "Quote text is required." });
        }

        const quote = new Quote({ text });
        await quote.save();

        return res.status(201).json({ message: "Quote posted successfully." });
    } catch(error) {
        console.error("Error posting quote:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}

export const getQuotes = async (req: Request, res: Response) => {
    try {
        const quotes = await Quote.find();
        return res.status(200).json({ quotes });
    } catch(error) {
        console.error("Error getting quotes:", error);
        return res.status(500).json({
            message: "Internal server error",
            error: error.message,
        });
    }
}