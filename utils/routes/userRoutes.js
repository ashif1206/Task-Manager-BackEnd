import express from 'express'
import { CreateUserByAdmin, deleteUser, getUserById, getUsers, UpdateUserById } from '../controller/userController.js';
import { adminOnly, protect } from '../middleware/authMiddleware.js';

const userRouter = express.Router();

userRouter.get('/',protect,adminOnly,getUsers);
userRouter.post('/',protect,adminOnly,CreateUserByAdmin);
userRouter.get('/:id',protect,getUserById);
userRouter.put('/:id',protect,UpdateUserById);
userRouter.delete('/:id',protect,deleteUser);




export default userRouter;

