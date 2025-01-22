import mongoose, { Model, Schema } from "mongoose";


const quoteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Quote = mongoose.model("Quote", quoteSchema);
export default Quote;
