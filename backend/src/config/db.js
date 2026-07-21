const mongoose = require("mongoose");

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in .env");
  }
  const conn = await mongoose.connect(process.env.MONGODB_URI);
  console.log(`✅ MongoDB connected: ${conn.connection.host}`);
};

module.exports = connectDB;
