const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // เชื่อมโยงกับโมเดล User
        required: true
    },
    title: {
        type: String,
        required: true
    },
    description: String,
    img: String, // ชื่อไฟล์รูปภาพที่โพสต์
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // รายชื่อผู้ที่กดไลค์
    comments: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // ผู้เขียนคอมเมนต์
            comment: { type: String, required: true }, // เนื้อหาคอมเมนต์
            createdAt: { type: Date, default: Date.now }, // เวลาที่คอมเมนต์ถูกโพสต์
        },
    ],
}, { timestamps: true });

const Post = mongoose.model('Post', postSchema);
module.exports = Post;
