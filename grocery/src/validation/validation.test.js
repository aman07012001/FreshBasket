import { describe, it, expect } from 'vitest';
import { deliverySchema, orderSchema } from './schemas';

describe('Validation Schemas', () => {
  describe('deliverySchema', () => {
    it('should validate correct delivery data', async () => {
      const validData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '1234567890',
        address: '123 Main St',
        pincode: '123456',
        city: 'New York',
        state: 'NY'
      };

      await expect(deliverySchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject data with missing required fields', async () => {
      const invalidData = {
        email: 'john@example.com',
        phone: '1234567890',
        address: '123 Main St'

      };

      await expect(deliverySchema.validate(invalidData)).rejects.toThrow();
    });

    it('should accept email as optional field', async () => {
      const validData = {
        name: 'John Doe',
        phone: '1234567890',
        address: '123 Main St',
        pincode: '123456',
        city: 'New York',
        state: 'NY'

      };

      await expect(deliverySchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should validate minimum phone length', async () => {
      const validData = {
        name: 'John Doe',
        phone: '1234567', 
        address: '123 Main St',
        pincode: '123456',
        city: 'New York',
        state: 'NY'
      };

      await expect(deliverySchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject phone with less than 7 characters', async () => {
      const invalidData = {
        name: 'John Doe',
        phone: '123456', 
        address: '123 Main St',
        pincode: '123456',
        city: 'New York',
        state: 'NY'
      };

      await expect(deliverySchema.validate(invalidData)).rejects.toThrow();
    });
  });

  describe('orderSchema', () => {
    it('should validate correct order data', async () => {
      const validData = {
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

      await expect(orderSchema.validate(validData)).resolves.toEqual(validData);
    });

    it('should reject order with empty items array', async () => {
      const invalidData = {
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

      await expect(orderSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should validate payment method enum values', async () => {
      const validDataCOD = {
        items: [
          {
            productId: 'prod123',
            name: 'Test Product',
            price: 19.99,
            quantity: 1
          }
        ],
        paymentMethod: 'COD',
        totalAmount: 19.99,
        deliveryAddress: {
          name: 'John Doe',
          phone: '1234567890',
          pincode: '123456',
          address: '123 Main St',
          city: 'New York',
          state: 'NY'
        }
      };

      await expect(orderSchema.validate(validDataCOD)).resolves.toEqual(validDataCOD);
    });

    it('should reject invalid payment method', async () => {
      const invalidData = {
        items: [
          {
            productId: 'prod123',
            name: 'Test Product',
            price: 19.99,
            quantity: 1
          }
        ],
        paymentMethod: 'INVALID',
        totalAmount: 19.99,
        deliveryAddress: {
          name: 'John Doe',
          phone: '1234567890',
          pincode: '123456',
          address: '123 Main St',
          city: 'New York',
          state: 'NY'
        }
      };

      await expect(orderSchema.validate(invalidData)).rejects.toThrow();
    });

    it('should validate non-negative prices and quantities', async () => {
      const validData = {
        items: [
          {
            productId: 'prod123',
            name: 'Test Product',
            price: 0, 
            quantity: 1,
            img: ''
          }
        ],
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

      await expect(orderSchema.validate(validData)).resolves.toEqual(validData);
    });
  });
});