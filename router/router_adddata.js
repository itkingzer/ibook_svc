const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const User = require('../model/User')
const User_Post = require('../model/Post');
const bcrypt = require('bcrypt');
const multer = require('multer');

//multer
const uploadPath1 = path.join(__dirname, '..', 'public', 'asset','img','post_picture'); // ขึ้นไป 1 directory จาก routes

const storage1 = multer.diskStorage({
    destination:function(req,res,cb){
        cb(null,uploadPath1)
    },
    filename:function(req,file,cb){
        cb(null, Date.now()+ ".jpg")//เปลี่ยนชื่อไฟล์ป้องกันซ้ำ
    }
})

const upload = multer({ storage: storage1 });
//อัพโหลดprofile
const uploadPath2 = path.join(__dirname, '..', 'public', 'asset','img','profilepicture'); // ขึ้นไป 1 directory จาก routes

const storage2 = multer.diskStorage({
    destination:function(req,res,cb){
        cb(null,uploadPath2)
    },
    filename:function(req,file,cb){
        cb(null, Date.now()+ ".jpg")//เปลี่ยนชื่อไฟล์ป้องกันซ้ำ
    }
})

const upload2 = multer({ storage: storage2 });

///เพิ่มข้อมูลผู้ใช้
router.post('/insert', async (req, res) => {
    try {
        const user = req.body.name;       // ชื่อผู้ใช้
        const email = req.body.email;     // อีเมล
        const password = req.body.password; // รหัสผ่าน
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // รูปแบบของอีเมล
        // ตรวจสอบค่าว่างสำหรับทุกฟิลด์
        if (!user || user.trim() === '' || 
            !email || email.trim() === '' || 
            !password || password.trim() === '') {
            return res.render('login', { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
        }
        // ตรวจสอบรูปแบบ email
        if (!emailRegex.test(email)) {
            return res.render('login', { error: 'รูปแบบอีเมลไม่ถูกต้อง' });
        }
        // เข้ารหัสรหัสผ่าน
        const saltRounds = 10; 
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // สร้าง User ใหม่
        const newUser = new User({
            username: user,
            email: email,
            password: hashedPassword
        });

        await newUser.save();
        res.redirect('/login');

    } catch (error) {
        console.error("Error inserting product:", error);
        res.status(500).send("Error inserting product. Please try again.");
    }
});

///ประมวลผลตรวจสอบการLogin
router.post('/process_login', async (req, res) => {
    const email = req.body.email;     // อีเมล
    const password = req.body.password; // รหัสผ่าน
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // รูปแบบของอีเมล


    if (!email || email.trim() === '' || !password || password.trim() === '') {
        return res.render('login', { error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    if (!emailRegex.test(email)) {
        return res.render('login', { error: 'รูปแบบอีเมลไม่ถูกต้อง' });
    }

    try {
        // ตรวจสอบว่ามีผู้ใช้ในระบบหรือไม่
        const find_user = await User.findOne({ email: email });
        if (!find_user) {
            return res.render('login', { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
        }

        // ตรวจสอบรหัสผ่าน
        const isPasswordValid = await bcrypt.compare(password, find_user.password);
        if (!isPasswordValid) {
            return res.render('login', { error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
        }

        req.session.userId = find_user._id;
        req.session.username = find_user.username;
        req.session.email = find_user.email;
        req.session.img = find_user.img;
        req.session.createdAt = find_user.createdAt;
        req.session.login = true;

     
        res.redirect('/');
    } catch (err) {
        console.error('Error during login process:', err);
        res.status(500).send('เกิดข้อผิดพลาดในระบบ');
    }
});

///สร้างPost

router.post('/addPost',upload.single('upload_img'), async (req, res) => {
    const { title, description } = req.body;
    const user_id = req.session.userId; // ค่าผู้โพสต์มาจาก session
  
    if (!title ) {
      return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }
  
    try {
      const newPost = new User_Post({
        user_id,
        title,
        description,
        img: req.file ? req.file.filename : null,
      });
  
      await newPost.save(); // บันทึกโพสต์ในฐานข้อมูล
      res.redirect('/'); // หรือส่งกลับผลการทำงาน
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'เกิดข้อผิดพลาดในการสร้างโพสต์' });
    }
  });

  //ไลค์
  router.post('/like/:postId', async (req, res) => {
    const postId = req.params.postId;
    const userId = req.session.userId;

    try {
        const post = await User_Post.findById(postId);

        if (!post) {
            return res.status(404).json({ error: 'โพสต์ไม่พบ' });
        }

        if (post.likes.includes(userId)) {
            // Remove like
            post.likes = post.likes.filter(like => like.toString() !== userId);
        } else {
            // Add like
            post.likes.push(userId);
        }

        await post.save();

        res.json({ likes: post.likes, userId }); // ส่งข้อมูลไลค์กลับไปยัง frontend
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการกดไลค์' });
    }
});

//comment
router.post('/comment/:postid', async (req, res) => {
    const postId  =   req.params.postid
    const comment  =  req.body.comment
    const userId =   req.session.userId;

    if (!userId) {
        return res.status(401).json({ error: "User not authenticated" });
    }

    if (!comment || comment.trim() === "") {
        return res.status(400).json({ error: "Comment cannot be empty" });
    }

    try {
        const post = await User_Post.findById(postId);
        if (!post) {
            return res.status(404).send("Post not found");
        }

        post.comments.push({ userId, comment, createdAt: new Date() });
        await post.save();
        res.redirect(`/`); // หรือ res.json({ success: true });
    } catch (err) {
        console.error("Error saving comment:", err);
        res.status(500).send("Server error");
    }
});
//Update

router.post('/profile/:userid/Save', upload2.single('upload_img'), async (req, res) => {
    const userId = req.params.userid; // รับค่าจาก URL params
    const username = req.body.username;

    if (!userId) {
        return res.render('login');
    }

    if (!username) {
        return res.status(400).json({ error: 'กรุณากรอกข้อมูลให้ครบถ้วน' });
    }

    // กำหนด default image ถ้าไม่มีไฟล์อัปโหลด
    const filename = req.file ? req.file.filename : req.session.img; // ใช้ session img หากไม่มีการอัปโหลดใหม่

    try {
        console.log(req.file);  // ตรวจสอบข้อมูลไฟล์

        // อัปเดตข้อมูลในฐานข้อมูล
        const updateProfile = await User.findByIdAndUpdate(userId, {
            username: username,
            img: filename  // ใช้ชื่อไฟล์ที่ได้รับจาก `req.file.filename` หรือ default
        });

        if (updateProfile) {
            console.log('Upload Success');

            // อัปเดต session ด้วยค่าใหม่
            req.session.username = username; // อัปเดตชื่อใน session
            req.session.img = filename; // อัปเดตภาพใน session

            res.redirect(`/profile/${userId}`); // กลับไปหน้าโปรไฟล์ของผู้ใช้
        } else {
            res.status(404).json({ message: 'User not found' });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'เกิดข้อผิดพลาดในการเปลี่ยนแปลงข้อมูล' });
    }
});

//   // Route สำหรับลบโพสต์




// Route สำหรับลบโพสต์
router.post('/DELETE/:POST_ID', async (req, res) => {
    try {
        const post = await User_Post.findById(req.params.POST_ID);
        
        if (!post) {
            return res.status(404).send('Post not found');
        }

        if (post.user_id.toString() !== req.session.userId) {
            return res.status(403).send('You are not authorized to delete this post');
        }

        if (post.img) {
            const imagePath = path.resolve(__dirname, '..', 'public', 'asset', 'img', 'post_picture', post.img.trim());
            console.log('🛠 Fixed Path:', imagePath);
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error('❌ Error deleting image:', err);
                } else {
                    console.log('✅ Image deleted successfully');
                }
            });
        }

        await User_Post.findByIdAndDelete(req.params.POST_ID);
        res.json({ success: true, message: 'Post deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});


//แก้ไข้โพสต์
router.post('/EDIT/:POST_ID/Update', upload.single('upload_img'), async (req, res) => {
    try {
        const title = req.body.title
        const description =req.body.description
        const posts = await User_Post.findById(req.params.POST_ID);

        if (!posts) {
            return res.render('error', { message: 'Post not found' });
        }

        // ตรวจสอบว่า user_id ของโพสต์ตรงกับ user ที่ล็อกอินหรือไม่
        if (posts.user_id.toString() !== req.session.userId) {
            return res.render('error', { message: 'You are not authorized to edit this post' });
        }

        // อัปเดตข้อมูลโพสต์
        posts.title = title;
        posts.description = description;

        // ตรวจสอบการอัปโหลดรูปภาพใหม่
        if (req.file) {
            // ถ้ามีการอัปโหลดไฟล์ใหม่ ให้ใช้ไฟล์ใหม่
            posts.img = req.file.filename;
        } else {
            // ถ้าไม่มีการอัปโหลดไฟล์ใหม่ ให้ใช้รูปเดิม
            posts.img = posts.img;
        }

        await posts.save(); // บันทึกการเปลี่ยนแปลง

        res.redirect(`/`); // เปลี่ยนเส้นทางไปยังโพสต์ที่อัปเดตแล้ว
    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

  
module.exports = router;