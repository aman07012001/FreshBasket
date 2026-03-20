import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { inventoryApi } from '../services/inventoryService';
import { useAuth } from '../hooks/useAuth';

const InventoryContext = createContext();

const inventoryReducer = (state, action) => {
  switch (action.type) {
    case 'SET_INVENTORY':
      return {
        ...state,
        inventory: action.payload,
        loading: false
      };
    case 'SET_LOW_STOCK':
      return {
        ...state,
        lowStockProducts: action.payload
      };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        inventory: state.inventory.map(product =>
          product.productId === action.payload.productId ? action.payload : product
        )
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    default:
      return state;
  }
};

const initialState = {
  inventory: [],
  lowStockProducts: [],
  loading: false,
  error: null
};

export const InventoryProvider = ({ children }) => {
  const [state, dispatch] = useReducer(inventoryReducer, initialState);
  const { user } = useAuth();

  const loadInventory = async (options = {}) => {
    if (!user || user.role !== 'admin') return;

    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const response = await inventoryApi.getAllInventory(options);
      dispatch({ type: 'SET_INVENTORY', payload: response.data });

      const lowStockResponse = await inventoryApi.getLowStockProducts();
      dispatch({ type: 'SET_LOW_STOCK', payload: lowStockResponse.data });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
    }
  };

  const updateInventory = async (productId, quantity, reason) => {
    try {
      const result = await inventoryApi.updateProductInventory(productId, quantity, reason);
      dispatch({ type: 'UPDATE_PRODUCT', payload: result.data });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    }
  };

  const restockProduct = async (productId, quantity, reason) => {
    try {
      const result = await inventoryApi.restockProduct(productId, quantity, reason);
      dispatch({ type: 'UPDATE_PRODUCT', payload: result.data });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    }
  };

  const updateThreshold = async (productId, threshold) => {
    try {
      const result = await inventoryApi.updateLowStockThreshold(productId, threshold);
      dispatch({ type: 'UPDATE_PRODUCT', payload: result.data });
      return { success: true };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      return { success: false, message: error.message };
    }
  };

  return (
    <InventoryContext.Provider
      value={{
        ...state,
        loadInventory,
        updateInventory,
        restockProduct,
        updateThreshold
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within InventoryProvider');
  }
  return context;
};