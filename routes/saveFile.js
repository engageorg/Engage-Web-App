const express = require("express")
const router = express.Router();
const fs = require('fs')
const crypto = require('crypto');
const algorithm = 'aes-256-cbc';
const key = crypto.randomBytes(32);
const iv = crypto.randomBytes(16);
const snappy = require('snappy')

router.post("/", (req,res) => {
    let cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
    let encrypted = cipher.update(JSON.stringify(req.body.lectureData.audio + req.body.lectureData.recording));
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    const ecryptedLecture ={ iv: iv.toString('hex'), encryptedData: encrypted.toString('hex') }
    fs.writeFile("lectureFile-4.txt",JSON.stringify(req.body),function (err) {
        if (err) throw err;
            console.log('saved');
        })
    fs.writeFile("lectureFile-5.txt",JSON.stringify(ecryptedLecture),function (err) {
        if (err) throw err;
            console.log('saved');
    })
})

module.exports = router;