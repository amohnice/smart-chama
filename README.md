# Smart Chama - Group Financial Management System

Smart Chama is a comprehensive web application designed to streamline group financial management, particularly for savings groups, investment clubs, and community-based organizations. The system provides tools for managing contributions, loans, meetings, and member communications.

## Features

### Admin Features
- **Dashboard**: Real-time overview of group finances, member statistics, and recent activities
- **Member Management**: Add, edit, and manage member profiles and roles
- **Contribution Management**: Track and manage member contributions
- **Loan Management**: Process loan applications, track repayments, and manage interest
- **Meeting Management**: Schedule and track group meetings
- **Financial Reports**: Generate comprehensive financial reports and statements
- **User Management**: Manage admin users and their permissions

### Member Features
- **Personal Dashboard**: View personal contributions, loans, and upcoming meetings
- **Profile Management**: Update personal information and profile picture
- **Contribution Tracking**: View contribution history and make new contributions
- **Loan Management**: Apply for loans and track loan status
- **Meeting Management**: View upcoming meetings and mark attendance
- **Financial Statements**: Access personal financial statements
- **Security**: Change password and manage account security

## Tech Stack

### Frontend
- React.js with Vite
- Material-UI for UI components
- React Router for navigation
- Axios for API requests
- Redux Toolkit for state management
- Formik & Yup for form handling and validation

### Backend
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

1. Clone the repository:
```bash
git clone https://github.com/yourusername/smart-chama.git
cd smart-chama
```

2. Install dependencies:
```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables:

Backend (.env):
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

Frontend (.env):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development servers:
```bash
# Start backend server (from backend directory)
npm run dev

# Start frontend server (from frontend directory)
npm run dev
```

## Creating an Admin Account

To create an admin account:

1. Navigate to the registration page
2. Fill in all required fields
3. Check the "Register as Admin" checkbox
4. Enter the admin code (default: ADMIN123456)
5. Submit the form

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile
- `PUT /api/auth/password` - Change password

### Member Endpoints
- `GET /api/members/profile` - Get member profile
- `PUT /api/members/profile` - Update member profile
- `PUT /api/members/profile/image` - Update profile image
- `GET /api/members/contributions` - Get member contributions
- `GET /api/members/loans` - Get member loans
- `GET /api/members/meetings/upcoming` - Get upcoming meetings
- `GET /api/members/dashboard/stats` - Get dashboard statistics

### Admin Endpoints
- `GET /api/admin/dashboard` - Get admin dashboard data
- `GET /api/admin/members` - Get all members
- `POST /api/admin/members` - Add new member
- `PUT /api/admin/members/:id` - Update member
- `DELETE /api/admin/members/:id` - Delete member

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

