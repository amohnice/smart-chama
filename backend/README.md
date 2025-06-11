# Smart Chama Backend

Backend API for Smart Chama - A Digital Chama Management System

## Features

- User Authentication & Authorization
- Member Management
- Meeting Management
- Financial Management (Contributions & Loans)
- Real-time Notifications
- Email Notifications
- File Uploads
- Security Features

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Nodemailer
- Multer
- Various Security Middleware

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/smart-chama.git
cd smart-chama/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add the following variables:
```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://localhost:27017/smart-chama
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
JWT_COOKIE_EXPIRES_IN=7
EMAIL_SERVICE=gmail
EMAIL_USERNAME=your_email@gmail.com
EMAIL_PASSWORD=your_email_password
EMAIL_FROM=Smart Chama <your_email@gmail.com>
```

4. Start the development server:
```bash
npm run dev
```

## API Documentation

### Authentication

- POST `/api/auth/register` - Register a new user
- POST `/api/auth/login` - Login user
- POST `/api/auth/logout` - Logout user
- GET `/api/auth/me` - Get current user
- PATCH `/api/auth/me` - Update current user
- POST `/api/auth/forgot-password` - Request password reset
- POST `/api/auth/reset-password` - Reset password

### Members

- GET `/api/members` - Get all members
- GET `/api/members/:id` - Get member by ID
- POST `/api/members` - Create new member
- PATCH `/api/members/:id` - Update member
- DELETE `/api/members/:id` - Delete member

### Meetings

- GET `/api/meetings` - Get all meetings
- GET `/api/meetings/:id` - Get meeting by ID
- POST `/api/meetings` - Create new meeting
- PATCH `/api/meetings/:id` - Update meeting
- DELETE `/api/meetings/:id` - Delete meeting
- GET `/api/meetings/upcoming` - Get upcoming meetings
- GET `/api/meetings/past` - Get past meetings

### Finance

- GET `/api/finance/transactions` - Get all transactions
- GET `/api/finance/transactions/:id` - Get transaction by ID
- POST `/api/finance/contributions` - Create contribution
- POST `/api/finance/loans` - Create loan request
- POST `/api/finance/loans/:id/approve` - Approve loan
- POST `/api/finance/loans/:id/reject` - Reject loan
- POST `/api/finance/loans/payments` - Record loan payment
- GET `/api/finance/stats` - Get financial statistics

### Notifications

- GET `/api/notifications` - Get user notifications
- GET `/api/notifications/unread` - Get unread count
- PATCH `/api/notifications/:id/read` - Mark notification as read
- PATCH `/api/notifications/read-all` - Mark all notifications as read
- DELETE `/api/notifications/:id` - Delete notification

## Security Features

- JWT Authentication
- Password Hashing
- Rate Limiting
- CORS Protection
- XSS Protection
- NoSQL Injection Protection
- HTTP Parameter Pollution Protection
- Security Headers
- Input Validation
- File Upload Validation

## Error Handling

The API uses a centralized error handling mechanism with appropriate HTTP status codes and error messages.

## Testing

Run tests using:
```bash
npm test
```

## Linting

Run linter using:
```bash
npm run lint
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
