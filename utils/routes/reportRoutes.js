import express from 'express'
import { adminOnly, protect } from '../middleware/authMiddleware.js';
import { exportTaskReport, exportUserReport } from '../controller/reportController.js';

const reportRouter = express.Router();

reportRouter.get("/export/tasks",protect,adminOnly,exportTaskReport);
reportRouter.get("/export/users",protect,adminOnly,exportUserReport);



export default reportRouter;