// Simple validation test script
const { deliverySchema, orderSchema } = require('./src/validation/schemas.js');

async function testValidation() {
  console.log('Testing validation schemas...\n');

  // Test delivery schema
  console.log('1. Testing deliverySchema:');
  
  try {
    const validDelivery = {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '1234567890',
      address: '123 Main St',
      pincode: '123456',
      city: 'New York',
      state: 'NY'
    };
    
    await deliverySchema.validate(validDelivery);
    console.log('   ✓ Valid delivery data passed');
  } catch (error) {
    console.log('   ✗ Valid delivery data failed:', error.message);
  }

  try {
    const invalidDelivery = {
      phone: '123456', // too short
      address: '123 Main St',
      pincode: '123456',
      city: 'New York',
      state: 'NY'
    };
    
    await deliverySchema.validate(invalidDelivery);
    console.log('   ✗ Invalid delivery data should have failed');
  } catch (error) {
    console.log('   ✓ Invalid delivery data correctly rejected');
  }

  // Test order schema
  console.log('\n2. Testing orderSchema:');
  
  try {
    const validOrder = {
      items: [
        {
          productId: 'prod123',
          name: 'Test Product',
          price: 19.99,
          quantity: 2,
          img: 'product.jpg'
        }
      ],
      paymentMethod: 'ONLINE',
      totalAmount: 39.98,
      deliveryAddress: {
        name: 'John Doe',
        phone: '1234567890',
        pincode: '123456',
        address: '123 Main St',
        city: 'New York',
        state: 'NY',
        email: 'john@example.com'
      }
    };
    
    await orderSchema.validate(validOrder);
    console.log('   ✓ Valid order data passed');
  } catch (error) {
    console.log('   ✗ Valid order data failed:', error.message);
  }

  try {
    const invalidOrder = {
      items: [],
      paymentMethod: 'ONLINE',
      totalAmount: 0,
      deliveryAddress: {
        name: 'John Doe',
        phone: '1234567890',
        pincode: '123456',
        address: '123 Main St',
        city: 'New York',
        state: 'NY'
      }
    };
    
    await orderSchema.validate(invalidOrder);
    console.log('   ✗ Invalid order data should have failed');
  } catch (error) {
    console.log('   ✓ Invalid order data correctly rejected');
  }

  console.log('\n✅ Validation tests completed!');
}

testValidation().catch(console.error);