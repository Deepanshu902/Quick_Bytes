import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Payment } from "../models/payment.model.js";
import { Order } from "../models/order.model.js";
import razorpay from "../utils/razorpay.js";

const createPayment = asyncHandler(async (req, res) => {
    const { orderId } = req.body;

    if (!orderId) {
        throw new ApiError(400, "Order ID is required");
    }

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const options = {
        amount: order.totalAmount * 100, // Amount in paise
        currency: "INR",
        receipt: `order_${order._id}`,
    };

    const razorpayOrder = await razorpay.orders.create(options);

    if (!razorpayOrder) {
        throw new ApiError(500, "Failed to create Razorpay order");
    }

    return res.status(200).json(new ApiResponse(200, razorpayOrder, "Razorpay order created"));
});

const verifyPayment = asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderId) {
        throw new ApiError(400, "Razorpay order ID, payment ID, signature, and order ID are required");
    }

    const order = await Order.findById(orderId);
    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    const expectedSignature = razorpay.utils.generateSignature({
        order_id: razorpay_order_id,
        payment_id: razorpay_payment_id,
    }, process.env.RAZORPAY_KEY_SECRET);

    if (expectedSignature !== razorpay_signature) {
        throw new ApiError(400, "Payment signature verification failed");
    }

    const payment = await Payment.create({
        orderId,
        amount: order.totalAmount,
        paymentMethod: "Razorpay",
        transactionId: razorpay_payment_id,
        status: "success",
    });

    if (!payment) {
        throw new ApiError(500, "Failed to create payment record");
    }

    await Order.findByIdAndUpdate(orderId, { status: "confirmed" });

    return res.status(200).json(new ApiResponse(200, payment, "Payment successful"));
});

const getPaymentById = asyncHandler(async (req, res) => {
    const payment = await Payment.findById(req.params.paymentId).populate("orderId");

    if (!payment) {
        throw new ApiError(404, "Payment not found");
    }

    return res.status(200).json(new ApiResponse(200, payment, "Payment fetched successfully"));
});

const getPaymentsForOrder = asyncHandler(async (req, res) => {
    const payments = await Payment.find({ orderId: req.params.orderId }).populate("orderId");

    if (!payments) {
        throw new ApiError(404, "Payments not found");
    }

    return res.status(200).json(new ApiResponse(200, payments, "Payments fetched successfully"));
});

export { createPayment, verifyPayment, getPaymentById, getPaymentsForOrder };