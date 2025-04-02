import { Router } from "express";
import {
    createMeal,
    getAllMeals,
    getMealById,
    updateMeal,
    deleteMeal,
    getMealsByChefId,
} from "../controllers/meal.controller.js";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/multer.middleware.js"; // Import upload middleware
import {moderateImage} from "../middleware/imageModeration.middleware.js"
const router = Router();

router.route("/")
    .post(verifyJWT, authorizeRoles("chef"), upload.single("image"),moderateImage, createMeal) // Use upload.single() for single image uploads
    .get(getAllMeals);

router.route("/chef")
    .get(verifyJWT, authorizeRoles("chef"), getMealsByChefId);

router.route("/:mealId")
    .get(getMealById)
    .patch(verifyJWT, authorizeRoles("chef"), upload.single("image"),moderateImage, updateMeal) // Use upload.single() for single image uploads
    .delete(verifyJWT, authorizeRoles("chef"), deleteMeal);

export default router;