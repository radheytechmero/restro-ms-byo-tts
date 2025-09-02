/**
 * Premium Admin Layout Component
 * Main layout wrapper with sidebar navigation for authenticated users
 */

import { useState } from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { 
  LayoutDashboard, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Shield,
  Crown,
  BarChart3,
  UserCheck,
  SquareMenu,
  ShoppingCart,
  Phone,
  Tags
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();

  // Define navigation items based on user role
  const getNavigationItems = () => {
    if (user?.role === 'superadmin') {
      // Super admin only sees restaurant module
      return [
        {
          name: 'Restaurants',
          href: '/admin/restaurants',
          icon: Settings,
          description: 'Manage restaurants'
        }
      ];
    }
    
    // Regular admin sees all modules except restaurants
    return [
      {
        name: 'Dashboard',
        href: '/admin',
        icon: LayoutDashboard,
        description: 'Overview and analytics'
      },
      {
        name: 'Orders',
        href: '/admin/orders',
        icon: ShoppingCart,
        description: 'Order management'
      },
      {
        name: 'Menu Items',
        href: '/admin/menu-item',
        icon: SquareMenu,
        description: 'View Menu'
      },
      {
        name: 'Categories',
        href: '/admin/categories',
        icon: Tags,
        description: 'Manage categories'
      },
      {
        name: 'Customers',
        href: '/admin/customers',
        icon: UserCheck,
        description: 'Customer management'
      },
      {
        name: 'Call Recordings',
        href: '/admin/call-recordings',
        icon: Phone,
        description: 'Call recording management'
      },
      // {
      //   name: 'Call Logs',
      //   href: '/admin/call-logs',
      //   icon: Phone,
      //   description: 'Call tracking'
      // },
      // {
      //   name: 'Users',
      //   href: '/admin/users',
      //   icon: Users,
      //   description: 'User management'
      // },
      // {
      //   name: 'Analytics',
      //   href: '/admin/analytics',
      //   icon: BarChart3,
      //   description: 'Performance metrics'
      // },
      {
        name: 'Settings',
        href: '/admin/settings',
        icon: Settings,
        description: 'System configuration'
      }
    ];
  };

  const navigationItems = getNavigationItems();

  const handleLogout = () => {
    logout();
  };

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center">
                {user?.role === 'superadmin' ? (
                  <Shield className="w-4 h-4 text-primary-foreground" />
                ) : (
                  <Shield className="w-4 h-4 text-primary-foreground" />
                )}
              </div>
              <h1 className="text-lg font-semibold">
                {user?.role === 'superadmin' ? 'Super Admin' : 'RestroMS'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-4 h-4" />
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div className="text-xs opacity-70">{item.description}</div>
                  </div>
                </NavLink>
              );
            })}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name?.charAt(0) || 'A'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <div className="flex items-center space-x-1">
                  {user?.role === 'superadmin' && <Shield className="w-3 h-3 text-primary" />}
                  {user?.role === 'admin' && <Crown className="w-3 h-3 text-primary" />}
                  <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2 text-sm text-muted-foreground">
              <UserCheck className="w-4 h-4" />
              <span>Online</span>
            </div>
            {/* <ThemeToggle /> */}
          </div>
        </header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;