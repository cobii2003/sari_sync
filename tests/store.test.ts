import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock AsyncStorage so it can run under vitest (Node)
vi.mock("@react-native-async-storage/async-storage", () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock React's useSyncExternalStore which would otherwise require react-dom in tests
vi.mock("react", async () => {
  const actual = (await vi.importActual<typeof import("react")>("react")) as Record<string, unknown>;
  return {
    ...actual,
    useSyncExternalStore: (
      _sub: () => () => void,
      getSnapshot: () => unknown,
    ) => getSnapshot(),
    useEffect: () => undefined,
    useState: <T,>(v: T) => [v, () => undefined] as const,
  };
});

import {
  actions,
  getDebtorBalance,
  isLowStock,
  isOutOfStock,
  hydrateStore,
} from "../lib/store";

describe("Sari Sync store", () => {
  beforeEach(async () => {
    actions.clearAll();
    await hydrateStore();
  });

  it("adds and deletes a product", () => {
    const p = actions.addProduct({
      name: "Coke 250ml",
      category: "Inumin",
      price: 18,
      stock: 24,
    });
    expect(p.id).toBeTruthy();
    actions.deleteProduct(p.id);
  });

  it("records a cash sale and decrements stock", () => {
    const product = actions.addProduct({
      name: "Bigas 1kg",
      category: "Pagkain",
      price: 60,
      stock: 10,
    });

    const result = actions.recordSale({
      productId: product.id,
      quantity: 3,
      type: "cash",
    });

    if ("error" in result) throw new Error(result.error);
    expect(result.product.stock).toBe(7);
    expect(result.sale.total).toBe(180);
    expect(result.sale.type).toBe("cash");
  });

  it("rejects sale when stock is insufficient", () => {
    const product = actions.addProduct({
      name: "Sigarilyo",
      category: "Sigarilyo",
      price: 10,
      stock: 2,
    });

    const result = actions.recordSale({
      productId: product.id,
      quantity: 5,
      type: "cash",
    });

    expect("error" in result).toBe(true);
  });

  it("records utang sale and creates debt transaction", () => {
    const product = actions.addProduct({
      name: "Sabon",
      category: "Sabon",
      price: 25,
      stock: 5,
    });
    const debtor = actions.addDebtor("Aling Maria");

    const result = actions.recordSale({
      productId: product.id,
      quantity: 2,
      type: "utang",
      debtorId: debtor.id,
      debtorName: debtor.name,
    });

    if ("error" in result) throw new Error(result.error);
    const balance = getDebtorBalance(debtor.id);
    expect(balance).toBe(50);
  });

  it("records payment and reduces debt balance", () => {
    const debtor = actions.addDebtor("Mang Juan");
    actions.addManualDebt(debtor.id, 100);
    expect(getDebtorBalance(debtor.id)).toBe(100);

    actions.recordPayment(debtor.id, 40);
    expect(getDebtorBalance(debtor.id)).toBe(60);

    actions.recordPayment(debtor.id, 60);
    expect(getDebtorBalance(debtor.id)).toBe(0);
  });

  it("low stock helper detects low and out-of-stock", () => {
    const lowProduct = {
      id: "1",
      name: "x",
      category: "y",
      price: 10,
      stock: 3,
      createdAt: 0,
      updatedAt: 0,
    };
    expect(isLowStock(lowProduct, 5)).toBe(true);
    expect(isOutOfStock(lowProduct)).toBe(false);

    const outProduct = { ...lowProduct, stock: 0 };
    expect(isOutOfStock(outProduct)).toBe(true);
    expect(isLowStock(outProduct, 5)).toBe(false);
  });

  it("manages categories", () => {
    const c = actions.addCategory("Test Cat");
    expect(c.name).toBe("Test Cat");
    actions.updateCategory(c.id, "Updated");
    actions.deleteCategory(c.id);
  });

  it("clearAll resets state", () => {
    actions.addProduct({ name: "x", category: "y", price: 1, stock: 1 });
    actions.addDebtor("test");
    actions.clearAll();
    // Add another and verify only one
    const p = actions.addProduct({ name: "fresh", category: "y", price: 1, stock: 1 });
    expect(p.name).toBe("fresh");
  });
});
