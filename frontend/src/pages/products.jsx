import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from 'react-router-dom';
import apiClient from "../api/client";
import AdminHeader from "../components/AdminHeader";
import AdminSidebar from "../components/AdminSidebar";

const schema = yup.object({
  name: yup.string().required("Name is required"),
  description: yup.string(),
  price: yup.number().positive("Price must be positive").required("Price is required"),
  stock: yup.number().integer("Stock must be an integer").min(0, "Stock cannot be negative").required("Stock is required"),
  category: yup.string().required("Category is required"),
  specifications: yup.string(),
});

function Products({ user }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm({
    resolver: yupResolver(schema),
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [removedImageIds, setRemovedImageIds] = useState(new Set());
  const [status, setStatus] = useState("");
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  // ✅ Fetch all products
  const fetchProducts = async () => {
    try {
      const { data } = await apiClient.get("/api/v1/products");
      setProducts(data.products || []);
    } catch (e) {
      setStatus("Failed to load products");
    }
  };

  // ✅ Fetch stored categories
  const fetchCategories = async () => {
    try {
      const { data } = await apiClient.get("/api/v1/categories");
      setCategories(data.categories || []);
    } catch (e) {
      console.error("Failed to load categories", e);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/login');
  };

  const openAddModal = () => {
    setEditProduct(null);
    reset({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      specifications: "",
    });
    setImageFiles([]);
    setImagePreviews([]);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditProduct(product);
    setValue("name", product.name || "");
    setValue("description", product.description || "");
    setValue("price", product.price || "");
    setValue("stock", product.stock ?? "");
    setValue("category", product.category || "");
    setValue("specifications", product.specifications || "");
    setImagePreviews([]);
    setExistingImages(product.images ? product.images.map((img) => ({ public_id: img.public_id, url: img.url })) : []);
    setRemovedImageIds(new Set());
    setImageFiles([]);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    reset({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      specifications: "",
    });
    setImageFiles([]);
    setImagePreviews([]);
    setEditProduct(null);
    setStatus("");
  };

  const handleImagesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImageFiles(files);
    setImagePreviews(files.map((file) => URL.createObjectURL(file)));
  };

  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const onSubmit = async (data) => {
    setStatus("Saving...");
    try {
      let imagesBase64 = [];
      if (imageFiles.length > 0) {
        imagesBase64 = await Promise.all(imageFiles.map(fileToBase64));
      }
      const payload = {
        ...data,
        price: Number(data.price) || 0,
        stock: Number.isFinite(Number(data.stock)) ? Number(data.stock) : 0,
        images: imagesBase64.length > 0 ? imagesBase64 : undefined,
      };
      // If editing and we have existing images, include retain list (public_ids of images to keep)
      if (editProduct) {
        const retain = (existingImages || []).filter(img => !removedImageIds.has(img.public_id)).map(i => i.public_id);
        payload.retainImagePublicIds = retain;
      }
      if (editProduct) {
        await apiClient.put(
          `/api/v1/products/${editProduct._id}`,
          payload
        );
        setStatus("Product updated ✅");
      } else {
        await apiClient.post("/api/v1/products", payload);
        setStatus("Product added ✅");
      }
      fetchProducts();
      closeModal();
    } catch (err) {
      setStatus(err.response?.data?.message || "Save failed");
    }
  };

  const toggleArchive = async (product) => {
    setStatus("Archiving...");
    try {
      await apiClient.put(
        `/api/v1/products/${product._id}/archive`
      );
      fetchProducts();
      setStatus(product.isArchived ? "Restored ✅" : "Archived ✅");
    } catch (err) {
      setStatus("Archive failed");
    }
  };

  return (
    <div>
      <AdminHeader
        onLogout={handleLogout}
        onToggleSidebar={() => setIsSidebarOpen((v) => !v)}
      />
      {isSidebarOpen && (
        <div className="backdrop" onClick={() => setIsSidebarOpen(false)} />
      )}
      <div className="row" style={{ alignItems: "flex-start" }}>
        <AdminSidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          onLogout={handleLogout}
        />
        <main className="container" style={{ padding: 16 }}>
          <div
            className="card col"
            style={{ maxWidth: 900, margin: "32px auto" }}
          >
            <h1 className="text-center mb-16">Product Management</h1>
            <button className="btn mb-16" onClick={openAddModal}>
              Add Product
            </button>
            <div style={{ marginLeft: 8 }}>
              <button
                className="btn mb-16 outline"
                onClick={() => setActiveTab(activeTab === 'archived' ? 'active' : 'archived')}
              >
                {activeTab === 'archived' ? 'Back to Products' : 'Archived Products'}
              </button>
            </div>
            {status && <p style={{ color: "#f99" }}>{status}</p>}

            {activeTab === 'active' && (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#111", borderBottom: "1px solid #333" }}>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Images</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter((p) => !p.isArchived)
                      .map((p) => (
                        <tr key={p._id} style={{ borderBottom: "1px solid #222" }}>
                          <td>{p.name}</td>
                          <td>{p.category}</td>
                          <td>{p.price}</td>
                          <td>{p.stock}</td>
                          <td style={{ minWidth: 96 }}>
                            <div className="row" style={{ gap: 2 }}>
                              {p.images &&
                                p.images.map((img, i) => (
                                  <img
                                    key={i}
                                    src={img.url}
                                    alt=""
                                    style={{
                                      width: 48,
                                      height: 48,
                                      objectFit: "cover",
                                      borderRadius: 4,
                                      border: "1px solid #333",
                                    }}
                                  />
                                ))}
                            </div>
                          </td>
                          <td>
                            <button
                              className="btn outline"
                              onClick={() => openEditModal(p)}
                              style={{ marginRight: 4 }}
                            >
                              Edit
                            </button>
                            <button
                              className="btn outline"
                              onClick={() => toggleArchive(p)}
                            >
                              Archive
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'archived' && (
              <div style={{ overflowX: "auto" }}>
                <h2 className="mb-16">Archived Products</h2>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ background: "#111", borderBottom: "1px solid #333" }}>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Images</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter((p) => p.isArchived)
                      .map((p) => (
                        <tr key={p._id} style={{ borderBottom: "1px solid #222" }}>
                          <td>{p.name}</td>
                          <td>{p.category}</td>
                          <td>{p.price}</td>
                          <td>{p.stock}</td>
                          <td style={{ minWidth: 96 }}>
                            <div className="row" style={{ gap: 2 }}>
                              {p.images &&
                                p.images.map((img, i) => (
                                  <img
                                    key={i}
                                    src={img.url}
                                    alt=""
                                    style={{
                                      width: 48,
                                      height: 48,
                                      objectFit: "cover",
                                      borderRadius: 4,
                                      border: "1px solid #333",
                                    }}
                                  />
                                ))}
                            </div>
                          </td>
                          <td>
                            <button className="btn outline" onClick={() => toggleArchive(p)}>Restore</button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal */}
            {modalOpen && (
              <>
                <div
                  className="backdrop"
                  style={{ zIndex: 99 }}
                  onClick={closeModal}
                />
                <div
                  className="card col"
                  style={{
                    zIndex: 100,
                    position: "fixed",
                    top: "10%",
                    left: 0,
                    right: 0,
                    maxWidth: 420,
                    margin: "auto",
                    background: "#111",
                    border: "2px solid #444",
                  }}
                >
                  <h2>{editProduct ? "Edit Product" : "Add Product"}</h2>
                  <form onSubmit={handleSubmit(onSubmit)} className="col">
                    <label>
                      Name
                      <input
                        {...register("name")}
                        className="input"
                      />
                      {errors.name && <p style={{ color: "#f99", fontSize: "0.875rem" }}>{errors.name.message}</p>}
                    </label>

                    <label>
                      Description
                      <input
                        {...register("description")}
                        className="input"
                      />
                    </label>

                    {/* ✅ Dropdown for Category */}
                    <label>
                      Category
                      <select
                        {...register("category")}
                        className="input"
                      >
                        <option value="">Select Category</option>
                        {categories.map((cat) => (
                          <option key={cat._id} value={cat.name}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {errors.category && <p style={{ color: "#f99", fontSize: "0.875rem" }}>{errors.category.message}</p>}
                    </label>

                    <label>
                      Price
                      <input
                        {...register("price")}
                        type="number"
                        className="input"
                        min="0"
                      />
                      {errors.price && <p style={{ color: "#f99", fontSize: "0.875rem" }}>{errors.price.message}</p>}
                    </label>

                    <label>
                      Stock
                      <input
                        {...register("stock")}
                        type="number"
                        className="input"
                        min="0"
                        step="1"
                      />
                      {errors.stock && <p style={{ color: "#f99", fontSize: "0.875rem" }}>{errors.stock.message}</p>}
                    </label>

                    <label>
                      Specifications
                      <textarea
                        {...register("specifications")}
                        className="input"
                        placeholder="Add product specifications (features, dimensions, materials)..."
                        rows={4}
                      />
                    </label>

                    <label>
                      Images
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImagesChange}
                        className="input"
                      />
                    </label>

                    <div
                      className="row"
                      style={{
                        gap: 4,
                        flexWrap: "wrap",
                        minHeight: 48,
                      }}
                    >
                      {(imagePreviews.length > 0
                          ? imagePreviews
                          : []
                      ).map((src, i) => (
                        <img
                          key={i}
                          src={src}
                          alt="preview"
                          style={{
                            width: 48,
                            height: 48,
                            objectFit: "cover",
                            borderRadius: 4,
                            border: "1px solid #333",
                          }}
                        />
                      ))}
                        {/* Existing images when editing (with remove checkboxes) */}
                        {(existingImages || []).map((img) => (
                          <div key={img.public_id} style={{ display: 'inline-block', position: 'relative', marginRight: 6 }}>
                            <img src={img.url} alt="existing" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, border: '1px solid #333' }} />
                            <label style={{ display: 'block', fontSize: 11, textAlign: 'center' }}>
                              <input type="checkbox" checked={removedImageIds.has(img.public_id)} onChange={(e) => {
                                const next = new Set(removedImageIds);
                                if (e.target.checked) next.add(img.public_id); else next.delete(img.public_id);
                                setRemovedImageIds(next);
                              }} /> Remove
                            </label>
                          </div>
                        ))}
                    </div>

                    <button className="btn mt-16" type="submit">
                      {editProduct ? "Save Changes" : "Add Product"}
                    </button>
                    <button
                      type="button"
                      className="btn outline"
                      onClick={closeModal}
                    >
                      Cancel
                    </button>
                    {status && (
                      <p
                        className="text-center mt-16"
                        style={{ fontSize: "0.875rem", color: "#f99" }}
                      >
                        {status}
                      </p>
                    )}
                  </form>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Products;
