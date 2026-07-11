"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

// A cart line keeps a display snapshot (name/price/image) so the drawer can render
// without extra fetches. Prices here are for DISPLAY ONLY — the checkout API always
// recomputes the real total server-side from PocketBase (never trust the client).
export type CartItem = {
  id: string;
  qty: number;
  name: string;
  priceCents: number; // effective (sale) price
  regularCents: number; // for strikethrough
  image: string | null;
  slug: string;
  stock: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.id === item.id);
          if (existing) {
            const newQty = Math.min(existing.qty + qty, item.stock);
            return { items: s.items.map((i) => (i.id === item.id ? { ...i, ...item, qty: newQty } : i)) };
          }
          return { items: [...s.items, { ...item, qty: Math.min(qty, item.stock) }] };
        }),
      remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
      setQty: (id, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.id !== id)
              : s.items.map((i) => (i.id === id ? { ...i, qty: Math.min(qty, i.stock) } : i)),
        })),
      clear: () => set({ items: [] }),
    }),
    {
      name: "sos-cart",
      version: 1,
      // Drop carts saved before the store shape changed (they lack price fields).
      migrate: (persisted, version) => (version < 1 ? { items: [] } : (persisted as CartState)),
    },
  ),
);

export const useCartCount = () => useCart((s) => s.items.reduce((n, i) => n + i.qty, 0));
export const useCartSubtotal = () =>
  useCart((s) => s.items.reduce((n, i) => n + (i.priceCents ?? 0) * i.qty, 0));

// Non-persisted UI state for the slide-over drawer.
type DrawerState = { open: boolean; setOpen: (o: boolean) => void };
export const useCartDrawer = create<DrawerState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
}));
