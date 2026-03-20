import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiRequest } from '../../utils/api';
import { useOrderWebSocket, useWebSocket } from '../../hooks/useWebSocket';
import { useToast } from '../SuccessAlert/SuccessAlert';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function MyOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const pageSize = 5;

  const { isConnected } = useWebSocket(user);

  const handleOrderStatusUpdate = (data) => {
    console.log('Order status update received:', data);

    setOrders((prevOrders) => {
      return prevOrders.map((order) => {
        if (order.orderId === data.orderId) {
          const updatedOrder = {
            ...order,
            status: data.status,
            updatedAt: data.timestamp
          };
          return updatedOrder;
        }
        return order;
      });
    });

    const toast = useToast();
    toast.success(`Order ${data.orderId} status updated to ${data.status}`);
  };

  useOrderWebSocket(user, handleOrderStatusUpdate, null);

  const toast = useToast();

  const getStatusColorClass = (status) => {
    const colorMap = {
      pending: 'text-yellow-600',
      processing: 'text-blue-600',
      shipped: 'text-indigo-600',
      delivered: 'text-green-600',
      cancelled: 'text-red-600'
    };
    return colorMap[status] || 'text-gray-600';
  };

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      setLoading(true);
      setError('');
      try {
        const result = await apiRequest(`${API_BASE_URL}/api/orders/my`);
        if (!isMounted) return;

        if (result && result.error) {
          setError(result.message || 'Failed to load orders.');
          setOrders([]);
        } else {
          setOrders(result.orders || []);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('MyOrders fetch error:', err);
        setError('Failed to load orders.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (user) {
      loadOrders();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">My Orders</h1>
        <p className="text-gray-600">You need to be logged in to view your orders.</p>
      </div>
    );
  }

  const filteredOrders = useMemo(() => {
    if (statusFilter === 'all') return orders;
    return orders.filter((o) => o.status === statusFilter);
  }, [orders, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const pageItems = filteredOrders.slice(startIndex, startIndex + pageSize);

  const handleStatusChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(1);
  };

  const goToPrevPage = () => {
    setPage((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const goToNextPage = () => {
    setPage((prev) => (prev < totalPages ? prev + 1 : prev));
  };

  const refreshOrders = async () => {
    if (!user) return;

    setLoading(true);
    setError('');
    try {
      const result = await apiRequest(`${API_BASE_URL}/api/orders/my`);
      if (result && result.error) {
        setError(result.message || 'Failed to load orders.');
        setOrders([]);
      } else {
        setOrders(result.orders || []);
      }
    } catch (err) {
      console.error('MyOrders refresh error:', err);
      setError('Failed to refresh orders.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (order) => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await apiRequest(`${API_BASE_URL}/api/orders/${order.orderId}/cancel`, {
        method: 'POST',
      });

      if (result && result.error) {
        toast.error(result.message || 'Failed to cancel order.');
      } else {
        toast.success('Order cancelled successfully');

        refreshOrders();
      }
    } catch (err) {
      toast.error('Failed to cancel order. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            My Orders
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'} animate-pulse`}></div>
              <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-gray-600'}`}>
                {isConnected ? 'Live Updates' : 'No Live Updates'}
              </span>
            </div>
          </h1>
          <p className="text-gray-600 mt-1">Track and manage your recent orders</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {}
          <button
            onClick={refreshOrders}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Refresh
          </button>

          {}
          {!loading && !error && orders.length > 0 && (
            <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-lg">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-medium text-emerald-700">Active Orders</span>
              </div>
              <span className="text-sm font-bold text-emerald-800">
                {orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length}
              </span>
            </div>
          )}
        </div>
      </div>

      {}
      {loading && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="text-red-800 font-medium">{error}</p>
              <p className="text-red-600 text-sm">Please try refreshing the page</p>
            </div>
          </div>
        </div>
      )}

      {}
      {!loading && !error && orders.length > 0 && (
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-2">
              <span className="text-sm text-gray-700 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={handleStatusChange}
                className="text-sm border-0 bg-transparent focus:outline-none focus:ring-0"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">Showing {pageItems.length}</span>
              <span>of {filteredOrders.length} orders</span>
            </div>
          </div>

          {}
          <div className="flex items-center gap-2">
            {statusFilter !== 'all' && (
              <button
                onClick={() => setStatusFilter('all')}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Clear filter
              </button>
            )}
          </div>
        </div>
      )}

      {}
      {!loading && !error && orders.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4zM3 8a3 3 0 013-3h12a3 3 0 013 3v7a3 3 0 01-3 3H6a3 3 0 01-3-3V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here. Your order history will be saved and easily accessible.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
                Browse Products
              </Link>
              <Link
                to="/categories"
                className="inline-flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                View Categories
              </Link>
            </div>
          </div>
        </div>
      )}

      {}
      {!loading && !error && orders.length > 0 && (
        <>
          <div className="grid gap-6">
            {pageItems.map((order) => (
              <div
                key={order._id}
                className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-gray-300"
              >
                {}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-emerald-700" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M4 3a2 2 0 00-2 2v1h16V5a2 2 0 00-2-2H4zM3 8a1 1 0 011-1h12a1 1 0 011 1v5a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Order ID</p>
                      <p className="font-mono font-semibold text-gray-900 break-all">{order.orderId}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="text-2xl font-bold text-emerald-600">
                        ${(
                          (order.totalAmount && order.totalAmount.toFixed ? order.totalAmount.toFixed(2) : order.totalAmount) ||
                          (order.amount && order.amount.toFixed ? order.amount.toFixed(2) : order.amount)
                        )}
                      </p>
                    </div>

                    <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-semibold capitalize ${
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                      order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                      {order.updatedAt && (
                        <span className="ml-2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" title="Recently updated"></span>
                      )}
                    </div>
                  </div>
                </div>

                {}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Order Date</p>
                    <p className="text-sm font-medium">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}
                    </p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                    <p className="text-sm font-medium capitalize">{order.paymentMethod || 'N/A'}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                    <p className={`text-sm font-medium capitalize ${
                      order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      {order.paymentStatus || 'pending'}
                    </p>
                  </div>
                </div>

                {}
                {order.shippingAddress && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 019.9-9.9A7 7 0 013 10c0-1.467.433-2.82 1.205-3.932a3.91 3.91 0 012.845-1.618z" clipRule="evenodd" />
                      </svg>
                      <p className="font-medium text-gray-900">Delivery Address</p>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-900">{order.shippingAddress.full_name}</p>
                      {order.shippingAddress.phone && <p>{order.shippingAddress.phone}</p>}
                      <p>{order.shippingAddress.address}</p>
                      {order.shippingAddress.city && order.shippingAddress.state && order.shippingAddress.pincode && (
                        <p>{`${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`}</p>
                      )}
                    </div>
                  </div>
                )}

                {}
                {Array.isArray(order.items) && order.items.length > 0 && (
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-semibold text-gray-900">Items in this order</h4>
                      <span className="text-xs text-gray-500">{order.items.length} item(s)</span>
                    </div>
                    <div className="grid gap-3">
                      {order.items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                          {item.img && (
                            <img
                              src={item.img}
                              alt={item.name || item.title || 'Item'}
                              className="w-16 h-16 rounded-lg object-cover border border-gray-200"
                            />
                          )}
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{item.name || item.title || 'Item'}</div>
                            <div className="text-sm text-gray-600">
                              {item.quantity != null && (
                                <>
                                  Quantity: {item.quantity}
                                  {item.unit && <span className="ml-2">({item.unit})</span>}
                                  {item.total && (
                                    <span className="ml-3 font-medium text-gray-900">
                                      - ${item.total}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-600">Unit Price</div>
                            <div className="font-semibold">
                              ${item.price?.toFixed ? item.price.toFixed(2) : item.price}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-6 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Need help? Contact our support team for assistance with your order.
                  </div>
                  <div className="flex items-center gap-3">
                    <Link
                      to={`/orders/${order.orderId}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      View Details
                    </Link>
                    {(order.status === 'pending' || order.status === 'processing') && (
                      <button
                        onClick={() => handleCancelOrder(order)}
                        className="inline-flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 bg-red-50 font-medium rounded-lg hover:bg-red-100 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {}
          <div className="flex items-center justify-center lg:justify-between mt-8 gap-4">
            <div className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={goToPrevPage}
                disabled={currentPage <= 1}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentPage <= 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Previous
              </button>
              <button
                type="button"
                onClick={goToNextPage}
                disabled={currentPage >= totalPages}
                className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  currentPage >= totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                Next
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default MyOrders;