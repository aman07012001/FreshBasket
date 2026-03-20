import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useToast } from '../SuccessAlert/SuccessAlert';

function OrderTestDashboard() {
  const { user } = useAuth();
  const [testOrder, setTestOrder] = useState(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const toast = useToast();

  const isAdmin = user && (user.role === 'admin');

  const testOrderData = {
    items: [
      {
        productId: 'test-product-001',
        name: 'Test Product',
        price: 25.99,
        quantity: 2,
        img: 'https://via.placeholder.com/100'
      }
    ],
    paymentMethod: 'COD',
    totalAmount: 51.98,
    deliveryAddress: {
      name: 'Test User',
      phone: '1234567890',
      pincode: '123456',
      address: 'Test Address, Test City',
      city: 'Test City',
      state: 'Test State',
      email: 'test@example.com'
    }
  };

  const handleCreateTestOrder = async () => {
    if (!user) {
      toast.error('You need to be logged in to create a test order');
      return;
    }

    setIsCreatingOrder(true);
    try {
      const response = await fetch('http://localhost:5000/api/orders/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify(testOrderData)
      });

      const result = await response.json();

      if (response.ok) {
        setTestOrder(result.order);
        toast.success(`Test order ${result.order.orderId} created successfully!`);
      } else {
        toast.error(result.message || 'Failed to create test order');
      }
    } catch (error) {
      console.error('Error creating test order:', error);
      toast.error('Failed to create test order. Please check the console for details.');
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const handleUpdateOrderStatus = async (newStatus) => {
    if (!testOrder) return;

    try {
      const response = await fetch(`http://localhost:5000/api/orders/${testOrder.orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const result = await response.json();

      if (response.ok) {
        setTestOrder(result.order);
        toast.success(`Order status updated to ${newStatus}`);
      } else {
        toast.error(result.message || 'Failed to update order status');
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusButtons = () => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    return statuses.map(status => (
      <button
        key={status}
        onClick={() => handleUpdateOrderStatus(status)}
        disabled={!testOrder || isCreatingOrder}
        className={`px-3 py-1 text-sm rounded mr-2 ${
          testOrder?.status === status
            ? 'bg-blue-600 text-white cursor-not-allowed'
            : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </button>
    ));
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Order Management Test Dashboard</h2>

        {!user ? (
          <div className="text-center py-8">
            <p className="text-gray-600 mb-4">Please log in to test the order management functionality</p>
          </div>
        ) : (
          <>
            {}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Create Test Order</h3>
              <button
                onClick={handleCreateTestOrder}
                disabled={isCreatingOrder}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreatingOrder ? 'Creating...' : 'Create Test Order'}
              </button>
            </div>

            {}
            {testOrder && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Test Order Status</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Order ID:</span>
                      <p className="font-mono font-medium">{testOrder.orderId}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <p className={`font-medium capitalize ${
                        testOrder.status === 'delivered' ? 'text-green-600' :
                        testOrder.status === 'cancelled' ? 'text-red-600' :
                        testOrder.status === 'shipped' ? 'text-indigo-600' :
                        testOrder.status === 'processing' ? 'text-blue-600' :
                        'text-yellow-600'
                      }`}>
                        {testOrder.status}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Amount:</span>
                      <p className="font-medium text-green-600">
                        ${testOrder.totalAmount?.toFixed(2) || testOrder.amount?.toFixed(2)}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Created:</span>
                      <p className="text-sm">{new Date(testOrder.createdAt).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {}
            {testOrder && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4">Update Order Status</h3>
                <div className="flex flex-wrap">
                  {getStatusButtons()}
                </div>
              </div>
            )}

            {}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Test Instructions:</h4>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. Create a test order using the button above</li>
                <li>2. Open another browser tab/window and log in as admin</li>
                <li>3. Navigate to Admin Orders page to see real-time updates</li>
                <li>4. Update the order status using the buttons above</li>
                <li>5. Observe real-time notifications and status updates</li>
              </ol>
            </div>

            {}
            {isAdmin && (
              <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">Admin Note:</h4>
                <p className="text-sm text-green-800">
                  As an admin, you can also update order statuses from the Admin Orders page.
                  Real-time updates will be reflected across all connected clients.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default OrderTestDashboard;