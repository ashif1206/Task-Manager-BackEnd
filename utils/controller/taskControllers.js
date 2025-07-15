import { hadndleRes } from "../helper/handleRes.js";
import taskModel from "../models/taskModel.js";

export const getTask = async (req, res) => {
  const { status } = req.query;
  try {
    let filter = {};
    if (status) {
      filter.status = status;
    }
    
    let tasks;
    if (req.user.role === "admin") {
        tasks = await taskModel
        .find(filter)
        .populate("assignedTo", "name email profileImageUrl");
    } else {
      tasks = await taskModel
        .find({ ...filter, assignedTo: req.user._id })
        .populate("assignedTo", "name email profileImageUrl");
    }
 
    tasks = await Promise.all(
      tasks.map(async (task) => {
        const completedCount = task.todoChecklist.filter(
          (item) => item.completed
        ).length;
        return { ...task._doc, completedTodoCount: completedCount };
      })
    );

    const allTasks = await taskModel.countDocuments(
      req.user.role === "admin" ? {} : { assignedTo: req.user._id }
    );

    const pendingTask = await taskModel.countDocuments({
      ...filter,
      status: "Pending",
      ...(req.user.role !== "admin" && { assignedTo: req.user._id }),
    });

    const inProgressTask = await taskModel.countDocuments({
      ...filter,
      status: "In Progress",
      ...(req.user.role !== "admin" && { assignedTo: req.user._id }),
    });

    const completedTask = await taskModel.countDocuments({
      ...filter,
      status: "Completed",
      ...(req.user.role !== "admin" && { assignedTo: req.user._id }),
    });
    return hadndleRes(res, 200, {
      status: true,
      tasks,
      statusSummary: {
        all: allTasks,
        pendingTask,
        inProgressTask,
        completedTask,
      },
    });
  } catch (e) {
    return hadndleRes(res, 500, { success: false, message: "Server Error", e });
  }
};

export const getTaskById = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return hadndleRes(res, 400, { success: false, message: "Id not found." });
    }
    const task = await taskModel
      .findById(id)
      .populate("assignedTo", "name email profileImageUrl");

    if (!task) {
      return hadndleRes(res, 400, {
        success: false,
        message: "Task not found",
      });
    }

    return hadndleRes(res, 200, { success: true, message: "All task", task });
  } catch (e) {
    return hadndleRes(res, 500, { success: false, message: "Server Error", e });
  }
};

export const createTask = async (req, res) => {
  const {
    title,
    description,
    priority,
    dueDate,
    assignedTo,
    attachments,
    todoChecklist,
  } = req.body;
  try {
    if (!Array.isArray(assignedTo)) {
      return hadndleRes(res, 400, {
        success: false,
        message: "assignedTo must be an array of IDs",
      });
    }
    const task = await taskModel({
      title,
      description,
      priority,
      dueDate,
      assignedTo,
      createdBy: req.user._id,
      attachments,
      todoChecklist,
    });
    if (!task) {
      return hadndleRes(res, 400, {
        success: false,
        message: "Something went wrong or Task not created",
      });
    }
    await task.save();
    return hadndleRes(res, 201, {
      success: true,
      message: "Task Created Successfully",
      task,
    });
  } catch (e) {
    return hadndleRes(res, 500, { success: false, message: "Server Error", e });
  }
};

export const updateTask = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return hadndleRes(res, 400, { success: false, message: "Id not Found" });
    }

    const task = await taskModel.findById(id);
    if (!task) {
      return hadndleRes(res, 200, {
        success: false,
        message: "Task not Found.",
      });
    }

    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.priority = req.body.priority || task.priority;
    task.dueDate = req.body.dueDate || task.dueDate;
    task.todoChecklist = req.body.todoChecklist || task.todoChecklist;
    task.attachments = req.body.attachments || task.attachments;

    if (req.body.assignedTo) {
      if (!Array.isArray(req.body.assignedTo)) {
        return hadndleRes(res, 400, {
          success: false,
          message: "assignedTo must be an array",
        });
      }
      task.assignedTo = req.body.assignedTo;
    }

    const updateTask = await task.save();

    return hadndleRes(res, 200, {
      success: true,
      message: "Task updated Successfully",
      updateTask,
    });
  } catch (e) {
    return hadndleRes(res, 500, { success: false, message: "Server Error", e });
  }
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return hadndleRes(res, 400, { success: false, message: "Id not Found" });
    }

    const task = await taskModel.findById(id);
    if (!task) {
      return hadndleRes(res, 400, {
        success: false,
        message: "Something went wrong or task not found",
      });
    }

    await task.deleteOne();
    return hadndleRes(res, 200, {
      success: false,
      message: "Task Deleted Succefully",
    });
  } catch (e) {
    return hadndleRes(res, 500, { success: false, message: "Server Error", e });
  }
};

export const updateTaskStatus = async (req, res) => {
  const { id } = req.params;
  try {
    if (!id) {
      return hadndleRes(res, 400, { success: false, message: "Id not found" });
    }
    const task = await taskModel.findById(id);
    if (!task) {
      return hadndleRes(res, 400, {
        success: false,
        message: "Sometnig wenr wrong or task not found",
      });
    }

    const isAssigned = task.assignedTo.some(
      (userId) => userId.toString() === req.user._id.toString()
    );
    if (!isAssigned && req.user.role !== "admin") {
      return hadndleRes(res, 400, {
        success: false,
        message: "You are not authorized",
      });
    }

    task.status = req.body.status || task.status;
    if (task.status === "Completed") {
      task.todoChecklist.forEach((item) => {
        item.completed = true;
      });
      task.progress = 100;
    }

    await task.save();

    return hadndleRes(res, 200, {
      success: true,
      message: "task status updated successfully",
      task,
    });
  } catch (e) {
    return hadndleRes(res, 500, { success: false, message: "Server Error", e });
  }
};

export const updateTaskCheckList = async (req, res) => {
  const { id } = req.params;
  const { todoChecklist } = req.body;
  try {
    if (!id) {
      return hadndleRes(res, 400, { success: false, message: "Id not found" });
    }

    const task = await taskModel.findById(id);
    if (!task) {
      return hadndleRes(resizeBy, 400, {
        success: false,
        message: "Sometnih went wrong or Task not found",
      });
    }

    if (!task.assignedTo.includes(req.user._id) && req.user.role !== "admin") {
      return hadndleRes(res, 400, {
        success: false,
        message: "You are not authorized to update checklist",
      });
    }

    task.todoChecklist = todoChecklist;

    const completedCount = task.todoChecklist.filter(
      (item) => item.completed
    ).length;

    const totalItem = task.todoChecklist.length;

    task.progress =
      totalItem > 0 ? Math.round((completedCount / totalItem) * 100) : 0;

    if (task.progress === 100) {
      task.status = "Completed";
    } else if (task.progress > 0) {
      task.status = "In Progress";
    } else {
      task.status = "Pending";
    }

    await task.save();
    const updateTask = await taskModel
      .findById(id)
      .populate("assignedTo", "name email profileImageUrl");

    return hadndleRes(res, 200, {
      message: true,
      message: "CheckList Updated succeffully",
      updateTask,
    });
  } catch (e) {
    return hadndleRes(res, 500, { success: false, message: "Server Error", e });
  }
};

export const getDashboardData = async (req, res) => {
  try {
    const totalTask = await taskModel.countDocuments();
    const pendingTask = await taskModel.countDocuments({ status: "Pending" });
    const completedTask = await taskModel.countDocuments({
      status: "Completed",
    });
    const overDueTask = await taskModel.countDocuments({
      status: { $ne: "Completed" },
      dueDate: { $lt: new Date() },
    });

    const taskStatuses = ["Pending", "In Progress", "Completed"];
    const taskDistributionRaw = await taskModel.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const taskDistribution = taskStatuses.reduce((acc, status) => {
      const formattedkey = status.replace(/\s+/g, "");
      acc[formattedkey] =
        taskDistributionRaw.find((item) => item._id === status)?.count || 0;
      return acc;
    }, {});

    taskDistribution["All"] = totalTask;

    const taskPriorities = ["Low", "Medium", "High"];

    const taskPriorityLevelRaw = await taskModel.aggregate([
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    const taskPriorityLevel = taskPriorities.reduce((acc, priority) => {
      acc[priority] =
        taskPriorityLevelRaw.find((item) => item._id === priority)?.count || 0;
      return acc;
    }, {});

    const recentTask = await taskModel
      .find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title status priority dueDate createdAt");

    return hadndleRes(res, 200, {
       statistics: {
          totalTask,
          pendingTask,
          completedTask,
          overDueTask,
        },
        charts: {
          taskDistribution,
          taskPriorityLevel,
        },
        recentTask,
    });
  } catch (e) {
    return hadndleRes(res, 500, { success: false, message: "Server Error", e });
  }
};

export const getUserDashboardData = async (req, res) => {
    const userId = req.user._id;
  try {
    if(!userId){
        return hadndleRes(res,400,{success:false,message:"Something went wrong or id not found"});
    };
    const totalTask = await taskModel.countDocuments({assignedTo:userId});
    const pendingTask = await taskModel.countDocuments({assignedTo:userId,status:"Pending"});
    const completedTask = await taskModel.countDocuments({assignedTo:userId,status:"Completed"});
    const overDueTask = await taskModel.countDocuments({
        assignedTo:userId,
        status:{$ne:"Completed"},
        dueDate:{$lt: new Date()},
    });

    const taskStatuses = ["Pending","In Progress","Completed"];
    const taskDistributionRaw = await taskModel.aggregate([
        {$match:{assignedTo:userId}},
        {$group:{_id:"$status",count:{$sum:1}}},
    ]);

    const taskDistribution = taskStatuses.reduce((acc,status)=>{
        const formattedKey = status.replace(/\s+/g,"");
        acc[formattedKey] = taskDistributionRaw.find((item)=>item._id === status)?.count || 0;
        return acc;
    },{});

    taskDistribution['All'] = totalTask;

    const taskPriorities = ['Low','Medium','High'];
    const taskProrityLevelRaw = await taskModel.aggregate([
        {$match:{assignedTo:userId}},
        {$group:{_id:"$priority",count:{$sum:1}}},
    ]);

    const taskPriorityLevel = taskPriorities.reduce((acc,priority)=>{
        acc[priority] = taskProrityLevelRaw.find((item)=> item._id === priority)?.count || 0;
        return acc;
    },{});
    
    const recentTask = await taskModel.find({assignedTo:userId})
    .sort({createdAt:-1})
    .limit(10)
    .select("title status priority dueDate createdAt");

    return hadndleRes(res,200,{success:true,message:"User Dashboard Data fetch Succefully",
        statistics:{totalTask,pendingTask,completedTask,overDueTask},
        charts:{taskDistribution,taskPriorityLevel},
        recentTask
    });

  } catch (e) {
    return hadndleRes(res, 500, { success: false, message: "Server Error", e });
  }
};
