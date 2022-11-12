const axios = require('axios');
const express=require("express");
const Router=express.Router();
const mysqlConnection=require("../utils/connection");


function getOrgById(orgId)
{
    return new Promise(resolve=>{

        mysqlConnection.query("SELECT * FROM organization WHERE organization.id=?",[orgId],(err,rows,fields)=>{
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

function getAllUsers(orgId)
{
    return new Promise(resolve=>{
        mysqlConnection.query("SELECT * FROM user",(err,rows,fields)=>{
            if(!err)
            {
                resolve([rows,null]);
            }
            else
            {
                resolve([null,404]);
            }
        })
    });
}


Router.get("/all/:orgid",async (req,res)=>{
    
    const orgid = req.params.orgid;
    
    let rowsOutput =  await getOrgById(orgid);
    if(rowsOutput[1])
    {
        res.sendStatus(404);
    }
    else
    {
        let rows = rowsOutput[0];
        let orgUsername = rows[0]["username"];
        let orgName = rows[0]["name"];
        let orgDomain = rows[0]["domain"];

        console.log(orgUsername);
        console.log(orgName);
        console.log(orgDomain);

        let wrydURL = `https://wryd.live/api/v1/locations/${orgUsername}`;

        console.log(wrydURL);
        let wrydResponse = await axios.get(wrydURL);
        // console.log(wrydResponse.data);
        res.send(wrydResponse.data);
    }
})


module.exports=Router;