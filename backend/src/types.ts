import { DateTime, Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";


// export const Task = z.object({
// 	name: Str({ example: "lorem" }),
// 	slug: Str(),
// 	description: Str({ required: false }),
// 	completed: z.boolean().default(false),
// 	due_date: DateTime(),
// });

// Base schemas for common fields
const idSchema = z.number().int().positive();
const timestampSchema = z.date();
const optionalStringSchema = z.string().optional();
const statusSchema = z.string().default("active");


// Login Schemas
export const loginSchema = z.object({
  email: z.string().email().default('info@demoresto.com'),
  password: z.string().min(1, "Password is required").default('1234'),
});

export const customJWTPayloadSchema = z.object({
    restaurantId: z.string(),
    email: z.string(),
    iat: z.number(),
    exp: z.number(),
});

// Restaurant schemas
export const createRestaurantSchema = z.object({
  name: z.string().min(1, "Restaurant name is required").max(255),
  location: z.string().min(1, "Location is required").max(255),
  phone: z.string().optional(),
  email: z.string().email().or(z.literal("")),
  password: z.string(),
  opening_hours: z.string().optional(),
  active: z.boolean().default(true).optional(),
  status: statusSchema.optional(),
  stt_model: z.enum(['deepgram', 'elevenlabs', 'openai']).optional(),
  stt_deepgram_language: z.enum(['en', 'es', 'fr', 'de', 'nl', 'it', 'ja']).optional(),
  stt_deepgram_voice: z.string().optional(),
  stt_elevenlabs_api_key: z.string().optional(),
  stt_elevenlabs_voice_id: z.string().optional(),
  stt_elevenlabs_model_id: z.string().optional(),
  stt_openai_base_url: z.string().optional(),
  stt_openai_api_key: z.string().optional(),
  stt_openai_model: z.string().optional(),
  stt_openai_voice: z.string().optional(),
});

export const updateRestaurantSchema = createRestaurantSchema.partial();

export const restaurantSchema = createRestaurantSchema.extend({
  id: idSchema,
  active: z.boolean().default(true),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// customer schemas
export const createCustomerSchema = z.object({
  customerUID: z.string().nullable().optional(),
  name: z.string().min(1, "Name is required").max(255),
  email: z.string().email("Invalid email format").nullable().optional(),
  phone: z.string(),
  address: z.string().nullable().optional(),
  active: z.boolean().default(true).optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial()

export const customerSchema = createCustomerSchema.extend({
  id: idSchema,
  active: z.boolean().default(true),
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// Password update schema
export const updateRestaurantPasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});

// Category schemas
export const createCategorySchema = z.object({
  // restaurantId: idSchema,
  name: z.string().min(1, "Category name is required").max(255),
  description: z.string().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

export const updateCategorySchema = createCategorySchema.partial()
// .omit({ restaurantId: true });

export const categorySchema = createCategorySchema.extend({
  id: idSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// MenuItem schemas
export const createMenuItemSchema = z.object({
  // restaurantId: idSchema,
  categoryId: idSchema.optional(),
  menuUID: z.string().optional(),
  name: z.string().min(1, "Item name is required").max(255),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive").multipleOf(0.01),
  servesPeople: z.string().optional().nullable(),
  ingredients: z.string().optional().nullable(),
  spiceLevel: z.string().optional().nullable(),
  allergens: z.string().optional().nullable(),
  similarItems: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().or(z.literal("")),
  isAvailable: z.boolean().default(true).optional(),
});

export const updateMenuItemSchema = createMenuItemSchema.partial()
// .omit({ restaurantId: true });

export const menuItemSchema = createMenuItemSchema.extend({
  id: idSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// Table schemas
export const createTableSchema = z.object({
  // restaurantId: idSchema,
  tableNumber: z.string().min(1, "Table number is required").max(50),
  capacity: z.number().int().positive("Capacity must be positive"),
  location: z.string().optional(),
  status: z.enum(['available', 'occupied', 'reserved', 'maintenance']).default("available").optional(),
});

export const updateTableSchema = createTableSchema.partial()
// .omit({ restaurantId: true });

export const tableSchema = createTableSchema.extend({
  id: idSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// Reservation schemas
export const createReservationSchema = z.object({
  // restaurantId: idSchema,
  tableId: idSchema,
  customerName: z.string().min(1, "Customer name is required").max(255),
  customerPhone: z.string().min(1, "Customer phone is required").max(20),
  reservationTime: z.date().min(new Date(), "Reservation time must be in the future"),
  guestCount: z.number().int().positive("Guest count must be positive"),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no-show']).default("pending").optional(),
});

export const updateReservationSchema = createReservationSchema.partial()
// .omit({ restaurantId: true });

export const reservationSchema = createReservationSchema.extend({
  id: idSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// Order schemas
export const createOrderSchema = z.object({
  restaurantId: idSchema,
  tableId: idSchema.optional(),
  customerId: idSchema,
  orderType: z.enum(['dine-in', 'takeaway', 'delivery']).optional(),
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled']).default("pending").optional(),
  totalAmount: z.number().nonnegative("Total amount cannot be negative").multipleOf(0.01),
  
  // Customer information for orders
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().min(1, "Customer phone is required"),
  customerEmail: z.string().email().optional(),
  
  // Delivery information
  deliveryAddressStreet: z.string().nullable().optional(),
  deliveryAddressCity: z.string().nullable().optional(),
  deliveryAddressZipCode: z.string().nullable().optional(),
  deliverySpecialInstructions: z.string().nullable().optional(),
  
  // Order details
  specialRequests: z.string().nullable().optional(),
  isConfirmed: z.boolean().default(false),
});
const orderItemFrontEndSchema = z.object({
  id: z.number(),
  menuUID: z.string().nullable().optional(),
  menuItemName: z.string({ required_error: "menuItemName is required" }),
  quantity: z.number().min(1, "Quantity must be at least 1"),
  price: z.number(),
  size: z.enum(["small", "medium", "large", "extra-large"]).nullable().optional(),
  customizations: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

// Delivery address schema
export const deliveryAddressSchema = z.object({
  street: z.string().min(1, "Street address is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(1, "ZIP code is required"),
  specialInstructions: z.string().optional(),
});

export const placeOrderSchema = z.object({
  customerName: z.string({ required_error: "Customer name is required" }),
  customerPhone: z.string({ required_error: "Customer phone is required" }),
  customerEmail: z.string().email().nullable().optional(),
  restaurantNo: z.string(),
  tableNumber: z.string().nullable().optional(),
  orderType: z.enum(['dine-in', 'takeaway', 'delivery']).optional(),
  deliveryAddress: deliveryAddressSchema.nullable().optional(),
  
  orderItems: z
    .array(orderItemFrontEndSchema)
    .min(1, "At least one item must be in the order"),

  specialRequests: z.string().nullable().optional(),
  isConfirmed: z.boolean().default(false),
});


export const updateOrderSchema = createOrderSchema.partial().omit({ restaurantId: true, customerId: true });

export const orderSchema = createOrderSchema.extend({
  id: idSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// OrderItem schemas
export const createOrderItemSchema = z.object({
  orderId: idSchema,
  menuItemId: idSchema,
  quantity: z.number().int().positive("Quantity must be positive"),
  price: z.number().positive("Price must be positive").multipleOf(0.01),
  size: z.enum(["small", "medium", "large", "extra-large"]).nullable().optional(),
  customizations: z.string().nullable().optional(), // JSON string of customizations
  notes: z.string().nullable().optional(),
});

export const updateOrderItemSchema = createOrderItemSchema.partial();

export const orderItemSchema = createOrderItemSchema.extend({
  id: idSchema,
  createdAt: timestampSchema,
  updatedAt: timestampSchema,
});

// ActivityLog schemas
export const createActivityLogSchema = z.object({
  customerId: idSchema,
  restaurantId: idSchema,
  actionType: z.string().min(1, "Action type is required").max(100),
  actionData: z.string().optional(),
});

export const activityLogSchema = createActivityLogSchema.extend({
  id: idSchema,
  timestamp: timestampSchema,
});

// Query parameter schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});

export const restaurantQuerySchema = z.object({
  status: z.enum(['active', 'inactive']).optional(),
  search: z.string().optional(),
}).merge(paginationSchema);

export const customerQuerySchema = z.object({
  role: z.enum(['superadmin', 'admin', 'waiter', 'chef', 'manager']).optional(),
  status: z.enum(['active', 'inactive']).optional(),
  search: z.string().optional(),
}).merge(paginationSchema);

export const menuItemQuerySchema = z.object({
  categoryId: idSchema.optional(),
  isAvailable: z.coerce.boolean().optional(),
  restaurantId: idSchema.optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
}).merge(paginationSchema);

export const tableQuerySchema = z.object({
  status: z.enum(['available', 'occupied', 'reserved', 'maintenance']).optional(),
  restaurantId: idSchema.optional(),
  capacity: z.coerce.number().int().positive().optional(),
}).merge(paginationSchema);

export const reservationQuerySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no-show']).optional(),
  restaurantId: idSchema.optional(),
  tableId: idSchema.optional(),
  date: z.coerce.date().optional(),
  customerPhone: z.string().optional(),
}).merge(paginationSchema);

export const orderQuerySchema = z.object({
  status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled']).optional(),
  orderType: z.enum(['dine-in', 'takeaway', 'delivery']).optional(),
  restaurantId: idSchema.optional(),
  tableId: idSchema.optional(),
  customerId: idSchema.optional(),
  date: z.coerce.date().optional(),
}).merge(paginationSchema);

export const activityLogQuerySchema = z.object({
  customerId: idSchema.optional(),
  restaurantId: idSchema.optional(),
  actionType: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
}).merge(paginationSchema);

// Response schemas with relations
// export const restaurantWithRelationsSchema = restaurantSchema.extend({
//   customer: z.array(customerSchema).optional(),
//   categories: z.array(categorySchema).optional(),
//   menuItems: z.array(menuItemSchema).optional(),
//   tables: z.array(tableSchema).optional(),
//   reservations: z.array(reservationSchema).optional(),
//   orders: z.array(orderSchema).optional(),
//   _count: z.object({
//     customer: z.number(),
//     categories: z.number(),
//     menuItems: z.number(),
//     tables: z.number(),
//     reservations: z.number(),
//     orders: z.number(),
//   }).optional(),
// });

// export const orderWithItemsSchema = orderSchema.extend({
//   orderItems: z.array(orderItemSchema.extend({
//     menuItem: menuItemSchema.optional(),
//   })).optional(),
//   table: tableSchema.optional(),
//   customer: customerSchema.optional(),
// });

export const menuItemWithCategorySchema = menuItemSchema.extend({
  category: categorySchema.optional(),
});

export const reservationWithDetailsSchema = reservationSchema.extend({
  table: tableSchema.optional(),
  restaurant: restaurantSchema.pick({ name: true, phone: true }).optional(),
});

// Validation helper functions
export const validateId = (id: unknown) => idSchema.parse(id);

export const validateEmail = (email: string) => z.string().email().parse(email);

export const validatePhone = (phone: string) => 
  z.string().regex(/^[\+]?[\d\s\-\(\)]{7,15}$/, "Invalid phone number format").parse(phone);

export const validatePrice = (price: number) => 
  z.number().positive().multipleOf(0.01).parse(price);

// Type exports
export type LoginInput = z.infer<typeof loginSchema>;
export type CustomJWTPayload = z.infer<typeof customJWTPayloadSchema>;

export type Restaurant = z.infer<typeof restaurantSchema>;
export type CreateRestaurant = z.infer<typeof createRestaurantSchema>;
export type UpdateRestaurant = z.infer<typeof updateRestaurantSchema>;

export type Customer = z.infer<typeof customerSchema>;
export type CreateCustomer = z.infer<typeof createCustomerSchema>;
export type UpdateCustomer = z.infer<typeof updateCustomerSchema>;

export type Category = z.infer<typeof categorySchema>;
export type CreateCategory = z.infer<typeof createCategorySchema>;
export type UpdateCategory = z.infer<typeof updateCategorySchema>;

export type MenuItem = z.infer<typeof menuItemSchema>;
export type CreateMenuItem = z.infer<typeof createMenuItemSchema>;
export type UpdateMenuItem = z.infer<typeof updateMenuItemSchema>;

export type Table = z.infer<typeof tableSchema>;
export type CreateTable = z.infer<typeof createTableSchema>;
export type UpdateTable = z.infer<typeof updateTableSchema>;

export type Reservation = z.infer<typeof reservationSchema>;
export type CreateReservation = z.infer<typeof createReservationSchema>;
export type UpdateReservation = z.infer<typeof updateReservationSchema>;

export type Order = z.infer<typeof orderSchema>;
export type CreateOrder = z.infer<typeof createOrderSchema>;
export type UpdateOrder = z.infer<typeof updateOrderSchema>;

export type OrderItem = z.infer<typeof orderItemSchema>;
export type CreateOrderItem = z.infer<typeof createOrderItemSchema>;
export type UpdateOrderItem = z.infer<typeof updateOrderItemSchema>;

export type DeliveryAddress = z.infer<typeof deliveryAddressSchema>;
export type PlaceOrder = z.infer<typeof placeOrderSchema>;

export type ActivityLog = z.infer<typeof activityLogSchema>;
export type CreateActivityLog = z.infer<typeof createActivityLogSchema>;

// Call Recording schemas
export const callRecordingSchema = z.object({
  id: idSchema,
  customerId: z.number().int().positive().nullable(),
  restaurantId: idSchema,
  recordingUrl: z.string().url(),
  timestamp: timestampSchema,
});

export const createCallRecordingSchema = z.object({
  customerId: z.number().int().positive().optional(),
  recordingUrl: z.string().url("Valid recording URL is required"),
});

export const callRecordingQuerySchema = paginationSchema.extend({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type CallRecording = z.infer<typeof callRecordingSchema>;
export type CreateCallRecording = z.infer<typeof createCallRecordingSchema>;
export type CallRecordingQuery = z.infer<typeof callRecordingQuerySchema>;

export type PaginationQuery = z.infer<typeof paginationSchema>;
export type RestaurantQuery = z.infer<typeof restaurantQuerySchema>;
export type CustomerQuery = z.infer<typeof customerQuerySchema>;
export type MenuItemQuery = z.infer<typeof menuItemQuerySchema>;
export type TableQuery = z.infer<typeof tableQuerySchema>;
export type ReservationQuery = z.infer<typeof reservationQuerySchema>;
export type OrderQuery = z.infer<typeof orderQuerySchema>;
export type ActivityLogQuery = z.infer<typeof activityLogQuerySchema>;

// Dashboard schemas
export const dashboardOverviewSchema = z.object({
  totalOrders: z.number(),
  totalRevenue: z.number(),
  averageOrderValue: z.number(),
  totalCustomers: z.number(),
  totalMenuItems: z.number(),
  totalCategories: z.number(),
  totalReservations: z.number(),
});

export const dashboardGrowthSchema = z.object({
  orderGrowth: z.number(),
  revenueGrowth: z.number(),
});

export const dashboardOrderStatusSchema = z.object({
  status: z.string(),
  count: z.number(),
});

export const dashboardTableStatusSchema = z.object({
  status: z.string(),
  count: z.number(),
});

export const dashboardTopMenuItemSchema = z.object({
  name: z.string(),
  price: z.number(),
  category: z.object({
    name: z.string(),
  }).nullable(),
  totalQuantitySold: z.number(),
  orderCount: z.number(),
});

export const dashboardRecentOrderSchema = z.object({
  id: z.number(),
  customerName: z.string(),
  customerPhone: z.string(),
  totalAmount: z.number(),
  status: z.string().nullable(),
  orderType: z.string().nullable(),
  tableNumber: z.string().nullable(),
  itemCount: z.number(),
  createdAt: z.string(),
});

export const dashboardDataSchema = z.object({
  period: z.enum(['today', 'week', 'month', 'year']),
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
  }),
  overview: dashboardOverviewSchema,
  growth: dashboardGrowthSchema,
  orderStats: z.object({
    byStatus: z.array(dashboardOrderStatusSchema),
    total: z.number(),
  }),
  tableStats: z.array(dashboardTableStatusSchema),
  topMenuItems: z.array(dashboardTopMenuItemSchema),
  recentOrders: z.array(dashboardRecentOrderSchema),
});

// Dashboard type exports
export type DashboardOverview = z.infer<typeof dashboardOverviewSchema>;
export type DashboardGrowth = z.infer<typeof dashboardGrowthSchema>;
export type DashboardOrderStatus = z.infer<typeof dashboardOrderStatusSchema>;
export type DashboardTableStatus = z.infer<typeof dashboardTableStatusSchema>;
export type DashboardTopMenuItem = z.infer<typeof dashboardTopMenuItemSchema>;
export type DashboardRecentOrder = z.infer<typeof dashboardRecentOrderSchema>;
export type DashboardData = z.infer<typeof dashboardDataSchema>;
