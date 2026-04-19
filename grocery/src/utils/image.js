const FALLBACK_IMAGE = "https://placehold.co/400x300?text=Fresh+Grocery";

// Maps product names (lowercase) to their public-folder image URLs.
// Served from /public/products/... at predictable paths, no Vite hashing.
const PRODUCT_IMAGE_MAP = {
  // Meat
  "chicken meat": "/products/meat/chicken_meat.jpg.jpg",
  "crab meat": "/products/meat/crab_meat.jpg.jpg",
  // Vegetables
  "tomato": "/products/vegetables/tomato.jpg.jpg",
  "carrot": "/products/vegetables/carrot.jpg.jpg",
  "spinach": "/products/vegetables/spinach.jpg.jpg",
  "broccoli": "/products/vegetables/broccoli.jpg.jpg",
  // Fruits 
  "apple": "/products/fruits/apple.jpg.jpg",
  "banana": "/products/fruits/banana.jpg.jpg",
  "orange": "/products/fruits/orange.jpg.jpg",
  "grapes": "/products/fruits/grapes.jpg.jpg",
  // Dairy
  "milk": "/products/dairy/milk.jpg.jpg",
  "cheese": "/products/dairy/cheese.jpg.jpg",
  "yogurt": "/products/dairy/yogurt.jpg.jpg",
  "butter": "/products/dairy/butter.jpg.jpg",
  // Grains
  "rice": "/products/grains/rice.jpg.jpg",
  "wheat": "/products/grains/wheat.jpg.jpg",
  "oats": "/products/grains/oats.jpg.jpg",
  "barley": "/products/grains/barley.jpg.jpg",
};

/**
 * Returns a valid image URL for a product.
 * If the backend `img` field is empty/invalid, falls back to the
 * name-based public map, then to the generic placeholder.
 */
export function optimizeImage(imageUrl, productName) {
  const trimmed = typeof imageUrl === "string" ? imageUrl.trim() : "";

  // If we have a real non-data URL, use it directly
  if (trimmed && !trimmed.startsWith("data:image")) {
    return trimmed;
  }

  // Resolve via the product name map
  if (productName) {
    const key = String(productName).toLowerCase();
    if (PRODUCT_IMAGE_MAP[key]) {
      return PRODUCT_IMAGE_MAP[key];
    }
  }

  return FALLBACK_IMAGE;
}

export function getFallbackImage() {
  return FALLBACK_IMAGE;
}

export function getImageByName(productName) {
  if (!productName) return FALLBACK_IMAGE;
  const key = String(productName).toLowerCase();
  return PRODUCT_IMAGE_MAP[key] || FALLBACK_IMAGE;
}
