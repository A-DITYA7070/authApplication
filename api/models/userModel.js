import mongoose from "mongoose";
import validator from "validator";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import crypto from "crypto";

const schema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter your name "],
        minLength:[2,"Name must be atleast 2 characters long "]
    },
    email:{
        type:String,
        required:[true,"Please enter your email "],
        unique:[true,"Email already exists "],
        validate:validator.isEmail
    },
    userName:{
        type:String,
        required:[true,"Please enter username "],
        unique:[true,"username already exists "]
    },
    password:{
        type:String,
        required:[true,"Please enter your password "],
        minLength:[6,"Password must be atleast 6 characters long "]
    },
    phoneNumber:{
        type:String,
        required:[true,"Please enter your phone Number "],
        minLength:[10,"Phone number must be of 10 characters "]
    },
    address:{
        type:String,
        required:[true,"Please enter your address "]
    },
    createdAt:{
        type:Date,
        default:Date.now,
    },
    resetPasswordToken:String,
    resetPasswordExpire:String
})

schema.pre("save",async function(next){
    if(!this.isModified("password")) return next();
    const hashedPassword=await bcrypt.hash(this.password,10);
    this.password=hashedPassword;
    next();
 })
 
 schema.methods.getjwtToken = function(){
     return jwt.sign(
     {_id:this._id},
     process.env.JWT_SECRET,
     { expiresIn:"15d"},
   ).toString();
 }
 
 schema.methods.comparePassword = async function(password){
     return await bcrypt.compare(password,this.password);
 }
 
 schema.methods.getResetToken = async function(){
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken=crypto
     .createHash("sha256")
     .update(resetToken)
     .digest("hex");
 
    this.resetPasswordExpire=Date.now()+15*60*1000;
    return resetToken;
 }
 
 export const User = mongoose.model("User",schema);