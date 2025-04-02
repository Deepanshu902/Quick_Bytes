import { Router } from "express";
import {
    createOrder,
    getOrderById,
    updateOrderStatus,
    getOrdersForUser,
    getOrdersForChef,
} from "../controllers/order.controller.js";
import { verifyJWT, authorizeRoles } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, createOrder).get(verifyJWT, getOrdersForUser);
router.route("/chef").get(verifyJWT, authorizeRoles("chef"), getOrdersForChef);
router.route("/:orderId").get(verifyJWT, getOrderById).patch(verifyJWT, authorizeRoles("chef"), updateOrderStatus);

export default router;