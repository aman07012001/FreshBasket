import React, { useState } from 'react';
import { MyOrders } from './MyOrders';
import { AdminOrders } from './AdminOrders';
import { OrderDetails } from './OrderDetails';
import { OrderStates } from './OrderStates';
import { 
  AnimatedOrderCard, 
  InteractiveButton, 
  PulseIndicator,
  ConfettiAnimation,
  ScrollProgress 
} from './OrderMicroInteractions';
import './order-styles.css';

function OrderUITest() {
  const [testMode, setTestMode] = useState('my-orders'); 
  const [showConfetti, setShowConfetti] = useState(false);

  const mockOrders = [
    {
      _id: '1',
      orderId: 'ORD-1234567890',
      status: 'pending',
      totalAmount: 125.50,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      items: [
        { name: 'Organic Apples', price: 2.99, quantity: 5, img: 'https://via.placeholder.com/100' },
        { name: 'Fresh Milk', price: 3.50, quantity: 2, img: 'https://via.placeholder.com/100' }
      ],
      deliveryAddress: {
        full_name: 'John Doe',
        phone: '123-456-7890',
        address: '123 Main St, Anytown, USA',
        city: 'Anytown',
        state: 'CA',
        pincode: '12345'
      }
    },
    {
      _id: '2',
      orderId: 'ORD-0987654321',
      status: 'delivered',
      totalAmount: 89.99,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      items: [
        { name: 'Whole Wheat Bread', price: 4.99, quantity: 1, img: 'https://via.placeholder.com/100' },
        { name: 'Free-Range Eggs', price: 6.99, quantity: 2, img: 'https://via.placeholder.com/100' }
      ],
      deliveryAddress: {
        full_name: 'Jane Smith',
        phone: '098-765-4321',
        address: '456 Oak Ave, Somewhere, USA',
        city: 'Somewhere',
        state: 'NY',
        pincode: '54321'
      }
    }
  ];

  const mockOrder = mockOrders[0];

  const testUser = {
    _id: 'user123',
    email: 'test@example.com',
    role: 'admin'
  };

  const renderTestContent = () => {
    switch (testMode) {
      case 'my-orders':
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">My Orders Test</h3>
            <MyOrders />
          </div>
        );

      case 'admin-orders':
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Admin Orders Test</h3>
            <AdminOrders />
          </div>
        );

      case 'order-details':
        return (
          <div>
            <h3 className="text-lg font-semibold mb-4">Order Details Test</h3>
            <OrderDetails />
          </div>
        );

      case 'states':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Loading and Empty States Test</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-semibold mb-3">Loading State</h4>
                <OrderStates.OrderLoadingState message="Testing enhanced loading state..." />
              </div>

              <div>
                <h4 className="text-md font-semibold mb-3">Empty State</h4>
                <OrderStates.OrderEmptyState 
                  title="No Orders Found"
                  message="This is the enhanced empty state with beautiful design and helpful actions."
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-md font-semibold mb-3">Error State</h4>
                <OrderStates.OrderErrorState 
                  error="Connection Error"
                  message="Failed to load orders. Please check your internet connection and try again."
                  onRetry={() => console.log('Retry clicked')}
                />
              </div>

              <div>
                <h4 className="text-md font-semibold mb-3">Order Item Skeleton</h4>
                <OrderStates.OrderItemSkeleton />
              </div>
            </div>
          </div>
        );

      case 'interactions':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold mb-4">Micro-Interactions Test</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-md font-semibold">Animated Order Cards</h4>
                <AnimatedOrderCard index={0} delay={100}>
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="font-mono text-sm">ORD-1234567890</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-lg font-semibold text-green-600">$125.50</p>
                      </div>
                    </div>
                  </div>
                </AnimatedOrderCard>

                <AnimatedOrderCard index={1} delay={200}>
                  <div className="bg-white border border-gray-200 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500">Order ID</p>
                        <p className="font-mono text-sm">ORD-0987654321</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500">Total</p>
                        <p className="text-lg font-semibold text-green-600">$89.99</p>
                      </div>
                    </div>
                  </div>
                </AnimatedOrderCard>
              </div>

              <div className="space-y-4">
                <h4 className="text-md font-semibold">Interactive Buttons</h4>
                <div className="space-y-3">
                  <InteractiveButton 
                    variant="primary" 
                    size="md"
                    onClick={() => setShowConfetti(true)}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    Trigger Confetti
                  </InteractiveButton>

                  <InteractiveButton 
                    variant="secondary" 
                    size="md"
                    onClick={() => console.log('Secondary action')}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                    </svg>
                    Secondary Action
                  </InteractiveButton>

                  <InteractiveButton 
                    variant="danger" 
                    size="sm"
                    onClick={() => console.log('Danger action')}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    Danger Action
                  </InteractiveButton>
                </div>

                <h4 className="text-md font-semibold">Status Indicators</h4>
                <div className="flex items-center gap-3">
                  <PulseIndicator isActive={true} color="emerald" />
                  <PulseIndicator isActive={false} color="blue" />
                  <PulseIndicator isActive={true} color="yellow" />
                  <PulseIndicator isActive={false} color="red" />
                </div>
              </div>
            </div>

            <ConfettiAnimation isActive={showConfetti} />
          </div>
        );

      default:
        return <div>Select a test mode</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 py-8 px-4">
      {}
      <ScrollProgress />

      <div className="max-w-7xl mx-auto">
        {}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <svg className="w-8 h-8 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 3a2 2 0 00-2 2v1h16V5a2 2 0 00-2-2H4zM3 8a1 1 0 011-1h12a1 1 0 011 1v5a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
                </svg>
                Order UI Test Suite
              </h1>
              <p className="text-gray-600 mt-1">Test all the enhanced order management features</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <InteractiveButton 
                variant={testMode === 'my-orders' ? 'primary' : 'secondary'}
                onClick={() => setTestMode('my-orders')}
              >
                My Orders
              </InteractiveButton>
              <InteractiveButton 
                variant={testMode === 'admin-orders' ? 'primary' : 'secondary'}
                onClick={() => setTestMode('admin-orders')}
              >
                Admin Orders
              </InteractiveButton>
              <InteractiveButton 
                variant={testMode === 'order-details' ? 'primary' : 'secondary'}
                onClick={() => setTestMode('order-details')}
              >
                Order Details
              </InteractiveButton>
              <InteractiveButton 
                variant={testMode === 'states' ? 'primary' : 'secondary'}
                onClick={() => setTestMode('states')}
              >
                States
              </InteractiveButton>
              <InteractiveButton 
                variant={testMode === 'interactions' ? 'primary' : 'secondary'}
                onClick={() => setTestMode('interactions')}
              >
                Interactions
              </InteractiveButton>
            </div>
          </div>
        </div>

        {}
        <div className="space-y-6">
          {renderTestContent()}
        </div>

        {}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm mt-6">
          <h3 className="text-lg font-semibold mb-3">Test Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Visual Improvements:</h4>
              <ul className="space-y-1">
                <li>✓ Enhanced card layouts with better shadows and spacing</li>
                <li>✓ Improved status indicators with better visibility</li>
                <li>✓ Better typography hierarchy and readability</li>
                <li>✓ Consistent color scheme and branding</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Interactive Features:</h4>
              <ul className="space-y-1">
                <li>✓ Smooth hover animations and transitions</li>
                <li>✓ Touch-friendly button targets (44px minimum)</li>
                <li>✓ Loading and empty states with engaging designs</li>
                <li>✓ Micro-interactions for user feedback</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Mobile Responsiveness:</h4>
              <ul className="space-y-1">
                <li>✓ Responsive grid layouts that adapt to screen size</li>
                <li>✓ Touch-optimized controls and buttons</li>
                <li>✓ Proper spacing and typography scaling</li>
                <li>✓ Smooth scrolling and navigation</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Accessibility:</h4>
              <ul className="space-y-1">
                <li>✓ Proper ARIA labels and semantic HTML</li>
                <li>✓ Keyboard navigation support</li>
                <li>✓ High contrast mode compatibility</li>
                <li>✓ Reduced motion support</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderUITest;