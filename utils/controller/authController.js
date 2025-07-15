import { hadndleRes } from "../helper/handleRes.js";
import taskModel from "../models/taskModel.js";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import userModel from "../models/userModel.js";

const generateToken = (userId) =>{
    return jwt.sign({id:userId},process.env.JWT_SECRET, {expiresIn:"1d"})
}

// route api/auth/register
export const registerUser = async (req,res)=>{
    const {name,email,password,profileImageUrl,adminInviteToken} = req.body
    try {
        if(!name || !email || !password){
            return hadndleRes(res,400,{success:false,message:"All feilds are required!!!"})
        }
        const isUserExist = await userModel.findOne({email});
        if(isUserExist){
            return hadndleRes(res,400,{success:false,message:"User Exixts!!!"})
        };

        let role = "member";

        if(adminInviteToken && adminInviteToken == process.env.ADMIN_INVITE_TOKEN){
            role = "admin"
        };

        const salt = await bcrypt.genSalt(12);
        const hashPassword = await bcrypt.hash(password,salt);


        const user = await userModel({name,email,password:hashPassword,profileImageUrl,role});

        if(user){
            await user.save();
            return hadndleRes(res,201,{success:true,data:{user,token:generateToken(user._id)}})
        }
    } catch (error) {
        return hadndleRes(res,500,{success:false,error})
    }
};

//  route POST/api/auth/login
export const login = async (req,res)=>{
        const {email,password} = req.body;
        try{
            if(!email || !password){
                return hadndleRes(res,400,{success:false,message:"All fields are required!!!"})
            };
            const user = await userModel.findOne({email});
            if(!user){
                return hadndleRes(res,400,{success:false,message:"User Does not Exists"});
            };

            const isMatch = await bcrypt.compare(password,user.password);
            if(!isMatch){
                return hadndleRes(res,401,{success:false,message:"Password does not match"})
            };

            return hadndleRes(res,200,{success:true,message:"User loggedIn SuceessFully", data:{user,token:generateToken(user._id)}});

        }catch(e){
            return hadndleRes(res,500,{success:false,message:"Server Error "})
        }
};

// route GET/api/auth/profile
export const getUserProfile = async (req,res)=>{
    const id = req.user.id;
    try{
        if(!id){
            return hadndleRes(res,400,{success:false,message:"Something went wrong or id not found"})
        };
        
        const user = await userModel.findById(id);
        if(!user){
            return hadndleRes(res,400,{success:false,message:"Something went Wrong!!!"})
        };
        return hadndleRes(res,200,{seccess:true,user})
    }catch(e){
        return hadndleRes(res,500,{success:false,e})
    }
};

// route PUT/api/auth/profile
export const updateUserProfile = async (req,res)=>{
    
    const {name,email,password} = req.body
    try {
        const user = await userModel.findById(req.user.id);

        if(!user){
            return hadndleRes(res,404,{success:false,message:"user not Found"})
        };

        user.name = name || user.name;
        user.email = email || user.email;

        if(password){
            const salt = await bcrypt.genSalt(12);
            const hashPassword = await bcrypt.hash(password,salt);
            user.password = hashPassword;
        };

        const updateUser = await user.save();

        return hadndleRes(res,200,{success:true,updateUser, token:generateToken(updateUser._id)});


    } catch (error) {
        return hadndleRes(res,500,{success:false,error})
    }
};

