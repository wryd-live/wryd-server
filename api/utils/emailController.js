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
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title></title>
    </head>
    <body>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout:fixed;background-color:#f9f9f9" id="bodyTable">
        <tbody>
          <tr>
            <td style="padding-right:10px;padding-left:10px;" align="center" valign="top" id="bodyCell">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapperBody" style="max-width:600px">
                <tbody>
                  <tr>
                    <td align="center" valign="top">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableCard" style="background-color:#fff;border-color:#e5e5e5;border-style:solid;border-width:0 1px 1px 1px;">
                        <tbody>
                          <tr>
                            <td style="background-color:rgb(158, 63, 212);font-size:1px;line-height:3px" class="topBorder" height="3">&nbsp;</td>
                          </tr>
                          <tr>
                            <td style="padding-top: 60px; padding-bottom: 20px;" align="center" valign="middle" class="emailLogo">
                              <!-- <a href="#" style="text-decoration:none" target="_blank"> -->
                                <img alt="" border="0" src="https://res.cloudinary.com/duj04otcy/image/upload/v1668576478/map_zeaa2t.png" width="120">
                              <!-- </a> -->
                            </td>
                          </tr>
    
                          <tr>
                            <td style="padding-bottom: 5px; padding-left: 20px; padding-right: 20px;" align="center" valign="top" class="mainTitle">
                              <h2 class="text" style="color:#000;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:28px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:36px;text-transform:none;text-align:center;padding:0;margin:0">Hi ${name}</h2>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-bottom: 30px; padding-left: 20px; padding-right: 20px;" align="center" valign="top" class="subTitle">
                              <h4 class="text" style="color:#999;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:16px;font-weight:500;font-style:normal;letter-spacing:normal;line-height:24px;text-transform:none;text-align:center;padding:0;margin:0">Verify Your Email Account</h4>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding-left:20px;padding-right:20px" align="center" valign="top" class="containtTable ui-sortable">
                              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableDescription" style="">
                                <tbody>
                                  <tr>
                                    <td style="padding-bottom: 20px;" align="center" valign="top" class="description">
                                      <p class="text" style="color:#666;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:14px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:22px;text-transform:none;text-align:center;padding:0;margin:0">Please verify your WRYD account to use the app</p>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="tableButton" style="">
                                <tbody>
                                  <tr>
                                    <td style="padding-top:20px;padding-bottom:20px" align="center" valign="top">
                                      <table border="0" cellpadding="0" cellspacing="0" align="center">
                                        <tbody>
                                          <tr>
                                            <td style="background-color: rgb(158, 63, 212); padding: 12px 35px; border-radius: 50px;" align="center" class="ctaButton"> <a href="${verificationURL}" style="color:#fff;font-family:Poppins,Helvetica,Arial,sans-serif;font-size:13px;font-weight:600;font-style:normal;letter-spacing:1px;line-height:20px;text-transform:uppercase;text-decoration:none;display:block" target="_blank" class="text">Confirm Email</a>
                                            </td>
                                          </tr>
                                        </tbody>
                                      </table>
                                    </td>
                                  </tr>
                                </tbody>
                              </table>
                            </td>
                          </tr>
                          <tr>
                            <td style="font-size:1px;line-height:1px" height="20">&nbsp;</td>
                          </tr>
                        </tbody>
                      </table>
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" class="space">
                        <tbody>
                          <tr>
                            <td style="font-size:1px;line-height:1px" height="15">&nbsp;</td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" class="wrapperFooter" style="max-width:600px">
                <tbody>
                  <tr>
                    <td align="center" valign="top">
                      <table border="0" cellpadding="0" cellspacing="0" width="100%" class="footer">
                        <tbody>
                          <tr>
                            <td style="padding: 0px 10px 10px;" align="center" valign="top" class="footerEmailInfo">
                              <p class="text" style="color:#bbb;font-family:'Open Sans',Helvetica,Arial,sans-serif;font-size:12px;font-weight:400;font-style:normal;letter-spacing:normal;line-height:20px;text-transform:none;text-align:center;padding:0;margin:0">Have any question or help? contact us : <a href="mailto: projectlinkedlist@gmail.com" style="color:#bbb;text-decoration:underline" target="_blank">projectlinkedlist@gmail.com</a>
                              </p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
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
