import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  sessionId: {
    type: String,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: "14d",
  },
  deviceInfo: {
    deviceType: {
      type: String,
    },
    deviceId: {
      type: String,
    },
    os: {
      type: String,
    },
    browser: {
      type: String,
    },
  },
});

const Session = mongoose.model("Session", sessionSchema);

export default Session;
