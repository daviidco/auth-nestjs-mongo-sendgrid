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

#### 🗄️ **Database Configuration**
```env
MONGODB_URI=mongodb://localhost:27017/auth_microservice
```
- **Purpose**: MongoDB connection string for data persistence
- **Required**: Yes
- **Example**: `mongodb://user:pass@localhost:27017/mydb` (with auth)

#### 🔐 **JWT Authentication**
```env
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-min-32-chars  
REFRESH_TOKEN_EXPIRES_IN=7d
```
- **JWT_SECRET**: Secret key for signing access tokens (min 32 characters)
- **JWT_EXPIRES_IN**: Access token expiration time (default: 15m)
- **REFRESH_TOKEN_SECRET**: Secret key for refresh tokens (min 32 characters)
- **REFRESH_TOKEN_EXPIRES_IN**: Refresh token expiration time (default: 7d)

#### 📧 **Email Configuration (SendGrid)**
```env
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Auth Microservice
```
- **SENDGRID_API_KEY**: API key from SendGrid dashboard (required for emails)
- **SENDGRID_FROM_EMAIL**: Sender email address (must be verified in SendGrid)
- **SENDGRID_FROM_NAME**: Display name for emails (optional, default: "Auth Microservice")

#### ✉️ **Email Verification System**
```env
REQUIRE_EMAIL_VERIFICATION=true
VERIFICATION_DEFAULT_MODE=hybrid
```
- **REQUIRE_EMAIL_VERIFICATION**: Enable/disable mandatory email verification (default: true)
  - `true`: Users must verify email before login
  - `false`: Users can login without email verification
- **VERIFICATION_DEFAULT_MODE**: Email verification mode (default: web)
  - `web`: Send only web verification link
  - `api`: Send only API commands (for developers)
  - `hybrid`: Send both web link and API commands

#### 🌐 **Frontend & URLs**
```env
FRONTEND_URL=http://localhost:3001
EMAIL_VERIFICATION_URL=http://localhost:3001/auth/verify-email
PASSWORD_RESET_URL=http://localhost:3001/auth/reset-password
```
- **FRONTEND_URL**: Your frontend application URL for CORS and email links
- **EMAIL_VERIFICATION_URL**: Custom URL for email verification (optional, auto-generated from FRONTEND_URL)
- **PASSWORD_RESET_URL**: Custom URL for password reset (optional, auto-generated from FRONTEND_URL)

#### 🚦 **Rate Limiting & Security**
```env
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
EMAIL_RATE_LIMIT_TTL=60000
EMAIL_RATE_LIMIT_MAX=2
PASSWORD_RESET_RATE_LIMIT_TTL=300000
PASSWORD_RESET_RATE_LIMIT_MAX=3
```
- **RATE_LIMIT_TTL**: Global rate limit window in milliseconds (default: 60000ms = 1 min)
- **RATE_LIMIT_MAX**: Max requests per window (default: 100)
- **THROTTLE_TTL**: Throttle window for specific endpoints (default: 60000ms)
- **THROTTLE_LIMIT**: Max requests per throttle window (default: 100)
- **EMAIL_RATE_LIMIT_***: Specific limits for email verification endpoints
- **PASSWORD_RESET_RATE_LIMIT_***: Specific limits for password reset (5 min window, max 3 attempts)

#### 🔧 **Application Settings**
```env
PORT=3000
NODE_ENV=development
BCRYPT_ROUNDS=12
```
- **PORT**: Server port (default: 3000)
- **NODE_ENV**: Environment mode (development, production, test)
- **BCRYPT_ROUNDS**: Password hashing rounds (default: 12, higher = more secure but slower)

#### 📊 **Complete .env Example**
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/auth_microservice

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-change-in-production-min-32-chars
REFRESH_TOKEN_EXPIRES_IN=7d

# SendGrid Configuration
SENDGRID_API_KEY=SG.your-sendgrid-api-key-here-replace-with-real-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com
SENDGRID_FROM_NAME=Auth Microservice

# Email Verification Settings
FRONTEND_URL=http://localhost:3001
EMAIL_VERIFICATION_URL=http://localhost:3001/auth/verify-email
PASSWORD_RESET_URL=http://localhost:3001/auth/reset-password
REQUIRE_EMAIL_VERIFICATION=true
VERIFICATION_DEFAULT_MODE=hybrid

# Rate Limiting
RATE_LIMIT_TTL=60000
RATE_LIMIT_MAX=100
THROTTLE_TTL=60000
THROTTLE_LIMIT=100
EMAIL_RATE_LIMIT_TTL=60000
EMAIL_RATE_LIMIT_MAX=2
PASSWORD_RESET_RATE_LIMIT_TTL=300000
PASSWORD_RESET_RATE_LIMIT_MAX=3

# Security
BCRYPT_ROUNDS=12
```

> **🔒 Security Note**: Never commit your actual `.env` file to version control. Use strong, unique secrets in production.

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
