/**
 * Developed using express js
 * 
 */
const express = require('express');
const { check, validationResult } = require('express-validator');
const app = express();
/**
 *  Session for storing and validating JWT token
 * 
 */
const session = require('express-session');
/**
 * environment variables for stroring and accessing confedential information
 * 
 */
require('dotenv/config');
/**
 * Getting database configuration
 * 
 */
const dbConfig = require('../config/db');
/**
 * JSON web token
 * 
 */
const jwt = require('jsonwebtoken');
/**
 * Password encryption
 * 
 */
var bcrypt = require('bcrypt-nodejs');
/**
 * Body parser middleware
 * 
 */
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());
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
/**
 * Mongodb client module
 * 
 */
var MongoClient = require('mongodb').MongoClient;
/**
 * Mongodb connection
 * 
 */
MongoClient.connect(dbConfig.db,(err,client)=>{
    const collection = client.db("user").collection("details");
    if(err){
        console.log(err);
        return 0;
    }
    /**
     * GET root Routing
     * 
     */
    app.get('/',(req,res)=>{
        res.send("Connected!");
    });
    /**
     * POST Register Routing
     * 
     */
    app.post('/register',async (req,res,next)=>{
        let countBody = Object.keys(req.body).length;
        let countQuery = Object.keys(req.query).length;
        if(countBody!==4 || countQuery>0) return errorLog(res,{
            response:"Bad input !"
        },400);
        var user = req.body.user;
        var fullName = req.body.name;
        var phoneNo = req.body.phone;
        var pwd = req.body.pwd;
        let userNameValidation = require('../regex');
        if(!userNameValidation(user)) return errorLog(res,{
            response:"User name not valid!"
        },400);
        /**
         * User defined Promise
         * 
         */
        let validation = ()=>{
            return new Promise((resolve,reject)=>{
                if(user.length==0 || fullName.length==0 || phoneNo.length==0|| pwd.length==0 || typeof user !='string' || !isNaN(parseInt(fullName)) || isNaN(parseInt(phoneNo)) || typeof user=='undefined' || typeof fullName=='undefined' || typeof phoneNo=='undefined' || typeof pwd=='undefined') reject("Bad Input");
                else resolve("Perfect!");
            });
        };
        /**
         *  Implementation of then and catch.
         * 
         */
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

    // let item= await collection.findOne({userName:user,phoneNo:phoneNo})
    /**
     *  Implementation of await and async
     * 
     */
    var item = await collection.findOne({ $or: [{ userName: user.toLowerCase() }, { phoneNo: phoneNo }] });
    // console.log(item);
    // return res.send(item);
    if(item){
        if(item.userName==user.toLowerCase())
        return errorLog(res,{response:"Error!",message:"User already exists"},400);
        else if(item.phoneNo==phoneNo)
        return errorLog(res,{response:"Error!",message:"Phone No already exists"},400);
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
    /**
     *  POST method for login
     * 
     */
    app.post('/login',async (req,res,next)=>{
        var user = req.body.user;
        var userPwd = req.body.pwd;
        var params = req.params;
        var query = req.query;
        var countQuery = Object.keys(query).length;
        var countParams = Object.keys(params).length;
        var countBody = Object.keys(req.body).length;
        if(countBody>2 || typeof user==='undefined' || typeof userPwd ==='undefined') return errorLog(res,{"Response":"Bad input!"},400);
            if(countQuery>0 || countParams>0){
            return errorLog(res,{
                response: "Bad input!"
            },400);
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
        /**
         * jwt token implementation
         * 
         */
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
    /**
     * GET method for fetching details of the user with the middleware function ensureToken 
     * 
     */
    app.get('/details',ensureToken, async (req,res,next)=>{
        var countBody = Object.keys(req.body).length;
        var countHeaders = Object.keys(req.headers).length;
        var countQuery = Object.keys(req.query).length;
        // console.log(countHeaders);
        if(countBody>0 || countQuery>0 ||countHeaders!==9) return errorLog(res,{
            response :"Bad input!"
        },400);
         jwt.verify(req.token,process.env.SECRET_TOKEN,(err,data)=>{
            if(err){
                return errorLog(res,{
                    response:"Authorization failed !"
                },401);
            }else{
                var user = data.findDocument.userName;
                try {
                    /**
                     * find method for fetching details fromo Mongodb
                     * 
                     */
                    collection.findOne({userName:user},{projection:{password:0}},(err,data)=>{
                        return errorLog(res,{
                            data
                        },200);
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