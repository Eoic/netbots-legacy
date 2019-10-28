import mongoose from "mongoose";

export const mongoConnect = mongoose.connect(process.env.MONGO_URI as string, {
  useNewUrlParser: true,
});
