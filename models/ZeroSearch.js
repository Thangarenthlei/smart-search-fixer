import mongoose from "mongoose";

const ZeroSearchSchema = new mongoose.Schema({
  shop: {
    type: String,
    required: true,
    index: true,
  },
  query: {
    type: String,
    required: true,
    index: true,
  },
  count: {
    type: Number,
    default: 1,
  },
  lastSeen: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("ZeroSearch", ZeroSearchSchema);
