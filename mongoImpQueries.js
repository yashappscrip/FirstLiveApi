db.getCollection('details').aggregate([{$project:{"company.title":1,"age":1}},{$group:{_id:{total:{$sum:"$age"},count:{$sum:1}}}},{$sort:{age:-1,gender:-1,index:1}}]);
db.getCollection('details').aggregate([{$group:{_id:"$age",count:{$sum:1}}},{$sort:{"_id":1}}]);
db.getCollection('details').aggregate([{$unwind:"$tags"},{$group:{_id:"$tags",count:{$sum:1}}}]);
db.getCollection('details').aggregate([{$unwind:"$tags"},{$group:{_id:"$tags",count:{$sum:NumberInt(1)}}}]);
db.getCollection('details').aggregate([{$group:{_id:"$eyeColor",avgAge:{$avg:"$age"}}}]);
db.getCollection('details').aggregate([{$project:{_id:"$eyeColor",ageType:{$type:"$age"}}}]);
db.getCollection('details').aggregate([{$project:{name:1}},{$out:"aggregationResults"}]);
db.getCollection('employee1').aggregate([
{$lookup:{
    from:"employee2",
    localField:"empId",
    foreignField:"empId",
    as:"employeeId"
    }}
]);
db.getCollection('employee1').aggregate([
{$lookup:{
    from:"employee2",
    localField:"empId",
    foreignField:"empId",
    as:"employeeInfo"
    }}
]);
db.getCollection('details').find({age:{$in:[20,21]}});
db.getCollection('details').aggregate([{$match:{$and:[{gender:"female"},{eyeColor:"green"}]}}]);
db.getCollection('details').aggregate([{$match:{$or:[{gender:"female"},{eyeColor:"green"}],$and:[{gender:"female"},{eyeColor:"blue"}]}}]);
db.getCollection('details').aggregate([{$match:{$and:[{$and:[{gender:"female"},{name:"Kitty Snow"}]},{eyeColor:"blue"}]}}]);