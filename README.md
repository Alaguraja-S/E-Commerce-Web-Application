# Grainhouse — a basic e-commerce app

A full-stack learning project: product catalog, cart, checkout, order tracking,
and role-based (admin/user) access, built on the MERN stack (MongoDB, Express,
React, Node).

```
ecommerce-app/
  server/   Express + MongoDB API (auth, products, orders)
  client/   React + Vite storefront and admin UI
```

## How the pieces fit together

- **Auth**: `POST /api/auth/register` and `/api/auth/login` return a JWT. The
  client stores it in `localStorage` and the `api/axios.js` interceptor attaches
  it to every request as `Authorization: Bearer <token>`.
- **Roles**: every user has `role: "user"` or `role: "admin"` in MongoDB.
  `middleware/auth.js` exposes `protect` (must be logged in) and
  `requireRole('admin')` (must be an admin) — routes compose these two.
- **Products**: public read endpoints, admin-only write endpoints
  (`POST /PUT /DELETE /api/products`).
- **Orders**: a logged-in user posts their cart to `POST /api/orders`; the
  server re-validates stock, decrements it, and creates the order in one
  MongoDB transaction. Admins list and update order status from `/api/orders`.
- **Cart**: kept client-side (React context + `localStorage`) until checkout,
  which is the simplification most "basic" e-commerce apps make — the cart
  only becomes a database record once it's an order.

## 1. Prerequisites

- Node.js 18+
- A MongoDB instance — either:
  - **Local**: install MongoDB Community Server and run `mongod`, or
  - **Atlas**: create a free cluster at mongodb.com/atlas and copy its
    connection string.

The checkout endpoint uses a MongoDB **transaction**, which requires a
replica set. A local standalone `mongod` does not support transactions.
Easiest fixes:
- Use MongoDB Atlas (transactions work out of the box), or
- Run a local single-node replica set: `mongod --replSet rs0`, then once
  connected run `rs.initiate()` in `mongosh`.

## 2. Backend setup

```bash
cd server
cp .env.example .env
# edit .env: set MONGO_URI to your database, and JWT_SECRET to a random string
npm install
npm run seed     # creates an admin user, a demo user, and sample products
npm run dev       # starts the API on http://localhost:5000
```

Seeded logins (also printed by the seed script):
- Admin — `admin@example.com` / `admin1234`
- User — `user@example.com` / `user1234`

## 3. Frontend setup

In a second terminal:

```bash
cd client
npm install
npm run dev       # starts the React app on http://localhost:5173
```

The Vite dev server proxies `/api` to `http://localhost:5000` (see
`vite.config.js`), so you don't need to configure CORS URLs for local dev.

Open http://localhost:5173, sign in with a seeded account, and:
- As **user**: browse products, add to cart, check out, view "My orders".
- As **admin**: everything a user can do, plus "Products (admin)" and
  "Orders (admin)" in the nav to manage the catalog and update order status.

## 4. API reference

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create a user account |
| POST | `/api/auth/login` | — | Log in, returns JWT |
| GET | `/api/auth/me` | user | Current user profile |
| GET | `/api/products` | — | List/search/filter products (paginated) |
| GET | `/api/products/:id` | — | Product detail |
| POST | `/api/products` | admin | Create product |
| PUT | `/api/products/:id` | admin | Update product |
| DELETE | `/api/products/:id` | admin | Delete product |
| POST | `/api/orders` | user | Place an order from cart items |
| GET | `/api/orders/mine` | user | The logged-in user's orders |
| GET | `/api/orders` | admin | All orders (optional `?status=`) |
| PUT | `/api/orders/:id/status` | admin | Update an order's status |

## 5. Where to go from here

Natural next steps once the basics feel solid:
- Swap `localStorage` JWT storage for httpOnly cookies (more secure against XSS).
- Add product images via file upload (e.g. Multer + S3/Cloudinary) instead of URLs.
- Add a payment step (Stripe test mode) between checkout and order creation.
- Add automated tests (Jest + Supertest for the API, React Testing Library for the client).
- Swap MongoDB for PostgreSQL/MySQL with an ORM (Prisma/Sequelize) if you want
  relational-database practice instead — the route/controller structure here
  translates directly, only the models and queries change.
