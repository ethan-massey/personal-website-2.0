const express = require('express');
var svgCaptcha = require('svg-captcha');
var nodemailer = require('nodemailer');

const router = express.Router();

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
    
    // if inputs are valid, send to captcha
    }else{
      var captcha = svgCaptcha.create();
      // set email details in app for /captcha route to view and use when sending
      res.app.set('emailDetails', {
        address: address,
        name: name,
        body: body,
        captchaSolution: captcha.text
      });
      // render captcha view and send captcha image as context
      res.render('captcha', {
        captchaData: captcha.data
      })
    }
})

router.post('/captcha', (req, res) => {
  // get email details from app
  const address = res.app.get('emailDetails').address;
  const name = res.app.get('emailDetails').name;
  const body = res.app.get('emailDetails').body;
  const captchaSolution = res.app.get('emailDetails').captchaSolution;
  // get captcha user input
  const captchaResponse = req.body.captchaResponse;

  // if captcha user input is correct
  if(captchaResponse == captchaSolution){
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
    // user input for captcha is wrong
  }else{
    // create new captcha and try again
    var captcha = svgCaptcha.create();
    res.app.set('emailDetails', {
      address: res.app.get('emailDetails').address,
      body: res.app.get('emailDetails').body,
      name: res.app.get('emailDetails').name,
      captchaSolution: captcha.text
    })
    res.render('captcha', {captchaData: captcha.data, captchaWrong: true});
  }
})

module.exports = router
