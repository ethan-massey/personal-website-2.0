const express = require('express')
var nodemailer = require('nodemailer');
const router = express.Router()

router.post('/email', (req, res) => {
    const address = req.body.address;
    const name = req.body.name;
    const body = req.body.body;

    // if user inputs INVALID
    if(!address || !name || !body){
      res.render('contact', {
        itemMissing: true,
        address: address,
        name: name,
        body: body
      })
    
    // if inputs are valid, send email
    }else{
      var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.TURBO_EMAIL_USER,
          pass: process.env.TURBO_EMAIL_PASS
        }
      });
      
      var mailOptions = {
        from: process.env.TURBO_EMAIL_USER,
        to: process.env.TURBO_EMAIL_USER,
        subject: 'New email from ' + name,
        text: body + '\n\nFrom: ' + name + '\nReply To: ' + address
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          res.render('email_failure', {name: name});
        } else {
          console.log('Email sent: ' + info.response);
          res.render('email_success', {name: name});
        }
      });
    }
})

module.exports = router
