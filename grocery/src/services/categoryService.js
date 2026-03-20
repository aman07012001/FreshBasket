import axios from 'axios';
import { buildApiEndpoint } from '../utils/urlUtils';

const api = axios.create({
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

const CATEGORIES_URL = () => buildApiEndpoint('categories');

export async function fetchCategories() {
  try {
    const { data: categories } = await api.get(CATEGORIES_URL());

    const CATEGORY_KEY_MAP = {};
    categories.forEach((cat) => {
      CATEGORY_KEY_MAP[cat.slug] = cat.name;
    });

    return { categories, CATEGORY_KEY_MAP };
  } catch (error) {
    console.error('categoryService.fetchCategories error:', error);
    return { categories: [], CATEGORY_KEY_MAP: {} };
  }
}

export function resolveCategoryName(slug, map) {
  if (!slug) return '';
  return (
    map[slug] ??
    slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  );
}
