const mongoose = require('mongoose');
const schema = mongoose.Schema;
const userSchema = new schema({
   user:{
       type: String,
       required: [true,'User name is required']
   },
   fullName:{
       type:String,
       required: [true,'Full name is required']
   },
   phoneNo:{
       type:String,
       required: [true,'Phone number is required']
   },
   password:{
       type:String,
       required: [true,'password is required']
   }
});
// const userSchema = mongoose.model('user',userSchema);
module.exports=Demo;