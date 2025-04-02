import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  chefId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  price: {
    type: Number,
    required: true,
  },
  availability: {
    type: Boolean,
    default: true,
  },
  category: {
    type: String,
    trim: true,
  },
  imageUrl: {
    type: String,
  },
  locationCoordinates: {
    type: [Number],
    index: '2dsphere',
  },
}, { timestamps: true });

export const Meal = mongoose.model('Meal', mealSchema);
