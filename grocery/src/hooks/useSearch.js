import { useMemo, useState } from "react";

export function useSearch(items, { keys = ["name", "category"] } = {}) {
  const [query, setQuery] = useState("");

  const normalizedQuery = query.trim().toLowerCase();

  const results = useMemo(() => {
    if (!Array.isArray(items)) return [];
    if (!normalizedQuery) return items;

    return items.filter((item) => {
      return keys.some((key) => {
        const value = item && item[key];
        if (typeof value !== "string") return false;
        return value.toLowerCase().includes(normalizedQuery);
      });
    });
  }, [items, normalizedQuery, JSON.stringify(keys)]);

  return { query, setQuery, results, resetQuery: () => setQuery("") };
}
