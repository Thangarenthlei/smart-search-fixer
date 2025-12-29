import mongoose from "mongoose";

const SearchQuerySchema = new mongoose.Schema(
  {
    store_id: { type: String, required: true },
    query: { type: String, required: true },
    total_searches: { type: Number, default: 0 },
    zero_result_count: { type: Number, default: 0 },
    last_searched_at: { type: Date },
    status: { type: String, default: "open" }
  },
  { timestamps: true }
);

SearchQuerySchema.index(
  { store_id: 1, query: 1 },
  { unique: true }
);

export default mongoose.model("SearchQuery", SearchQuerySchema);
