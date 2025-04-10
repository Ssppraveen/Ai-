# Mobile E-commerce Platform

A full-stack e-commerce platform for mobile phones and accessories built with React.js, Node.js, and MongoDB.

## Features

- User authentication and authorization
- Product browsing with filters and search
- Shopping cart functionality
- Order management
- Admin dashboard
- Responsive design
- Image upload for products
- User reviews and ratings
- Wishlist functionality

## Tech Stack

- **Frontend:**
  - React.js
  - Material-UI
  - Redux Toolkit
  - React Router
  - Axios

- **Backend:**
  - Node.js
  - Express.js
  - MongoDB
  - JWT Authentication
  - Multer for file uploads

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
PORT=5000
```

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mobile-ecommerce.git
cd mobile-ecommerce
```

2. Install backend dependencies:
```bash
npm install
```

3. Install frontend dependencies:
```bash
cd client
npm install
```

## Running the Application

1. Start the backend server:
```bash
npm run server
```

2. Start the frontend development server:
```bash
cd client
npm start
```

3. Run both frontend and backend concurrently:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`, and the API will be running at `http://localhost:5000`.

## API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `POST /api/products/:id/reviews` - Add product review

### Users
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get user profile
- `PUT /api/users/me` - Update user profile
- `POST /api/users/me/addresses` - Add address
- `PUT /api/users/me/addresses/:id` - Update address
- `DELETE /api/users/me/addresses/:id` - Delete address

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/me` - Get user orders
- `GET /api/orders/:id` - Get order by ID
- `PUT /api/orders/:id` - Update order status (Admin)
- `GET /api/orders` - Get all orders (Admin)
- `GET /api/orders/stats/overview` - Get order statistics (Admin)

## Folder Structure

```
mobile-ecommerce/
├── client/                 # Frontend React application
│   ├── public/
│   └── src/
│       ├── components/    # Reusable components
│       ├── pages/        # Page components
│       └── admin/        # Admin dashboard components
├── middleware/            # Express middleware
├── models/               # Mongoose models
├── routes/               # API routes
├── uploads/              # Uploaded files
└── server.js            # Express app
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details. 