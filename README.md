<p align="center">
  <a href="http://nestjs.com/" target="_blank">
    <img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" />
  </a>
</p>

<p align="center">
  <b>Wallet & Transaction Service</b> built with <a href="http://nodejs.org" target="_blank">Node.js</a> and <a href="http://nestjs.com/" target="_blank">NestJS</a>.
</p>

<p align="center">
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
  <a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
  <a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
  <a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
</p>

## Description

This project is a **financial wallet and transaction management system** built with [NestJS](https://nestjs.com).  
It supports:

- Multi‑currency wallets per user
- Funding wallets
- Currency conversion with FX rates
- Trading between currencies
- Transaction tracking with statuses
- **Audit logs** for accountability and compliance
- Double‑entry ledger principles (debit & credit transactions)


## Project Setup

```bash
# install dependencies
npm install

```

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Project Structure
src/user → User entity, service, controllers (signup, login, verify email)

src/token → Token entity, service, controllers (refresh, logout)

src/wallet → Wallet entity, service, DTOs

src/transaction → Transaction entity, service, enums

src/fx → FX rate service for currency conversion

src/audit-logs → AuditLog entity, service, DTOs

## Audit Logging
Every critical wallet action (fund, convert, trade) is recorded in the audit_logs table with:

User ID

Wallet ID

Transaction ID

Action type (FUND, CONVERT, TRADE)

Details (amount, currency, before/after balances, reference)

Timestamp

This ensures traceability, compliance, and accountability.

## API Reference (Quick)

 **Users**
POST /users/signup → Register a new user

POST /users/verify-email → Verify email with OTP

POST /users/login → Login with email/password

 **Tokens**
POST /token/refresh → Refresh access token (requires AuthGuard)

POST /token/logout → Logout and invalidate refresh token

 **Wallets**
POST /wallet/fund → Fund a wallet

POST /wallet/convert → Convert currency between wallets

POST /wallet/trade → Trade currency between wallets

GET /wallet/:userId → Get wallet(s) for a user

**Transactions**
GET /transactions/:walletId → List transactions for a wallet

GET /transactions/:id → Get transaction details

 **Audit Logs**
GET /audit-logs/user/:id → Get audit logs for a user

GET /audit-logs/wallet/:id → Get audit logs for a wallet

GET /audit-logs/:id → Get a single audit log

## System Design

### Architecture Overview
The system is built using **NestJS** with a modular architecture. Each domain (User, Token, Wallet, Transaction, FX, AuditLog) is encapsulated in its own module, exposing controllers, services, and entities.

- **User Module**
  - Handles user registration, email verification, and login.
  - Provides authentication context for wallets and transactions.

- **Token Module**
  - Issues and manages access/refresh tokens.
  - Provides secure session management with `AuthGuard`.

- **Wallet Module**
  - Each user can have multiple wallets (one per currency).
  - Supports funding, conversion, and trading operations.
  - Maintains balances and links to transactions.

- **Transaction Module**
  - Records all wallet operations (fund, convert, trade).
  - Implements double‑entry ledger principles (debit & credit).
  - Each transaction is linked to a wallet and may have audit logs.

- **FX Module**
  - Provides exchange rates for currency conversion and trading.
  - External API integration for real‑time rates.

- **AuditLog Module**
  - Records every critical action (fund, convert, trade).
  - Links to User, Wallet, and Transaction.
  - Stores structured details (amount, currency, before/after balances, reference).

  **OTP Module**
   - Generates and validates one‑time passwords (OTPs) for email verification and
     secure actions
   - Uses BullMQ for queueing and sending OTP emails
   - Ensures only verified users can access trading features

  **Password Module**
   - Manages secure password storage and validation
   - Handles hashing, salting, and password reset flows
   - Provides a reliable record of user credentials

### Data Flow

1. **User Signup/Login**
   - User registers → email verified → login generates access/refresh tokens.
   - Tokens are used to authenticate subsequent requests.

2. **Wallet Operations**
   - User requests to fund/convert/trade.
   - WalletService validates balances and currency.
   - TransactionService creates pending transactions.
   - Wallet balances are updated.
   - Transactions are marked `SUCCESS`.

3. **Audit Logging**
   - After each wallet operation, AuditLogService records:
     - User ID
     - Wallet ID
     - Transaction ID
     - Action type
     - Before/after balances
     - Reference

4. **Token Refresh/Logout**
   - Refresh endpoint validates refresh token and issues new tokens.
   - Logout deletes refresh token from storage.
   
5. **Password & OTP**
   - Passwords securely stored and validated during login
   - OTPs generated and validated during signup and sensitive operations

### Entity Relationships

- **User ↔ Wallet** → One‑to‑Many  
- **Wallet ↔ Transaction** → One‑to‑Many  
- **Transaction ↔ AuditLog** → One‑to‑Many  
- **User ↔ AuditLog** → One‑to‑Many  
- **Wallet ↔ AuditLog** → One‑to‑Many  
-  **User ↔ OTP** → One‑to‑Many
- **User ↔ Password** → One‑to‑One

### Sequence Example: Fund Wallet

1. User calls `POST /wallet/fund`.  
2. WalletService validates wallet and balance.  
3. TransactionService creates a pending transaction.  
4. Wallet balance is updated.  
5. Transaction is marked `SUCCESS`.  
6. AuditLogService records the action with details.  
7. Response returned with updated balance and reference.

### Documentation on postman 
 [https://.postman.co/workspace/My-Workspace~ce342de9-293d-4f1e-8b08-d1eaa008bdc8/collection/32752842-d12e7fc6-b0fa-4076-a063-44d706ad7590?action=share&creator=32752842]

### Deployment Considerations

- **Database**: PostgreSQL recommended (supports JSONB for audit details).  
- **Authentication**: JWT access/refresh tokens.  
- **Scalability**: Each module can scale independently (e.g., AuditLogService can be offloaded to a logging microservice).  
- **Monitoring**: Audit logs provide traceability; add metrics/logging for performance.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support


## Author
Developer: Rasaq

Framework: NestJS

License: MIT

## Stay in touch

- Author - [Yisa Rasaq](yisarasaq2018@gmail.com)
- Twitter - [@nestframework](https://x.com/Yisamoses12)

