# RestroMS Suite

A modern, premium admin panel built with React, TypeScript, and Tailwind CSS. Features token-based authentication, protected routes, and a comprehensive dashboard for restaurant management.

## 🚀 Features

- **Modern UI/UX**: Built with shadcn/ui components and Tailwind CSS
- **Authentication**: JWT token-based authentication with protected routes
- **Responsive Design**: Mobile-first approach with responsive sidebar
- **Real-time Updates**: Toast notifications and loading states
- **Type Safety**: Full TypeScript support
- **API Integration**: RESTful API integration with error handling

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn/ui components
- **Routing**: React Router DOM v6
- **State Management**: React Query (TanStack Query)
- **Authentication**: Custom JWT implementation
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

## 📁 Project Structure

```
adminzen-suite/
├── public/
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── admin/           # Admin-specific components
│   │   ├── providers/       # Context providers
│   │   └── ui/             # Reusable UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── pages/              # Page components
│   ├── services/           # API services
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # App entry point
│   └── index.css          # Global styles
├── package.json
├── vite.config.ts
└── tailwind.config.ts
```

## 🗺️ Routing Configuration

The application uses React Router DOM v6 with nested routing for the admin panel.

### Main App Routes (`src/App.tsx`)

```tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";

const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Protected Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute>
          <AdminLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="analytics" element={<Dashboard />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
      
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);
```

### Route Structure

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin` | `Dashboard` | Main admin dashboard |
| `/admin/users` | `UsersPage` | User management |
| `/admin/analytics` | `Dashboard` | Analytics dashboard |
| `/admin/settings` | `SettingsPage` | System settings |
| `*` | `NotFound` | 404 error page |

### Protected Route Implementation

```tsx
// src/components/admin/ProtectedRoute.tsx
const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  return <>{children}</>;
};
```

## 🔐 Authentication System

### Authentication Flow

1. **Login**: User submits credentials via `/api/login`
2. **Token Storage**: JWT token stored in localStorage
3. **Route Protection**: All admin routes require authentication
4. **Token Refresh**: Automatic token refresh mechanism
5. **Logout**: Token removal and redirect to login

### Auth Hook Usage

```tsx
// src/hooks/useAuth.ts
const { user, isAuthenticated, isLoading, login, logout } = useAuth();

// Login
await login(email, password);

// Check authentication
if (isAuthenticated) {
  // Access protected content
}

// Logout
await logout();
```

## 🌐 API Integration

### Base Configuration

```tsx
// src/services/api.ts
export class ApiService {
  private baseUrl = 'http://127.0.0.1:8787/api';
  
  private getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('admin_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}
```

### Available API Endpoints

#### Authentication Endpoints

**POST `/api/login`**
```tsx
// Request
{
  "email": "info@demoresto.com",
  "password": "1234"
}

// Response
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "info@demoresto.com",
    "name": "Demo Resto"
  }
}
```

**POST `/api/logout`**
```tsx
// Clears authentication token
await apiService.logout();
```

#### Restaurant Management Endpoints

**GET `/api/restaurant`** - List all restaurants
**GET `/api/fetch-restaurant/{id}`** - Get restaurant by ID
**POST `/api/create-restaurant`** - Create new restaurant
**PUT `/api/update-restaurant/{id}`** - Update restaurant
**DELETE `/api/delete-restaurant/{id}`** - Delete restaurant

#### Menu Management Endpoints

**GET `/api/menu-items`** - List all menu items

#### Order Management Endpoints

**POST `/api/create-order`** - Create new order

### API Service Methods

```tsx
// Authentication
await apiService.login(email, password);
await apiService.logout();
await apiService.refreshToken();

// Dashboard
const stats = await apiService.getDashboardStats();

// User Management
const users = await apiService.getUsers(page, limit);
const user = await apiService.getUser(id);
await apiService.updateUser(id, userData);
await apiService.deleteUser(id);

// Settings
await apiService.updateSettings(settings);
const settings = await apiService.getSettings();
```

### Error Handling

```tsx
try {
  const response = await apiService.login(email, password);
  // Handle success
} catch (error) {
  // Error handling with toast notifications
  toast({
    title: "Login Failed",
    description: error instanceof Error ? error.message : "Unknown error",
    variant: "destructive",
  });
}
```

## 🎨 UI Components

### Component Library

The project uses shadcn/ui components with custom styling:

- **Buttons**: Primary, secondary, outline variants
- **Forms**: Input fields, labels, validation
- **Navigation**: Sidebar, breadcrumbs, tabs
- **Feedback**: Toasts, alerts, loading states
- **Data Display**: Tables, cards, avatars
- **Layout**: Containers, grids, spacing

### Custom Components

```tsx
// Admin Layout with Sidebar
<AdminLayout>
  <Outlet />
</AdminLayout>

// Protected Route Wrapper
<ProtectedRoute>
  <AdminContent />
</ProtectedRoute>

// Login Form
<LoginForm />
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Backend API running on `http://127.0.0.1:8787`

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd adminzen-suite
```

2. **Install dependencies**
```bash
npm install
```

3. **Start development server**
```bash
npm run dev
```

4. **Build for production**
```bash
npm run build
```

### Environment Setup

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://127.0.0.1:8787/api
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run build:dev` | Build for development |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

## 🔧 Configuration

### Vite Configuration

```ts
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

### Tailwind Configuration

```js
// tailwind.config.ts
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Custom color palette
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

## 📱 Responsive Design

The application is fully responsive with:

- **Mobile-first approach**
- **Collapsible sidebar** on mobile devices
- **Touch-friendly interactions**
- **Optimized layouts** for all screen sizes

## 🔒 Security Features

- **JWT Token Authentication**
- **Protected Routes**
- **Automatic Token Refresh**
- **Secure Token Storage**
- **CSRF Protection** (via API headers)

## 🧪 Testing

The application includes:

- **TypeScript** for type safety
- **ESLint** for code quality
- **Error boundaries** for graceful error handling
- **Loading states** for better UX

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support and questions:

- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Built with ❤️ using React, TypeScript, and Tailwind CSS**
