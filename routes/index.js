const express = require('express');
const { check, validationResult } = require('express-validator');
// var expressValidator = require('express-validator');
const app = express();
// const cookieParser = require('cookie-parser');
const session = require('express-session');
require('dotenv/config');
const dbConfig = require('../config/db');
const jwt = require('jsonwebtoken');
var bcrypt = require('bcrypt-nodejs');
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
// app.use(expressValidator());
var errorLog = (res,err,errCode)=>{
    res.status(errCode).json(err);
};
app.use(session({
    secret:process.env.SESSIONSECRET,
    saveUninitialized:false,
    resave:true,
    cookie:{
        maxAge:60000
    }
}));
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
                if(user.length==0 || fullName.length==0 || phoneNo.length==0|| pwd.length==0 || typeof user !='string' || !isNaN(parseInt(fullName)) || isNaN(parseInt(phoneNo)) || typeof user=='undefined' || typeof fullName=='undefined' || typeof phoneNo=='undefined' || typeof pwd=='undefined') reject("Bad Input");
                else resolve("Perfect!");
            });
        };
        validation().then(()=>{}).catch((err)=>{
            errorLog(res,{response:err},400);
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
        return errorLog(res,{response:"some error"},500);
    }
       var encryptedPassword = (pwd)=>{
            return pwd;
        }
        var insert={
            "userName":user,
            "fullName":fullName,
            "phoneNo":phoneNo,
            "password":encryptedPassword(pwd)
        };
        collection.insert(insert).then(()=>{
            errorLog(res,{
                "Response":"Details Inserted"
            },200);
        }).catch((err)=>{
            errorLog(res,{
                response : err
            },500);
        });
    });
    var token;
    app.post('/login',async (req,res,next)=>{
        var user = req.body.user;
        var userPwd = req.body.pwd;
        var params = req.params;
        var query = req.query;
        var resultQuery = Object.keys(query).map(function(key) {
            return [Number(key), query[key]];
          });
        var resultParams = Object.keys(params).map(function(key) {
        return [Number(key), params[key]];
        });
        if(typeof resultParams[0]!='undefined' || typeof resultQuery[0]!='undefined'){
            return errorLog(res,{
                response: "Bad input!"
            },400)
        }
        let validation = ()=>{
            return new Promise((resolve,reject)=>{
                if(user.length ==0 || userPwd.length == 0 || typeof user !='string') reject("Bad input");
                else resolve("All fine!");
            });
        };
        validation().then().catch((err)=>{
            return errorLog(res,{
                response:"Bad input"
            },400);
        });
        const findDocument = {
            userName:user
        };
        token = jwt.sign({findDocument},process.env.SECRET_TOKEN);
        try {
            let returnData = await collection.findOne(findDocument);
            if(returnData && returnData._id){
                const checkPwd = (userPwd,dbPwd)=>{
                    if(dbPwd==userPwd) return true;
                    else return false;
                }
                var dbPwd= returnData.password;
                if(checkPwd(userPwd,dbPwd)){
                    req.session.token=token;
                    return errorLog(res,{
                        response:"Success",
                        token:token
                    },200);
                }
                else{
                    return errorLog(res,{
                        response:"Authentication failed"
                    },401);
                }
            }
            else{
                return errorLog(res,{
                    response:"User not registered !"
                },401);
            }
        } catch (error) {
            console.log(error);
        }
    });
    app.get('/details',ensureToken, async (req,res,next)=>{
         jwt.verify(req.token,process.env.SECRET_TOKEN,(err,data)=>{
            if(err){
                return errorLog(res,{
                    response:"Authorization failed !"
                },401);
            }else{
                var user = data.findDocument.userName;
                // var userFront = req.body.user;    
                try {
                    collection.findOne({userName:user},{projection:{password:0}},(err,data)=>{
                        return errorLog(res,{
                            data
                        },200); 
                        // res.json(data);
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
            if(req.session.token){
                if(headerToken==req.session.token){
                    grantAccess(req,headerToken,next);
                    return; 
                }
                else{
                    return errorLog(res,{
                        response:"Token not valid !"
                    },401);
                }
            }
            else{
                grantAccess(req,headerToken,next);
                return;
            }
        } 
        else{
            return errorLog(res,{
                response:"Token missing !"
            },401);
        }
    }
    async function grantAccess(req,headerToken,next){
        req.token = headerToken;
        next();
    }
});
module.exports=app;