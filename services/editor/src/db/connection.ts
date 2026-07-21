import mongoose from "mongoose";
import { DB_NAME } from "../config/constants.js";
import { config } from "../config/env.js";

const connectDB = async () => {
  try {
    await mongoose.connect(config.MONGODB_URL!, {
      dbName: DB_NAME,
    });
    console.log("🟢 Connected to MongoDB");
  } catch (error) {
    console.log("🔴 Error connecting to MongoDB:", error);
    process.exit(1);
  }
};

export { connectDB };
