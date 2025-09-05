# Authentication Microservice

<p align="center">
  <a href="http://nestjs.com/" target="blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

<p align="center">
  <strong>Authentication microservice built with NestJS, MongoDB, JWT, and SendGrid email integration</strong>
</p>

<p align="center">
  <a href="https://nodejs.org" target="_blank">
    <img src="https://img.shields.io/badge/Node.js-18%2B-green" alt="Node.js Version" />
  </a>
  <a href="https://www.typescriptlang.org" target="_blank">
    <img src="https://img.shields.io/badge/TypeScript-5.0-blue" alt="TypeScript" />
  </a>
  <a href="https://nestjs.com" target="_blank">
    <img src="https://img.shields.io/badge/NestJS-10.0-red" alt="NestJS" />
  </a>
  <a href="https://www.mongodb.com" target="_blank">
    <img src="https://img.shields.io/badge/MongoDB-7.0-green" alt="MongoDB" />
  </a>
</p>

## 📖 Description

A robust authentication microservice built with modern technologies for secure user management and email verification.

### ✨ Key Features

- 🔐 **JWT Authentication** - Secure token-based authentication with refresh tokens
- 📧 **Email Verification** - Account verification via SendGrid integration
- 🔑 **Password Recovery** - Secure password reset functionality
- 🛡️ **Role-based Access Control** - User roles and permissions management
- 📊 **Health Monitoring** - Built-in health checks and system monitoring
- 🚦 **Rate Limiting** - Protection against brute force attacks
- 📚 **API Documentation** - Auto-generated Swagger/OpenAPI documentation

### 🏗️ Architecture

- **Framework**: NestJS with TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Refresh Token strategy
- **Email Service**: SendGrid for transactional emails
- **Documentation**: Swagger/OpenAPI integration
- **Validation**: Zod schema validation for environment variables

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- Docker (for MongoDB)
- npm or yarn

### 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd auth-nestjs
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration values
   ```

### 🗄️ Database Setup

**Start MongoDB with Docker:**
```bash
docker run -d \
  --name mongo-auth \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=auth_microservice \
  mongo:latest
```

### ⚙️ Environment Variables

Create a `.env` file with the following variables:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/auth_microservice

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-min-32-chars

# SendGrid Configuration  
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Application
PORT=3000
NODE_ENV=development
```

### 🏃‍♂️ Running the Application

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod

# Standard development mode
npm run start
```

The application will be available at:
- **API**: http://localhost:3000
- **Documentation**: http://localhost:3000/api
- **Health Check**: http://localhost:3000/health

### 🧪 Testing

```bash
# Unit tests
npm run test

# End-to-end tests  
npm run test:e2e

# Test coverage report
npm run test:cov

# Watch mode for development
npm run test:watch
```

## 🛠️ Code Quality & Development

### Linting and Formatting

```bash
# Run ESLint with auto-fix
npm run lint

# Format code with Prettier
npm run format
```

### Build

```bash
# Build for production
npm run build
```

## 📁 Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data Transfer Objects
│   ├── strategies/      # Passport strategies
│   └── interfaces/      # TypeScript interfaces
├── users/               # User management module
│   ├── schemas/         # Mongoose schemas
│   ├── mappers/         # Data mappers
│   └── entities/        # User entities
├── verification/        # Email verification module
│   ├── dto/             # Verification DTOs
│   └── schemas/         # Token schemas
├── health/              # Health check module
├── email/               # Email service module
├── common/              # Shared utilities
│   ├── decorators/      # Custom decorators
│   ├── filters/         # Exception filters
│   ├── interceptors/    # Request interceptors
│   └── validators/      # Custom validators
├── config/              # Configuration files
│   └── *.config.ts     # Environment configs
└── guards/              # Authentication guards
```

## 📋 API Endpoints

### Authentication
- `POST /auth/register` - User registration
- `POST /auth/login` - User login
- `POST /auth/refresh` - Refresh access token
- `POST /auth/logout` - User logout
- `POST /auth/logout-all` - Logout from all devices

### Email Verification
- `POST /verification/verify-email` - Verify email address
- `POST /verification/resend-verification` - Resend verification email
- `POST /verification/request-password-reset` - Request password reset
- `POST /verification/reset-password` - Reset password

### Health Check
- `GET /health` - Complete system health status
- `GET /health/ping` - Simple API availability check
- `GET /health/database` - Database connectivity check

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID

## 🚀 Deployment

### Production Build
```bash
# Build the application
npm run build

# Start production server
npm run start:prod
```

### Docker Deployment
```bash
# Build Docker image
docker build -t auth-microservice .

# Run container
docker run -p 3000:3000 --env-file .env auth-microservice
```

### Environment Variables for Production
Ensure these variables are properly configured:
- `NODE_ENV=production`
- `MONGODB_URI` - Production MongoDB connection string
- `JWT_SECRET` - Strong JWT secret (32+ characters)
- `SENDGRID_API_KEY` - Valid SendGrid API key
- Rate limiting and security configurations

## 📚 Documentation

- **API Documentation**: Available at `/api` when running
- **Health Monitoring**: Available at `/health`
- **Interactive API Testing**: Use Swagger UI at `/api`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is [MIT licensed](LICENSE).

---

**Built with ❤️ using NestJS, MongoDB, and TypeScript**
