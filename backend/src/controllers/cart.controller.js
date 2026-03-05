import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Cart } from "../models/cart.model.js";
import { Meal } from "../models/meal.model.js";

// Helper: recalculate totalAmount correctly across all items in the cart
const recalculateTotal = async (cartItems) => {
    const mealIds = cartItems.map((item) => item.mealId);
    const meals = await Meal.find({ _id: { $in: mealIds } });
    const mealPriceMap = {};
    meals.forEach((meal) => { mealPriceMap[meal._id.toString()] = meal.price; });

    return cartItems.reduce((total, item) => {
        const price = mealPriceMap[item.mealId.toString()] || 0;
        return total + item.quantity * price;
    }, 0);
};

const addToCart = asyncHandler(async (req, res) => {
    const { mealId, quantity } = req.body;
    const userId = req.user._id;

    if (!mealId || quantity === undefined) {
        throw new ApiError(400, "Meal ID and quantity are required");
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
        throw new ApiError(400, "Quantity must be a positive integer");
    }

    const meal = await Meal.findById(mealId);
    if (!meal) {
        throw new ApiError(404, "Meal not found");
    }

    if (!meal.availability) {
        throw new ApiError(400, "This meal is currently unavailable");
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
        cart = await Cart.create({ userId, items: [], totalAmount: 0 });
    }

    const itemIndex = cart.items.findIndex((item) => item.mealId.toString() === mealId);

    if (itemIndex > -1) {
        cart.items[itemIndex].quantity += quantity;
    } else {
        cart.items.push({ mealId, quantity });
    }

    cart.totalAmount = await recalculateTotal(cart.items);

    await cart.save();

    return res.status(200).json(new ApiResponse(200, cart, "Item added to cart"));
});

const updateCartItemQuantity = asyncHandler(async (req, res) => {
    const { quantity } = req.body;
    const { mealId } = req.params;
    const userId = req.user._id;

    if (quantity === undefined) {
        throw new ApiError(400, "Quantity is required");
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
        throw new ApiError(400, "Quantity must be a positive integer");
    }

    const cart = await Cart.findOne({ userId });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    const itemIndex = cart.items.findIndex((item) => item.mealId.toString() === mealId);

    if (itemIndex === -1) {
        throw new ApiError(404, "Item not found in cart");
    }

    cart.items[itemIndex].quantity = quantity;

    cart.totalAmount = await recalculateTotal(cart.items);

    await cart.save();

    return res.status(200).json(new ApiResponse(200, cart, "Cart item quantity updated"));
});

const removeFromCart = asyncHandler(async (req, res) => {
    const { mealId } = req.params;
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId });
    if (!cart) {
        throw new ApiError(404, "Cart not found");
    }

    cart.items = cart.items.filter((item) => item.mealId.toString() !== mealId);

    // Recalculate from remaining items — no longer fetches the removed meal
    cart.totalAmount = await recalculateTotal(cart.items);

    await cart.save();

    return res.status(200).json(new ApiResponse(200, cart, "Item removed from cart"));
});

const getCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    const cart = await Cart.findOne({ userId }).populate("items.mealId");

    if (!cart) {
        return res.status(200).json(new ApiResponse(200, { items: [], totalAmount: 0 }, "Cart is empty"));
    }

    return res.status(200).json(new ApiResponse(200, cart, "Cart retrieved successfully"));
});

const clearCart = asyncHandler(async (req, res) => {
    const userId = req.user._id;

    await Cart.findOneAndDelete({ userId });

    return res.status(200).json(new ApiResponse(200, {}, "Cart cleared"));
});

export { addToCart, updateCartItemQuantity, removeFromCart, getCart, clearCart };