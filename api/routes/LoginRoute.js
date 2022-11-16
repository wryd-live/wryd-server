const express = require("express");
const jwt = require("jsonwebtoken");
const Router = express.Router();
const mysqlConnection = require("../utils/connection");
const {LOGIN_MAXAGE} = require("../utils/config");
require('dotenv').config();


function searchUser(email, password) {

    return new Promise(resolve=>{

        const query = `SELECT * FROM user WHERE email = ? AND password = ?`;

        mysqlConnection.query(query,[email,password],(err,rows,fields)=>{
            if(!err && rows.length!=0)
            {
                // 0        1
                //[rows , error]
                resolve([rows,null]);
            }
            else
            {
                resolve([null,404]);
            }
        })
    });
}



const createLoginToken = (id) => {
    return jwt.sign({ id }, process.env.JWTLOGINSECRET , {
      expiresIn: LOGIN_MAXAGE,
    });
  };







/**
 * @api {post} /login Login
 * 
 * error
 * 1001 - email or password is empty
 * 1002 - email or password is incorrect
 * 1003 - user is not verified
 */

Router.post("/", async (req, res) => {

    const {email,password} = req.body;

    if(!email || !password)
    {
        res.status(404);
        res.json({
            code: 1001,
            msg: "email or password is empty"
        })
      return;
    }

    const result = await searchUser(email,password);
    if(result[1])
    {
        res.status(404);
        res.json({
            code: 1002,
            msg: "email or password is incorrect"
        });
        return;
    }

    const userDetails = result[0][0];
    const isVerified = userDetails.verified;
    if(!isVerified)
    {
        res.status(404);
        res.json({
            code: 1003,
            msg: "user is not verified"
        });
        return;
    }


    const MYtoken = createLoginToken(userDetails.id);
    res.json({
        userid: userDetails.id,
        orgid: userDetails.organization,
        token: MYtoken,
    })

})

module.exports = Router;