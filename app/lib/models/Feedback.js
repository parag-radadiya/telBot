import mongoose from "mongoose";

const FeedbackSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  rating: { type: Number, required: true },
  timestamp: { type: Date, default: Date.now },
});

export default mongoose.models.Feedback || mongoose.model("Feedback", FeedbackSchema);
