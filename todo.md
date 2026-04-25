# Sari Sync TODO

## Branding
- [x] Generate custom app logo
- [x] Update app icon assets (icon, splash, favicon, android-foreground)
- [x] Update app.config.ts branding (appName, logoUrl)

## Core Setup
- [x] Update theme colors (slate blue + warm coral palette)
- [x] Add tab bar icons to icon-symbol.tsx mapping
- [x] Create AsyncStorage data layer (products, categories, sales, debtors, debt transactions)
- [x] Setup app providers and tab layout (4 tabs)

## Imbentaryo (Inventory) Tab
- [x] Add new product form (name, category dropdown, price, stock)
- [x] Camera capture and gallery picker for product image
- [x] Product list with cards (name, category, price, stock, low-stock warning)
- [x] Edit product modal
- [x] Delete product with confirmation
- [x] "Ibenta" (sell) modal with quantity + cash/utang options

## Utang (Debt) Tab
- [x] Debtor list with total summary
- [x] Add new debtor flow
- [x] Debtor detail screen with transaction history
- [x] "Bayaran" (pay) flow

## Benta (Sales Reports) Tab
- [x] Period selector (Daily, Weekly, Monthly, 3-Month)
- [x] Total sales and transaction count summary
- [x] Top-selling products
- [x] Recent transactions list

## Settings Tab
- [x] Manage categories (add/edit/delete)
- [x] Low stock threshold setting
- [x] Notification toggle
- [x] Clear all data with confirmation
- [x] About section

## Notifications
- [x] Setup expo-notifications permissions
- [x] Schedule low-stock notification on sale that drops stock below threshold
- [x] Trigger immediate notification on sale that drops stock below threshold

## Polish
- [x] Tagalog/Filipino text everywhere
- [x] Unit tests for store actions
- [x] Create checkpoint before delivery
