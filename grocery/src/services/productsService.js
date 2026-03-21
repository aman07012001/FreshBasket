import axios from 'axios';
import { buildApiEndpoint } from '../utils/urlUtils';

const api = axios.create({
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const PRODUCTS_URL = () => buildApiEndpoint('products');
const PRODUCT_URL  = (id) => buildApiEndpoint(`products/${id}`);

const CATEGORY_KEY_MAP = {
  meat:       'Meat',
  vegetables: 'Vegetables',
  fruits:     'Fruits',
  dairy:      'Dairy',
  grains:     'Grains',
};

export async function getAllProductGroups() {
  try {
    const { data } = await api.get(PRODUCTS_URL());
    return groupByCategory(data.products);
  } catch (err) {
    console.error('productsService.getAllProductGroups error:', err);
    return [];
  }
}

export async function getFlattenedProductsWithCategory() {
  try {
    const { data } = await api.get(PRODUCTS_URL());
    return data.products; 
  } catch (err) {
    console.error('productsService.getFlattenedProductsWithCategory error:', err);
    return [];
  }
}

export async function getProductsByCategoryKey(categoryKey) {
  try {
    const params = {};

    if (categoryKey) {
      const normalizedKey  = String(categoryKey).toLowerCase();
      const categoryName   = CATEGORY_KEY_MAP[normalizedKey]
        ?? (categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1).toLowerCase());
      params.category = categoryName;
    }

    const { data } = await api.get(PRODUCTS_URL(), { params });
    return data.products;
  } catch (err) {
    console.error('productsService.getProductsByCategoryKey error:', err);
    return [];
  }
}

export async function getTopItemsByIndex(index, limit = 3) {
  try {
    const groups = await getAllProductGroups();
    const group  = groups[index];
    if (!group || !Array.isArray(group.items)) return [];
    return group.items.slice(0, limit);
  } catch (err) {
    console.error('productsService.getTopItemsByIndex error:', err);
    return [];
  }
}

export async function createProduct(productData) {
  try {
    const { data } = await api.post(PRODUCTS_URL(), productData);
    return data;
  } catch (err) {
    console.error('productsService.createProduct error:', err?.response?.data || err);
    return null;
  }
}

export async function updateProduct(id, updates) {
  try {
    const { data } = await api.put(PRODUCT_URL(id), updates);
    return data;
  } catch (err) {
    console.error('productsService.updateProduct error:', err?.response?.data || err);
    return null;
  }
}

export async function deleteProduct(id) {
  try {
    const { data } = await api.delete(PRODUCT_URL(id));
    return data;
  } catch (err) {
    console.error('productsService.deleteProduct error:', err?.response?.data || err);
    return null;
  }
}

function groupByCategory(products = []) {
  const order = ['Meat', 'Vegetables', 'Fruits', 'Dairy', 'Grains'];
  const map   = {};

  for (const product of products) {
    if (!map[product.category]) {
      map[product.category] = { category: product.category, items: [] };
    }
    map[product.category].items.push(product);
  }

  return order.filter((c) => map[c]).map((c) => map[c]);
}
