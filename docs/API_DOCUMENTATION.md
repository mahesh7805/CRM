# REST API Documentation

Base URL: `/api`

## Authentication Endpoints

### `POST /api/auth/login`
Authenticates employee credentials and returns JWT bearer token.
- **Request Body**:
  ```json
  {
    "email": "admin@fundsroom.com",
    "password": "admin123"
  }
  ```
- **Response 200 OK**:
  ```json
  {
    "success": true,
    "token": "eyJhbGciOiJIUzI1Ni...",
    "user": {
      "id": "u-1",
      "name": "Rajesh Sharma (Admin)",
      "email": "admin@fundsroom.com",
      "role": "ADMIN"
    }
  }
  ```

### `GET /api/auth/me`
Fetches active user profile from JWT session.

---

## Customer CRM Endpoints

### `GET /api/customers`
Query Parameters: `search`, `status`, `type`, `page`, `limit`.

### `POST /api/customers`
Creates a new customer profile.
- **Roles Allowed**: `ADMIN`, `SALES`.

### `GET /api/customers/:id`
Returns customer overview, linked follow-ups, sales challans, and CRM activity timeline.

---

## Sales Challan Endpoints

### `GET /api/challans`
Query Parameters: `search`, `status`, `customerId`, `page`, `limit`.

### `POST /api/challans`
Creates a new Sales Challan (Draft or Confirmed).
- **Request Body**:
  ```json
  {
    "customerId": "cust-1",
    "status": "DRAFT",
    "notes": "Payment credit 30 days",
    "items": [
      { "productId": "p-1", "quantity": 2 }
    ]
  }
  ```

### `POST /api/challans/:id/confirm`
Executes ACID transaction to validate stock, deduct inventory, generate `OUT` movements, and set status to `CONFIRMED`.
- **Roles Allowed**: `ADMIN`, `SALES`.
- **Error Response 400 Bad Request** (Insufficient Stock):
  ```json
  {
    "success": false,
    "message": "Insufficient stock for Product 'Digital Multimeter Pro'. Available: 4, Requested: 7."
  }
  ```

---

## Inventory & Stock Movements

### `GET /api/inventory/movements`
Fetches complete stock movement audit ledger.

### `POST /api/inventory/adjust`
Executes transactional manual stock adjustment (IN or OUT).
- **Roles Allowed**: `ADMIN`, `WAREHOUSE`.
- **Request Body**:
  ```json
  {
    "productId": "p-1",
    "quantity": 50,
    "movementType": "IN",
    "reason": "Supplier Shipment Container #881 Inbound Restock"
  }
  ```
