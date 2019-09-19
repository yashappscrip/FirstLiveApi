module.exports = (userName)=>{
    var re = new RegExp("^[a-z]([._-]?[a-zA-Z0-9]+)*$");
    if (re.test(userName)) {
        return true;
    } else {
        return false;
    }
};
// var Regex = require("regex");
// var regex = new Regex("^[a-z]([._-]?[a-z0-9]+)*$");
// console.log(regex.test("aqwdyash1212saa"));
// var value="yash";
// // console.log(value.match(/^[A-Z]*$/));
// // console.log(value.match("^[a-z]([._-]?[a-z0-9]+)*$"));
// var re = new RegExp("^[a-z]([._-]?[a-z0-9]+)*$");
//     if (re.test("yash98")) {
//         console.log(true);
//     } else {
//         console.log(false);
//     }