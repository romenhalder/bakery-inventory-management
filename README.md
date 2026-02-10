# Bakery Inventory Management System

A comprehensive full-stack inventory management solution designed specifically for bakeries to track products, manage stock levels, monitor expiration dates, and generate alerts for low stock or expiring items.

## Features

### Core Features

- **Product Management**: Create, read, update, and delete bakery products with support for:
  - Finished goods (ready-to-sell items like bread, cakes, pastries)
  - Raw materials (ingredients like flour, sugar, eggs)
  - Product categories with hierarchical structure
  - Image upload for products
  - Custom stock thresholds (min, max, reorder point)
  - Expiry date tracking

- **Inventory Tracking**: Real-time stock management with:
  - Current, reserved, and available quantities
  - Stock transactions (stock in, stock out, adjustments, returns, wastage)
  - Batch number tracking
  - Location-based inventory
  - Transaction audit trail

- **Smart Alert System**: Automated notifications for:
  - Low stock alerts
  - Out of stock warnings
  - Reorder point notifications
  - Expiring soon warnings (7 days)
  - Expired product alerts

- **User Management**: Role-based access control with:
  - Admin: Full system access, employee management, reporting
  - Employee: Product viewing, inventory updates, alert management
  - JWT-based authentication
  - OTP verification for email/phone
  - Password reset functionality

- **Reporting & Analytics**: 
  - Stock reports
  - Transaction history
  - Low stock summaries
  - Activity tracking

## Tech Stack

### Backend
- **Framework**: Spring Boot 3.1.6
- **Language**: Java 17
- **Security**: Spring Security with JWT
- **Database**: MySQL 8.0
- **ORM**: Hibernate / JPA
- **Build Tool**: Maven
- **Additional Libraries**:
  - Lombok (boilerplate reduction)
  - JJWT (JSON Web Tokens)
  - Jakarta Validation
  - Apache Commons IO

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS 4
- **UI Components**: Headless UI, Heroicons
- **HTTP Client**: Axios

## Prerequisites

Before running this project, ensure you have the following installed:

- **Java Development Kit (JDK) 17** or higher
- **Node.js 18** or higher
- **MySQL 8.0** or higher
- **Maven 3.6+**
- **Git**

## Installation & Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd bakery-inventory-management
```

### 2. Database Setup

1. Create a MySQL database named `bakerydb`:
```sql
CREATE DATABASE bakerydb;
```

2. Update database credentials in `backend/src/main/resources/application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/bakerydb?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 3. Backend Setup

```bash
cd backend

# Build the project
mvn clean install

# Run the application
mvn spring-boot:run
```

The backend server will start on `http://localhost:8080`

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run the development server
npm run dev
```

The frontend application will start on `http://localhost:5173`

## Project Structure

```
bakery-inventory-management/
├── backend/
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/com/romen/inventory/
│   │   │   │   ├── controller/      # REST API controllers
│   │   │   │   ├── service/         # Business logic
│   │   │   │   ├── repository/      # Data access layer
│   │   │   │   ├── entity/          # JPA entities
│   │   │   │   ├── dto/             # Data transfer objects
│   │   │   │   ├── security/        # JWT & security config
│   │   │   │   ├── config/          # Application configuration
│   │   │   │   └── exception/       # Global exception handling
│   │   │   └── resources/
│   │   │       └── application.properties
│   │   └── test/
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   └── store.js             # Redux store configuration
│   │   ├── components/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── features/
│   │   │   ├── auth/                # Authentication features
│   │   │   ├── products/            # Product management
│   │   │   ├── inventory/           # Inventory management
│   │   │   ├── alerts/              # Alert management
│   │   │   └── reports/             # Reporting features
│   │   ├── pages/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── EmployeeDashboard.jsx
│   │   │   └── NotFound.jsx
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register new employee (Admin only)
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/send-otp` - Send OTP for verification
- `POST /api/auth/verify-email` - Verify email with OTP
- `POST /api/auth/reset-password` - Reset password with OTP
- `GET /api/auth/employees` - List all employees (Admin only)
- `PUT /api/auth/employees/{id}/status` - Toggle employee status (Admin only)
- `DELETE /api/auth/employees/{id}` - Delete employee (Admin only)

### Products
- `GET /api/api/products` - List all products
- `GET /api/api/products/{id}` - Get product by ID
- `POST /api/api/products` - Create new product
- `PUT /api/api/products/{id}` - Update product
- `DELETE /api/api/products/{id}` - Delete product (Admin only)
- `GET /api/api/products/search?keyword={keyword}` - Search products
- `GET /api/api/products/low-stock` - Get low stock products

### Inventory
- `GET /api/api/inventory` - Get all inventory
- `GET /api/api/inventory/product/{productId}` - Get inventory by product
- `GET /api/api/inventory/low-stock` - Get low stock items
- `GET /api/api/inventory/out-of-stock` - Get out of stock items
- `POST /api/api/inventory/update` - Update stock
- `GET /api/api/inventory/transactions` - Get all transactions
- `GET /api/api/inventory/transactions/product/{productId}` - Get product transactions

### Alerts
- `GET /api/api/alerts` - Get all alerts
- `GET /api/api/alerts/unread` - Get unread alerts
- `PUT /api/api/alerts/{id}/read` - Mark alert as read
- `PUT /api/api/alerts/{id}/resolve` - Resolve alert

## Environment Variables

### Backend (application.properties)

```properties
# Server Configuration
server.port=8080
server.servlet.context-path=/api

# Database Configuration
spring.datasource.url=jdbc:mysql://localhost:3306/bakerydb?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect

# JWT Configuration
jwt.secret=your_jwt_secret_key
jwt.expiration=86400000
jwt.refresh-expiration=604800000

# File Upload Configuration
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=10MB

# Application URLs
app.base-url=http://localhost:8080
app.frontend-url=http://localhost:5173
app.upload-dir=./uploads/
```

### Frontend

Create a `.env` file in the frontend directory:

```env
VITE_API_URL=http://localhost:8080/api
```

## Default Admin Credentials

After initial setup, you can create an admin user through the API or database:

**Sample Admin Registration Request:**
```json
{
  "email": "admin@bakery.com",
  "password": "admin123",
  "fullName": "Admin User",
  "phone": "1234567890",
  "role": "ADMIN"
}
```

## Running Tests

### Backend Tests
```bash
cd backend
mvn test
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Deployment

### Backend Deployment
1. Build the JAR file:
```bash
cd backend
mvn clean package
```

2. Run the JAR:
```bash
java -jar target/inventory-management-1.0.0.jar
```

### Frontend Deployment
1. Build for production:
```bash
cd frontend
npm run build
```

2. The `dist` folder contains the production build

## Screenshots

*Coming soon*

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@bakeryinventory.com or create an issue in the repository.

## Acknowledgments

- Spring Boot team for the excellent framework
- React team for the frontend library
- Tailwind CSS for the utility-first CSS framework
- All contributors who helped improve this project

---

**Happy Baking! 🍞🥐🍰**
