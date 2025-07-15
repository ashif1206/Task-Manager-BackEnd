import express from 'express'
import { adminOnly, protect } from '../middleware/authMiddleware.js';
import { createTask, deleteTask, getDashboardData, getTask, getTaskById, getUserDashboardData, updateTask, updateTaskCheckList, updateTaskStatus } from '../controller/taskControllers.js';

const taskRouter = express.Router();

taskRouter.get("/dashboard-data",protect,getDashboardData);
taskRouter.get("/user/dashboard-data",protect,getUserDashboardData);
taskRouter.get("/",protect,getTask);
taskRouter.get("/:id",protect,getTaskById);
taskRouter.post("/",protect,adminOnly,createTask);
taskRouter.put("/:id",protect,updateTask);
taskRouter.delete("/:id",protect,adminOnly,deleteTask);
taskRouter.put("/:id/status",protect,updateTaskStatus);
taskRouter.put("/:id/todo",protect,updateTaskCheckList);


export default taskRouter;