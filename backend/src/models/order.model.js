import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  items: [
    {
      mealId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meal',
        required: true,
      },
      quantity: {
        type: Number,
        required: true,
        default: 1,
      },
    },
  ],
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out for delivery', 'delivered'],
    default: 'pending',
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  paymentId: {
    type: String,
  },
  totalAmount: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

export const Order = mongoose.model('Order', orderSchema);
