const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true 
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true 
    },
    img: {
        type: String,
        default: `01_profile_default.jpg`
    },
    role: {
        type: String,
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const User = mongoose.model('User', userSchema); // สร้าง Model ชื่อ User
module.exports = User; // export Model เพื่อให้ไฟล์อื่นนำไปใช้ได้