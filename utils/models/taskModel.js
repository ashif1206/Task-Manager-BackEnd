import mongoose, { model, Schema } from 'mongoose'


const todoSchema = new Schema({
    text:{ type:String, require:true},
    completed:{type:Boolean, default:false},
},{timestamps:true});

const taskSchema = new Schema({

    title:{ type:String, require:true},
    description:{ type:String},
    priority:{ type:String, enum:['Low', 'Medium', 'High'], default:"Medium"},
    status:{ type:String, enum:['Pending', 'In Progress', 'Completed'], default:"Pending"},
    dueDate:{ type:Date, require:true},
    assignedTo:[{type:mongoose.Schema.Types.ObjectId, ref:"user"}],
    createdBy:{type:mongoose.Schema.Types.ObjectId, ref:"user"},
    attachments:[{type:String}],
    todoChecklist:[todoSchema],
    progress:{ type:Number, default:0},


},{timestamps:true});

const taskModel = new model("task", taskSchema);

export default taskModel;