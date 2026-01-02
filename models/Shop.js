import mongoose from "mongoose";

const shopSchema = new mongoose.Schema(
  {
    shop: {
      type: String,
      required: true,
      unique: true,
    },
    accessToken: {
      type: String,
      required: true,
    },
    installedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Shop", shopSchema);
