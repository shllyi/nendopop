const Product = require("../models/product");
const cloudinary = require("cloudinary");

// Create Product
exports.createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      specifications,
      price,
      category,
      images,
      stock,
    } = req.body;

    if (!name || !price) {
      return res
        .status(400)
        .json({ success: false, message: "Name and price are required" });
    }

    let uploadedImages = [];
    if (images && images.length > 0) {
      for (const img of images) {
        const result = await cloudinary.v2.uploader.upload(img, {
          folder: "product_images",
        });
        uploadedImages.push({
          public_id: result.public_id,
          url: result.secure_url,
        });
      }
    }

    const parsedStock = Number.isFinite(Number(stock)) ? Number(stock) : 0;

    const product = await Product.create({
      name,
      description,
      specifications, // ✅ Added
      price,
      category,
      images: uploadedImages,
      stock: parsedStock,
      isInStock: parsedStock > 0,
    });

    res.status(201).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    // By default, only return non-archived products for public endpoints (home page, listings)
    const products = await Product.find({ isArchived: false });
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Admin: Get all products including archived
exports.getAllProductsAdmin = async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get Single Product
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      specifications,
      price,
      category,
      images,
      stock,
    } = req.body;

    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    if (typeof name !== "undefined") product.name = name;
    if (typeof description !== "undefined") product.description = description;
    if (typeof specifications !== "undefined") product.specifications = specifications; // ✅ Added
    if (typeof price !== "undefined") product.price = price;
    if (typeof category !== "undefined") product.category = category;
    if (typeof stock !== "undefined") {
      const parsedStock = Number.isFinite(Number(stock)) ? Number(stock) : 0;
      product.stock = parsedStock;
      product.isInStock = parsedStock > 0;
    }

    // Support partial image retention/removal. Client may send `retainImagePublicIds` as an array
    // of public_ids to keep. New `images` will be uploaded and appended to the retained ones.
    const retainImagePublicIds = req.body.retainImagePublicIds;
    if (Array.isArray(retainImagePublicIds)) {
      // Remove images that are no longer retained
      const toRemove = product.images.filter((img) => !retainImagePublicIds.includes(img.public_id));
      for (const img of toRemove) {
        try { await cloudinary.v2.uploader.destroy(img.public_id); } catch (err) {}
      }
      // Keep only retained images
      product.images = product.images.filter((img) => retainImagePublicIds.includes(img.public_id));

      // If new images provided, upload and append
      if (images && images.length > 0) {
        const newUploaded = [];
        for (const img of images) {
          const result = await cloudinary.v2.uploader.upload(img, {
            folder: "product_images",
          });
          newUploaded.push({ public_id: result.public_id, url: result.secure_url });
        }
        product.images = product.images.concat(newUploaded);
      }
    } else if (images && images.length > 0) {
      // Backwards-compatible behavior: replace all images when `images` is provided and no retain list
      for (const img of product.images) {
        try { await cloudinary.v2.uploader.destroy(img.public_id); } catch (err) {}
      }
      const newUploaded = [];
      for (const img of images) {
        const result = await cloudinary.v2.uploader.upload(img, {
          folder: "product_images",
        });
        newUploaded.push({ public_id: result.public_id, url: result.secure_url });
      }
      product.images = newUploaded;
    }

    await product.save();
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Archive/Unarchive Product
exports.toggleArchiveProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    product.isArchived = !product.isArchived;
    await product.save();

    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });

    for (const img of product.images) {
      await cloudinary.v2.uploader.destroy(img.public_id);
    }

    await product.deleteOne();
    res.status(200).json({ success: true, message: "Product deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
