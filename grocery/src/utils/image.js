const FALLBACK_IMAGE = "https://placehold.co/400x300?text=Fresh+Grocery";

export function optimizeImage(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") {
    return FALLBACK_IMAGE;
  }

  const trimmed = imageUrl.trim();

  if (trimmed.startsWith("data:image")) {
    return FALLBACK_IMAGE;
  }

  return trimmed;
}

export function getFallbackImage() {
  return FALLBACK_IMAGE;
}
