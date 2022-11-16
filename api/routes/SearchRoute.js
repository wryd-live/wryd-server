const express = require("express");
const Router = express.Router();
const mysqlConnection = require("../utils/connection");
const {requireAuth} = require("../middleware/authMiddleware");


Router.get("/:name",requireAuth, (req, res) => {

    const myname = req.params.name;
    const searchedExpression = `%${myname.trim()}%`;
    const userid = req.params.userid;
    console.log(myname);
    console.log(userid);
    console.log(searchedExpression);
    const query_string = `SELECT user.id,user.name,user.imageurl
    FROM user
    where user.organization = (select user.organization from user where user.id = ?) and user.name LIKE ?  && user.id != ? and user.verified != 0`
    mysqlConnection.query(query_string,[userid,searchedExpression,userid],(err, rows, fields) => {
        if (!err) {
            if(rows.length != 0)
            {
                res.send(rows);
            }
            else
            {
                res.sendStatus(404);
            }
        }
        else {
            res.sendStatus(404);
        }
    })
})

module.exports = Router;