# Database Schema Documentation

## Entity Relationship Overview

The database is fully normalized with relational integrity, foreign key constraints, indexes, and historical snapshot preservation.

```
+----------------+      1:N     +--------------------+
|    Customer    | ------------>|  CustomerFollowup  |
+----------------+              +--------------------+
        |
        | 1:N
        v
+----------------+      1:N     +--------------------+
|    Challan     | ------------>|    ChallanItem     |
+----------------+              +--------------------+
        ^                                 | (Snapshot)
        | 1:N                             v
+----------------+      1:N     +--------------------+
|      User      | ------------>|   StockMovement    |
+----------------+              +--------------------+
                                          ^
                                          | 1:N
                                +--------------------+
                                |      Product       |
                                +--------------------+
                                       ^      ^
                                   N:1 |      | N:1
                          +------------+      +------------+
                          |                        |
                 +------------------+     +------------------+
                 |     Category     |     |    Warehouse     |
                 +------------------+     +------------------+
```

## Key Tables & Fields

1. **`users`**: Stores employee credentials, password hashes (`bcrypt`), and foreign key `role_id`.
2. **`roles`**: Enums for `ADMIN`, `SALES`, `WAREHOUSE`, `ACCOUNTS`.
3. **`customers`**: CRM profile data, business name, GST number, type (`RETAIL`, `WHOLESALE`, `DISTRIBUTOR`), status, and next follow-up date.
4. **`products`**: Catalog items, SKU (unique), category, unit price, current stock level, minimum alert threshold, and warehouse location.
5. **`stock_movements`**: Immutable audit ledger recording quantity changes, movement type (`IN` / `OUT`), reason, created_by_id, and timestamps.
6. **`challans`**: Delivery challan header with auto-incrementing challan number (`CH-1001`), customer_id, total quantity, total amount, status (`DRAFT`, `CONFIRMED`, `CANCELLED`), and timestamps.
7. **`challan_items`**: Historical snapshot storing `productName`, `productSku`, `unitPrice`, `quantity`, and `lineTotal` at the time of creation.
