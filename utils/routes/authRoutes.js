import express from 'express'
import { getUserProfile, login, registerUser, updateUserProfile } from '../controller/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { hadndleRes } from '../helper/handleRes.js';
import upload from '../middleware/uploadMiddleware.js';

const authRouter = express.Router();
// api/auth
authRouter.post("/register",registerUser);
authRouter.post("/login",login);
authRouter.get("/profile",protect,getUserProfile);
authRouter.put("/profile",protect,updateUserProfile);

authRouter.post("/upload-image", upload.single("image"), (req, res) => {
  if (!req.file) {
    return hadndleRes(res, 400, { success: false, message: "no file uploaded" });
  }

  const imageUrl = `${process.env.SERVER_URL}/uploads/${req.file.filename}`;
  return hadndleRes(res, 200, {
    success: true,
    message: "file uploaded Successfully",
    imageUrl,
  });
});


export default authRouter;