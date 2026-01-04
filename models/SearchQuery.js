import mongoose from "mongoose";

const SearchQuerySchema = new mongoose.Schema({
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
  resultsCount: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("SearchQuery", SearchQuerySchema);
