# Node.js Boilerplate with PostgreSQL, Redis, Sequelize, and Production-Ready Features

Welcome to the **Node.js Boilerplate** repository! This boilerplate is designed to help you kickstart your Node.js backend projects with a production-ready setup, including PostgreSQL, Redis, Sequelize ORM, custom error handling, logging, and JWT-based authentication (with refresh tokens). 

## Features
This boilerplate includes:

- **PostgreSQL**: Relational database with Sequelize ORM.
- **Redis**: Caching layer for improved performance and secure refresh token management.
- **Sequelize**: ORM for managing PostgreSQL database models and migrations.
- **Custom Error Handling**: Centralized error handling using Winston for logging.
- **Logging**: 
  - **Morgan**: HTTP request logger.
  - **Winston**: General-purpose logger with support for error levels and formatting.
  - **Chalk**: Terminal string styling for color-coded log messages.
- **JWT Authentication**: Secure access token generation and refresh token management with Redis cache.
- **Swagger**: Integrated API documentation.

## Project Structure
```
demo-project-nodejs
├── .env
├── .gitignore
├── .sequelizerc
├── logs
│   ├── combined.log
│   └── error.log
├── package-lock.json
├── package.json
└── src
    ├── Controllers
    │   └── authController.js
    ├── db
    │   ├── config
    │   │   └── config.js
    │   ├── migrations
    │   │   └── 20241219113540-create-user.js
    │   ├── models
    │   │   ├── index.js
    │   │   └── user.js
    │   └── seeders
    ├── index.js
    ├── middlewares
    │   └── morganMiddleware.js
    ├── routes
    │   ├── auth.js
    │   └── main.js
    ├── utils
    │   ├── asyncErrorHandler.js
    │   ├── customError.js
    │   ├── globalErrorhandler.js
    │   ├── init_redis.js
    │   ├── jwt
    │   │   └── jwt_helper.js
    │   └── logger.js
    └── validations
        └── auth
            └── authValidation.js
```

## Getting Started

### Prerequisites
Make sure you have the following installed on your system:
- Node.js (>= 18.x)
- PostgreSQL (>= 14.x)
- Redis (>= 6.x)
- npm (>= 8.x) or yarn

### Installation
1. Clone this repository:
   ```bash
   git clone -b postgres-redis https://github.com/your-username/your-repo-name.git
   cd your-repo-name
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Set up the PostgreSQL database:
   ```bash
   npx sequelize-cli db:create
   npx sequelize-cli db:migrate
   ```

### Environment Variables
Rename `.env.example` to `.env` and update the environment variables as per your setup:
```env
# @app config
APP_PORT=3000
APP_HOST=localhost
NODE_ENV=development # development | production
APP_URL=http://localhost:3000

# @redis config
REDIS_HOST=localhost
REDIS_PORT=6379

# @JWT config
ACCESS_TOKEN_SECRET=secret
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_SECRET=secret
REFRESH_TOKEN_EXPIRES_IN=7d
ACCESS_TOKEN_ISSUER=Titanslab
REFRESH_TOKEN_ISSUER=Titanslab


# @postgres sequelize config
DB_USER=
DB_PASSWORD=
DB_HOST=
DB_PORT=
DB_NAME=
DB_DIALECT=
```

## Usage

### Scripts
- **Start the server**: `npm start`
- **Run in development mode**: `npm run dev`
- **Run tests**: `npm test`
- **Lint the code**: `npm run lint`

## Custom Error Handling
All errors are centralized and use custom error classes located in the `src/utils/customError.js`. The `globalErrorhandler.js` ensures consistent error responses with status codes and logs errors using Winston.

## Logging
- **Morgan**: Logs HTTP requests in the console (e.g., request method, status code).
- **Winston**: Manages detailed logs (info, warn, error) for debugging and monitoring.
- **Chalk**: Adds color-coded terminal output for improved visibility during development.

## JWT Authentication

### Access Tokens
Access tokens are issued to authenticate API requests. Tokens are signed using `JWT_SECRET` and validated on protected routes using an authentication middleware.

### Refresh Tokens with Redis Cache
Refresh tokens are stored in Redis to enhance security. A refresh token can:
- Reissue a new access token.
- Be blacklisted upon logout.

Redis is used to:
- Store tokens with expiration times.
- Ensure fast validation and revocation.

