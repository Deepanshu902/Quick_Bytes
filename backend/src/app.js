import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./routes/user.routes.js";
import mealRouter from "./routes/meal.routes.js";
import cartRouter from "./routes/cart.routes.js";
import orderRouter from "./routes/order.routes.js";
import paymentRouter from "./routes/payment.routes.js";
import {rateLimit} from "express-rate-limit"

const app = express();
const limiter = rateLimit({
	windowMs: 10 * 60 * 1000, // 10 minutes
	limit: 20, // Limit each IP is 20
	standardHeaders: 'draft-8', 
	legacyHeaders: false, 
	
})

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());
app.use(limiter)

// Health check endpoint
app.get("/healthz", (req, res) => {
    res.status(200).json({ status: "OK" });
});

// Routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/meals", mealRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/orders", orderRouter);
app.use("/api/v1/payments", paymentRouter);

export { app };