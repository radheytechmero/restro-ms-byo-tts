/**
 * Premium Admin Dashboard Component
 * Main dashboard with analytics, stats, and recent activity
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  UserCheck, 
  Crown, 
  DollarSign, 
  TrendingUp, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  RefreshCw,
  ShoppingCart,
  ChefHat,
  Table,
  Calendar
} from 'lucide-react';
import { apiService, type DashboardResponse, type RecentOrder } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState<DashboardResponse | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month' | 'year'>('today');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const data = await apiService.getDashboard(selectedPeriod);
      setDashboardData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedPeriod]);

  const statCards = [
    {
      title: 'Total Orders',
      value: dashboardData?.data.overview.totalOrders || 0,
      change: `${dashboardData?.data.growth.orderGrowth >= 0 ? '+' : ''}${dashboardData?.data.growth.orderGrowth || 0}%`,
      trend: (dashboardData?.data.growth.orderGrowth || 0) >= 0 ? 'up' : 'down',
      icon: ShoppingCart,
      description: `Orders for ${selectedPeriod}`
    },
    {
      title: 'Total Revenue',
      value: `$${dashboardData?.data.overview.totalRevenue?.toLocaleString() || 0}`,
      change: `${dashboardData?.data.growth.revenueGrowth >= 0 ? '+' : ''}${dashboardData?.data.growth.revenueGrowth || 0}%`,
      trend: (dashboardData?.data.growth.revenueGrowth || 0) >= 0 ? 'up' : 'down',
      icon: DollarSign,
      description: `Revenue for ${selectedPeriod}`
    },
    {
      title: 'Average Order Value',
      value: `$${dashboardData?.data.overview.averageOrderValue?.toFixed(2) || '0.00'}`,
      change: '',
      trend: 'up',
      icon: TrendingUp,
      description: 'Average order amount'
    },
    {
      title: 'Menu Items',
      value: dashboardData?.data.overview.totalMenuItems || 0,
      change: '',
      trend: 'up',
      icon: ChefHat,
      description: 'Total menu items'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'pending': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'preparing': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'confirmed': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
      case 'cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatOrderType = (type: string) => {
    return type.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">Welcome to your admin panel</p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Restaurant Dashboard</h1>
          <p className="text-muted-foreground">Monitor your restaurant performance and analytics</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Select value={selectedPeriod} onValueChange={(value: 'today' | 'week' | 'month' | 'year') => setSelectedPeriod(value)}>
            <SelectTrigger className="w-[140px]">
              <Calendar className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button 
            onClick={loadDashboardData}
            disabled={isLoading}
            className="bg-gradient-to-r from-primary to-primary-glow"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const TrendIcon = stat.trend === 'up' ? ArrowUpRight : ArrowDownRight;
          
          return (
            <Card key={stat.title} className="relative overflow-hidden group hover:shadow-elegant transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                {stat.change && (
                  <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                    <TrendIcon className={`w-3 h-3 ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}>{stat.change}</span>
                    <span>from last period</span>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <ShoppingCart className="w-5 h-5" />
              <span>Recent Orders</span>
            </CardTitle>
            <CardDescription>
              Latest customer orders
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {dashboardData?.data.recentOrders && dashboardData.data.recentOrders.length > 0 ? (
              dashboardData.data.recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-accent/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium">{order.customerName.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">{order.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatOrderType(order.orderType)} • Table {order.tableNumber}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-sm font-medium">${order.totalAmount.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">{order.itemCount} items</p>
                  </div>
                  <Badge variant="outline" className={getStatusColor(order.status)}>
                    {order.status}
                  </Badge>
                </div>
              </div>
              ))
            ) : (
              <div className="text-center py-8">
                <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No recent orders</p>
                <p className="text-sm text-muted-foreground">Orders will appear here once customers start placing them</p>
              </div>
            )}
            
            {dashboardData?.data.recentOrders && dashboardData.data.recentOrders.length > 0 && (
              <Button variant="outline" className="w-full">
                <Eye className="w-4 h-4 mr-2" />
                View All Orders
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Restaurant Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Restaurant Insights</span>
            </CardTitle>
            <CardDescription>
              Key performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 rounded-lg bg-accent/20">
                <div className="flex items-center space-x-2">
                  <Table className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Available Tables</span>
                </div>
                <span className="text-sm font-medium">
                  {dashboardData?.data.tableStats.find(t => t.status === 'available')?.count || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-lg bg-accent/20">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Total Customers</span>
                </div>
                <span className="text-sm font-medium">
                  {dashboardData?.data.overview.totalCustomers || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-lg bg-accent/20">
                <div className="flex items-center space-x-2">
                  <ChefHat className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Categories</span>
                </div>
                <span className="text-sm font-medium">
                  {dashboardData?.data.overview.totalCategories || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between p-2 rounded-lg bg-accent/20">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">Reservations</span>
                </div>
                <span className="text-sm font-medium">
                  {dashboardData?.data.overview.totalReservations || 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;