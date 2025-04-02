import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
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
  totalAmount: {
    type: Number,
    required: true,
    default: 0,
  },
}, { timestamps: true });

export const Cart = mongoose.model('Cart', cartSchema);
