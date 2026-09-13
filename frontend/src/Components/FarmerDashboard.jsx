import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_BASE } from '../config/api';
import './FarmerDashboard.css';

export default function FarmerDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userRole = localStorage.getItem('user');
  const farmerId = localStorage.getItem('_id');

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterTerm, setFilterTerm] = useState('');

  const isLoggedIn = Boolean(token);
  const isFarmer = isLoggedIn && userRole === 'farmer';

  const fetchOrders = () => {
    if (!farmerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    axios
      .get(`${API_BASE}/farmer-orders/${farmerId}`)
      .then((res) => {
        setOrders(res.data?.orders || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching farmer orders:', err);
        toast.error('Failed to load orders.', {
          position: toast.POSITION.BOTTOM_RIGHT
        });
        setLoading(false);
      });
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
    } else if (userRole !== 'farmer') {
      navigate('/marketplace');
    } else {
      fetchOrders();
    }
  }, [navigate, token, userRole, farmerId]);

  // Compute summary metrics
  const totalRevenue = orders.reduce((sum, ord) => sum + (Number(ord.totalAmount) || 0), 0);
  const totalQuantity = orders.reduce((sum, ord) => sum + (Number(ord.quantity) || 0), 0);
  const totalOrders = orders.length;

  const filteredOrders = orders.filter((ord) => {
    const term = filterTerm.toLowerCase();
    return (
      (ord.productName || '').toLowerCase().includes(term) ||
      (ord.buyerName || '').toLowerCase().includes(term) ||
      (ord.deliveryAddress?.city || '').toLowerCase().includes(term) ||
      (ord.deliveryAddress?.state || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="farmer-dash-container">
      {/* HEADER SECTION */}
      <header className="farmer-dash-header">
        <div>
          <div className="farmer-dash-title-row">
            <h1 className="farmer-dash-title">Farmer Dashboard</h1>
            <span className="farmer-dash-badge">Real-Time Sales</span>
          </div>
          <p className="farmer-dash-subtitle">
            Manage your sold crops, track buyer orders, and view delivery details in one place.
          </p>
        </div>
        <div className="farmer-dash-actions">
          <button
            type="button"
            className="farmer-dash-btn farmer-dash-btn-secondary"
            onClick={fetchOrders}
          >
            <i className="ti ti-refresh" />
            <span>Refresh Sales</span>
          </button>
          <button
            type="button"
            className="farmer-dash-btn farmer-dash-btn-primary"
            onClick={() => navigate('/marketplace')}
          >
            <i className="ti ti-plus" />
            <span>Add Marketplace Listing</span>
          </button>
        </div>
      </header>

      {/* METRICS STATS CARDS */}
      <div className="farmer-dash-stats-grid">
        <div className="farmer-stat-card">
          <div className="farmer-stat-icon-wrap icon-green">
            <i className="ti ti-currency-dollar" />
          </div>
          <div className="farmer-stat-info">
            <span className="farmer-stat-lbl">Total Sales Revenue</span>
            <h2 className="farmer-stat-val">₨ {totalRevenue.toLocaleString()}</h2>
          </div>
        </div>

        <div className="farmer-stat-card">
          <div className="farmer-stat-icon-wrap icon-blue">
            <i className="ti ti-shopping-cart-check" />
          </div>
          <div className="farmer-stat-info">
            <span className="farmer-stat-lbl">Completed Sales</span>
            <h2 className="farmer-stat-val">{totalOrders} Orders</h2>
          </div>
        </div>

        <div className="farmer-stat-card">
          <div className="farmer-stat-icon-wrap icon-amber">
            <i className="ti ti-scale" />
          </div>
          <div className="farmer-stat-info">
            <span className="farmer-stat-lbl">Produce Volume Sold</span>
            <h2 className="farmer-stat-val">{totalQuantity.toLocaleString()} KGs</h2>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="farmer-dash-toolbar">
        <div className="farmer-search-input-wrap">
          <i className="ti ti-search farmer-search-icon" />
          <input
            type="text"
            className="farmer-search-input"
            placeholder="Search orders by buyer name, crop, city..."
            value={filterTerm}
            onChange={(e) => setFilterTerm(e.target.value)}
          />
        </div>
        <span className="farmer-orders-count">
          Showing {filteredOrders.length} of {orders.length} orders
        </span>
      </div>

      {/* ORDERS / NOTIFICATIONS LIST */}
      <section className="farmer-orders-section">
        <h2 className="farmer-section-title">
          <i className="ti ti-bell-ring" />
          <span>Sold Product Notifications</span>
        </h2>

        {loading ? (
          <div className="farmer-dash-loading">
            <i className="ti ti-loader spin-icon" />
            <span>Loading orders...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="farmer-dash-empty">
            <div className="farmer-empty-icon">
              <i className="ti ti-package-off" />
            </div>
            <h3>No sales orders found</h3>
            <p>When buyers order your marketplace listings, their purchase notifications and delivery details will appear here.</p>
          </div>
        ) : (
          <div className="farmer-orders-grid">
            {filteredOrders.map((order) => {
              const formattedDate = order.orderDate
                ? new Date(order.orderDate).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })
                : 'N/A';

              const city = order.deliveryAddress?.city || 'N/A';
              const state = order.deliveryAddress?.state || 'N/A';
              const pinCode = order.deliveryAddress?.pinCode || 'N/A';

              return (
                <article key={order._id} className="farmer-order-card">
                  <div className="farmer-order-header">
                    <div className="farmer-order-product-tag">
                      <i className="ti ti-leaf" />
                      <span className="farmer-order-product-name">{order.productName}</span>
                    </div>
                    <span className="farmer-order-status-badge">
                      <i className="ti ti-check" /> Sold
                    </span>
                  </div>

                  <div className="farmer-order-body">
                    <div className="farmer-order-row">
                      <span className="farmer-order-label">
                        <i className="ti ti-user" /> Buyer Name:
                      </span>
                      <strong className="farmer-order-value">{order.buyerName}</strong>
                    </div>

                    <div className="farmer-order-row">
                      <span className="farmer-order-label">
                        <i className="ti ti-phone" /> Mobile Number:
                      </span>
                      <strong className="farmer-order-value">{order.buyerPhone || 'N/A'}</strong>
                    </div>

                    <div className="farmer-order-row">
                      <span className="farmer-order-label">
                        <i className="ti ti-box" /> Quantity Sold:
                      </span>
                      <strong className="farmer-order-value highlight-green">
                        {order.quantity} KGs
                      </strong>
                    </div>

                    <div className="farmer-order-row">
                      <span className="farmer-order-label">
                        <i className="ti ti-tag" /> Unit Price:
                      </span>
                      <span className="farmer-order-value">₨ {order.price} / KG</span>
                    </div>

                    <div className="farmer-order-row">
                      <span className="farmer-order-label">
                        <i className="ti ti-receipt" /> Total Amount:
                      </span>
                      <strong className="farmer-order-value highlight-revenue">
                        ₨ {(order.totalAmount || 0).toLocaleString()}
                      </strong>
                    </div>

                    <div className="farmer-order-divider" />

                    <div className="farmer-order-row align-top">
                      <span className="farmer-order-label">
                        <i className="ti ti-map-pin" /> Delivery Address:
                      </span>
                      <span className="farmer-order-address">
                        {city}, {state} — <span className="farmer-pin">{pinCode}</span>
                      </span>
                    </div>

                    <div className="farmer-order-row">
                      <span className="farmer-order-label">
                        <i className="ti ti-calendar-time" /> Order Date:
                      </span>
                      <span className="farmer-order-date">{formattedDate}</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <ToastContainer />
    </div>
  );
}
