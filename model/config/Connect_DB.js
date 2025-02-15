const mongoose = require('mongoose');
require('dotenv').config(); 
const db_url = "mongodb+srv://itkingzer:Wave0950955834@ifacesvc.rdufv.mongodb.net/?retryWrites=true&w=majority&appName=ifacesvc";
const dbURI = process.env.DB_URI;
// ฟังก์ชันสำหรับเชื่อมต่อ MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(dbURI, {
            serverSelectionTimeoutMS: 5000, // Timeout หากไม่สามารถเชื่อมต่อภายใน 5 วินาที
        });
        console.log("Connected to MongoDB successfully");
    } catch (err) {
        console.error("Error connecting to MongoDB:", err.message);
        process.exit(1); // หยุดการทำงานหากเชื่อมต่อไม่ได้
    }
};

module.exports = connectDB;
