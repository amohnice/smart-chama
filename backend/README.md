# Smart Chama Backend

This is the backend API for Smart Chama, built with Node.js and Express.

## Tech Stack

- Node.js with Express
- MongoDB with Mongoose
- JWT for authentication
- Multer for file uploads
- Bcrypt for password hashing
- Nodemailer for email notifications

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:

Create a `.env` file in the root directory:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/smart-chama

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=30d

# Admin Registration
ADMIN_REGISTRATION_CODE=ADMIN123456

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_specific_password
EMAIL_FROM=your_email@gmail.com
```

3. Start the development server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
backend/
├── config/             # Configuration files
├── controllers/        # Route controllers
├── middleware/         # Custom middleware
├── models/            # Mongoose models
├── routes/            # API routes
├── utils/             # Utility functions
├── .env               # Environment variables
├── package.json       # Dependencies and scripts
└── server.js          # Entry point
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password

### Members
- `GET /api/members/profile` - Get member profile
- `PUT /api/members/profile` - Update member profile
- `GET /api/members/contributions` - Get member contributions
- `GET /api/members/loans` - Get member loans
- `GET /api/members/meetings` - Get member meetings

### Admin
- `GET /api/admin/dashboard` - Get admin dashboard
- `GET /api/admin/members` - Get all members
- `POST /api/admin/members` - Add new member
- `PUT /api/admin/members/:id` - Update member
- `DELETE /api/admin/members/:id` - Delete member

### Contributions
- `GET /api/contributions` - Get all contributions
- `POST /api/contributions` - Add new contribution
- `PUT /api/contributions/:id` - Update contribution
- `DELETE /api/contributions/:id` - Delete contribution

### Loans
- `GET /api/loans` - Get all loans
- `POST /api/loans` - Apply for loan
- `PUT /api/loans/:id` - Update loan
- `DELETE /api/loans/:id` - Delete loan

### Meetings
- `GET /api/meetings` - Get all meetings
- `POST /api/meetings` - Create new meeting
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting

## Error Handling

The API uses a centralized error handling system. All errors are returned in the following format:

```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License.
