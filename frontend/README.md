# Smart Chama Frontend

A modern web application for managing Chama groups, built with React and Material-UI.

## Features

- User authentication and authorization
- Member management
- Meeting scheduling and attendance tracking
- Financial management (contributions, loans, expenses)
- Real-time notifications
- Responsive design for all devices
- Interactive dashboards and reports
- File uploads and document management

## Tech Stack

- React 18
- Redux Toolkit for state management
- React Router for navigation
- Material-UI for components and styling
- Formik and Yup for form handling and validation
- Axios for API requests
- Recharts for data visualization
- React Toastify for notifications

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Backend API running (see backend README)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/smart-chama.git
   cd smart-chama/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory and add the following variables:
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=Smart Chama
   ```

4. Start the development server:
   ```bash
   npm run dev
   # or
   yarn dev
   ```

The application will be available at `http://localhost:5173`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run format` - Format code with Prettier

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── features/       # Redux slices and related logic
  ├── pages/         # Page components
  ├── services/      # API services
  ├── styles/        # Global styles and theme
  ├── utils/         # Utility functions
  ├── hooks/         # Custom React hooks
  ├── assets/        # Static assets
  ├── App.jsx        # Main App component
  └── main.jsx       # Application entry point
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

