// middlewares/auth.middleware.js
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            throw new ApiError(401, "unauthorized");
        }

        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

        const user = await User.findById(decodedToken?._id).select("username email role profile ");

        if (!user) {
            throw new ApiError(401, "invalid access token");
        }

        req.user = user;
        next(); // my work is done now go to other route see user.route file
    } catch (error) {
        throw new ApiError(401, error?.message || "invalid access token ");
    }
});

export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        console.log("req.user:", req.user);
        console.log("req.user.role:", req.user.role);
        if (!req.user || req.user.role === undefined) { // Check for undefined role very edge case
            throw new ApiError(403, "You do not have permission to access this resource");
        }
        if (req.user && req.user.role && typeof req.user.role.toString() === "string" && !roles.includes(req.user.role.toString().toLowerCase())) { // changed allowedRoles to roles.
            throw new ApiError(403, "You do not have permission to access this resource");
        }
        next();
    };
};