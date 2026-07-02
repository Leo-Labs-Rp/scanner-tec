"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { CartItem, Product } from "@/types/product";

const storageKey = "scannertec_quote_cart";
const storageEventName = "scannertec_quote_cart_updated";
const emptyCart: CartItem[] = [];

let cachedRaw = "";
let cachedCart: CartItem[] = emptyCart;

function getServerSnapshot() {
  return emptyCart;
}

function readStoredCart() {
  if (typeof window === "undefined") return emptyCart;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      cachedRaw = "";
      cachedCart = emptyCart;
      return cachedCart;
    }

    if (raw === cachedRaw) return cachedCart;

    const parsed = JSON.parse(raw) as CartItem[];
    cachedRaw = raw;
    cachedCart = Array.isArray(parsed) ? parsed : emptyCart;
    return cachedCart;
  } catch {
    cachedRaw = "";
    cachedCart = emptyCart;
    return cachedCart;
  }
}

function writeStoredCart(cart: CartItem[]) {
  if (typeof window === "undefined") return;
  const nextCart = cart.length ? cart : emptyCart;
  const serialized = JSON.stringify(nextCart);

  cachedRaw = serialized;
  cachedCart = nextCart;

  window.localStorage.setItem(storageKey, serialized);
  window.dispatchEvent(new Event(storageEventName));
}

function subscribe(onStoreChange: () => void) {
  if (typeof window === "undefined") return () => undefined;

  const handleStorage = (event: Event) => {
    if (event instanceof StorageEvent && event.key && event.key !== storageKey) return;
    onStoreChange();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(storageEventName, handleStorage);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(storageEventName, handleStorage);
  };
}

export function useQuoteCart() {
  const cart = useSyncExternalStore(subscribe, readStoredCart, getServerSnapshot);

  const total = useMemo(
    () => cart.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0),
    [cart]
  );

  const totalItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  function setCart(updater: CartItem[] | ((current: CartItem[]) => CartItem[])) {
    const current = readStoredCart();
    const next = typeof updater === "function" ? updater(current) : updater;
    writeStoredCart(next);
  }

  function addToCart(product: Product) {
    setCart((current) => {
      const existing = current.find((item) => item.id === product.id);
      if (existing) {
        return current.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }

      return [...current, { ...product, quantity: 1 }];
    });
  }

  function removeFromCart(productId: string) {
    setCart((current) => current.filter((item) => item.id !== productId));
  }

  function clearCart() {
    writeStoredCart([]);
  }

  return {
    cart,
    total,
    totalItems,
    addToCart,
    removeFromCart,
    clearCart,
    setCart
  };
}
