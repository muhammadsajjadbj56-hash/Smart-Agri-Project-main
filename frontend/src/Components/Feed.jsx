import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE } from '../config/api';
import FarmerDashboard from './FarmerDashboard';
import './Feed.css';

export default function Feed() {
  const navigate = useNavigate();

  // Auth Context / State
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const _id = localStorage.getItem('_id');
  const isLoggedIn = Boolean(token);
  const isFarmer = isLoggedIn && user === 'farmer';

  // Items State
  const [items, setItems] = useState([]);
  const [activeTab, setActiveTab] = useState('All Items');

  // Filter Modal State (Drafts)
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filterType, setFilterType] = useState('All');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('Newest First');

  // Filter Modal State (Applied)
  const [appliedFilterType, setAppliedFilterType] = useState('All');
  const [appliedMinPrice, setAppliedMinPrice] = useState('');
  const [appliedMaxPrice, setAppliedMaxPrice] = useState('');
  const [appliedSortBy, setAppliedSortBy] = useState('Newest First');

  // Add Item Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [itemType, setItemType] = useState('Fruit');
  const [price, setPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState('');

  const addFileInputRef = useRef(null);

  // Add to Cart Confirmation Modal State
  const [showCartModal, setShowCartModal] = useState(false);
  const [selectedCartItem, setSelectedCartItem] = useState(null);
  const [cartQuantity, setCartQuantity] = useState(1);

  // Order Checkout Modal State
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [orderQuantity, setOrderQuantity] = useState('');
  const [orderPin, setOrderPin] = useState('');
  const [city, setCity] = useState('');
  const [orderState, setOrderState] = useState('');

  const placeholderImage = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80';

  const getImageSource = (itemData) => {
    const imageId = itemData?.itemPictures?.[0]?.id;
    if (!imageId) return placeholderImage;
    if (imageId.startsWith('local:')) {
      const fileName = imageId.replace('local:', '');
      return `${API_BASE}/${fileName}`;
    }
    return `https://drive.google.com/thumbnail?id=${imageId}`;
  };

  // Fetch Items
  const fetchItems = () => {
    axios
      .get(`${API_BASE}/getitem`)
      .then((response) => {
        const fetched = response?.data?.response || [];
        setItems(fetched.slice().reverse());
      })
      .catch((err) => {
        console.error('Error fetching marketplace items:', err);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Filter & Sort Items
  const filteredItems = items
    .filter((item) => {
      const typeStr = (item.itemtype || item.ItemType || '').toLowerCase();

      // Top bar active tab filtering
      if (activeTab === 'Fruits' && !typeStr.includes('fruit')) return false;
      if (activeTab === 'Vegetables' && !typeStr.includes('veg')) return false;
      if (activeTab === 'My Listings' && _id !== item.createdBy) return false;

      // Filter Modal Product Type
      if (appliedFilterType === 'Fruit' && !typeStr.includes('fruit')) return false;
      if (appliedFilterType === 'Vegetable' && !typeStr.includes('veg')) return false;
      if (appliedFilterType === 'Grain' && !typeStr.includes('grain')) return false;

      // Filter Modal Price Range
      const itemPrice = Number(item.price || 0);
      if (appliedMinPrice !== '' && itemPrice < Number(appliedMinPrice)) return false;
      if (appliedMaxPrice !== '' && itemPrice > Number(appliedMaxPrice)) return false;

      return true;
    })
    .sort((a, b) => {
      if (appliedSortBy === 'Oldest First') {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      }
      if (appliedSortBy === 'Price: Low to High') {
        return Number(a.price || 0) - Number(b.price || 0);
      }
      if (appliedSortBy === 'Price: High to Low') {
        return Number(b.price || 0) - Number(a.price || 0);
      }
      if (appliedSortBy === 'Stock: High to Low') {
        const stockA = Number(a.availableQuantity || a.quantity || 0);
        const stockB = Number(b.availableQuantity || b.quantity || 0);
        return stockB - stockA;
      }
      // Default: 'Newest First'
      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });

  // Filter Modal Actions
  const handleApplyFilters = () => {
    setAppliedFilterType(filterType);
    setAppliedMinPrice(minPrice);
    setAppliedMaxPrice(maxPrice);
    setAppliedSortBy(sortBy);
    setShowFilterModal(false);
  };

  const handleResetFilters = () => {
    setFilterType('All');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('Newest First');
    setAppliedFilterType('All');
    setAppliedMinPrice('');
    setAppliedMaxPrice('');
    setAppliedSortBy('Newest First');
    setShowFilterModal(false);
  };

  // Add Item Modal Actions
  const handleOpenAddModal = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setItemName('');
    setItemType('Fruit');
    setPrice('');
    setQuantity('');
    setDescription('');
    setImageFile(null);
    setImagePreviewUrl('');
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreviewUrl(URL.createObjectURL(file));
  };

  const handlePostItem = (e) => {
    if (e) e.preventDefault();

    if (!itemName || !itemType || !price || !quantity) {
      toast.warning('Please fill in all required fields.', {
        position: toast.POSITION.BOTTOM_RIGHT
      });
      return;
    }

    const info = new FormData();
    info.append('ItemName', itemName);
    info.append('ItemType', itemType);
    info.append('Price', price);
    info.append('Quantity', quantity);
    if (description) {
      info.append('Description', description);
    }
    if (imageFile) {
      info.append('itemPictures', imageFile, imageFile.name);
    }

    axios({
      url: `${API_BASE}/postitem`,
      method: 'POST',
      data: info,
      headers: {
        Authorization: token ? `Bearer ${token}` : ''
      }
    })
      .then(() => {
        handleCloseAddModal();
        toast.success('Wohoo 🤩! Item listed successfully.', {
          position: toast.POSITION.BOTTOM_RIGHT
        });
        fetchItems();
      })
      .catch((err) => {
        console.error('Post item error:', err);
        toast.error('Failed to list item. Please try again.', {
          position: toast.POSITION.BOTTOM_RIGHT
        });
      });
  };

  // Handle Item Delete
  const handleDeleteItem = (itemId) => {
    axios
      .post(`${API_BASE}/deleteitem`, { id: itemId })
      .then(() => {
        setItems((prev) => prev.filter((it) => it._id !== itemId));
        toast.success('Item deleted successfully.', {
          position: toast.POSITION.BOTTOM_RIGHT
        });
      })
      .catch((err) => {
        console.error('Delete item error:', err);
        toast.error('Could not delete item.', {
          position: toast.POSITION.BOTTOM_RIGHT
        });
      });
  };

  // Add to Cart Modal Handlers
  const handleOpenAddToCartModal = (item) => {
    setSelectedCartItem(item);
    setCartQuantity(1);
    setShowCartModal(true);
  };

  const handleCloseCartModal = () => {
    setShowCartModal(false);
    setSelectedCartItem(null);
    setCartQuantity(1);
  };

  const handleConfirmAddToCart = () => {
    if (!selectedCartItem) return;
    const stock = Number(
      selectedCartItem.availableQuantity !== undefined && selectedCartItem.availableQuantity !== null
        ? selectedCartItem.availableQuantity
        : (selectedCartItem.quantity !== undefined ? selectedCartItem.quantity : 100)
    );
    if (cartQuantity > stock || cartQuantity <= 0) {
      toast.error(`Invalid quantity selected. Maximum stock available: ${stock} KG.`, {
        position: toast.POSITION.BOTTOM_RIGHT
      });
      return;
    }

    // Pass quantity into Order Checkout Modal
    setOrderQuantity(cartQuantity);
    setShowCartModal(false);
    setShowOrderModal(true);
  };

  // Order Checkout Submit
  const handlePlaceOrder = (e) => {
    if (e) e.preventDefault();

    if (!selectedCartItem?._id) {
      toast.error('No product selected.', {
        position: toast.POSITION.BOTTOM_RIGHT
      });
      return;
    }

    if (!buyerName || !buyerPhone || !city || !orderPin || !orderState || !orderQuantity) {
      toast.error('Please fill in all order details.', {
        position: toast.POSITION.BOTTOM_RIGHT
      });
      return;
    }

    const payload = {
      productId: selectedCartItem._id,
      productName: selectedCartItem.itemname || selectedCartItem.ItemName || 'Papaya',
      price: Number(selectedCartItem.price || selectedCartItem.Price || 120),
      sellerId: selectedCartItem.createdBy || '600000000000000000000000',
      buyerName,
      buyerPhone,
      quantity: Number(orderQuantity),
      city,
      state: orderState,
      pinCode: orderPin,
    };

    axios
      .post(`${API_BASE}/place-order`, payload)
      .then((res) => {
        setShowOrderModal(false);
        toast.success('Wohoo 🤩! Your order has been placed successfully.', {
          position: toast.POSITION.BOTTOM_RIGHT
        });
        setBuyerName('');
        setBuyerPhone('');
        setOrderQuantity('');
        setOrderPin('');
        setCity('');
        setOrderState('');
        setSelectedCartItem(null);
        fetchItems();
      })
      .catch((err) => {
        console.error('Order placement error:', err);
        const errMsg = err.response?.data?.error || err.message || 'Failed to place order. Please try again.';
        toast.error(errMsg, {
          position: toast.POSITION.BOTTOM_RIGHT
        });
      });
  };

  const tabsList = ['All Items', 'Fruits', 'Vegetables'];
  if (isLoggedIn && isFarmer) {
    tabsList.push('My Listings');
    tabsList.push('Farmer Dashboard');
  }

  return (
    <div className="feed-container">
      {/* PAGE HEADER */}
      <header className="feed-header">
        <div>
          <h1 className="feed-header-title">Marketplace</h1>
          <p className="feed-header-subtitle">
            Browse listed yields, compare prices, and manage your farmer inventory.
          </p>
        </div>
        <div className="feed-header-actions">
          {activeTab !== 'Farmer Dashboard' && (
            <button
              type="button"
              className="feed-btn feed-btn-outline"
              onClick={() => setShowFilterModal(true)}
            >
              <i className="ti ti-filter" />
              <span>Filter</span>
            </button>
          )}
          {isFarmer && (
            <button
              type="button"
              className="feed-btn feed-btn-primary"
              onClick={handleOpenAddModal}
            >
              <i className="ti ti-plus" />
              <span>Add Listing</span>
            </button>
          )}
        </div>
      </header>

      {/* FILTER TABS */}
      <nav className="feed-tabs-container">
        {tabsList.map((tab) => (
          <button
            key={tab}
            type="button"
            className={`feed-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </nav>

      {/* TAB CONTENT: FARMER DASHBOARD vs PRODUCT GRID */}
      {activeTab === 'Farmer Dashboard' ? (
        <FarmerDashboard />
      ) : (
        <div className="feed-product-grid">
          {filteredItems.map((marketItem) => {
            const createdAt = marketItem.createdAt
              ? new Date(marketItem.createdAt).toLocaleDateString()
              : 'Recent';
            const isOwner = _id === marketItem.createdBy;

            return (
              <article key={marketItem._id} className="feed-card">
                <img
                  className="feed-card-image"
                  src={getImageSource(marketItem)}
                  alt={marketItem.itemname || 'Yield'}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = placeholderImage;
                  }}
                />
                <div className="feed-card-body">
                  <div className="feed-card-top-row">
                    <h3 className="feed-card-title">{marketItem.itemname || 'Fresh Produce'}</h3>
                    <span className="feed-card-badge">{marketItem.itemtype || 'Crop'}</span>
                  </div>
                  <h4 className="feed-card-price">
                    ₨ {marketItem.price ? marketItem.price : '0'} / KG
                  </h4>
                  <div className="feed-card-meta">
                    <span>Stock: {marketItem.availableQuantity || marketItem.quantity || 0} KGs</span>
                    <span>Listed: {createdAt}</span>
                  </div>

                  {isLoggedIn && isFarmer ? (
                    <button
                      type="button"
                      className="feed-action-btn feed-action-btn-red"
                      onClick={() => handleDeleteItem(marketItem._id)}
                    >
                      <i className="ti ti-trash" />
                      <span>Delete Item</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="feed-action-btn feed-action-btn-green"
                      onClick={() => handleOpenAddToCartModal(marketItem)}
                    >
                      <i className="ti ti-shopping-cart" />
                      <span>Add to Cart</span>
                    </button>
                  )}
                </div>
              </article>
            );
          })}

          {/* ADD NEW ITEM CARD (only for logged-in farmers) */}
          {isFarmer && (
            <div className="feed-add-card" onClick={handleOpenAddModal}>
              <i className="ti ti-plus feed-add-icon" />
              <span className="feed-add-text">Add New Item</span>
            </div>
          )}

          {filteredItems.length === 0 && !isFarmer && (
            <div className="feed-empty-state">
              <i className="ti ti-box feed-empty-icon" />
              <h3 className="feed-empty-title">No items found</h3>
              <p className="feed-empty-text">Try adjusting your active filters or check back later.</p>
            </div>
          )}
        </div>
      )}

      {/* FILTER MODAL OVERLAY */}
      {showFilterModal && (
        <div
          className="modal-overlay-bg"
          onClick={() => setShowFilterModal(false)}
        >
          <div
            className="filter-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="filter-modal-header">
              <h2 className="filter-modal-title">Filter Products</h2>
              <button
                type="button"
                className="filter-modal-close"
                onClick={() => setShowFilterModal(false)}
              >
                <i className="ti ti-x" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="filter-modal-body">
              {/* Section 1: Product Type */}
              <div>
                <label className="filter-section-label">Product Type</label>
                <div className="filter-pills-row">
                  {['All', 'Fruit', 'Vegetable', 'Grain'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      className={`filter-pill ${
                        filterType === type
                          ? 'filter-pill-selected'
                          : 'filter-pill-unselected'
                      }`}
                      onClick={() => setFilterType(type)}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Section 2: Price Range */}
              <div>
                <label className="filter-section-label">
                  Price Range (₨ per KG)
                </label>
                <div className="filter-price-row">
                  <input
                    type="number"
                    className="filter-input"
                    placeholder="Min Price"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                  />
                  <input
                    type="number"
                    className="filter-input"
                    placeholder="Max Price"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                  />
                </div>
              </div>

              {/* Section 3: Sort By */}
              <div>
                <label className="filter-section-label">Sort By</label>
                <select
                  className="filter-select"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="Newest First">Newest First</option>
                  <option value="Oldest First">Oldest First</option>
                  <option value="Price: Low to High">Price: Low to High</option>
                  <option value="Price: High to Low">Price: High to Low</option>
                  <option value="Stock: High to Low">Stock: High to Low</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="filter-modal-footer">
              <button
                type="button"
                className="filter-btn-reset"
                onClick={handleResetFilters}
              >
                Reset
              </button>
              <button
                type="button"
                className="filter-btn-apply"
                onClick={handleApplyFilters}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD LISTING MODAL OVERLAY */}
      {showAddModal && (
        <div
          className="modal-overlay-bg"
          onClick={handleCloseAddModal}
        >
          <div
            className="add-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hidden File Input */}
            <input
              ref={addFileInputRef}
              type="file"
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handleImageChange}
            />

            {/* Modal Header */}
            <div className="add-modal-header">
              <h2 className="add-modal-title">Add New Listing</h2>
              <button
                type="button"
                className="filter-modal-close"
                onClick={handleCloseAddModal}
              >
                <i className="ti ti-x" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handlePostItem} className="add-modal-form">
              {/* Row 1 */}
              <div className="add-form-row">
                <div className="add-field-group">
                  <label className="add-field-label" htmlFor="addProductName">
                    Product Name
                  </label>
                  <input
                    id="addProductName"
                    className="add-input"
                    type="text"
                    placeholder="e.g. Apple"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    required
                  />
                </div>

                <div className="add-field-group">
                  <label className="add-field-label" htmlFor="addProductType">
                    Product Type
                  </label>
                  <select
                    id="addProductType"
                    className="add-select"
                    value={itemType}
                    onChange={(e) => setItemType(e.target.value)}
                  >
                    <option value="Fruit">Fruit</option>
                    <option value="Vegetable">Vegetable</option>
                    <option value="Grain">Grain</option>
                    <option value="Herb">Herb</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              {/* Row 2 */}
              <div className="add-form-row">
                <div className="add-field-group">
                  <label className="add-field-label" htmlFor="addPrice">
                    Price per KG
                  </label>
                  <div className="add-input-prefix-wrap">
                    <span className="add-input-prefix">₨</span>
                    <input
                      id="addPrice"
                      className="add-input add-input-prefixed"
                      type="number"
                      placeholder="e.g. 300"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="add-field-group">
                  <label className="add-field-label" htmlFor="addStock">
                    Stock (KG)
                  </label>
                  <input
                    id="addStock"
                    className="add-input"
                    type="number"
                    placeholder="e.g. 400"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Product Image Upload */}
              <div className="add-field-group">
                <label className="add-field-label">Product Image</label>
                <div
                  className="add-image-dropzone"
                  onClick={() => addFileInputRef.current?.click()}
                >
                  {imagePreviewUrl ? (
                    <img
                      src={imagePreviewUrl}
                      alt="Product Preview"
                      className="add-preview-img"
                    />
                  ) : (
                    <>
                      <i className="ti ti-cloud-upload add-image-icon" />
                      <span className="add-image-text">
                        Click to upload product image
                      </span>
                      <span className="add-image-subtext">
                        PNG, JPG supported
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Description (Optional) */}
              <div className="add-field-group">
                <label className="add-field-label" htmlFor="addDescription">
                  Description (optional)
                </label>
                <textarea
                  id="addDescription"
                  className="add-textarea"
                  rows={3}
                  placeholder="Describe your product quality, harvest date, etc."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              {/* Modal Footer */}
              <div className="add-modal-footer">
                <button
                  type="button"
                  className="add-btn-cancel"
                  onClick={handleCloseAddModal}
                >
                  Cancel
                </button>
                <button type="submit" className="add-btn-post">
                  <i className="ti ti-check" />
                  <span>Post Listing</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD TO CART CONFIRMATION MODAL */}
      {showCartModal && selectedCartItem && (
        <div
          className="modal-overlay-bg"
          onClick={handleCloseCartModal}
        >
          <div
            className="cart-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="filter-modal-header">
              <h2 className="filter-modal-title">Add to Cart</h2>
              <button
                type="button"
                className="filter-modal-close"
                onClick={handleCloseCartModal}
              >
                <i className="ti ti-x" />
              </button>
            </div>

            {/* Product Preview Card */}
            <div className="cart-preview-card">
              <img
                src={getImageSource(selectedCartItem)}
                alt={selectedCartItem.itemname || 'Yield'}
                className="cart-preview-img"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = placeholderImage;
                }}
              />
              <div className="cart-preview-info">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h3 className="cart-preview-name">
                    {selectedCartItem.itemname || 'Fresh Produce'}
                  </h3>
                  <span className="feed-card-badge">
                    {selectedCartItem.itemtype || 'Crop'}
                  </span>
                </div>
                <h4 className="cart-preview-price">
                  ₨ {selectedCartItem.price ? selectedCartItem.price : '0'} / KG
                </h4>
              </div>
            </div>

            {/* Quantity Selector */}
            <div>
              <label className="cart-qty-label">Select Quantity (KG)</label>
              <div className="cart-qty-row">
                <button
                  type="button"
                  className="cart-qty-btn"
                  onClick={() => setCartQuantity((prev) => Math.max(1, prev - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  className="cart-qty-input"
                  value={cartQuantity}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    setCartQuantity(isNaN(val) ? '' : val);
                  }}
                  min={1}
                />
                <button
                  type="button"
                  className="cart-qty-btn"
                  onClick={() => setCartQuantity((prev) => (Number(prev) || 0) + 1)}
                >
                  +
                </button>
              </div>

              {/* Total & Stock Meta */}
              {(() => {
                const stock = Number(
                  selectedCartItem.availableQuantity ||
                    selectedCartItem.quantity ||
                    0
                );
                const priceNum = Number(selectedCartItem.price || 0);
                const qtyNum = Number(cartQuantity) || 0;
                const total = priceNum * qtyNum;
                const isExceeded = qtyNum > stock || qtyNum <= 0;

                return (
                  <>
                    <div className="cart-summary-meta">
                      <span className="cart-total-text">
                        Total: ₨ {total.toLocaleString()}
                      </span>
                      <span className="cart-stock-text">
                        Available: {stock} KG in stock
                      </span>
                    </div>

                    {isExceeded && (
                      <p className="cart-error-msg">
                        {qtyNum <= 0
                          ? 'Please enter a valid quantity'
                          : 'Exceeds available stock'}
                      </p>
                    )}
                  </>
                );
              })()}
            </div>

            {/* Modal Footer */}
            {(() => {
              const stock = Number(
                selectedCartItem.availableQuantity ||
                  selectedCartItem.quantity ||
                  0
              );
              const qtyNum = Number(cartQuantity) || 0;
              const isInvalid = qtyNum > stock || qtyNum <= 0;

              return (
                <div className="cart-modal-footer">
                  <button
                    type="button"
                    className="cart-btn-cancel"
                    onClick={handleCloseCartModal}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="cart-btn-submit"
                    onClick={handleConfirmAddToCart}
                    disabled={isInvalid}
                  >
                    <i className="ti ti-shopping-cart" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* ORDER CHECKOUT MODAL */}
      {showOrderModal && (
        <div
          className="modal-overlay-bg"
          onClick={() => setShowOrderModal(false)}
        >
          <div
            className="add-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="add-modal-header">
              <h2 className="add-modal-title">
                Checkout {selectedCartItem?.itemname ? `- ${selectedCartItem.itemname}` : ''}
              </h2>
              <button
                type="button"
                className="filter-modal-close"
                onClick={() => setShowOrderModal(false)}
              >
                <i className="ti ti-x" />
              </button>
            </div>
            <form onSubmit={handlePlaceOrder} className="add-modal-form">
              <div className="add-form-row">
                <div className="add-field-group">
                  <label className="add-field-label">Your Full Name</label>
                  <input
                    type="text"
                    className="add-input"
                    placeholder="e.g. Muhammad Sajjad"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    required
                  />
                </div>
                <div className="add-field-group">
                  <label className="add-field-label">Mobile Number</label>
                  <input
                    type="tel"
                    className="add-input"
                    placeholder="e.g. +92 300 1234567"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="add-field-group">
                <label className="add-field-label">Required Quantity (KGs)</label>
                <input
                  type="number"
                  className="add-input"
                  value={orderQuantity}
                  onChange={(e) => setOrderQuantity(e.target.value)}
                  required
                />
              </div>
              <div className="add-form-row">
                <div className="add-field-group">
                  <label className="add-field-label">City</label>
                  <input
                    type="text"
                    className="add-input"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                </div>
                <div className="add-field-group">
                  <label className="add-field-label">State / Province</label>
                  <input
                    type="text"
                    className="add-input"
                    value={orderState}
                    onChange={(e) => setOrderState(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="add-field-group">
                <label className="add-field-label">Pin Code</label>
                <input
                  type="number"
                  className="add-input"
                  value={orderPin}
                  onChange={(e) => setOrderPin(e.target.value)}
                  required
                />
              </div>
              <div className="add-modal-footer">
                <button
                  type="button"
                  className="add-btn-cancel"
                  onClick={() => setShowOrderModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="add-btn-post">
                  <i className="ti ti-check" />
                  <span>Confirm Order</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
