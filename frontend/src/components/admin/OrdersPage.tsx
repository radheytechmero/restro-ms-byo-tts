/**
 * Premium Orders Management Page
 * Complete order management interface with CRUD operations
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ShoppingCart, 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Phone,
  Mail,
  User,
  MapPin
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { apiService, type OrderRequest, type OrderItem } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const OrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [isMenuLoading, setIsMenuLoading] = useState<boolean>(false);
  const [restaurantDetails, setRestaurantDetails] = useState<any>(null);
  const { toast } = useToast();

  let restaurantId = JSON.parse(localStorage.getItem('admin_user')).id;

  // Form state for creating new order
  const [newOrder, setNewOrder] = useState<OrderRequest>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    restaurantNo: restaurantId ? String(restaurantId) : '',
    tableNumber: '',
    orderType: 'dine-in',
    deliveryAddress: { street: null, city: null, zipCode: null, specialInstructions: null },
    orderItems: [],
    specialRequests: '',
    isConfirmed: false
  });

  const [newOrderItem, setNewOrderItem] = useState<OrderItem>({
    id: 0,
    menuItemName: '',
    quantity: 1,
    price: 0,
    size: 'medium',
    customizations: null,
    notes: null
  });

  const loadOrders = async () => {
    try {
      setIsLoading(true);
      const status = selectedStatus === 'all' ? undefined : selectedStatus;
      const response = await apiService.getOrders(restaurantId, status, currentPage, 10);
      
      // Handle the new response format
      if (response.success && response.data) {
        setOrders(response.data);
        setTotalOrders(response.pagination?.total || 0);
      } else {
        setOrders([]);
        setTotalOrders(0);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load orders",
        variant: "destructive",
      });
      setOrders([]);
      setTotalOrders(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [selectedStatus, currentPage]);

  const loadMenuItems = async () => {
    try {
      setIsMenuLoading(true);
      const response = await apiService.getMenus(restaurantId, 1, 100);
      setMenuItems(Array.isArray(response?.data) ? response.data : []);
    } catch (error) {
      setMenuItems([]);
    } finally {
      setIsMenuLoading(false);
    }
  };

  useEffect(() => {
    if (isCreateDialogOpen) {
      loadMenuItems();
      // fetch restaurant details to get restaurant number
      (async () => {
        try {
          const result = await apiService.getRestaurantById(Number(restaurantId));
          setRestaurantDetails(result?.restaurant || null);
          const restaurantNo = result?.restaurant?.phone || result?.restaurant?.id || String(restaurantId || '');
          setNewOrder(prev => ({ ...prev, restaurantNo: String(restaurantNo) }));
        } catch (e) {
          setNewOrder(prev => ({ ...prev, restaurantNo: restaurantId ? String(restaurantId) : prev.restaurantNo }));
        }
      })();
    }
  }, [isCreateDialogOpen]);

  const filteredOrders = orders.filter(order =>
    order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.customer?.phone?.includes(searchTerm) ||
    order.id?.toString().includes(searchTerm)
  );

  const handleCreateOrder = async () => {
    try {
      if (newOrder.orderItems.length === 0) {
        toast({
          title: "Error",
          description: "Please add at least one order item",
          variant: "destructive",
        });
        return;
      }

      const payload: OrderRequest = {
        ...newOrder,
        restaurantNo: newOrder.restaurantNo || (restaurantId ? String(restaurantId) : ''),
      };

      // transform empty strings to null per schema expectations
      const normalizedPayload = {
        ...payload,
        customerEmail: payload.customerEmail && payload.customerEmail.trim() !== '' ? payload.customerEmail : null,
        tableNumber: payload.tableNumber && payload.tableNumber.trim() !== '' ? payload.tableNumber : null,
        specialRequests: payload.specialRequests && payload.specialRequests.trim() !== '' ? payload.specialRequests : null,
        deliveryAddress: payload.orderType === 'delivery' && payload.deliveryAddress &&
          (payload.deliveryAddress.street || payload.deliveryAddress.city || payload.deliveryAddress.zipCode)
          ? {
              street: payload.deliveryAddress.street,
              city: payload.deliveryAddress.city,
              zipCode: payload.deliveryAddress.zipCode,
              specialInstructions: payload.deliveryAddress.specialInstructions || undefined,
            }
          : null,
        orderItems: payload.orderItems.map(item => ({
          ...item,
          customizations: item.customizations && String(item.customizations).trim() !== '' ? String(item.customizations) : null,
          notes: item.notes && String(item.notes).trim() !== '' ? String(item.notes) : null,
        })),
      };

      const response = await apiService.createOrder(normalizedPayload as any);
      
      if (response.success) {
        toast({
          title: "Order Created",
          description: `Order created successfully with ID: ${response.orderId}`,
        });
        setIsCreateDialogOpen(false);
        setNewOrder({
          customerName: '',
          customerPhone: '',
          customerEmail: '',
          restaurantNo: restaurantId ? String(restaurantId) : '',
          tableNumber: '',
          orderType: 'dine-in',
          deliveryAddress: { street: '', city: '', zipCode: '', specialInstructions: '' },
          orderItems: [],
          specialRequests: '',
          isConfirmed: false
        });
        loadOrders();
      } else {
        throw new Error(response.message || 'Failed to create order');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create order",
        variant: "destructive",
      });
    }
  };

  const handleAddOrderItem = () => {
    if (!newOrderItem.id || newOrderItem.price <= 0) {
      toast({
        title: "Error",
        description: "Please select an item and ensure price is set",
        variant: "destructive",
      });
      return;
    }

    setNewOrder(prev => ({
      ...prev,
      orderItems: [...prev.orderItems, { ...newOrderItem }]
    }));

    setNewOrderItem({
      id: 0,
      menuItemName: '',
      quantity: 1,
      price: 0,
      size: 'medium',
      customizations: null,
      notes: null
    });
  };

  const handleRemoveOrderItem = (index: number) => {
    setNewOrder(prev => ({
      ...prev,
      orderItems: prev.orderItems.filter((_, i) => i !== index)
    }));
  };

  const handleViewOrder = async (order: any) => {
    try {
      const orderDetails = await apiService.getOrderById(order.id);
      setSelectedOrder(orderDetails);
      setIsViewDialogOpen(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
    }
  };

  const handleEditOrder = (order: any) => {
    setEditingOrder({
      id: order.id,
      status: order.status || 'pending',
      orderType: order.orderType || 'dine-in'
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateOrder = async () => {
    try {
      await apiService.updateOrder(editingOrder.id, {
        status: editingOrder.status,
        orderType: editingOrder.orderType
      });
      
      toast({
        title: "Success",
        description: "Order updated successfully",
      });
      
      setIsEditDialogOpen(false);
      setEditingOrder(null);
      loadOrders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order",
        variant: "destructive",
      });
    }
  };

  const handleDeleteOrder = async (orderId: number) => {
    if (!confirm('Are you sure you want to delete this order?')) {
      return;
    }

    try {
      await apiService.deleteOrder(orderId);
      toast({
        title: "Success",
        description: "Order deleted successfully",
      });
      loadOrders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      });
    }
  };

  const handleUpdateStatus = async (orderId: number, newStatus: string) => {
    try {
      await apiService.updateOrder(orderId, { status: newStatus });
      toast({
        title: "Status Updated",
        description: `Order status changed to ${newStatus}`,
      });
      loadOrders();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'preparing': return <AlertCircle className="w-4 h-4" />;
      case 'ready': return <CheckCircle className="w-4 h-4" />;
      case 'delivered': return <CheckCircle className="w-4 h-4" />;
      case 'cancelled': return <AlertCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const calculateTotal = (orderItems: OrderItem[]) => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Order Management</h1>
          <p className="text-muted-foreground">Manage and track restaurant orders</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            onClick={loadOrders}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-primary to-primary-glow">
                <Plus className="w-4 h-4 mr-2" />
                Create Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Order</DialogTitle>
                <DialogDescription>
                  Fill in the customer details and order items
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Customer Information</h3>
                  
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Customer Name *</Label>
                    <Input
                      id="customerName"
                      value={newOrder.customerName}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, customerName: e.target.value }))}
                      placeholder="Enter customer name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Phone Number *</Label>
                    <Input
                      id="customerPhone"
                      value={newOrder.customerPhone}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, customerPhone: e.target.value }))}
                      placeholder="Enter phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={newOrder.customerEmail}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, customerEmail: e.target.value }))}
                      placeholder="Enter email address"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orderType">Order Type</Label>
                    <Select value={newOrder.orderType || 'dine-in'} onValueChange={(value) => setNewOrder(prev => ({ ...prev, orderType: value as 'dine-in' | 'takeaway' | 'delivery' }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dine-in">Dine-in</SelectItem>
                        <SelectItem value="takeaway">Takeaway</SelectItem>
                        <SelectItem value="delivery">Delivery</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="restaurantNo">Restaurant Number</Label>
                    <Input
                      id="restaurantNo"
                      value={newOrder.restaurantNo}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, restaurantNo: e.target.value }))}
                      placeholder="Auto-filled from account"
                      readOnly
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tableNumber">Table Number</Label>
                    <Input
                      id="tableNumber"
                      value={newOrder.tableNumber}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, tableNumber: e.target.value }))}
                      placeholder="Enter table number"
                    />
                  </div>

                  {newOrder.orderType === 'delivery' && (
                    <div className="space-y-3 p-4 border rounded-lg">
                      <h4 className="font-medium">Delivery Address</h4>
                      <div className="space-y-2">
                        <Label htmlFor="street">Street</Label>
                        <Input
                          id="street"
                          value={newOrder.deliveryAddress?.street || ''}
                          onChange={(e) => setNewOrder(prev => ({ ...prev, deliveryAddress: { ...(prev.deliveryAddress || { street: '', city: '', zipCode: '', specialInstructions: '' }), street: e.target.value } }))}
                          placeholder="Street address"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label htmlFor="city">City</Label>
                          <Input
                            id="city"
                            value={newOrder.deliveryAddress?.city || ''}
                            onChange={(e) => setNewOrder(prev => ({ ...prev, deliveryAddress: { ...(prev.deliveryAddress || { street: '', city: '', zipCode: '', specialInstructions: '' }), city: e.target.value } }))}
                            placeholder="City"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="zipCode">Zip Code</Label>
                          <Input
                            id="zipCode"
                            value={newOrder.deliveryAddress?.zipCode || ''}
                            onChange={(e) => setNewOrder(prev => ({ ...prev, deliveryAddress: { ...(prev.deliveryAddress || { street: '', city: '', zipCode: '', specialInstructions: '' }), zipCode: e.target.value } }))}
                            placeholder="Zip code"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="specialInstructions">Delivery Instructions</Label>
                        <Input
                          id="deliverySpecialInstructions"
                          value={newOrder.deliveryAddress?.specialInstructions || ''}
                          onChange={(e) => setNewOrder(prev => ({ ...prev, deliveryAddress: { ...(prev.deliveryAddress || { street: '', city: '', zipCode: '', specialInstructions: '' }), specialInstructions: e.target.value } }))}
                          placeholder="Any special delivery instructions"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="specialRequests">Special Requests</Label>
                    <Textarea
                      id="specialRequests"
                      value={newOrder.specialRequests}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, specialRequests: e.target.value }))}
                      placeholder="Any special requests or notes"
                      rows={3}
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isConfirmed"
                      checked={newOrder.isConfirmed}
                      onChange={(e) => setNewOrder(prev => ({ ...prev, isConfirmed: e.target.checked }))}
                      className="rounded"
                    />
                    <Label htmlFor="isConfirmed">Order Confirmed</Label>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Order Items</h3>
                  
                  {/* Add New Item Form */}
                  <div className="space-y-3 p-4 border rounded-lg">
                    <h4 className="font-medium">Add New Item</h4>
                    
                    <div className="space-y-2">
                      <Label htmlFor="menuItemName">Item *</Label>
                      <Select
                        value={newOrderItem.id ? String(newOrderItem.id) : ''}
                        onValueChange={(value) => {
                          const selected = menuItems.find((m: any) => String(m.id) === String(value));
                          setNewOrderItem(prev => ({
                            ...prev,
                            id: selected?.id ?? 0,
                            menuItemName: selected?.name ?? '',
                            price: Number(selected?.price ?? 0),
                          }));
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={isMenuLoading ? 'Loading items...' : 'Select an item'} />
                        </SelectTrigger>
                        <SelectContent>
                          {menuItems.map((item: any) => (
                            <SelectItem key={item.id} value={String(item.id)}>
                              {item.name} - ${item.price}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                          id="quantity"
                          type="number"
                          min="1"
                          value={newOrderItem.quantity}
                          onChange={(e) => setNewOrderItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="price">Price *</Label>
                        <Input
                          id="price"
                          type="number"
                          min="0"
                          // step="0.01"
                          value={newOrderItem.price}
                          onChange={(e) => setNewOrderItem(prev => ({ ...prev, price: isNaN(e.currentTarget.valueAsNumber) ? 0 : e.currentTarget.valueAsNumber }))}
                          placeholder="0.00"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="size">Size</Label>
                      <Select value={newOrderItem.size ?? 'medium'} onValueChange={(value: 'small' | 'medium' | 'large' | 'extra-large') => setNewOrderItem(prev => ({ ...prev, size: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="extra-large">Extra Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Input
                        id="notes"
                        value={newOrderItem.notes ?? ''}
                        onChange={(e) => setNewOrderItem(prev => ({ ...prev, notes: e.target.value || null }))}
                        placeholder="Special instructions"
                      />
                    </div>

                    <Button onClick={handleAddOrderItem} className="w-full">
                      Add Item
                    </Button>
                  </div>

                  {/* Order Items List */}
                  <div className="space-y-2">
                    <h4 className="font-medium">Current Items</h4>
                    {newOrder.orderItems.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No items added yet</p>
                    ) : (
                      <div className="space-y-2">
                        {newOrder.orderItems.map((item, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                            <div className="flex-1">
                              <p className="font-medium">{item.menuItemName}</p>
                              <p className="text-sm text-muted-foreground">
                                {item.quantity}x ${item.price} - {item.size}
                              </p>
                              {item.notes && (
                                <p className="text-xs text-muted-foreground">Note: {item.notes}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRemoveOrderItem(index)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <div className="border-t pt-2">
                          <p className="text-lg font-bold">
                            Total: ${calculateTotal(newOrder.orderItems).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateOrder}>
                  Create Order
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                         <Input
               placeholder="Search orders by customer name, phone, email, or ID..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-10"
             />
          </div>
        </div>
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="ready">Ready</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            {filteredOrders?.length} orders found
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="w-6 h-6 animate-spin mr-2" />
              Loading orders...
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Contact</TableHead>
                                     <TableHead>Items (Qty)</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id}</TableCell>
                                         <TableCell>
                       <div>
                         <p className="font-medium">{order.customer?.name || 'N/A'}</p>
                         <p className="text-sm text-muted-foreground">{order.customer?.email || 'No email'}</p>
                       </div>
                     </TableCell>
                     <TableCell>
                       <div className="flex items-center space-x-1">
                         <Phone className="w-3 h-3" />
                         <span className="text-sm">{order.customer?.phone || 'N/A'}</span>
                       </div>
                     </TableCell>
                                         <TableCell>
                       <span className="text-sm">{order.items || order.orderItems?.length || 0} items ({order.quantity || 0} qty)</span>
                     </TableCell>
                                         <TableCell>
                       <span className="font-medium">${order.totalAmount?.toFixed(2) || '0.00'}</span>
                     </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(order.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status || 'pending'}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm">
                        {new Date(order.createdAt).toDateString()}
                      </span>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditOrder(order)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit Order
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'confirmed')}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Confirm Order
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'preparing')}>
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Mark Preparing
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, 'ready')}>
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Mark Ready
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteOrder(order.id)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Order
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* View Order Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Order Details</DialogTitle>
            <DialogDescription>
              View complete order information
            </DialogDescription>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6">
              {/* Customer Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Customer Information</h3>
                                 <div className="grid grid-cols-2 gap-4">
                   <div className="flex items-center space-x-2">
                     <User className="w-4 h-4 text-muted-foreground" />
                     <span>{selectedOrder.customer?.name || 'N/A'}</span>
                   </div>
                   <div className="flex items-center space-x-2">
                     <Phone className="w-4 h-4 text-muted-foreground" />
                     <span>{selectedOrder.customer?.phone || 'N/A'}</span>
                   </div>
                   <div className="flex items-center space-x-2">
                     <Mail className="w-4 h-4 text-muted-foreground" />
                     <span>{selectedOrder.customer?.email || 'No email'}</span>
                   </div>
                   <div className="flex items-center space-x-2">
                     <MapPin className="w-4 h-4 text-muted-foreground" />
                     <span>Table {selectedOrder.table?.number || 'N/A'}</span>
                   </div>
                 </div>
              </div>

                             {/* Order Items */}
               <div className="space-y-4">
                 <h3 className="text-lg font-semibold">Order Items</h3>
                 <div className="space-y-2">
                   {selectedOrder.orderItems?.map((item: any, index: number) => (
                     <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                       <div>
                         <p className="font-medium">Item #{item.id}</p>
                         <p className="text-sm text-muted-foreground">
                           Quantity: {item.quantity}
                         </p>
                       </div>
                       <span className="font-medium">Qty: {item.quantity}</span>
                     </div>
                   ))}
                                  </div>
                 <div className="border-t pt-2">
                   <div className="flex justify-between items-center">
                     <div>
                       <p className="text-sm text-muted-foreground">
                         Total Items: {selectedOrder.items || selectedOrder.orderItems?.length || 0}
                       </p>
                       <p className="text-sm text-muted-foreground">
                         Total Quantity: {selectedOrder.quantity || 0}
                       </p>
                     </div>
                     <p className="text-lg font-bold">
                       Total: ${selectedOrder.totalAmount?.toFixed(2) || '0.00'}
                     </p>
                   </div>
                 </div>
              </div>

              {/* Special Requests */}
              {selectedOrder.specialRequests && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Special Requests</h3>
                  <p className="text-sm text-muted-foreground">{selectedOrder.specialRequests}</p>
                </div>
              )}

              {/* Status */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Status</h3>
                <Badge className={getStatusColor(selectedOrder.status)}>
                  <div className="flex items-center space-x-1">
                    {getStatusIcon(selectedOrder.status)}
                    <span className="capitalize">{selectedOrder.status || 'pending'}</span>
                  </div>
                </Badge>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Order Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Order</DialogTitle>
            <DialogDescription>
              Update order status and type
            </DialogDescription>
          </DialogHeader>
          
          {editingOrder && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={editingOrder.status} 
                  onValueChange={(value) => setEditingOrder(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="confirmed">Confirmed</SelectItem>
                    <SelectItem value="preparing">Preparing</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-orderType">Order Type</Label>
                <Select 
                  value={editingOrder.orderType} 
                  onValueChange={(value) => setEditingOrder(prev => ({ ...prev, orderType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dine-in">Dine-in</SelectItem>
                    <SelectItem value="takeaway">Takeaway</SelectItem>
                    <SelectItem value="delivery">Delivery</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateOrder}>
              Update Order
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrdersPage; 