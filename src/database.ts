import mongoose from "mongoose";

export const mongoConnect = (uri: string): Promise<typeof mongoose> => {
  return mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
};
