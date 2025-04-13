const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected!");
  } catch (error) {
    console.error("MongoDB Connection Error:", error.message);
    process.exit(1); // Dừng server nếu kết nối thất bại
  }
};

module.exports = connectDB;