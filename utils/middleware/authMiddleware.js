import jwt from 'jsonwebtoken'
import { hadndleRes } from '../helper/handleRes.js'
import userModel from '../models/userModel.js';



 export const protect = async (req,res,next) =>{
    let token = req.headers.authorization;
    try{
        if(token && token.startsWith("Bearer")){
            token = token.split(" ")[1];
            const decode = jwt.verify(token,process.env.JWT_SECRET);
            req.user = await userModel.findById(decode.id).select("-password");
            next()
        }else{
            return hadndleRes(res,401,{success:false,message:"Your are not Authorized or token not found"})
        }
        
    }catch(e){
        return hadndleRes(res,500,{success:false,message:"server Error token failed", e})
    }
};

export const adminOnly = async (req,res,next)=>{
    try{
        if(req.user && req.user.role === "admin"){
            next();
        }else{
            return hadndleRes(res,403,{success:false,message:"Access denied, Admin only"})
        }
    }catch(e){
        return hadndleRes(res,500,{success:false,message:"Server Error",e})
    }
};