// Tagalog/Filipino UI strings for Sari Sync
export const t = {
  // App
  appName: "Sari Sync",
  appTagline: "Imbentaryo at Tindahan",

  // Tabs
  tabImbentaryo: "Imbentaryo",
  tabUtang: "Utang",
  tabBenta: "Mga Benta",
  tabSettings: "Mga Setting",

  // Inventory
  imbentaryoTitle: "Sari-Sync Imbentaryo",
  addNewProduct: "Magdagdag ng Bagong Paninda",
  cameraTip: "Itutok ang camera sa pangalan ng produkto lang, hindi sa buong label.",
  scanWithCamera: "I-scan gamit Camera",
  pickFromGallery: "Pumili sa Gallery",
  productName: "Pangalan ng Paninda",
  category: "Kategorya",
  price: "Presyo (₱)",
  stock: "Stok",
  saveProduct: "I-save ang Paninda",
  updateProduct: "I-update ang Paninda",
  productList: "Mga Paninda",
  noProducts: "Wala pang naka-save na paninda. Magdagdag ng una!",
  perUnit: "bawat isa",
  lowStockBadge: "na lang (Mababa!)",
  outOfStock: "Ubos na!",
  sell: "Ibenta",
  edit: "I-edit",
  delete: "Burahin",
  cancel: "Kanselahin",
  confirm: "Kumpirmahin",
  save: "I-save",
  close: "Isara",

  // Sell modal
  sellTitle: "Ibenta ang Paninda",
  quantity: "Bilang",
  total: "Kabuuan",
  payCash: "Bayad Cash",
  addToUtang: "Ilagay sa Utang",
  selectDebtor: "Piliin ang Suki",
  newDebtor: "+ Bagong Suki",
  debtorName: "Pangalan ng Suki",
  notesOptional: "Notes (opsyonal)",
  saleSuccess: "Naitala ang benta!",
  insufficientStock: "Kulang ang stok!",

  // Utang
  utangTitle: "Utang ng mga Suki",
  totalUtang: "Kabuuang Utang",
  debtorCount: "bilang ng suki",
  noDebtors: "Wala pang suki na may utang.",
  addDebtor: "Magdagdag ng Suki",
  debtorDetail: "Detalye ng Utang",
  pay: "Bayaran",
  paymentAmount: "Halaga ng Bayad",
  history: "Kasaysayan",
  noTransactions: "Walang transaksyon.",
  markAsPaid: "Tanggalin sa Listahan",
  paidInFull: "Bayad na lahat!",
  addManualUtang: "Magdagdag ng Utang",
  amount: "Halaga",

  // Sales Reports
  bentaTitle: "Mga Benta",
  periodDaily: "Araw-araw",
  periodWeekly: "Lingguhan",
  periodMonthly: "Buwanan",
  periodQuarterly: "3 Buwan",
  totalSales: "Kabuuang Benta",
  transactionCount: "Bilang ng Transaksyon",
  cashSales: "Cash",
  creditSales: "Utang",
  topProducts: "Pinakamabentang Paninda",
  recentTransactions: "Bagong Transaksyon",
  noSales: "Walang naitalang benta sa panahon na ito.",

  // Settings
  settingsTitle: "Mga Setting",
  manageCategories: "Pamahalaan ang Kategorya",
  addCategory: "Magdagdag ng Kategorya",
  categoryName: "Pangalan ng Kategorya",
  lowStockThreshold: "Hangganan ng Mababang Stok",
  lowStockHelp: "Magpapadala ng abiso kapag bumaba ang stok sa numerong ito.",
  notifications: "Mga Abiso",
  enableNotifications: "I-on ang Abiso",
  notificationsHelp: "Mag-abiso kapag mababa na ang stok ng paninda.",
  about: "Tungkol sa App",
  clearAllData: "Burahin Lahat ng Data",
  clearDataConfirm: "Sigurado ka bang gusto mong burahin ang lahat ng data? Hindi na ito mababawi.",
  dataCleared: "Burado na ang lahat ng data.",
  yesDelete: "Oo, Burahin",
  no: "Hindi",
  saved: "Naka-save!",

  // Categories defaults
  defaultCategories: ["Inumin", "Pagkain", "Sigarilyo", "Sabon", "Snacks", "Iba pa"],

  // Notifications
  lowStockNotifTitle: "Mababa na ang stok!",
  lowStockNotifBody: (productName: string, count: number) =>
    `${productName} ay ${count} na lang ang natitira. Mag-restock na!`,

  // Errors
  errorRequired: "Kinakailangan",
  errorInvalidNumber: "Mali ang numero",
  errorMin: (min: number) => `Hindi pwedeng mas mababa sa ${min}`,
};

export function formatPeso(amount: number): string {
  return `₱${amount.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric" });
}

export function formatDateTime(timestamp: number): string {
  const d = new Date(timestamp);
  return d.toLocaleString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}
