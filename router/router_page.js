    const express = require('express');
    const router = express.Router();
    const path = require('path')
    const User = require('../model/User')
    const User_Post = require('../model/Post');

    router.get('/', async (req, res) => {
        try{
            const posts = await User_Post.find().populate('user_id', 'username img').populate('comments.userId', 'username img').sort({ createdAt: -1 }); // ดึงโพสต์ล่าสุดและข้อมูลผู้ใช้ที่คอมเม้นต์

            if (req.session.login) {    
                res.render('index',{
                   user_id: req.session.userId,
                   name: req.session.username,
                   email: req.session.email,
                   img:req.session.img,
                   posts: posts
                });
            } else {
                res.redirect('/login');
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Error Not found."); // เพิ่ม error handling
        }
    });

    router.get('/login', async (req, res) => {
        try{
            if (req.session.login) {
                res.redirect('/'); // render หน้า index
            } else {
                res.render('login'); // ถ้ายังไม่ได้ล็อกอิน redirect ไปหน้า login
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Error Not found."); // เพิ่ม error handling
        }
    });

    router.get('/register', async (req, res) => {
        try{
            if (req.session.login) {
                res.redirect('/'); // render หน้า index
            } else {
                res.render('register'); // ถ้ายังไม่ได้ล็อกอิน redirect ไปหน้า login
            }
        } catch (err) {
            console.error(err);
            res.status(500).send("Error Not found."); // เพิ่ม error handling
        }
    });

    router.get('/logout',(req,res)=>{
        req.session.destroy((err)=>{
            res.redirect('/')
        })
    })


    router.get('/profile/:user_id', async (req,res)=>{
        try{
            if (req.session.login) {    
                res.render('User_Profile',{
                   user_id: req.session.userId,
                   name: req.session.username,
                   email: req.session.email,
                   img:req.session.img,
                   createdAt: req.session.createdAt
                });
            } else {
                res.redirect('/login');
            }
        }catch(err){
            console.log('User_Profile = error :')
        }

    })


    // แก้ไขโพสต์
    router.get('/EDIT/:POST_ID', async (req, res) => {
        try {
          const posts = await User_Post.findById(req.params.POST_ID); // ค้นหาโพสต์ตาม POST_ID
          if (!posts) {
            return res.status(404).send('Post not found');
          }
      
          // ตรวจสอบว่า user_id ของโพสต์ตรงกับ user ที่ล็อกอินหรือไม่
          if (posts.user_id.toString() !== req.session.userId) {
            res.redirect('/')
          }
      
          res.render('POST_EDIT', {
            user_id: req.session.userId,
            name: req.session.username,
            email: req.session.email,
            img: req.session.img,
            posts: posts // ส่งข้อมูลโพสต์ไปที่หน้าฟอร์ม
          });
        } catch (err) {
          console.error(err);
          res.status(500).send('Server error');
        }
      });
      
    
    module.exports = router;