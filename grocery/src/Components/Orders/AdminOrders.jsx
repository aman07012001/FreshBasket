import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { apiRequest } from '../../utils/api';
import { useOrderWebSocket, useWebSocket } from '../../hooks/useWebSocket';
import { useToast } from '../SuccessAlert/SuccessAlert';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function AdminOrders() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [updatingId, setUpdatingId] = useState(null);
  const [page, setPage] = useState(1);
  const [newOrderCount, setNewOrderCount] = useState(0);
  const pageSize = 10;

  const isAdmin = user && (user.role === 'admin');

  const { isConnected } = useWebSocket(user);

  const handleOrderStatusUpdate = (data) => {
    console.log('Admin order status update received:', data);

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

  const handleNewOrder = (data) => {
    console.log('New order received:', data);

    setOrders((prevOrders) => {
      const exists = prevOrders.some(order => order.orderId === data.orderId);
      if (!exists) {
        return [data, ...prevOrders];
      }
      return prevOrders;
    });

    setNewOrderCount(count => count + 1);

    const toast = useToast();
    toast.info(`New order ${data.orderId} received!`);
  };

  useOrderWebSocket(user, handleOrderStatusUpdate, handleNewOrder);

  const toast = useToast();

  useEffect(() => {
    let isMounted = true;

    async function loadOrders() {
      setLoading(true);
      setError('');
      try {
        const result = await apiRequest(`${API_BASE_URL}/api/orders`);
        if (!isMounted) return;

        if (result && result.error) {
          setError(result.message || 'Failed to load orders.');
          setOrders([]);
        } else {
          setOrders(result.orders || []);
        }
      } catch (err) {
        if (!isMounted) return;
        console.error('AdminOrders fetch error:', err);
        setError('Failed to load orders.');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (isAdmin) {
      loadOrders();
    } else {
      setLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isAdmin]);

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Admin Orders</h1>
        <p className="text-gray-600">You need to be logged in to view this page.</p>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-semibold mb-4">Admin Orders</h1>
        <p className="text-red-600">You do not have permission to view this page.</p>
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
    if (!isAdmin) return;

    setLoading(true);
    setError('');
    try {
      const result = await apiRequest(`${API_BASE_URL}/api/orders`);
      if (result && result.error) {
        setError(result.message || 'Failed to load orders.');
        setOrders([]);
      } else {
        setOrders(result.orders || []);
        setNewOrderCount(0); 
      }
    } catch (err) {
      console.error('AdminOrders refresh error:', err);
      setError('Failed to refresh orders.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColorClass = (status) => {
    const colorMap = {
      pending: 'bg-yellow-100 text-yellow-800',
      processing: 'bg-blue-100 text-blue-800',
      shipped: 'bg-indigo-100 text-indigo-800',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusDisplayName = (status) => {
    const statusMap = {
      pending: 'Pending',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return statusMap[status] || status;
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    setError('');
    try {
      const result = await apiRequest(`${API_BASE_URL}/api/orders/${orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      if (result && result.error) {
        setError(result.message || 'Failed to update order status.');
      } else {

        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      setError('Failed to update order status.');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 00-2 2v1h16V5a2 2 0 00-2-2H4zM3 8a1 1 0 011-1h12a1 1 0 011 1v5a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
              </svg>
              Admin Orders
            </h1>
            <p className="text-gray-600 mt-1">Manage and track all customer orders</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {}
            <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'} animate-pulse`}></div>
                <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-gray-600'}`}>
                  {isConnected ? 'Live Updates' : 'No Live Updates'}
                </span>
              </div>

              {}
              {newOrderCount > 0 && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                    {newOrderCount} new order{newOrderCount > 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>

            {}
            <button
              onClick={refreshOrders}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Orders
            </button>

            {}
            {newOrderCount > 0 && (
              <button
                onClick={() => setNewOrderCount(0)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                Clear Notifications
              </button>
            )}
          </div>
        </div>
      </div>

      {}
      {loading && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/6"></div>
            </div>
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-16 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {}
      {!loading && error && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
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
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-2">
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

              {}
              <div className="flex items-center gap-4">
                <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                  <div className="text-xs text-emerald-700">Active Orders</div>
                  <div className="text-lg font-bold text-emerald-800">
                    {orders.filter(o => ['pending', 'processing', 'shipped'].includes(o.status)).length}
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  <div className="text-xs text-blue-700">Completed</div>
                  <div className="text-lg font-bold text-blue-800">
                    {orders.filter(o => o.status === 'delivered').length}
                  </div>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <div className="text-xs text-red-700">Cancelled</div>
                  <div className="text-lg font-bold text-red-800">
                    {orders.filter(o => o.status === 'cancelled').length}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="bg-gray-100 px-2 py-1 rounded-full text-xs">Showing {pageItems.length}</span>
              <span>of {filteredOrders.length} orders</span>
            </div>
          </div>
        </div>
      )}

      {}
      {!loading && !error && orders.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4zM3 8a3 3 0 013-3h12a3 3 0 013 3v7a3 3 0 01-3 3H6a3 3 0 01-3-3V8z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-6">There are currently no orders to display. Orders will appear here once customers start placing them.</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={refreshOrders}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Refresh
              </button>
            </div>
          </div>
        </div>
      )}

      {}
      {!loading && !error && orders.length > 0 && (
        <>
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Order ID</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Customer</th>
                    <th className="px-4 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">Amount</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Payment</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created</th>
                    <th className="px-4 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pageItems.map((order) => {
                    const displayAmount =
                      (order.totalAmount != null ? order.totalAmount : order.amount);
                    const statusColorClass = getStatusColorClass(order.status);
                    const statusDisplayName = getStatusDisplayName(order.status);

                    return (
                      <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 text-emerald-700" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M4 3a2 2 0 00-2 2v1h16V5a2 2 0 00-2-2H4zM3 8a1 1 0 011-1h12a1 1 0 011 1v5a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
                              </svg>
                            </div>
                            <Link
                              to={`/orders/${order.orderId}`}
                              className="font-mono text-sm text-emerald-600 hover:text-emerald-800 font-medium"
                            >
                              {order.orderId}
                            </Link>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-sm font-semibold text-gray-900">
                              {order.userId ? `User ${order.userId.toString().slice(-6)}` : 'Anonymous'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {order.deliveryAddress?.email || 'No email'}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-right">
                          <div className="text-sm font-bold text-gray-900">
                            ${displayAmount?.toFixed ? displayAmount.toFixed(2) : displayAmount}
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${statusColorClass}`}>
                              {statusDisplayName}
                              {order.updatedAt && (
                                <span className="ml-2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" title="Recently updated"></span>
                              )}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                            order.paymentStatus === 'paid'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.paymentStatus || 'pending'}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleDateString() + ' ' +
                              new Date(order.createdAt).toLocaleTimeString()
                            : 'N/A'}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap">
                          {order.canUpdateStatus ? (
                            <select
                              className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-all duration-200 ${
                                updatingId === order.orderId
                                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
                                  : 'bg-white text-gray-700 border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                              }`}
                              value={order.status}
                              onChange={(event) =>
                                handleUpdateStatus(order.orderId, event.target.value)
                              }
                              disabled={updatingId === order.orderId}
                            >
                              <option value="pending">Pending</option>
                              <option value="processing">Processing</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          ) : (
                            <span className="text-gray-400 text-sm">No actions</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {}
          <div className="flex items-center justify-center lg:justify-between mt-6 gap-4">
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

export default AdminOrders;
