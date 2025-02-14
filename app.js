const express = require('express');
const app = express();
const path = require('path');
const Connect_DB = require('./model/config/Connect_DB')
const router_page = require('./router/router_page');
const session = require ('express-session')
const router_adddata = require('./router/router_adddata');
const{body,validationResult} = require('express-validator')

// Database
Connect_DB();

//set server
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use('/asset', express.static('asset'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: 'mysession',        // ใช้เป็นรหัสลับสำหรับการเข้ารหัส session
    resave: false,              // ไม่บันทึก session ใหม่หากไม่มีการเปลี่ยนแปลง
    saveUninitialized: false,   // ไม่บันทึก session เมื่อยังไม่มีการตั้งค่า
    cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000        // ตั้งเวลา session ให้หมดอายุหลังจาก 1 ชั่วโมง (3600000 ms)
    }
}));



//สร้างserver
app.use(router_page); 
app.use(router_adddata); 
app.listen(8888, () => {
    console.log('run server at 8888 port');
});