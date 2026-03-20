import { api } from '../utils/api';

export const inventoryApi = {

  getProductInventory: async (productId) => {
    const response = await api.get(`/api/inventory/product/${productId}`);
    if (response.error) {
      throw new Error(response.message || 'Failed to fetch inventory');
    }
    return response;
  },

  updateProductInventory: async (productId, quantity, reason) => {
    const response = await api.put(`/api/inventory/product/${productId}`, {
      quantity,
      reason
    });
    if (response.error) {
      throw new Error(response.message || 'Failed to update inventory');
    }
    return response;
  },

  restockProduct: async (productId, quantity, reason) => {
    const response = await api.post(`/api/inventory/product/${productId}/restock`, {
      quantity,
      reason
    });
    if (response.error) {
      throw new Error(response.message || 'Failed to restock product');
    }
    return response;
  },

  reserveStock: async (productId, quantity) => {
    const response = await api.post(`/api/inventory/product/${productId}/reserve`, {
      quantity
    });
    if (response.error) {
      throw new Error(response.message || 'Failed to reserve stock');
    }
    return response;
  },

  releaseStock: async (productId, quantity) => {
    const response = await api.post(`/api/inventory/product/${productId}/release`, {
      quantity
    });
    if (response.error) {
      throw new Error(response.message || 'Failed to release stock');
    }
    return response;
  },

  getLowStockProducts: async () => {
    const response = await api.get('/api/inventory/low-stock');
    if (response.error) {
      throw new Error(response.message || 'Failed to fetch low stock products');
    }
    return response;
  },

  getAllInventory: async (options = {}) => {
    const params = new URLSearchParams(options);
    const response = await api.get(`/api/inventory?${params}`);
    if (response.error) {
      throw new Error(response.message || 'Failed to fetch inventory');
    }
    return response;
  },

  updateLowStockThreshold: async (productId, threshold) => {
    const response = await api.put(`/api/inventory/product/${productId}/threshold`, {
      threshold
    });
    if (response.error) {
      throw new Error(response.message || 'Failed to update threshold');
    }
    return response;
  }
};