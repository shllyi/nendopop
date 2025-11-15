const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    specifications: { type: String }, // ✅ Added
    price: { type: Number, required: true },
    category: { type: String },
    images: [
      {
        public_id: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    isInStock: { type: Boolean, default: true },
    stock: { 
      type: Number, 
      required: true, 
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: 'Stock must be an integer'
      }
    },
    isArchived: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
