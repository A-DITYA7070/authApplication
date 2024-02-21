import express from 'express';
import { 
        login, 
        logout, 
        register,
        getMyProfile, 
        changePassword,
        updateProfile,
        forgetPassword,
        resetPassword,
} from '../controllers/userController.js';
import { isAuthenticated } from '../middlewares/auth.js';
import singleUpload from '../middlewares/multer.js';

const router = express.Router();

router.route("/register").post(singleUpload,register);
router.route("/login").post(login);
router.route("/logout").get(logout);
router.route("/me").get(isAuthenticated,getMyProfile);
router.route("/changepassword").put(isAuthenticated,changePassword);
router.route("/updateprofile").put(isAuthenticated,updateProfile);
router.route("/forgetpassword").post(forgetPassword);
router.route("/resetpassword/:token").put(resetPassword);


export default router;