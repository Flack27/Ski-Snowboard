"use client";

import { create } from "zustand";
import type { Product } from "./products";

export type ModalItem = { product: Product; images: string[] };

type State = {
  item: ModalItem | null;
  open: (item: ModalItem) => void;
  close: () => void;
};

// Which product's detail overlay is open (null = closed).
export const useProductModal = create<State>((set) => ({
  item: null,
  open: (item) => set({ item }),
  close: () => set({ item: null }),
}));
