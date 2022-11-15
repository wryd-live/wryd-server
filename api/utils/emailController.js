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

    let verificationURL = `${getAPIHostURL(request)}/api/user/verify/${username}/${verificationToken}`;


    // let bodycontent = `Hi ${name}, Please verify your WRYD Account <br> <br>`;
    // bodycontent+=`Verification URL <br> ${getAPIHostURL(request)}/api/user/verify/${username}/${verificationToken}`;





    let bodycontent = 

    `
    <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml">
    
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title></title>
    </head>
    
    <body style="font-family:-apple-system, '.SFNSText-Regular', 'Helvetica Neue', Roboto, 'Segoe UI', sans-serif; color: #666666; background:white; text-decoration: none;">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" summary="">
        <tr align="center">
          <td style="height: 30px; width: 100%;">&nbsp;</td>
        </tr>
        <tr align="center">
          <td valign="top" style="width: 100%;">
            <table cellspacing="0" cellpadding="0" border="0" summary="">
              <tr align="center">
                <td valign="middle" style="width: 100%;">
    
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr align="center">
          <td style="height: 50px; width: 100%;">&nbsp;</td>
        </tr>
        <tr align="center">
          <td valign="top" style="width: 100%;">
            <table style="padding: 0px; border: 0; max-width: 520px; text-align: center;" width="100%" cellpadding="0" cellspacing="0" border="0" summary="">
              <tr align="center">
                <td style="width: 100%; margin: 0px 10px; line-height: 24px; font-size: 14pt; font-weight: bold; color: #333333;">
                  <p style="margin: 0; padding: 0;">Verify your email address</p>
                </td>
              </tr>
              <tr align="center" style="margin: 0px 10px;">
                <td style="width: 100%; line-height: 24px; font-size: 11pt;">
                  <p>Hi, ${name} . Please verify your WRYD account to use the app.</p>
                </td>
              </tr>
              
                        <tr align="center" style="margin: 0px 10px;">
                <td style="width: 100%; line-height: 24px; font-size: 11pt;">
                  <p>Username: ${username}</p>
                  <p>Email: ${email}</p>
                </td>
              </tr>
              
              <tr align="center">
                <td style="height: 30px; width: 100%;">&nbsp;</td>
              </tr>
              <tr align="center">
                <td style="width: 100%; margin: 0px 10px; line-height: 24px; font-size: 11pt;">
                  <a style="padding: 10px 20px; border: 1px solid #1492ef; -webkit-border-radius: 999em; -moz-border-radius: 999em; border-radius: 999em; line-height: 24px; font-size: 11pt; background-color: #1492ef; color: white; text-decoration: none;" href="${verificationURL}">Verify your Account</a>
                </td>
              </tr>
              
              <tr>
                <td style="height: 40px; width: 100%;">&nbsp;</td>
              </tr>
                        <tr align="left" style="margin: 0px 10px;">
                <td style="width: 100%; line-height: 24px; font-size: 11pt;">
                  <p>- WRYD, HQ</p>
                </td>
              </tr>
            </table>
    
          </td>
        </tr>
        <tr align="center">
          <td style="height: 55px; width: 100%;">&nbsp;</td>
        </tr>
      </table>
    </body>
    
    </html>
    `;







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
