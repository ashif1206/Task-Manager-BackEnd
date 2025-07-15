import exceljs from 'exceljs'
import { hadndleRes } from "../helper/handleRes.js";
import taskModel from "../models/taskModel.js";
import userModel from '../models/userModel.js';

export const exportTaskReport = async(req,res)=>{
    try{
        const tasks = await taskModel.find().populate("assignedTo", "name email");;
        if(!tasks){
            return hadndleRes(res,400,{success:false,message:"Something went wrong or Task not found"});
        };
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet("Task Report");
        worksheet.columns = [
            {header:"Task Id", key:"_id",width:25},
            {header:"Title", key:"title",width:30},
            {header:"Description", key:"description",width:50},
            {header:"Priority", key:"priority",width:15},
            {header:"Status", key:"status",width:20},
            {header:"Due Date", key:"dueDate",width:20},
            {header:"AssignedTo", key:"assignedTo",width:30},
        ];

        tasks.forEach((task)=>{
            const assignedTo = Array.isArray(task.assignedTo)
        ? task.assignedTo.map((user) => `${user.name} <${user.email}>`).join(", ")
        : "Unassigned";
            worksheet.addRow({
                _id:task._id,
                title:task.title,
                description:task.description,
                priority:task.priority,
                status:task.status,
                dueDate:task.dueDate.toISOString().split("T")[0],
                assignedTo,
            });      
        })
          res.setHeader(
                "Content-Type",
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
            res.setHeader(
                "Content-Disposition", 'attachment; filename="tasks_report.xlsx"'
            ); 
       return  workbook.xlsx.write(res).then(()=>{
        res.end()
       });

    }catch(e){
        return hadndleRes(res,500,{success:false,message:"server Error",e})
    }

};


export const exportUserReport = async(req,res)=>{
    try{
        const users = await userModel.find().select("name email _id").lean();
        const userTasks = await taskModel.find().populate("assignedTo", "name email _id");

        const userTaskMap = {};
        users.forEach((user)=>{
            userTaskMap[user._id] = {
                name:user.name,
                email:user.email,
                taskCount:0,
                pendingtasks:0,
                inProgressTasks:0,
                completedTasks:0,
            };
        });
       
        userTasks.forEach((task)=>{
            if(task.assignedTo){
                task.assignedTo.forEach((assignedUser)=>{
                    if(userTaskMap[assignedUser._id]){
                        userTaskMap[assignedUser._id].taskCount +=1;
                        if(task.status === "Pending"){
                            userTaskMap[assignedUser._id].pendingtasks +=1
                        }else if (task.status === "In Progress"){
                            userTaskMap[assignedUser._id].inProgressTasks +=1;
                        }else if(task.status === "Completed"){
                            userTaskMap[assignedUser._id].completedTasks += 1;
                        }
                    }
                });
            };
        });
       
        const workbook = new exceljs.Workbook();
        const worksheet = workbook.addWorksheet("User Task Report");

        worksheet.columns = [
            {header:"User Name", key:"name",width:30},
            {header:"Email", key:"email",width:40},
            {header:"Total Assigned Tasks", key:"taskCount",width:20},
            {header:"Pending Tasks", key:"pendingTasks",width:20},
            {header:"In Progress Tasks", key:"inProgressTasks",width:20},
            {header:"Completed Tasks", key:"completedTasks",width:20},
        ];

        Object.values(userTaskMap).forEach((user)=>{
            worksheet.addRow(user);
        });

        res.setHeader(
            "Content-Type",
            "application/nvd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        res.setHeader(
            "Content-Disposition",
            'attachment; filename="users.report.xlsx"'
        );

        return workbook.xlsx.write(res).then(()=>{
            res.end();
        });

    }catch(e){
        return hadndleRes(res,500,{success:false,message:"server Error",e})
    }

};