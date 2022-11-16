const express=require("express");
const Router=express.Router();
const mysqlConnection=require("../utils/connection");

Router.post('/create', function (req, res) {
    var postData = req.body;
    const {username,name,domain} = postData;
    console.log(username);
    console.log(name);
    console.log(domain);

    mysqlConnection.query("INSERT INTO organization (username, name, domain) VALUES (?, ?, ?)", [username,name,domain],(err, rows, fields)=>{
        if(!err)
        {
            res.json(
                {
                    code: 1200,
                    msg: "Organization Created"
                }    
            );
        }
        else
        {
            console.log(err);
            const myerr = err.errno;
            res.status(404);

            if(myerr==1062)
            {
                res.json(
                    {
                        code: 1500,
                        msg: "Organization Already Exists"
                    }
                );
            }
            else if(myerr==1048)
            {
                res.json(
                    {
                        code: 1700,
                        msg: "Empty Field"
                    }
                );
                return;  
            }
            else
            {
                res.json(
                    {
                        code: 1600,
                        msg: "Internal Error"
                    }
                );
            }
            
        }
    })
})

Router.get("/all",(req,res)=>{
    mysqlConnection.query("SELECT * FROM organization",(err,rows,fields)=>{
        if(!err)
        {
            res.send(rows);
        }
        else
        {
            console.log(err);
            res.sendStatus(404);
        }
    })
})



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


Router.get("/view/:id",async (req,res)=>{

    const orgid=req.params.id;
    
    let rowsOutput =  await getOrgById(orgid);
    if(rowsOutput[1])
    {
        res.sendStatus(404);
    }
    else
    {
        res.send(rowsOutput[0][0]);
    }
})


Router.get("/delete/:id",(req,res)=>{

    const orgid=req.params.id;
    
    mysqlConnection.query("DELETE FROM organization WHERE organization.id=?",[orgid],(err,rows,fields)=>{
        if(!err)
        {
            if(rows["affectedRows"]!=0)
            {
                res.send(rows);
            }
            else
            {
                res.sendStatus(404);
            }
        }
        else
        {
            console.log(err);
            res.sendStatus(404);
        }
    })
})
module.exports=Router;