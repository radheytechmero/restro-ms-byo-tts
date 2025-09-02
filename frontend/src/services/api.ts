import axios, { AxiosInstance } from 'axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'premium' | 'superadmin';
  status: 'active' | 'inactive' | 'pending';
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  expiresIn: number;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  premiumUsers: number;
  revenue: number;
  growth: number;
}

export interface DashboardOverview {
  totalOrders: number;
  totalRevenue: number;
  averageOrderValue: number;
  totalCustomers: number;
  totalMenuItems: number;
  totalCategories: number;
  totalReservations: number;
}

export interface DashboardGrowth {
  orderGrowth: number;
  revenueGrowth: number;
}

export interface OrderStats {
  byStatus: { status: string; count: number }[];
  total: number;
}

export interface TableStats {
  status: string;
  count: number;
}

export interface TopMenuItem {
  name: string;
  price: number;
  category: { name: string };
  totalQuantitySold: number;
  orderCount: number;
}

export interface RecentOrder {
  id: number;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  status: string;
  orderType: string;
  tableNumber: string;
  itemCount: number;
  createdAt: string;
}

export interface DashboardResponse {
  success: boolean;
  data: {
    period: string;
    dateRange: {
      start: string;
      end: string;
    };
    overview: DashboardOverview;
    growth: DashboardGrowth;
    orderStats: OrderStats;
    tableStats: TableStats[];
    topMenuItems: TopMenuItem[];
    recentOrders: RecentOrder[];
  };
}

export interface OrderItem {
  id: number;
  menuItemName: string;
  quantity: number;
  price: number;
  size?: 'small' | 'medium' | 'large' | 'extra-large' | null;
  customizations?: string | null;
  notes?: string | null;
}

export interface OrderRequest {
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  restaurantNo: string;
  tableNumber?: string | null;
  orderType?: 'dine-in' | 'takeaway' | 'delivery';
  deliveryAddress?: {
    street: string;
    city: string;
    zipCode: string;
    specialInstructions?: string;
  } | null;
  orderItems: OrderItem[];
  specialRequests?: string | null;
  isConfirmed: boolean;
}

export interface OrderResponse {
  success: boolean;
  orderId?: string;
  message?: string;
}

class ApiService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      // baseURL: 'http://192.168.0.135:8787/api',
      // baseURL: 'https://q6f1bmhp-3000.inc1.devtunnels.ms/api',
      baseURL: '/api',
      // baseURL: 'http://127.0.0.1:5002/api',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    this.axiosInstance.interceptors.request.use(config => {
      const token = localStorage.getItem('admin_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    
    this.axiosInstance.interceptors.response.use(
    response => response,
    error => {
      if (error.response?.status === 401) {
        // Clear stored data
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_user');
        // Optional: Redirect to login
        window.location.href = '/admin'; // adjust path as needed
      }
      return Promise.reject(error);
    }
  );
}

  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data } = await this.axiosInstance.post('/login', { email, password });
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data.user));
      return { token: data.token, user: data.user, expiresIn: data.expiresIn || 3600 };
    } catch (error: any) {
      localStorage.removeItem('admin_token');
      localStorage.removeItem('admin_user');
      const errorMsg = error?.response?.data?.error || 'Login failed';
      throw new Error(errorMsg);
    }
  }

  async logout(): Promise<void> {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
  }

  async refreshToken(): Promise<AuthResponse> {
    const currentUser = localStorage.getItem('admin_user');
    if (!currentUser) throw new Error('No user found');

    const token = 'refreshed_token_' + Date.now();
    localStorage.setItem('admin_token', token);
    return { token, user: JSON.parse(currentUser), expiresIn: 3600 };
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await this.axiosInstance.get('/dashboard/stats');
    return data;
  }

  async getDashboard(period: 'today' | 'week' | 'month' | 'year' = 'today', timezone?: string): Promise<DashboardResponse> {
    let url = `/dashboard?period=${period}`;
    if (timezone) {
      url += `&timezone=${encodeURIComponent(timezone)}`;
    }
    const { data } = await this.axiosInstance.get(url);
    return data;
  }

  async getUsers(page = 1, limit = 10): Promise<{ users: User[]; total: number }> {
    const { data } = await this.axiosInstance.get(`/users?page=${page}&limit=${limit}`);
    return data;
  }

  async getUser(id: string): Promise<User> {
    const { data } = await this.axiosInstance.get(`/users/${id}`);
    return data;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const { data } = await this.axiosInstance.put(`/users/${id}`, userData);
    return data;
  }

  async deleteUser(id: string): Promise<void> {
    await this.axiosInstance.delete(`/users/${id}`);
  }

  async updateSettings(settings: Record<string, any>): Promise<void> {
    await this.axiosInstance.put('/settings', settings);
  }

  async getSettings(): Promise<Record<string, any>> {
    const { data } = await this.axiosInstance.get('/settings');
    return data;
  }

  async createOrder(orderData: OrderRequest): Promise<OrderResponse> {
    const { data } = await this.axiosInstance.post('/create-order', orderData);
    return data;
  }

  async getOrders(restaurantId: number, status?: string, page = 1, limit = 10): Promise<{ 
    success: boolean; 
    data: any[]; 
    pagination: { 
      page: number; 
      limit: number; 
      total: number; 
      totalPages: number; 
    }; 
  }> {
    let url = `/order?restaurantId=${restaurantId}&page=${page}&limit=${limit}`;
    if (status) {
      url += `&status=${status}`;
    }
    const { data } = await this.axiosInstance.get(url);
    return data;
  }

  async getOrderById(orderId: number): Promise<any> {
    const { data } = await this.axiosInstance.get(`/order/${orderId}`);
    return data;
  }

  async updateOrder(orderId: number, orderData: any): Promise<any> {
    const { data } = await this.axiosInstance.put(`/order/${orderId}`, orderData);
    return data;
  }

  async deleteOrder(orderId: number): Promise<void> {
    await this.axiosInstance.delete(`/order/${orderId}`);
  }

  async getMenus(restaurantId: number, page = 1, limit = 10): Promise<{ data: any[]; total: number }> {
    const { data } = await this.axiosInstance.get(`/menu-items?restaurantId=${restaurantId}&page=${page}&limit=${limit}`);
    return data;
  }

  async createMenuItem(menuItemData: any): Promise<any> {
    const { data } = await this.axiosInstance.post(`/menu-items`, menuItemData);
    return data;
  }

  async updateMenuItem(id: number, menuItemData: any): Promise<any> {
    const { data } = await this.axiosInstance.put(`/menu-items/${id}`, menuItemData);
    return data;
  }

  async deleteMenuItem(id: number): Promise<void> {
    await this.axiosInstance.delete(`/menu-items/${id}`);
  }

  async getCategories(): Promise<any[]> {
    const { data } = await this.axiosInstance.get(`/category`);
    return data;
  }

  async createCategory(categoryData: any): Promise<any> {
    const { data } = await this.axiosInstance.post(`/category`, categoryData);
    return data;
  }

  async updateCategory(id: number, categoryData: any): Promise<any> {
    const { data } = await this.axiosInstance.put(`/category/${id}`, categoryData);
    return data;
  }

  async deleteCategory(id: number): Promise<void> {
    await this.axiosInstance.delete(`/category/${id}`);
  }

  async getRestaurantById(): Promise<any> {
    const { data } = await this.axiosInstance.get(`/fetch-restaurant`);
    return data;
  }

  async getRestaurants(): Promise<any[]> {
    const { data } = await this.axiosInstance.get(`/restaurant`);
    return data;
  }

  async createRestaurant(restaurantData: any): Promise<any> {
    const { data } = await this.axiosInstance.post(`/create-restaurant`, restaurantData);
    return data;
  }

  async updateRestaurant(id: number, restaurantData: any): Promise<any> {
    const { data } = await this.axiosInstance.put(`/update-restaurant/${id}`, restaurantData);
    return data;
  }

  async deleteRestaurant(id: number): Promise<void> {
    await this.axiosInstance.delete(`/delete-restaurant/${id}`);
  }

  // Customer API methods
  async getCustomers(page = 1, limit = 10): Promise<{ 
    success: boolean; 
    data: any[]; 
    pagination?: { 
      page: number; 
      limit: number; 
      total: number; 
      totalPages: number; 
    }; 
  }> {
    const { data } = await this.axiosInstance.get(`/customer?page=${page}&limit=${limit}`);
    return data;
  }

  async getCustomerById(id: number): Promise<any> {
    const { data } = await this.axiosInstance.get(`/customer/${id}`);
    return data;
  }

  async createCustomer(customerData: any): Promise<any> {
    const { data } = await this.axiosInstance.post(`/customer`, customerData);
    return data;
  }

  async updateCustomer(id: number, customerData: any): Promise<any> {
    const { data } = await this.axiosInstance.put(`/customer/${id}`, customerData);
    return data;
  }

  async deleteCustomer(id: number): Promise<void> {
    await this.axiosInstance.delete(`/customer/${id}`);
  }

  async searchCustomers(phone: string): Promise<any> {
    const { data } = await this.axiosInstance.get(`/customers?phone=${phone}`);
    return data;
  }

  async bulkUploadCustomers(formData: FormData): Promise<any> {
    const { data } = await this.axiosInstance.post(`/customer/bulk-upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  }

  async downloadCustomerTemplate(): Promise<Blob> {
    const { data } = await this.axiosInstance.get(`/customer/template`, {
      responseType: 'blob'
    });
    return data;
  }

  // Call Recordings API methods
  async getCallRecordings(): Promise<any[]> {
    try {
      // For now, return mock data since direct BunnyCDN API access from frontend has CORS issues
      // In production, you should proxy this through your backend
      const { data } = await this.axiosInstance.get(`/recordings`);
      console.log(data.data,'Fetching call recordings...');
      
      return data.data
      // Mock data based on your provided structure
      // return [
      //   {
      //     Guid: "53014aec-7390-4dc9-b9cf-88d618c0abf9",
      //     StorageZoneName: "restro-ai-call-agent",
      //     Path: "/recordings/14502347691/",
      //     ObjectName: "RE47f7882cadbd5f65b6116ced82efce7a_CAa68eaf4dbd8084e00eafa1ce6e75ebdb.mp3",
      //     Length: 24346,
      //     LastChanged: "2025-08-22T11:35:13.037",
      //     ServerId: 858,
      //     ArrayNumber: 0,
      //     IsDirectory: false,
      //     UserId: "eb23e3cc-400b-4cd6-8e2b-c7c28bbb15f5",
      //     ContentType: "",
      //     DateCreated: "2025-08-22T11:35:13.037",
      //     StorageZoneId: 1150701,
      //     Checksum: "DE34D75EC6277469B2CA5B56CA4FEC7EE3C547D8529705717CC55D7C057A635D",
      //     ReplicatedZones: "LA",
      //     phoneNumber: "+1 (450) 234-7691",
      //     duration: 24,
      //     status: 'completed'
      //   },
      //   {
      //     Guid: "0cfce67b-efd5-496c-8881-7b6e535e791c",
      //     StorageZoneName: "restro-ai-call-agent",
      //     Path: "/recordings/14502347691/",
      //     ObjectName: "RE5ece615aa9c9881ebb38f1ddc818a2fe_CA6a41c73942f34541c0d16dfd52b20698.mp3",
      //     Length: 22047,
      //     LastChanged: "2025-08-22T11:38:43.29",
      //     ServerId: 785,
      //     ArrayNumber: 2,
      //     IsDirectory: false,
      //     UserId: "eb23e3cc-400b-4cd6-8e2b-c7c28bbb15f5",
      //     ContentType: "",
      //     DateCreated: "2025-08-22T11:38:43.29",
      //     StorageZoneId: 1150701,
      //     Checksum: "CF91BEF5F9EAD4FCEBFFEB91D94226A11D641C332AEA0584CCFBF8DBB571C953",
      //     ReplicatedZones: "LA",
      //     phoneNumber: "+1 (450) 234-7691",
      //     duration: 22,
      //     status: 'completed'
      //   }
      // ];
    } catch (error) {
      console.error('Error fetching call recordings:', error);
      throw error;
    }
  }


  getCallRecordingUrl(recording: any): string {
    // Construct the full URL for the audio file
    // const baseUrl = `https://ny.storage.bunnycdn.com${recording.Path}${recording.ObjectName}`;
    const baseUrl = `https://restro-ai-call-agent.b-cdn.net${recording.Path}${recording.ObjectName}`;
    return baseUrl;
  }

  // Method to get headers for audio requests (not needed for CDN URLs)
  getAudioHeaders(): { [key: string]: string } {
    return {
      // No headers needed for CDN URLs
    };
  }

  // Method to fetch audio blob (no authentication needed for CDN URLs)
  async getAudioBlob(recording: any): Promise<Blob> {
    try {
      const response = await fetch(this.getCallRecordingUrl(recording));
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.blob();
    } catch (error) {
      console.error('Error fetching audio blob:', error);
      throw error;
    }
  }

  // Method to create a signed URL for audio playback
  getSignedAudioUrl(recording: any): string {
    // For now, return the direct URL
    // In production, you should implement proper URL signing
    const baseUrl = this.getCallRecordingUrl(recording);
    return baseUrl;
  }
}

// Call Recordings interfaces
// export interface CallRecording {
//   Guid: string;
//   StorageZoneName: string;
//   Path: string;
//   ObjectName: string;
//   Length: number;
//   LastChanged: string;
//   ServerId: number;
//   ArrayNumber: number;
//   IsDirectory: boolean;
//   UserId: string;
//   ContentType: string;
//   DateCreated: string;
//   StorageZoneId: number;
//   Checksum: string;
//   ReplicatedZones: string;
// }

// export interface CallRecordingWithMetadata extends CallRecording {
//   phoneNumber?: string;
//   duration?: number;
//   status?: 'completed' | 'missed' | 'in-progress';
// }

export const apiService = new ApiService();
