import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AuthProvider from "@/components/providers/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import ProtectedRoute from "@/components/admin/ProtectedRoute";
import AdminLayout from "@/components/admin/AdminLayout";
import Dashboard from "./components/admin/Dashboard";
import OrdersPage from "@/components/admin/OrdersPage";
import CallLogsPage from "@/components/admin/CallLogsPage";
import CallRecordingsPage from "@/components/admin/CallRecordingsPage";
import UsersPage from "@/components/admin/UsersPage";
import SettingsPage from "@/components/admin/SettingsPage";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MenuItem from "./components/admin/MenuItem";
import CategoryPage from "./components/admin/CategoryPage";
import RestaurantPage from "./components/admin/RestaurantPage";
import CustomerPage from "./components/admin/CustomerPage";
import { useAuth } from "@/hooks/useAuth";

const queryClient = new QueryClient();

// Component to handle role-based redirects
const AdminRedirect = () => {
  const { user } = useAuth();
  
  if (user?.role === 'superadmin') {
    return <Navigate to="/admin/restaurants" replace />;
  }
  
  return <Dashboard />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="adminzen-theme">
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* <Route path="/" element={<Index />} /> */}
              <Route path="/" element={<Navigate to="/admin" replace />} />
              {/* Protected Admin Routes */}
              <Route path="/admin" element={
                <ProtectedRoute>
                  <AdminLayout />
                </ProtectedRoute>
              }>
                <Route index element={<AdminRedirect />} />
                {/* Regular admin routes - super admin cannot access */}
                <Route path="orders" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <OrdersPage />
                  </ProtectedRoute>
                } />
                <Route path="menu-item" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <MenuItem />
                  </ProtectedRoute>
                } />
                <Route path="categories" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <CategoryPage />
                  </ProtectedRoute>
                } />
                {/* Super admin only route */}
                <Route path="restaurants" element={
                  <ProtectedRoute requiredRole="superadmin">
                    <RestaurantPage />
                  </ProtectedRoute>
                } />
                <Route path="customers" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <CustomerPage />
                  </ProtectedRoute>
                } />
                <Route path="call-recordings" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <CallRecordingsPage />
                  </ProtectedRoute>
                } />
                <Route path="settings" element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <SettingsPage /> 
                  </ProtectedRoute>
                } />
                {/* <Route path="call-logs" element={<CallLogsPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="analytics" element={<Dashboard />} />
                */}
              </Route>
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
