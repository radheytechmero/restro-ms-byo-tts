# Dashboard API

This endpoint provides comprehensive dashboard data for restaurant management.

## Endpoint

`GET /api/dashboard`

## Authentication

Requires Bearer token authentication.

## Query Parameters

- `period` (optional): Time period for data aggregation
  - `today` (default): Data for current day
  - `week`: Data for last 7 days
  - `month`: Data for current month
  - `year`: Data for current year
- `timezone` (optional): Timezone for date calculations (e.g., 'America/New_York')

## Response Data

The API returns aggregated data including:

### Overview Statistics
- Total orders for the period
- Total revenue
- Average order value
- Total customers
- Total menu items
- Total categories
- Total reservations

### Growth Metrics
- Order growth percentage compared to previous period
- Revenue growth percentage compared to previous period

### Order Statistics
- Orders grouped by status (pending, confirmed, preparing, etc.)
- Total order count

### Table Statistics
- Tables grouped by status (available, occupied, reserved, maintenance)

### Top Menu Items
- Top 5 best-selling menu items with:
  - Item name and price
  - Category information
  - Total quantity sold
  - Number of orders containing this item

### Recent Orders
- Last 10 orders with:
  - Customer information
  - Order details (amount, status, type)
  - Table information
  - Item count
  - Creation timestamp

## Example Request

```bash
curl -X GET "https://localhost:443/api/dashboard?period=week" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Example Response

```json
{
  "success": true,
  "data": {
    "period": "week",
    "dateRange": {
      "start": "2024-01-15T00:00:00.000Z",
      "end": "2024-01-22T12:30:00.000Z"
    },
    "overview": {
      "totalOrders": 45,
      "totalRevenue": 1250.75,
      "averageOrderValue": 27.79,
      "totalCustomers": 38,
      "totalMenuItems": 24,
      "totalCategories": 6,
      "totalReservations": 12
    },
    "growth": {
      "orderGrowth": 15.5,
      "revenueGrowth": 8.2
    },
    "orderStats": {
      "byStatus": [
        {"status": "completed", "count": 35},
        {"status": "pending", "count": 8},
        {"status": "cancelled", "count": 2}
      ],
      "total": 45
    },
    "tableStats": [
      {"status": "available", "count": 8},
      {"status": "occupied", "count": 4},
      {"status": "reserved", "count": 2}
    ],
    "topMenuItems": [
      {
        "name": "Margherita Pizza",
        "price": 18.99,
        "category": {"name": "Pizza"},
        "totalQuantitySold": 25,
        "orderCount": 20
      }
    ],
    "recentOrders": [
      {
        "id": 123,
        "customerName": "John Doe",
        "customerPhone": "+1234567890",
        "totalAmount": 35.50,
        "status": "completed",
        "orderType": "dine-in",
        "tableNumber": "T1",
        "itemCount": 3,
        "createdAt": "2024-01-22T11:30:00.000Z"
      }
    ]
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or missing authentication token"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to fetch dashboard data",
  "detail": "Detailed error message"
}
```