import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Order } from "../models/order.model.js";
import { Cart } from "../models/cart.model.js";
import { Meal } from "../models/meal.model.js";

const createOrder = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
        throw new ApiError(400, "Cart is empty");
    }

    const orderItems = await Promise.all(cart.items.map(async (item) => {
        const meal = await Meal.findById(item.mealId);
        if (!meal) {
            throw new ApiError(404, `Meal with ID ${item.mealId} not found`);
        }
        if (!meal.availability) {
            throw new ApiError(400, `"${meal.name}" is currently unavailable`);
        }
        return { mealId: item.mealId, quantity: item.quantity };
    }));

    const totalAmount = cart.totalAmount;

    const order = await Order.create({
        userId,
        items: orderItems,
        totalAmount,
    });

    if (!order) {
        throw new ApiError(500, "Failed to create order");
    }

    await Cart.findOneAndDelete({ userId });

    return res.status(201).json(new ApiResponse(201, order, "Order created successfully"));
});

const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.orderId).populate("items.mealId");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    // Users can only see their own orders; chefs can see any order with their meals
    if (order.userId.toString() !== req.user._id.toString() && req.user.role !== "chef") {
        throw new ApiError(403, "You are not authorized to view this order");
    }

    return res.status(200).json(new ApiResponse(200, order, "Order fetched successfully"));
});

const updateOrderStatus = asyncHandler(async (req, res) => {
    const { status } = req.body;

    if (!status) {
        throw new ApiError(400, "Status is required");
    }

    const order = await Order.findByIdAndUpdate(
        req.params.orderId,
        { status },
        { new: true }
    ).populate("items.mealId");

    if (!order) {
        throw new ApiError(404, "Order not found");
    }

    return res.status(200).json(new ApiResponse(200, order, "Order status updated"));
});

const getOrdersForUser = asyncHandler(async (req, res) => {
    const orders = await Order.find({ userId: req.user._id }).populate("items.mealId");

    // .find() always returns an array, never null — return empty array gracefully
    return res.status(200).json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

const getOrdersForChef = asyncHandler(async (req, res) => {
    const meals = await Meal.find({ chefId: req.user._id });
    const mealIds = meals.map(meal => meal._id);

    const orders = await Order.find({ "items.mealId": { $in: mealIds } })
        .populate("items.mealId")
        .populate("userId", "username"); // Only expose username — not encrypted PII

    return res.status(200).json(new ApiResponse(200, orders, "Orders fetched successfully"));
});

export { createOrder, getOrderById, updateOrderStatus, getOrdersForUser, getOrdersForChef };