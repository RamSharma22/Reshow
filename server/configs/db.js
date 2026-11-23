import mongoose from "mongoose";
import "dotenv/config";

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () =>
      console.log("Database connected")
    );
    const mongoUri = process.env.MONGODB_URI.includes("?")
      ? process.env.MONGODB_URI
      : `${process.env.MONGODB_URI.replace(/\/$/, "")}/reshow`;
    await mongoose.connect(mongoUri);
  } catch (error) {
    console.log(error.message);
  }
};

export default connectDB;
