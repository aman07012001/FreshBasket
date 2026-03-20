import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiRequest } from '../../utils/api';
import { optimizeImage, getFallbackImage } from '../../utils/image';
import { useOrderWebSocket, useWebSocket } from '../../hooks/useWebSocket';
import { useToast } from '../SuccessAlert/SuccessAlert';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updating, setUpdating] = useState(false);

  const { isConnected } = useWebSocket();

  const handleOrderStatusUpdate = (data) => {
    if (data.orderId === id) {
      setOrder((prevOrder) => {
        if (prevOrder) {
          return {
            ...prevOrder,
            status: data.status,
            updatedAt: data.timestamp
          };
        }
        return prevOrder;
      });

      const toast = useToast();
      toast.success(`Order ${data.orderId} status updated to ${data.status}`);
    }
  };

  useOrderWebSocket(null, handleOrderStatusUpdate, null);

  const toast = useToast();

  useEffect(() => {
    let isMounted = true;

    async function loadOrder() {
      setLoading(true);
      setError('');
      try {
        const result = await apiRequest(`${API_BASE_URL}/api/orders/${id}`);
        if (!isMounted) return;
        if (result && result.error) {
          setError(result.message || 'Failed to load order.');
          setOrder(null);
        } else {
          setOrder(result.order || null);
        }
      } catch (err) {
        if (!isMounted) return;
        setError('Failed to load order.');
        setOrder(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      loadOrder();
    }

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleStatusChange = async (event) => {
    const newStatus = event.target.value;
    if (!order || !newStatus) return;

    setUpdating(true);
    setError('');
    try {
      const result = await apiRequest(`${API_BASE_URL}/api/orders/${order.orderId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      if (result && result.error) {
        setError(result.message || 'Failed to update status.');
      } else if (result && result.order) {
        setOrder(result.order);
      }
    } catch (err) {
      setError('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const handleCancelOrder = async (order) => {
    if (!window.confirm('Are you sure you want to cancel this order? This action cannot be undone.')) {
      return;
    }

    setUpdating(true);
    setError('');
    try {
      const result = await apiRequest(`${API_BASE_URL}/api/orders/${order.orderId}/cancel`, {
        method: 'POST',
      });

      if (result && result.error) {
        setError(result.message || 'Failed to cancel order.');
      } else {
        toast.success('Order cancelled successfully');

        setOrder((prevOrder) => ({
          ...prevOrder,
          status: 'cancelled',
          updatedAt: new Date().toISOString()
        }));
      }
    } catch (err) {
      setError('Failed to cancel order. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
            <div className="animate-pulse">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div>
                  <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                  <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                        <div className="w-20 h-20 bg-gray-200 rounded-xl"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="space-y-3">
                      {[1, 2, 3].map(j => (
                        <div key={j} className="h-4 bg-gray-200 rounded w-full"></div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border border-red-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-1">Failed to Load Order</h3>
                <p className="text-red-600 text-sm">{error}</p>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                </svg>
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center shadow-sm">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4zM3 8a3 3 0 013-3h12a3 3 0 013 3v7a3 3 0 01-3 3H6a3 3 0 01-3-3V8z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Order Not Found</h3>
              <p className="text-gray-600 mb-8 text-sm">
                The order you're looking for doesn't exist or may have been removed.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/my-orders"
                  className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-emerald-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-1.5-1.5a1 1 0 011.414-1.414L9 13.086l5.293-5.293a1 1 0 011.414 1.414l-6 6z" clipRule="evenodd" />
                  </svg>
                  Back to Orders
                </Link>
                <Link
                  to="/products"
                  className="inline-flex items-center gap-3 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                  Browse Products
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const delivery = order.deliveryAddress || {};
  const shipping = order.shippingAddress || {};
  const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const displayAmount =
    order.totalAmount != null && order.totalAmount !== undefined
      ? order.totalAmount
      : order.amount;

  const statusColorMap = {
    pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800',
  };

  const statusColorClass = statusColorMap[order.status] || 'bg-gray-100 text-gray-800';

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <div className="flex items-center gap-4 mb-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-700" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 00-2 2v1h16V5a2 2 0 00-2-2H4zM3 8a1 1 0 011-1h12a1 1 0 011 1v5a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    Order Details
                    <div className="flex items-center gap-2 text-sm">
                      <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-gray-400'} animate-pulse`}></div>
                      <span className={`font-medium ${isConnected ? 'text-green-600' : 'text-gray-600'}`}>
                        {isConnected ? 'Live Updates' : 'No Live Updates'}
                      </span>
                    </div>
                  </h1>
                  <p className="text-sm text-gray-600">Complete information about your order</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Order ID</p>
                    <p className="font-mono font-semibold text-gray-900">{order.orderId}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Order Date</p>
                    <p className="text-sm font-medium">{order.createdAt ? new Date(order.createdAt).toLocaleString() : 'N/A'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold capitalize ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                    order.status === 'shipped' ? 'bg-indigo-100 text-indigo-800' :
                    order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    <span className="w-2 h-2 rounded-full mr-2" style={{
                      backgroundColor: order.status === 'delivered' ? '#16a34a' :
                                      order.status === 'cancelled' ? '#dc2626' :
                                      order.status === 'shipped' ? '#4f46e5' :
                                      order.status === 'processing' ? '#2563eb' : '#f59e0b'
                    }}></span>
                    {order.status}
                    {order.updatedAt && (
                      <span className="ml-2 w-2 h-2 bg-yellow-400 rounded-full animate-pulse" title="Recently updated"></span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {}
        <div className="grid gap-6 lg:grid-cols-3">
          {}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M4 3a2 2 0 00-2 2v1h16V5a2 2 0 00-2-2H4zM3 8a1 1 0 011-1h12a1 1 0 011 1v5a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
                  </svg>
                  Items in this order
                </h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                  {Array.isArray(order.items) ? order.items.length : 0} item(s)
                </span>
              </div>

              {Array.isArray(order.items) && order.items.length > 0 ? (
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className="h-20 w-20 rounded-xl overflow-hidden bg-gray-200 flex-shrink-0">
                        <img
                          src={optimizeImage(item.img)}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getFallbackImage();
                          }}
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Unit Price</p>
                            <p className="text-lg font-bold text-gray-900">
                              ${item.price?.toFixed ? item.price.toFixed(2) : item.price}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="bg-white px-2 py-1 rounded-lg font-medium">
                              Qty: {item.quantity}
                            </span>
                            {item.productId && (
                              <span className="text-xs font-mono text-gray-500 bg-white px-2 py-1 rounded-lg">
                                #{item.productId}
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-500">Total</p>
                            <p className="text-lg font-semibold text-emerald-600">
                              ${(item.price * item.quantity)?.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 3a2 2 0 00-2 2v1h16V5a2 2 0 00-2-2H4zM3 8a1 1 0 011-1h12a1 1 0 011 1v5a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
                    </svg>
                  </div>
                  <p className="text-gray-500">No items found for this order.</p>
                </div>
              )}
            </div>
          </div>

          {}
          <div className="space-y-6">
            {}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                </svg>
                Order Summary
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>${displayAmount?.toFixed ? displayAmount.toFixed(2) : displayAmount}</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-emerald-600 font-medium">FREE</span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>Tax</span>
                  <span className="text-emerald-600 font-medium">Included</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-gray-900">Total Amount</span>
                    <span className="text-2xl font-bold text-emerald-600">
                      ${displayAmount?.toFixed ? displayAmount.toFixed(2) : displayAmount}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                Payment Information
              </h2>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                  <p className="font-semibold capitalize">{order.paymentMethod || 'N/A'}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-xs text-gray-500 mb-1">Payment Status</p>
                  <p className={`font-semibold capitalize ${
                    order.paymentStatus === 'paid' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {order.paymentStatus || 'pending'}
                  </p>
                </div>
              </div>
            </div>

            {}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 019.9-9.9A7 7 0 013 10c0-1.467.433-2.82 1.205-3.932a3.91 3.91 0 012.845-1.618z" clipRule="evenodd" />
                </svg>
                Delivery Address
              </h2>
              <div className="space-y-3">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="font-semibold text-gray-900 mb-2">
                    {delivery.name || shipping.full_name || '—'}
                  </p>
                  <div className="text-sm text-gray-600 space-y-1">
                    {delivery.phone || shipping.phone ? (
                      <p className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                        </svg>
                        {delivery.phone || shipping.phone}
                      </p>
                    ) : null}
                    <p className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 019.9-9.9A7 7 0 013 10c0-1.467.433-2.82 1.205-3.932a3.91 3.91 0 012.845-1.618z" clipRule="evenodd" />
                      </svg>
                      {delivery.address || shipping.address || '—'}
                    </p>
                    {delivery.city && delivery.state && delivery.pincode && (
                      <p className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 019.9-9.9A7 7 0 013 10c0-1.467.433-2.82 1.205-3.932a3.91 3.91 0 012.845-1.618z" clipRule="evenodd" />
                        </svg>
                        {`${delivery.city}, ${delivery.state} - ${delivery.pincode}`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {}
            {(order.status === 'pending' || order.status === 'processing') && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Cancel Order
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Cancel this order if it's still pending or being processed.
                </p>
                <button
                  onClick={() => handleCancelOrder(order)}
                  disabled={updating}
                  className={`inline-flex items-center gap-2 px-4 py-2 text-red-600 border border-red-200 bg-red-50 font-medium rounded-lg hover:bg-red-100 transition-colors ${
                    updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  Cancel Order
                </button>
              </div>
            )}

            {/* Admin Actions */}
            {order.canUpdateStatus && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-900 mb-3 flex items-center gap-3">
                  <svg className="w-5 h-5 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  Update Order Status
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  Choose a new status for this order. Changes will be reflected in real-time.
                </p>
                <div className="space-y-3">
                  {statusOptions.map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange({ target: { value: status } })}
                      disabled={updating || order.status === status}
                      className={`w-full text-left p-3 rounded-lg border transition-all duration-200 ${
                        order.status === status
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300'
                      } ${updating ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="capitalize">{status}</span>
                        {order.status === status && (
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 1.414l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {updating && (
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-3">
                    <div className="w-4 h-4 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    Updating order status...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;
