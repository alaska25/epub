import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

const readStored = (key, fallback) => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

// Carts saved before templates were tagged with `itemType` would be sent to
// checkout as books. Templates are the only items with a zip file, so tag
// those on load. Entries that already have an itemType are left alone.
const tagLegacyItems = (items) =>
  items.map((item) =>
    item.itemType || item.fileType !== "zip" ? item : { ...item, itemType: "template" }
  );

export const CartProvider = ({ children }) => {
  const [items, setItems] = useState(() => tagLegacyItems(readStored("adyoolau_cart", [])));

  // Ids of items the shopper un-ticked ("buy later"). Storing the exceptions,
  // not the ticked ones, means every newly added item is ticked by default.
  const [buyLaterIds, setBuyLaterIds] = useState(() => readStored("adyoolau_cart_later", []));

  useEffect(() => {
    localStorage.setItem("adyoolau_cart", JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem("adyoolau_cart_later", JSON.stringify(buyLaterIds));
  }, [buyLaterIds]);

  const addItem = (item) => {
    setItems((prev) => (prev.some((i) => i._id === item._id) ? prev : [...prev, item]));
  };

  const removeItem = (itemId) => {
    setItems((prev) => prev.filter((i) => i._id !== itemId));
    setBuyLaterIds((prev) => prev.filter((id) => id !== itemId));
  };

  // Remove several items at once, e.g. only the ones that were just purchased.
  const removeItems = (itemIds) => {
    const ids = new Set(itemIds);
    setItems((prev) => prev.filter((i) => !ids.has(i._id)));
    setBuyLaterIds((prev) => prev.filter((id) => !ids.has(id)));
  };

  const clearCart = () => {
    setItems([]);
    setBuyLaterIds([]);
  };

  // --- Selection: which items are ticked for purchase right now ---
  const isSelected = (itemId) => !buyLaterIds.includes(itemId);

  const toggleSelected = (itemId) => {
    setBuyLaterIds((prev) =>
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    );
  };

  const selectAll = () => setBuyLaterIds([]);
  const deselectAll = () => setBuyLaterIds(items.map((i) => i._id));

  const selectedItems = items.filter((i) => isSelected(i._id));
  const allSelected = items.length > 0 && selectedItems.length === items.length;

  // `total` is what the shopper is about to pay: ticked items only.
  const total = selectedItems.reduce((sum, i) => sum + i.price, 0);
  // Value of everything in the cart, ticked or not.
  const cartTotal = items.reduce((sum, i) => sum + i.price, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        removeItems,
        clearCart,
        isSelected,
        toggleSelected,
        selectAll,
        deselectAll,
        selectedItems,
        allSelected,
        total,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);