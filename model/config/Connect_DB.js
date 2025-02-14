const mongoose = require('mongoose');

const db_url = "mongodb://127.0.0.1:27017/user";

// ฟังก์ชันสำหรับเชื่อมต่อ MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(db_url, {
            serverSelectionTimeoutMS: 5000, // Timeout หากไม่สามารถเชื่อมต่อภายใน 5 วินาที
        });
        console.log("Connected to MongoDB successfully");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err.message);
        process.exit(1); // หยุดการทำงานหากเชื่อมต่อไม่ได้
    }
};

module.exports = connectDB;
