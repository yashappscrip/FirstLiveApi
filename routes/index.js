const express = require('express');
const app = express();
const dbConfig = require('../config/db');
const jwt = require('jsonwebtoken');
// var mp = require('mongodb-promise');
var bcrypt = require('bcrypt-nodejs');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
var MongoClient = require('mongodb').MongoClient;
MongoClient.connect(dbConfig.db,(err,client)=>{
    const collection = client.db("user").collection("details");
    if(err){
        console.log(err);
        return 0;
    }
    app.get('/',(req,res)=>{
        res.send("Connected!");
    });
    app.post('/register',async (req,res,next)=>{
        var user = req.body.user;
        var fullName = req.body.name;
        var phoneNo = req.body.phone;
        var pwd = req.body.pwd;
        let validation = ()=>{
            return new Promise((resolve,reject)=>{
                if(user.length==0 || fullName.length==0 || phoneNo.length==0|| pwd.length==0 || typeof user !='string' || !isNaN(parseInt(fullName)) || isNaN(parseInt(phoneNo)) || typeof user=='undefined' || typeof fullName=='undefined' || typeof phoneNo=='undefined' || typeof pwd=='undefined'){
                    // reject("UserLength:"+user.length + "NameLength:" +fullName.length + "PhoneLength:" + phoneNo.length + "PasswordLength:" + pwd.length + "User type:" + typeof user + "Name type:" + typeof fullName + "Phone type:" + typeof phoneNo + "User type: " + typeof user +"Name type:"+ typeof fullName +"Phone type: "+ typeof phoneNo + "Password type:" + typeof pwd);
                    // console.log("ERROR!");
                    // throw new Error("All fields are mandatory");
                    reject("Bad Input");
                }
                else{
                    resolve("Perfect!");
                }
            });
        };
        validation().then(()=>{}).catch((err)=>{
            // console.log("-----")
            res.status(400).json({
                response : err
            });
            return;
        });
    //     let backValidationUser =()=>{
    //         // return new Promise((resolve,reject)=>{
    //             collection.find({userName:user}).then((item)=>{
    //                 console.log("Resfdtfyyuyty");
    //                 if(item && item._id) reject('User already registered');
    //                 else resolve('Fine!');
    //             }).catch((err)=>{
    //                 console.log("yashasacftyf");
    //                 reject(err);
    //                 // console.log(err);
    //             });
    //         // });
    //     };
        
    //   backValidationUser().then((item)=>{}).catch((err)=>{return res.status(500).json({response2:err});});

    let item= await collection.findOne({userName:user})
    if(item){
        return res.json({res:"some error"}).status(500)
    }
        console.log("dsddas")
        var encryptedPassword = (pwd)=>{
            return pwd;
            // return bcrypt.hashSync(pwd, bcrypt.genSaltSync(8), null);
        }
        var insert={
            "userName":user,
            "fullName":fullName,
            "phoneNo":phoneNo,
            "password":encryptedPassword(pwd)
        };
        collection.insert(insert).then(()=>{
            res.json({
                "Response":"Details Inserted"
            });
        }).catch((err)=>{
            res.status(500).json({
                response : err
            });
        });
    });
    var token;
    app.post('/login',async (req,res,next)=>{
        var user = req.body.user;
        var userPwd = req.body.pwd;
        let validation = ()=>{
            return new Promise((resolve,reject)=>{
                if(user.length ==0 || userPwd.length == 0 || typeof user !='string') reject("Bad input");
                else resolve("All fine!");
            });
        };
        validation().then().catch((err)=>{
            res.status(400).json({
                response:"Bad input"
            });
            return;
        });
        const findDocument = {
            userName:user
        };
        token = jwt.sign({findDocument},'secretKey');
        try {
            let returnData = await collection.findOne(findDocument);
            if(returnData && returnData._id){
                const checkPwd = (userPwd,dbPwd)=>{
                    // return bcrypt.compareSync(pwd, userPwd);
                    // var userPwdEnc= bcrypt.hashSync(userPwd, bcrypt.genSaltSync(8), null);
                    if(dbPwd==userPwd)
                    return true;
                    else return false;
                }
                var dbPwd= returnData.password;
                if(checkPwd(userPwd,dbPwd)){
                    // res.set('Authorization','Bearer '+token);
                    res.json({
                        "response":"Success",
                        token:token
                    });
                }
                else{
                    res.json({
                        "response":"Authentication failed"
                    });
                }
            }
            else{
                res.json({
                    "response":"User not registered !"
                });
            }
        } catch (error) {
            console.log(error);
        }
    });
    app.get('/details',ensureToken, async (req,res,next)=>{
         jwt.verify(req.token,'secretKey',(err,data)=>{
            if(err){
                res.status(403).json({response:"Authorization failed"});
            }else{
                var user = data.findDocument.userName;
                // var userFront = req.body.user;    
                try {
                    collection.findOne({userName:user},{projection:{password:0}},(err,data)=>{
                        res.json(data);
                    });
                } catch (error) {
                    console.log(error);     
                }
            }
        });
    });
    function ensureToken(req,res,next){
        const headerToken = req.headers["authorization"];
        if(typeof headerToken !=='undefined'){
            // const bearer = bearerHeader.split(" ");
            // const bearerToken = bearer[1];
            req.token = headerToken;
            next();
        } else{
            res.sendStatus(403);
        }
    }
});
module.exports=app;