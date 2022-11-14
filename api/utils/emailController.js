const nodemailer = require('nodemailer');
const { getAPIHostURL } = require('./config');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'projectlinkedlist@gmail.com',
    pass: process.env.EMAILPASSWORD
  }
});

let mailOptions = {
  from: 'WRYD <projectlinkedlist@gmail.com>',
  to: 'siddhant.dixit23@gmail.com',
  subject: 'WRYD Account Verification',
};


module.exports.sendEmailVerificationLink = function(username,name,email,verificationToken,request,callback)
{
    //  /api/user/verify/:userid/:verification_key

    let bodycontent = `Hi ${name}, Please verify your WRYD Account <br> <br>`;
    bodycontent+=`Verification URL <br> ${getAPIHostURL(request)}/api/user/verify/${username}/${verificationToken}`;

    mailOptions.to = email;
    mailOptions.html = bodycontent;
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) {
        console.log(error);
        callback(error);
      } else {
        console.log('Email sent: ' + info.response);
        callback(200);
      }
    }); 
}
