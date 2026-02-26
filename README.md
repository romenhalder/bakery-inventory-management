# 🍞 Bakery Inventory Management System

<div align="center">

![Java](https://img.shields.io/badge/Java-17-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.1.6-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Redux](https://img.shields.io/badge/Redux_Toolkit-latest-764ABC?style=for-the-badge&logo=redux&logoColor=white)

A comprehensive full-stack inventory management solution designed for bakeries — track products, manage stock levels, handle sales via POS, monitor expiry dates, manage suppliers, and get real-time alerts.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Setup](#-installation--setup) • [API Docs](#-api-endpoints) • [Screenshots](#-screenshots)

</div>

---

## ✨ Features

### 🏪 Point of Sale (POS)
- Quick product search with real-time stock availability
- Shopping cart with add/remove/quantity controls
- Customer name & mobile tracking with recent customer suggestions
- Payment method selection (Cash, UPI, Card, etc.)
- Auto-generated order numbers
- Raw materials automatically excluded from billing

### 📦 Product Management
- **Finished goods** (cakes, pastries, bread) & **Raw materials** (flour, sugar, eggs)
- **22+ bakery brands** (Royal Oven, Sweet Palace, Cake Mahal, etc.)
- **80+ flavor options** across 9 categories (Chocolate, Fruit, Indian Special, Premium, Cheesecake, Pastry, Festival, Eggless, Basic)
- Product categories with hierarchical structure
- Image upload for products
- Custom stock thresholds (min stock, max stock, reorder point)
- Expiry date tracking
- Brand & flavor tagging
- Raw materials show only cost price (not for sale)

### 📊 Inventory Tracking
- Real-time stock levels (current, reserved, available)
- Stock transactions: Stock In, Stock Out, Adjustment, Return, Wastage
- **Price verification** on Stock In (confirm or update cost price per batch)
- Selling price hidden for raw material Stock Out
- Batch number tracking
- Full transaction audit trail
- **New product creation automatically logged** as STOCK_IN transaction

### 🚚 Supplier Management
- Supplier directory with card-based UI
- Contact person, phone, email, address, license/FSSAI number
- Active/inactive status toggle
- Search & sort functionality
- Supplier selection during product creation (dropdown or manual entry)

### 🔔 Smart Alert System
- **Out of Stock** alerts (quantity = 0)
- **Low Stock** alerts (quantity > 0 but below minimum threshold)
- Reorder point notifications
- Expiring soon warnings (7 days)
- Expired product alerts
- Unread count badge in navbar
- Mark as read / Mark all as read

### 👥 Role-Based Access Control
| Feature                    | Admin | Manager | Employee |
|----------------------------|:-----:|:-------:|:--------:|
| Dashboard                  |  ✅   |   ✅    |    ✅    |
| POS / Sell Products        |  ✅   |   ✅    |    ✅    |
| View Products & Inventory  |  ✅   |   ✅    |    ✅    |
| Add / Edit Products        |  ✅   |   ✅    |    ❌    |
| Manage Categories          |  ✅   |   ✅    |    ❌    |
| Stock Updates              |  ✅   |   ✅    |    ✅    |
| Manage Suppliers           |  ✅   |   ✅    |    ❌    |
| View Reports               |  ✅   |   ✅    |    ❌    |
| Transaction History        |  ✅   |   ✅    |    ❌    |
| Manage Alerts              |  ✅   |   ✅    |    ✅    |
| Create Employees           |  ✅   |   ❌    |    ❌    |
| Reset Passwords            |  ✅   |   ❌    |    ❌    |

### 📈 Dashboards

**Admin / Manager Dashboard:**
- Sales summary (today's revenue, transaction count)
- Recent sales with sold-by, customer info, payment method, expandable item details
- Stock overview with Out of Stock / Low Stock / In Stock badges
- Low stock alerts with quick restock actions
- Password reset requests widget (Admin only)

**Employee Dashboard:**
- Personalized greeting
- Personal sales summary
- Quick action buttons (New Sale, Stock Update)
- Recent sales list
- Stock overview with progress bars
- Pending tasks (low stock items with restock buttons)

### 📋 Transaction History
- Full transaction log with day/week/month/all-time filters
- Filter by transaction type (Stock In, Stock Out, Adjustment, Return, Wastage)
- Search by product, user, or reference number
- Summary statistics cards (total in, out, wastage, count)

### 🔽 Sorting & Navigation
- **Newest records first** by default across all lists
- **One-click sort toggle** (⬇️ Newest / ⬆️ Oldest) on every list page
- Grouped sidebar navigation with collapsible sections
- Quick nav links in navbar (Dashboard, POS)
- Role badge display
- Auto-refreshing alert count

---

## 🛠 Tech Stack

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Java | 17 | Language |
| Spring Boot | 3.1.6 | Framework |
| Spring Security | 6.x | Authentication & Authorization |
| JWT (JJWT) | 0.12.x | Token-based auth |
| MySQL | 8.0 | Database |
| Hibernate / JPA | 6.x | ORM |
| Maven | 3.6+ | Build tool |
| Lombok | latest | Boilerplate reduction |
| Jakarta Validation | 3.x | Input validation |

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19 | UI framework |
| Vite | latest | Build tool |
| Redux Toolkit | latest | State management |
| React Router DOM | 7 | Routing |
| Tailwind CSS | 4 | Styling |
| Axios | latest | HTTP client |
| Heroicons | 2 | Icons |
| Headless UI | latest | Accessible components |

---

## 📋 Prerequisites

- **Java Development Kit (JDK) 17** or higher
- **Node.js 18** or higher
- **MySQL 8.0** or higher
- **Maven 3.6+**
- **Git**

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/romenhalder/bakery-inventory-management.git
cd bakery-inventory-management
```

### 2. Database Setup

```sql
CREATE DATABASE bakerydb;
```

Update credentials in `backend/src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bakerydb?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 3. Backend Setup

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

> Backend runs on `http://localhost:8080`

### 4. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

> Frontend runs on `http://localhost:5173`

---

## 📁 Project Structure

```
bakery-inventory-management/
├── backend/
│   └── src/main/java/com/romen/inventory/
│       ├── controller/          # REST API controllers
│       │   ├── AuthController        # Login, register, OTP, password reset
│       │   ├── ProductController     # CRUD products, search, filter
│       │   ├── CategoryController    # CRUD categories
│       │   ├── InventoryController   # Stock updates, transactions
│       │   ├── SalesController       # POS, sales history
│       │   ├── AlertController       # Alert CRUD, mark read/resolve
│       │   ├── ReportController      # Stock & transaction reports
│       │   └── SupplierController    # Supplier management
│       ├── service/             # Business logic layer
│       ├── repository/          # JPA data access
│       ├── entity/              # Database entities
│       │   ├── Product, Category, Inventory
│       │   ├── StockTransaction, Sale, SaleItem
│       │   ├── User, Supplier, Alert
│       │   └── PasswordResetRequest
│       ├── dto/                 # Request/Response DTOs
│       ├── security/            # JWT filter, config, user details
│       ├── config/              # CORS, web config
│       └── exception/           # Global exception handler
│
├── frontend/src/
│   ├── app/store.js             # Redux store
│   ├── components/
│   │   ├── Sidebar.jsx          # Grouped nav, collapsible sections
│   │   ├── Navbar.jsx           # Quick links, role badge, alerts
│   │   └── ProtectedRoute.jsx   # Auth guard
│   ├── features/
│   │   ├── auth/                # Login, Register, authSlice
│   │   ├── products/            # ProductList, AddProduct, RawMaterialList
│   │   ├── inventory/           # InventoryList, StockUpdate
│   │   ├── sales/               # SellProduct (POS), salesSlice
│   │   ├── alerts/              # AlertList, alertSlice
│   │   └── reports/             # ReportList
│   ├── pages/
│   │   ├── AdminDashboard.jsx   # Admin/Manager dashboard
│   │   ├── EmployeeDashboard.jsx # Employee dashboard
│   │   ├── TransactionHistory.jsx # Transaction log
│   │   ├── SupplierList.jsx     # Supplier management
│   │   ├── CategoryList.jsx     # Category management
│   │   ├── PasswordResetRequests.jsx
│   │   └── Setup.jsx            # Initial setup
│   └── routes/AppRoutes.jsx     # Route definitions
│
└── README.md
```

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/auth/login` | User login | Public |
| POST | `/auth/register` | Register employee | Admin |
| POST | `/auth/refresh-token` | Refresh JWT | Authenticated |
| POST | `/auth/send-otp` | Send OTP | Public |
| POST | `/auth/verify-email` | Verify email OTP | Public |
| POST | `/auth/reset-password` | Reset password | Public |
| GET | `/auth/employees` | List employees | Admin |
| PUT | `/auth/employees/{id}/status` | Toggle employee | Admin |

### Products
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/products` | List all products | Authenticated |
| GET | `/products/{id}` | Get product by ID | Authenticated |
| POST | `/products` | Create product | Admin, Manager |
| PUT | `/products/{id}` | Update product | Admin, Manager |
| DELETE | `/products/{id}` | Delete product | Admin |
| GET | `/products/search?keyword=` | Search products | Authenticated |
| GET | `/products/low-stock` | Get low stock | Authenticated |
| GET | `/products/type/{type}` | Filter by type | Authenticated |

### Inventory
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/inventory` | All inventory | Admin, Manager |
| GET | `/inventory/product/{id}` | By product | Admin, Manager |
| GET | `/inventory/low-stock` | Low stock items | Admin, Manager |
| GET | `/inventory/out-of-stock` | Out of stock | Admin, Manager |
| POST | `/inventory/update` | Update stock | Authenticated |
| GET | `/inventory/transactions` | All transactions | Admin, Manager |

### Sales
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/sales` | Create sale | Authenticated |
| GET | `/sales/recent?limit=` | Recent sales | Authenticated |
| GET | `/sales/order/{orderNumber}` | By order number | Authenticated |
| GET | `/sales/summary/today` | Today's summary | Authenticated |

### Alerts
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/alerts` | All alerts | Authenticated |
| GET | `/alerts/unread` | Unread alerts | Authenticated |
| PATCH | `/alerts/{id}/read` | Mark as read | Authenticated |
| PATCH | `/alerts/read-all` | Mark all read | Authenticated |
| DELETE | `/alerts/{id}` | Delete alert | Admin, Manager |

### Suppliers
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/suppliers` | All suppliers | Admin, Manager |
| POST | `/suppliers` | Create supplier | Admin, Manager |
| PUT | `/suppliers/{id}` | Update supplier | Admin, Manager |
| DELETE | `/suppliers/{id}` | Delete supplier | Admin |

### Reports
| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/reports/stock` | Stock report | Admin, Manager |
| GET | `/reports/transactions` | Transaction report | Admin, Manager |
| GET | `/reports/low-stock` | Low stock report | Admin, Manager |

---

## ⚙️ Configuration

### Backend (`application.properties`)

```properties
# Server
server.port=8080

# Database
spring.datasource.url=jdbc:mysql://localhost:3306/bakerydb?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_password

# JPA
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true

# JWT
jwt.secret=your_jwt_secret_key_here
jwt.expiration=86400000
jwt.refresh-expiration=604800000

# File Upload
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=10MB
app.upload-dir=./uploads/
```

---

## 👤 Default Admin Setup

Register the first admin via API or directly in the database:

```json
POST /auth/register
{
  "email": "admin@bakery.com",
  "password": "admin123",
  "fullName": "Admin User",
  "phone": "1234567890",
  "role": "ADMIN"
}
```

---

## 🧪 Running Tests

```bash
# Backend
cd backend && mvn test

# Frontend
cd frontend && npm test
```

---

## 📦 Deployment

### Backend
```bash
cd backend
mvn clean package -DskipTests
java -jar target/inventory-management-1.0.0.jar
```

### Frontend
```bash
cd frontend
npm run build
# Serve the dist/ folder with any static file server
```

---

## 📸 Screenshots

*Coming soon — screenshots of Dashboard, POS, Product Management, Inventory, Alerts, and more.*

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [Spring Boot](https://spring.io/projects/spring-boot) — Backend framework
- [React](https://react.dev/) — Frontend library
- [Tailwind CSS](https://tailwindcss.com/) — Utility-first CSS
- [Redux Toolkit](https://redux-toolkit.js.org/) — State management
- [Heroicons](https://heroicons.com/) — Beautiful hand-crafted SVG icons

---

<div align="center">

**Built with ❤️ for bakeries everywhere 🍞🥐🍰**

</div>
