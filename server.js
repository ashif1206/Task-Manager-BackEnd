import express from 'express'
import 'dotenv/config'
import cors from 'cors'
import db from './utils/dataBase/db.js';
import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import userRouter from './utils/routes/userRoutes.js';
import authRouter from './utils/routes/authRoutes.js';
import taskRouter from './utils/routes/taskRoutes.js';
import reportRouter from './utils/routes/reportRoutes.js';


const app = express();

app.use(cors({
    origin: [process.env.CLIENT_URL,"https://task-manager-front-end-omega.vercel.app",
    "https://task-manager-front-end-git-main-ashif1206s-projects.vercel.app" ,"*"],
    methods:['GET','POST','PUT','DELETE'],
    allowedHeaders:["Content-Type", "Authorization"],
    credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({extended:true}));

const PORT = process.env.PORT || 4000

app.use('/api/auth',authRouter,);
app.use('/api/user',userRouter);    
app.use('/api/tasks',taskRouter);
app.use('/api/reports',reportRouter);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use("/uploads",express.static(path.join(__dirname, "uploads")));

app.listen(PORT,()=>{
    db()
    console.log(`server is running on http://localhost:${PORT}/`);
})