# Smart Chama Frontend

This is the frontend application for Smart Chama, built with React and Vite.

## Tech Stack

- React.js with Vite
- Material-UI for UI components
- React Router for navigation
- Axios for API requests
- Redux Toolkit for state management
- Formik & Yup for form handling and validation

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:

Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
```

3. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

## Project Structure

```
frontend/
├── public/              # Static files
├── src/
│   ├── components/      # Reusable components
│   ├── features/        # Redux slices and features
│   ├── pages/          # Page components
│   ├── services/       # API services
│   ├── utils/          # Utility functions
│   ├── App.jsx         # Root component
│   └── main.jsx        # Entry point
├── .env                # Environment variables
├── package.json        # Dependencies and scripts
└── vite.config.js      # Vite configuration
```

## Features

- User authentication (login/register)
- Admin and member dashboards
- Contribution management
- Loan management
- Meeting management
- Profile management
- Responsive design

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

This project is licensed under the MIT License.

