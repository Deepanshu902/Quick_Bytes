import { Router } from "express";
import {
    createPayment,
    verifyPayment,
    getPaymentById,
    getPaymentsForOrder,
} from "../controllers/payment.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";

const router = Router();

router.route("/create-order").post(verifyJWT, createPayment);
router.route("/verify-payment").post(verifyJWT, verifyPayment);
router.route("/order/:orderId").get(verifyJWT, getPaymentsForOrder); // must be before /:paymentId
router.route("/:paymentId").get(verifyJWT, getPaymentById);

export default router;