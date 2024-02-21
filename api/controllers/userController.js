import { catchAsyncError } from "../middlewares/catchAsyncError.js";
import ErrorHandler from "../utils/errorHandler.js";
import {User} from "../models/userModel.js"
import { sendToken } from "../utils/sendToken.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";


export const register = catchAsyncError(async(req,res,next)=>{
    const {
        name,
        email,
        password,
        userName,
        phoneNumber,
        address
    } = req.body;

    if(!name || !email || !password || !userName || !phoneNumber || !address){
        return next(new ErrorHandler("Please enter all fields ",400));
    }

    let user = await User.findOne({email});
    if(user){
        return next(new ErrorHandler("User already exists ",409));
    }

    user = await User.create({
        name,
        email,
        password,
        userName,
        phoneNumber,
        address
    })
    
    sendToken(res,user,"User Registered successfully",201);
});


export const login = catchAsyncError(async(req,res,next)=>{
    const {email,password} = req.body;

    if(!email || !password) return next(new ErrorHandler("Please Enter all fields..",400));
    
    const user = await User.findOne({email}).select("+password");
    if(!user){
        return next(new ErrorHandler("Incorrect Email or password ",401));
    } 
    const isMAtch = await user.comparePassword(password);
    if(!isMAtch){
        return next(new ErrorHandler("Incorrect Email or password",401));
    }
    sendToken(res,user,`Welcome back !! ${user.name}`,200);
 });

 
/**
 * controller function for logout
 * we just need to expire the jwt token now and user will be logged out  
 */
 export const logout = catchAsyncError(async(req,res,next)=>{
    res.status(200).cookie("token",null,{
        expires:new Date(Date.now()),
    }).json({
        success:true,
        message:"logged out successfully"
    })
 })


 export const getMyProfile = catchAsyncError(async(req,res,next)=>{
    const user=await User.findById(req.user._id);
    res.status(200).json({
        success:true,
        user
    })
 })


 export const changePassword = catchAsyncError(async(req,res,next)=>{
    const {oldPassword,newPassword} = req.body;

    if(!oldPassword || !newPassword){
        return next(new ErrorHandler("please enter all fields.",400));
    }
    const user=await User.findById(req.user._id).select("+password");
    const isMatch = await user.comparePassword(oldPassword);

    if(!isMatch) return next(new ErrorHandler("Incorrect old password ",400));
    
    user.password=newPassword;

    await user.save();
    res.status(200).json({
        success:true,
        message:"password updated !! "
    })
 }) 


 export const updateProfile = catchAsyncError(async(req,res,next)=>{
    const {name,email} = req.body;
    const user=await User.findById(req.user._id).select("+password");
    if(name)user.name=name;
    if(email)user.email=email;
    await user.save();
    res.status(200).json({
        success:true,
        message:"profile updated !! "
    })
 });


 export const forgetPassword = catchAsyncError(async(req,res,next)=>{
    const {email} = req.body;
    const user=await User.findOne({email});
    if(!user){
        return next(new ErrorHandler("user not found",400));
    }

    const resetToken = await user.getResetToken();
    await user.save();

    // send token via email...

    const url=`${process.env.FRONT_END_URL}/resetpassword/${resetToken}`;
    const message=`click on the link to reset your password ${url} 
    if you have not req to change password then kindly ignore the message `;

    await sendEmail(user.email,"Your tutor reset password",message);

    res.status(200).json({
        success:true,
        message:`reset token has been sent to ${user.email}`
    })
 });


 export const resetPassword = catchAsyncError(async(req,res,next)=>{
    const {token} = req.params;
    
    const resetPasswordToken=crypto
    .createHash("sha256")
    .update(token)
    .digest("hex")

    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire:{
            $gt:Date.now(),
        },
    })

    if(!user){
        return next(new ErrorHandler("Token is invalid/Expired"))
    }
    user.password=req.body.password;
    user.resetPasswordExpire=null;
    // user.resetPasswordToken=null;
    await user.save();

    res.status(200).json({
        success:true,
        message:"password changed !! "
    })
 });


 export const deleteMyProfile = catchAsyncError(async(req,res,next)=>{
    const user = await User.findById(req.user._id);
        
    await user.deleteOne();

    res.status(200).cookie("token",null,{
        expires: new Date(Date.now()),
    }).json({
        success:true,
        message:"user deleted successfully "
    })
 }); 
