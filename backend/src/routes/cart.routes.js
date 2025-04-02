import { Router } from "express";
import {
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    getCart,
    clearCart,
} from "../controllers/cart.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/add").post(verifyJWT, addToCart);
router.route("/update/:mealId").put(verifyJWT, updateCartItemQuantity);
router.route("/remove/:mealId").delete(verifyJWT, removeFromCart);
router.route("/").get(verifyJWT, getCart).delete(verifyJWT, clearCart);

export default router;