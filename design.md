# Sari Sync - Design Plan

## Overview
**Sari Sync Imbentaryo** is a mobile app designed for Filipino sari-sari store owners to manage their inventory, sales, customer debts (utang), and receive low-stock alerts. The app works fully offline on the device using local storage. All UI text is in **Tagalog/Filipino**.

## Target User
Filipino micro-retail (sari-sari store) owners and tindera/tindero who need a simple, single-user tool to track what they sell, who owes money, and what's running low.

## Color Palette
Inspired by the mockup's professional blue with warm accents typical of Philippine market branding:

| Token | Color | Usage |
|-------|-------|-------|
| `primary` | `#3D5A80` (slate blue) | Headers, primary buttons, accents |
| `secondary` | `#EE6C4D` (warm coral) | Sale/CTA accents, low-stock warnings |
| `background` | `#F8F9FB` (off-white) | App background |
| `surface` | `#FFFFFF` (white) | Cards, inputs |
| `foreground` | `#1F2937` (dark slate) | Primary text |
| `muted` | `#6B7280` (gray) | Secondary text, hints |
| `border` | `#E5E7EB` (light gray) | Dividers, input borders |
| `success` | `#10B981` (emerald) | Confirmed sales, healthy stock |
| `warning` | `#F59E0B` (amber) | Low stock alerts |
| `error` | `#EF4444` (red) | Delete actions, debts overdue |

## Screen List (Tab Navigation)

### Tab 1: Imbentaryo (Inventory) — Default
Main inventory management — add new products, view list, sell items.

Content:
- Header: "Sari-Sync Imbentaryo" (blue header bar)
- "Magdagdag ng Bagong Paninda" card with form (camera/gallery, name, category, price, stock, save button)
- "Mga Paninda (count)" section header
- Product cards showing image, name, category tag, price, stock count with warning, Ibenta button, delete icon

### Tab 2: Utang (Debt Tracker)
Track customer debts.

Content:
- Header: "Utang ng mga Suki"
- Summary card: Total kabuuang utang
- Add new utang button
- List of debtors with name, amount, last update
- Tap to open debtor detail with transaction history and mark-as-paid

### Tab 3: Benta (Sales Reports)
View sales reports across periods.

Content:
- Header: "Mga Benta"
- Period selector: Araw-araw / Lingguhan / Buwanan / 3 Buwan
- Summary cards: Kabuuang Benta, Bilang ng Transaksyon
- Top-selling products list
- Recent transactions

### Tab 4: Settings (Mga Setting)
Manage categories, low-stock threshold, notifications.

Content:
- Mga Kategorya — manage product categories
- Low Stock Threshold setting
- Notification toggle
- Tungkol sa App
- Burahin Lahat ng Data (with confirmation)

## Modals / Secondary Screens
- Sell Modal (Ibenta): Quantity, total, "Bayad Cash" or "Ilagay sa Utang"
- Edit Product Modal: same form as add but pre-filled
- Add Debtor Modal: Name + notes
- Debtor Detail Screen: transactions, mark as paid

## Key User Flows
1. Add Product → Imbentaryo tab → fill form → save → appears in list
2. Sell Product (Cash) → tap Ibenta → enter quantity → confirm Bayad Cash → stock decreases
3. Sell on Credit → tap Ibenta → quantity → Ilagay sa Utang → choose debtor → utang updated
4. Pay Utang → Utang tab → tap debtor → Bayaran → enter amount
5. View Reports → Benta tab → choose period
6. Low Stock Alert → daily notification when stock <= threshold

## Data Models (AsyncStorage)
- Product: { id, name, category, price, stock, imageUri?, lowStockThreshold }
- Category: { id, name }
- Sale: { id, productId, productName, quantity, unitPrice, total, type, debtorId?, timestamp }
- Debtor: { id, name, notes? }
- DebtTransaction: { id, debtorId, amount, type, saleId?, timestamp, note? }

## Notifications
Use expo-notifications for local scheduled notifications when stock falls below threshold.
