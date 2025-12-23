# 💰 SplitShare - Expense Sharing Application

A **production-ready** expense sharing application built with the **MERN stack** (MongoDB, Express, React, Node.js) and **TypeScript**. Similar to Splitwise, this app allows users to split expenses with friends and track who owes whom.

![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### Core Features
- **User Authentication** - Secure JWT-based authentication
- **Group Management** - Create groups and add members
- **Expense Tracking** - Add expenses with multiple split types
- **Balance Calculation** - Real-time balance tracking
- **Settlement Suggestions** - Optimized payment suggestions to minimize transactions

### Split Types
1. **Equal Split** - Divide amount equally among all participants
2. **Exact Amount** - Specify exact amounts for each person
3. **Percentage Split** - Split by percentage (must sum to 100%)

### Advanced Features
- **Balance Simplification Algorithm** - Minimizes the number of transactions needed to settle all debts
- **API Documentation** - Swagger/OpenAPI documentation
- **Unit Tests** - Comprehensive tests for split calculations
- **Modern UI** - Beautiful dark-themed responsive interface

## 🛠️ Tech Stack

### Backend
- **Node.js** + **Express.js** - Server framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication
- **express-validator** - Input validation
- **Swagger** - API documentation
- **Jest** - Testing

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **TypeScript** - Type safety
- **React Router** - Routing
- **Axios** - HTTP client
- **Lucide React** - Icons
- **React Hot Toast** - Notifications

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB Atlas account (or local MongoDB)

### 1. Clone & Setup

```bash
cd "Cred Resolve"
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Update .env with your MongoDB URI
# MONGODB_URI=mongodb+srv://your-connection-string
```

Edit `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/expense-sharing
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies  
npm install
```

### 4. Run the Application

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

- **Backend:** http://localhost:5000
- **Frontend:** http://localhost:5173
- **API Docs:** http://localhost:5000/api-docs

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

### Groups
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/groups` | Create group |
| GET | `/api/groups` | List user's groups |
| GET | `/api/groups/:id` | Get group details |
| POST | `/api/groups/:id/members` | Add member |
| GET | `/api/groups/:id/balances` | Get settlement suggestions |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/expenses` | Create expense |
| GET | `/api/expenses` | List expenses |
| GET | `/api/expenses/:id` | Get expense |
| PUT | `/api/expenses/:id` | Update expense |
| DELETE | `/api/expenses/:id` | Delete expense |

### Settlements
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/settlements` | Record settlement |
| GET | `/api/settlements` | List settlements |
| GET | `/api/settlements/suggestions` | Get optimized suggestions |

## 🧪 Running Tests

```bash
cd backend
npm test
```

## 📁 Project Structure

```
├── backend/
│   ├── src/
│   │   ├── config/         # Database configuration
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation, errors
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Split calculator, balance simplifier
│   │   └── app.ts          # Express app
│   └── tests/              # Unit tests
│
└── frontend/
    ├── src/
    │   ├── components/     # Reusable components
    │   ├── context/        # React context (Auth)
    │   ├── pages/          # Page components
    │   ├── services/       # API service layer
    │   └── types/          # TypeScript types
    └── index.html
```

## 🎯 Key Design Decisions

### 1. Balance Simplification Algorithm
Instead of showing all individual balances, the app calculates the minimum number of transactions needed to settle all debts using a greedy algorithm:

```
Before: A→B $10, B→C $5, C→A $3
Net: A: -7, B: +5, C: +2
After: A→B $5, A→C $2 (only 2 transactions instead of 3!)
```

### 2. Schema Design
- **Denormalized splits** in expenses for faster reads
- **Indexes** on frequently queried fields
- **References** for users and groups to maintain data integrity

### 3. TypeScript Throughout
- Full type safety from frontend to backend
- Shared type definitions
- Better developer experience and fewer bugs

## 📝 License

MIT License - feel free to use this for your own projects!

---

Built with ❤️ using the MERN Stack
