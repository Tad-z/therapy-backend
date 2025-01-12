import express from "express";
import { DecodedTokenInt } from "../../interface";

declare global {
  namespace Express {
    interface Request {
      user?: DecodedTokenInt;
    }
  }
}