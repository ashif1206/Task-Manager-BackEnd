
import userModel from "../models/userModel.js";
import taskModel from "../models/taskModel.js";
import { hadndleRes } from "../helper/handleRes.js"
import bcrypt from 'bcryptjs'

export const getUsers = async (req,res)=>{

    try{
        const users = await userModel.find({role:"member"});
        if(!users){
            return hadndleRes(res,400,{success:false,message:"Something went wrong or user not found"});
        };

        const usersWithTaskCount = await Promise.all(
            users.map(async (user)=>{
                const pendingTasks = await taskModel.countDocuments({
                    assignedTo:user._id,
                    status:"Pending"
                });

                const inProgressTask = await taskModel.countDocuments({
                    assignedTo:user._id,
                    status:"In Progress"
                });

                const completedTask = await taskModel.countDocuments({
                    assignedTo:user._id,
                    status:"Completed"
                });

                return {
                    ...user._doc,
                    pendingTasks,
                    inProgressTask,
                    completedTask,
                };

            })
        )
        return hadndleRes(res,200,{success:true,message:usersWithTaskCount})

    }catch(e){
        return hadndleRes(res,500,{success:false,message:"server error",e})
    }
};

export const getUserById = async (req,res)=>{
    const {id} = req.params;
    try{
        if(!id){
            return hadndleRes(res,400,{success:false,message:"Somrthing went wrong or id not found"})
        }
        const user = await userModel.findById(id);
        if(!user){
            return hadndleRes(res,400,{success:false,message:"User not found"})
        };

        return hadndleRes(res,200,{success:true,message:user})

    }catch(e){
        return hadndleRes(res,500,{success:false,message:"server error",e})
    }
}

export const UpdateUserById = async (req,res)=>{
    const {id} = req.params
    const{name,email,password}= req.body;

    try{
        const user = await userModel.findById(id);
        if(!user){
            return hadndleRes(res,400,{success:false,message:"Something went wrong or user not found"});
        };

        user.name = name || user.name;
        user.email = email || user.email;
        if(password){
            const salt = await bcrypt.genSalt(12);
            const hash = await bcrypt.hash(password,salt);
            user.password = hash
        };

        await user.save();
        return hadndleRes(res,200,{success:true,message:"User Found Successfully",user});
    }catch(e){
       return hadndleRes(res,500,{success:false, message:'Server errro',e})
    }
}

export const deleteUser = async (req,res)=>{
    const {id} = req.params;
    try{
        if(!id){
            return hadndleRes(res,400,{success:false,message:"Id not found"})
        };

        const user = await userModel.findByIdAndDelete(id);
        if(!user){
            return hadndleRes(res,400,{success:false,message:"Something went wrong"})
        };

        return hadndleRes(res,200,{success:true,message:"User Deleted successfully"})

    }catch(e){
        return hadndleRes(res,500,{success:false,message:"server error",e})
    }
};

export const CreateUserByAdmin = async (req,res)=>{
    const {name,email,password,profileImageUrl,adminInviteToken} = req.body;
    try{
        if(!name || !email || !password){
            return hadndleRes(res,400,{success:false,message:"All Fields are required"})
        }
        const isUserExit = await userModel.findOne({email});
        if(isUserExit){
            return hadndleRes(res,400,{success:false,message:'User Already Exist'})
        };
        let role = "member";
        if(adminInviteToken && adminInviteToken === process.env.ADMIN_INVITE_TOKEN){
            role = "admin"
        };

        const salt = await bcrypt.genSalt(12);
        const hash = await bcrypt.hash(password,salt);

        const user = await userModel({name,email,password,profileImageUrl,role})
        if(!user){
            return hadndleRes(res,400,{success:false,message:"Something went wrong or server failed"});
        };

        await user.save();
        return hadndleRes(res,200,{success:true,message:"User Created Succefully",user})
    }catch(e){
        return hadndleRes(res,500,{success:false,message:"Server error",e})
    }

};

// export const registerUser = async (req,res)=>{
//     const {name,email,password,profileImageUrl,adminInviteToken} = req.body
//     try {
//         if(!name || !email || !password){
//             return hadndleRes(res,400,{success:false,message:"All feilds are required!!!"})
//         }
//         const isUserExist = await userModel.findOne({email});
//         if(isUserExist){
//             return hadndleRes(res,400,{success:false,message:"User Exixts!!!"})
//         };

//         let role = "member";

//         if(adminInviteToken && adminInviteToken == process.env.ADMIN_INVITE_TOKEN){
//             role = "admin"
//         };

//         const salt = await bcrypt.genSalt(12);
//         const hashPassword = await bcrypt.hash(password,salt);


//         const user = await userModel({name,email,password:hashPassword,profileImageUrl,role});

//         if(user){
//             await user.save();
//             return hadndleRes(res,201,{success:true,user,token:generateToken(user._id)})
//         }
//     } catch (error) {
//         return hadndleRes(res,500,{success:false,error})
//     }
// };
