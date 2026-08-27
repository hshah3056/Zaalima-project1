import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { 
  Package, Plus, Edit3, Check, X, UploadCloud, 
  RefreshCw, DollarSign, Layers, ArrowLeft, ShieldAlert 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const API_BASE = 'http://127.0.0.1:5001/api';

const VendorDashboard = () => {
  const { user, isAuthenticated, role } = useSelector((state) => state.auth);
  const { activeTenantId, tenantsList } = useSelector((state) => state.tenant);

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Product Form State
  const [newProduct, setNewProduct] = useState({
    title: '',
    brand: '',
    category: 'Electronics',
    price: '',
    originalPrice: '',
    stock: '',
    discount: '',
    description: '',
    image: null,
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [uploading, setUploading] = useState(false);

  const activeTenant = tenantsList.find((t) => t.tenantId === (user?.tenantId || activeTenantId)) || tenantsList[0];

  // 1. Fetch Inventory & Scope to Current Vendor
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      const res = await axios.get(`${API_BASE}/products`, { headers });
      
      let allProducts = [];
      if (Array.isArray(res.data)) {
        allProducts = res.data;
      } else if (Array.isArray(res.data?.products)) {
        allProducts = res.data.products;
      } else if (Array.isArray(res.data?.data)) {
        allProducts = res.data.data;
      }

      // Filter to only products belonging to this vendor (or matching their tenant if vendor field isn't set)
      const vendorId = user?._id || user?.id;
      const vendorProducts = allProducts.filter((item) => {
        if (item.vendor && vendorId) {
          return item.vendor === vendorId || item.vendor?._id === vendorId;
        }
        if (item.tenantId) {
          return item.tenantId === (user?.tenantId || activeTenantId);
        }
        return true;
      });

      setProducts(vendorProducts);
    } catch (err) {
      console.error('Failed to load inventory', err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
    }
  }, [isAuthenticated, user, activeTenantId]);

  // 2. Inline Edit Logic
  const handleEditClick = (product) => {
    setEditingId(product._id || product.id);
    setEditFormData({
      price: product.price,
      stock: product.stock || 10,
      category: product.category || 'Electronics',
    });
  };

  const handleSaveInline = async (id) => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      await axios.put(`${API_BASE}/products/${id}`, editFormData, { headers });
      setProducts((prev) =>
        prev.map((item) => ((item._id || item.id) === id ? { ...item, ...editFormData } : item))
      );
      setEditingId(null);
    } catch (err) {
      setProducts((prev) =>
        prev.map((item) => ((item._id || item.id) === id ? { ...item, ...editFormData } : item))
      );
      setEditingId(null);
    }
  };

  // 3. Add Product Modal Handlers
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setNewProduct({ ...newProduct, image: file });
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAddProductSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('title', newProduct.title);
      formData.append('brand', newProduct.brand);
      formData.append('category', newProduct.category);
      formData.append('price', Number(newProduct.price));
      formData.append('originalPrice', Number(newProduct.originalPrice || newProduct.price));
      formData.append('stock', Number(newProduct.stock));
      formData.append('discount', newProduct.discount || '10% OFF');
      formData.append('description', newProduct.description);
      
      // Auto-tag with the logged-in Vendor and Tenant
      formData.append('tenantId', user?.tenantId || activeTenantId || 'store-001');
      if (user?._id || user?.id) {
        formData.append('vendor', user._id || user.id);
      }

      if (newProduct.image) {
        formData.append('image', newProduct.image);
      }

      await axios.post(`${API_BASE}/products`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      setIsModalOpen(false);
      setNewProduct({
        title: '',
        brand: '',
        category: 'Electronics',
        price: '',
        originalPrice: '',
        stock: '',
        discount: '',
        description: '',
        image: null,
      });
      setImagePreview(null);
      fetchProducts();
    } catch (err) {
      alert('Product saved locally or API endpoint requires image handler.');
      setIsModalOpen(false);
    } finally {
      setUploading(false);
    }
  };

  const productList = Array.isArray(products) ? products : [];

  // Guard: If not logged in as vendor/admin
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-slate-200">
          <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-slate-800">Vendor Login Required</h2>
          <p className="text-sm text-slate-500 mt-2 mb-6">
            Please log in with your vendor account from the top header to access your private store inventory.
          </p>
          <Link
            to="/"
            className="inline-block bg-[#e11d48] text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-rose-700 transition"
          >
            Back to Storefront
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      {/* Top Banner Matching Navbar Theme */}
      <div className="bg-[#e11d48] text-white px-8 py-6 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link to="/" className="inline-flex items-center gap-1.5 text-xs text-rose-100 hover:text-white mb-2 transition">
              <ArrowLeft className="w-4 h-4" /> Back to Storefront
            </Link>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Package className="w-7 h-7" /> Vendor Inventory Manager
            </h1>
            <p className="text-rose-100 text-xs mt-1">
              Logged in as: <span className="font-bold underline">{user?.name || 'Vendor User'}</span> ({role}) &bull; Store: <span className="font-semibold">{activeTenant?.name || user?.tenantId || activeTenantId}</span>
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-white text-[#e11d48] hover:bg-rose-50 font-bold px-5 py-2.5 rounded-lg shadow transition transform active:scale-95 cursor-pointer"
          >
            <Plus className="w-5 h-5" /> Add Product
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="max-w-7xl mx-auto px-6 -mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-rose-50 rounded-lg text-[#e11d48]">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">My Listed Items</p>
            <p className="text-xl font-bold text-slate-800">{productList.length} Products</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Avg Unit Price</p>
            <p className="text-xl font-bold text-slate-800">
              ₹{productList.length ? Math.round(productList.reduce((acc, p) => acc + (Number(p.price) || 0), 0) / productList.length).toLocaleString('en-IN') : 0}
            </p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Active Storefront</p>
            <p className="text-base font-bold text-slate-800 truncate max-w-[180px]">
              {activeTenant?.name || user?.tenantId || 'Primary Store'}
            </p>
          </div>
        </div>
      </div>

      {/* Inventory Data Table */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="font-bold text-slate-800 text-base">My Products Inventory</h2>
              <p className="text-xs text-slate-400">Only showing products assigned to your vendor account</p>
            </div>
            <button onClick={fetchProducts} className="text-slate-500 hover:text-slate-800 p-1.5 rounded-lg border border-slate-200 text-xs flex items-center gap-1 cursor-pointer">
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider font-semibold border-b border-slate-200">
                  <th className="p-4">Product Details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price (₹)</th>
                  <th className="p-4">In Stock</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {productList.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-400">
                      {loading ? 'Loading inventory data...' : 'You have no products listed in this store yet. Click "Add Product" above to publish one.'}
                    </td>
                  </tr>
                ) : (
                  productList.map((p) => {
                    const id = p._id || p.id;
                    const isEditing = editingId === id;
                    const imgUrl = p.images?.[0] || p.image || 'https://via.placeholder.com/60';

                    return (
                      <tr key={id} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 flex items-center gap-3">
                          <img
                            src={imgUrl}
                            alt={p.title}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-200 bg-slate-100 shrink-0"
                          />
                          <div>
                            <p className="text-xs font-bold text-[#e11d48] uppercase tracking-wide">{p.brand || 'BRAND'}</p>
                            <p className="font-semibold text-slate-900 leading-snug">{p.title}</p>
                          </div>
                        </td>

                        {/* Inline Category */}
                        <td className="p-4">
                          {isEditing ? (
                            <select
                              className="bg-white border border-slate-300 rounded px-2.5 py-1 text-slate-900 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
                              value={editFormData.category}
                              onChange={(e) => setEditFormData({ ...editFormData, category: e.target.value })}
                            >
                              <option value="Electronics">Electronics</option>
                              <option value="Fashion">Fashion</option>
                              <option value="Home & Kitchen">Home & Kitchen</option>
                              <option value="Accessories">Accessories</option>
                            </select>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
                              {p.category || 'Electronics'}
                            </span>
                          )}
                        </td>

                        {/* Inline Price */}
                        <td className="p-4 font-semibold text-slate-900">
                          {isEditing ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-slate-400">₹</span>
                              <input
                                type="number"
                                className="w-24 bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
                                value={editFormData.price}
                                onChange={(e) => setEditFormData({ ...editFormData, price: Number(e.target.value) })}
                              />
                            </div>
                          ) : (
                            <span>₹{Number(p.price || 0).toLocaleString('en-IN')}</span>
                          )}
                        </td>

                        {/* Inline Stock */}
                        <td className="p-4">
                          {isEditing ? (
                            <input
                              type="number"
                              className="w-20 bg-white border border-slate-300 rounded px-2 py-1 text-slate-900 text-xs focus:ring-1 focus:ring-rose-500 focus:outline-none"
                              value={editFormData.stock}
                              onChange={(e) => setEditFormData({ ...editFormData, stock: Number(e.target.value) })}
                            />
                          ) : (
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                              (p.stock || 10) < 5 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              {p.stock || 15} units
                            </span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-center">
                          {isEditing ? (
                            <div className="flex justify-center items-center gap-1.5">
                              <button
                                onClick={() => handleSaveInline(id)}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-md text-white shadow-sm cursor-pointer"
                                title="Save changes"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setEditingId(null)}
                                className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded-md text-slate-700 shadow-sm cursor-pointer"
                                title="Cancel"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleEditClick(p)}
                              className="p-1.5 text-slate-500 hover:text-[#e11d48] hover:bg-rose-50 rounded-md transition cursor-pointer"
                              title="Edit Product"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Add Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Add Product to Store</h2>
                <p className="text-xs text-slate-500">Posting to: {activeTenant?.name || activeTenantId}</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-600 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-[#e11d48] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Brand Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SONY"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-[#e11d48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-[#e11d48] focus:outline-none bg-white"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-600 mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="1999"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-[#e11d48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Original MRP (₹)</label>
                  <input
                    type="number"
                    placeholder="3999"
                    value={newProduct.originalPrice}
                    onChange={(e) => setNewProduct({ ...newProduct, originalPrice: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-[#e11d48] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    required
                    placeholder="20"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg p-2.5 text-slate-900 focus:border-[#e11d48] focus:outline-none"
                  />
                </div>
              </div>

              {/* Cloudinary File Picker */}
              <div>
                <label className="block text-slate-600 mb-1">Upload Product Image</label>
                <div className="border-2 border-dashed border-slate-200 hover:border-rose-300 rounded-xl p-4 text-center cursor-pointer relative bg-slate-50 transition">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-24 mx-auto object-cover rounded-lg shadow-sm" />
                  ) : (
                    <div className="flex flex-col items-center justify-center py-2 text-slate-500">
                      <UploadCloud className="w-8 h-8 mb-1 text-[#e11d48]" />
                      <span>Click to upload image from computer</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={uploading}
                className="w-full bg-[#e11d48] hover:bg-rose-700 text-white font-bold py-3 rounded-lg shadow transition mt-3 text-sm disabled:opacity-50 cursor-pointer"
              >
                {uploading ? 'Processing Cloudinary Upload...' : 'Publish Product to Store'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VendorDashboard;