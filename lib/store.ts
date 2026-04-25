import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState, useCallback, useSyncExternalStore } from "react";

import { t } from "./i18n";

// =====================
// Types
// =====================
export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  imageUri?: string;
  createdAt: number;
  updatedAt: number;
};

export type Category = {
  id: string;
  name: string;
};

export type SaleType = "cash" | "utang";

export type Sale = {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  type: SaleType;
  debtorId?: string;
  debtorName?: string;
  timestamp: number;
};

export type Debtor = {
  id: string;
  name: string;
  notes?: string;
  createdAt: number;
};

export type DebtTxnType = "add" | "pay";

export type DebtTransaction = {
  id: string;
  debtorId: string;
  amount: number;
  type: DebtTxnType;
  saleId?: string;
  description?: string;
  timestamp: number;
};

export type Settings = {
  lowStockThreshold: number;
  notificationsEnabled: boolean;
};

export type StoreState = {
  products: Product[];
  categories: Category[];
  sales: Sale[];
  debtors: Debtor[];
  debtTransactions: DebtTransaction[];
  settings: Settings;
  hydrated: boolean;
};

// =====================
// Storage keys
// =====================
const STORAGE_KEY = "@sari_sync/state_v1";

// =====================
// Initial state
// =====================
const initialState: StoreState = {
  products: [],
  categories: t.defaultCategories.map((name, i) => ({
    id: `cat_default_${i}`,
    name,
  })),
  sales: [],
  debtors: [],
  debtTransactions: [],
  settings: {
    lowStockThreshold: 5,
    notificationsEnabled: true,
  },
  hydrated: false,
};

// =====================
// External store implementation (no Context, no Zustand)
// =====================
let state: StoreState = initialState;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function setState(updater: (s: StoreState) => StoreState) {
  state = updater(state);
  emit();
  // Persist (don't await)
  void persist();
}

async function persist() {
  try {
    const { hydrated, ...rest } = state;
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
  } catch (e) {
    console.error("[store] persist failed", e);
  }
}

export async function hydrateStore() {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Omit<StoreState, "hydrated">;
      state = {
        ...initialState,
        ...parsed,
        // Always merge categories — keep loaded ones
        categories: parsed.categories?.length ? parsed.categories : initialState.categories,
        settings: { ...initialState.settings, ...(parsed.settings || {}) },
        hydrated: true,
      };
    } else {
      state = { ...state, hydrated: true };
    }
    emit();
  } catch (e) {
    console.error("[store] hydrate failed", e);
    state = { ...state, hydrated: true };
    emit();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getState() {
  return state;
}

// =====================
// Hook to subscribe to store
// =====================
export function useStore<T>(selector: (s: StoreState) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(getState()),
    () => selector(getState()),
  );
}

export function useStoreState(): StoreState {
  return useStore((s) => s);
}

// =====================
// ID utility
// =====================
function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

// =====================
// Actions
// =====================
export const actions = {
  // Products
  addProduct(input: Omit<Product, "id" | "createdAt" | "updatedAt">): Product {
    const now = Date.now();
    const product: Product = {
      ...input,
      id: uid("prod"),
      createdAt: now,
      updatedAt: now,
    };
    setState((s) => ({ ...s, products: [product, ...s.products] }));
    return product;
  },

  updateProduct(id: string, patch: Partial<Omit<Product, "id" | "createdAt">>) {
    setState((s) => ({
      ...s,
      products: s.products.map((p) =>
        p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p,
      ),
    }));
  },

  deleteProduct(id: string) {
    setState((s) => ({
      ...s,
      products: s.products.filter((p) => p.id !== id),
    }));
  },

  // Categories
  addCategory(name: string): Category {
    const cat: Category = { id: uid("cat"), name: name.trim() };
    setState((s) => ({ ...s, categories: [...s.categories, cat] }));
    return cat;
  },

  updateCategory(id: string, name: string) {
    setState((s) => ({
      ...s,
      categories: s.categories.map((c) => (c.id === id ? { ...c, name: name.trim() } : c)),
    }));
  },

  deleteCategory(id: string) {
    setState((s) => ({
      ...s,
      categories: s.categories.filter((c) => c.id !== id),
    }));
  },

  // Sales
  recordSale(input: {
    productId: string;
    quantity: number;
    type: SaleType;
    debtorId?: string;
    debtorName?: string;
  }): { sale: Sale; product: Product } | { error: string } {
    const product = state.products.find((p) => p.id === input.productId);
    if (!product) return { error: "Walang nakitang paninda" };
    if (input.quantity <= 0) return { error: "Mali ang bilang" };
    if (product.stock < input.quantity) return { error: t.insufficientStock };

    const now = Date.now();
    const sale: Sale = {
      id: uid("sale"),
      productId: product.id,
      productName: product.name,
      quantity: input.quantity,
      unitPrice: product.price,
      total: product.price * input.quantity,
      type: input.type,
      debtorId: input.debtorId,
      debtorName: input.debtorName,
      timestamp: now,
    };

    let newProduct: Product = product;
    setState((s) => {
      newProduct = { ...product, stock: product.stock - input.quantity, updatedAt: now };
      const updates: Partial<StoreState> = {
        sales: [sale, ...s.sales],
        products: s.products.map((p) => (p.id === product.id ? newProduct : p)),
      };
      // If utang sale, log debt transaction
      if (input.type === "utang" && input.debtorId) {
        const debtTxn: DebtTransaction = {
          id: uid("dtxn"),
          debtorId: input.debtorId,
          amount: sale.total,
          type: "add",
          saleId: sale.id,
          description: `${input.quantity} x ${product.name}`,
          timestamp: now,
        };
        updates.debtTransactions = [debtTxn, ...s.debtTransactions];
      }
      return { ...s, ...updates };
    });

    return { sale, product: newProduct };
  },

  // Debtors
  addDebtor(name: string, notes?: string): Debtor {
    const debtor: Debtor = {
      id: uid("debt"),
      name: name.trim(),
      notes: notes?.trim() || undefined,
      createdAt: Date.now(),
    };
    setState((s) => ({ ...s, debtors: [debtor, ...s.debtors] }));
    return debtor;
  },

  updateDebtor(id: string, patch: Partial<Pick<Debtor, "name" | "notes">>) {
    setState((s) => ({
      ...s,
      debtors: s.debtors.map((d) => (d.id === id ? { ...d, ...patch } : d)),
    }));
  },

  deleteDebtor(id: string) {
    setState((s) => ({
      ...s,
      debtors: s.debtors.filter((d) => d.id !== id),
      debtTransactions: s.debtTransactions.filter((tx) => tx.debtorId !== id),
    }));
  },

  addManualDebt(debtorId: string, amount: number, description?: string) {
    const txn: DebtTransaction = {
      id: uid("dtxn"),
      debtorId,
      amount,
      type: "add",
      description,
      timestamp: Date.now(),
    };
    setState((s) => ({ ...s, debtTransactions: [txn, ...s.debtTransactions] }));
  },

  recordPayment(debtorId: string, amount: number, description?: string) {
    const txn: DebtTransaction = {
      id: uid("dtxn"),
      debtorId,
      amount,
      type: "pay",
      description,
      timestamp: Date.now(),
    };
    setState((s) => ({ ...s, debtTransactions: [txn, ...s.debtTransactions] }));
  },

  // Settings
  updateSettings(patch: Partial<Settings>) {
    setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
  },

  // Reset
  clearAll() {
    setState(() => ({
      ...initialState,
      hydrated: true,
    }));
  },
};

// =====================
// Selectors / derived
// =====================
export function getDebtorBalance(debtorId: string, transactions?: DebtTransaction[]): number {
  const txns = transactions ?? state.debtTransactions;
  return txns
    .filter((t) => t.debtorId === debtorId)
    .reduce((sum, t) => sum + (t.type === "add" ? t.amount : -t.amount), 0);
}

export function isLowStock(product: Product, threshold: number): boolean {
  return product.stock > 0 && product.stock <= threshold;
}

export function isOutOfStock(product: Product): boolean {
  return product.stock <= 0;
}

// =====================
// Hydration hook
// =====================
export function useHydration(): boolean {
  const hydrated = useStore((s) => s.hydrated);
  useEffect(() => {
    if (!hydrated) {
      void hydrateStore();
    }
  }, [hydrated]);
  return hydrated;
}
