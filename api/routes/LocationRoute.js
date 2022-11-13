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


function getOrgByUserId(userid)
{
    return new Promise(resolve=>{

        mysqlConnection.query("SELECT * FROM organization WHERE organization.id=(SELECT user.organization FROM user WHERE user.id = ?)",[userid],(err,rows,fields)=>{
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


function getFriendsOfUser(userid)
{
    return new Promise(resolve=>{
        const query_string = `SELECT friends.second as person_id,user.name as person_name,user.imageurl
        FROM friends
        INNER JOIN user
        ON friends.second = user.id
        where friends.first = ?`
        
        mysqlConnection.query(query_string,[userid],(err,rows,fields)=>{
            if(!err)
            {
                if(rows.length != 0)
                {
                    resolve([rows,null]);

                }
                else
                {
                    resolve([null,404]);
                }
            }
            else
            {
                resolve([null,404]);
            }
        })
    });
}



function getUsersByOrgId(orgId)
{
    return new Promise(resolve=>{

        mysqlConnection.query("SELECT user.id, user.name,user.verified,user.imageurl FROM user WHERE user.organization=? AND user.verified=?",[orgId,1],(err,rows,fields)=>{
            if(!err && rows.length!=0)
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
        return;
    }

    let fS1 = await getUsersByOrgId(orgid);

    if(fS1[1])
    {
        res.sendStatus(404);
        return;
    }

    let usersOutput = fS1[0];
    
    console.log(usersOutput);

    /* Takes a list of playlists, and an ID to remove */

    const userOutputFilteredMap = new Map();

    for(let i=0;i<usersOutput.length;i++)
    {
        userOutputFilteredMap.set(usersOutput[i].id,[usersOutput[i].name,usersOutput[i].imageurl]);
    }

    //Calling Wryd Live API
    
    try {
        let rows = rowsOutput[0];
        let orgUsername = rows[0]["username"];
    
        let wrydURL = `https://wryd.live/api/v1/locations/${orgUsername}`;
    
        let wrydResponse = await axios.get(wrydURL);
    

        let splicedUsers = [];
        for(let i=0;i<wrydResponse.data["locations"].length;i++)
        {
            let deviceId = wrydResponse.data["locations"][i]["device"];
            let deviceIdInt = parseInt(deviceId);
            if(userOutputFilteredMap.has(deviceIdInt))
            {
                wrydResponse.data["locations"][i]["person_id"] = deviceId;
                wrydResponse.data["locations"][i]["person_name"] = userOutputFilteredMap.get(deviceIdInt)[0];
                wrydResponse.data["locations"][i]["person_imageurl"] = userOutputFilteredMap.get(deviceIdInt)[1];
            }
            else
            {
                splicedUsers.push(i);
            }
        }

        for (var i = splicedUsers.length-1; i >= 0; i--)
        {
            wrydResponse.data["locations"].splice(splicedUsers[i],1);
        }
        
        res.send(wrydResponse.data);
    } catch (error) {
        console.log(error);
        res.sendStatus(404);
    }

})




Router.get("/friends/:userid",async (req,res)=>{
    
    const userid = req.params.userid;
    
    let rowsOutput =  await getOrgByUserId(userid);
    if(rowsOutput[1])
    {
        res.sendStatus(404);    
        return;
    }


    let fS1 = await getFriendsOfUser(userid);

    if(fS1[1])
    {
        res.sendStatus(404);
        return;
    }

    let usersOutput = fS1[0];
    console.log("Friends");
    console.log(usersOutput);

    

    const userOutputFilteredMap = new Map();

    for(let i=0;i<usersOutput.length;i++)
    {
        userOutputFilteredMap.set(
            usersOutput[i].person_id,
            [
                usersOutput[i].person_name,
                usersOutput[i].imageurl
            ]);
    }

    //Calling Wryd Live API
    
    try {
        let rows = rowsOutput[0];
        let orgUsername = rows[0]["username"];
    
        let wrydURL = `https://wryd.live/api/v1/locations/${orgUsername}`;
    
        let wrydResponse = await axios.get(wrydURL);
    

        let splicedUsers = [];
        for(let i=0;i<wrydResponse.data["locations"].length;i++)
        {
            let deviceId = wrydResponse.data["locations"][i]["device"];
            let deviceIdInt = parseInt(deviceId);
            if(userOutputFilteredMap.has(deviceIdInt))
            {
                wrydResponse.data["locations"][i]["person_id"] = deviceId;
                wrydResponse.data["locations"][i]["person_name"] = userOutputFilteredMap.get(deviceIdInt)[0];
                wrydResponse.data["locations"][i]["person_imageurl"] = userOutputFilteredMap.get(deviceIdInt)[1];
            }
            else
            {
                splicedUsers.push(i);
            }
        }

        for (var i = splicedUsers.length-1; i >= 0; i--)
        {
            wrydResponse.data["locations"].splice(splicedUsers[i],1);
        }
        
        res.send(wrydResponse.data);
    } catch (error) {
        console.log(error);
        res.sendStatus(404);
    }

})







Router.get("/test",async (req,res)=>{


    try {
        let wrydURL = `https://wryd.live/api/v1/locations/demoiiit`;
    
        let wrydResponse = await axios.get(wrydURL);
        
        res.send(wrydResponse.data);
    }
    catch(error)
    {
        console.log(error);
        res.sendStatus(404);
    }
});


module.exports=Router;