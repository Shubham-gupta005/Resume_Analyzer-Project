const mongoose = require("mongoose");

/**
 * Establishes connection to the MongoDB database.
 * Uses MONGO_URI from environment variables or defaults to a local instance.
 */
const connectDB = async () => {
  const mongoUri =
    process.env.MONGO_URI || "mongodb://localhost:27017/resume-analyzer";

  try {
    await mongoose.connect(mongoUri);
    console.log("Successfully connected to MongoDB.");
  } catch (error) {
    console.error("Database connection failed:", error);
    // Exit the process with failure if DB connection is vital to startup
    process.exit(1);
  }
};

module.exports = connectDB;
