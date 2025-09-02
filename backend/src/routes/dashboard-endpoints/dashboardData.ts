import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { dashboardDataSchema } from "../../types";

export class DashboardData extends OpenAPIRoute {
	schema = {
		tags: ["Dashboard"],
		summary: "Get Dashboard Data",
		description: "Returns aggregated data for restaurant dashboard including orders, customers, revenue, and menu statistics",
		security: [{ bearerAuth: [] }],
		request: {
			query: z.object({
				period: z.enum(['today', 'week', 'month', 'year']).default('today').optional(),
				timezone: z.string().optional().describe("Timezone for date calculations (e.g., 'America/New_York')"),
			}),
		},
		responses: {
			"200": {
				description: "Returns dashboard data with statistics and metrics",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: dashboardDataSchema,
						}),
					},
				},
			},
			"401": {
				description: "Unauthorized - Invalid or missing authentication",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							message: z.string(),
						}),
					},
				},
			},
			"500": {
				description: "Internal server error",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							error: z.string(),
							detail: z.string().optional(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const prisma = c.get('prisma');
		const { query } = await this.getValidatedData<typeof this.schema>();
		const authenticatedRestaurantId = c.get('authenticatedRestaurantId') as number;
		
		try {
			// Calculate date ranges based on period
			const now = new Date();
			let startDate: Date;
			let endDate: Date = now;

			switch (query.period) {
				case 'today':
					startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
					break;
				case 'week':
					startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
					break;
				case 'month':
					startDate = new Date(now.getFullYear(), now.getMonth(), 1);
					break;
				case 'year':
					startDate = new Date(now.getFullYear(), 0, 1);
					break;
				default:
					startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
			}

			// Parallel data fetching for better performance
			const [
				totalOrders,
				recentOrders,
				orderStats,
				revenueStats,
				customerStats,
				menuItemStats,
				categoryStats,
				tableStats,
				reservationStats
			] = await Promise.all([
				// Total orders count
				prisma.order.count({
					where: { 
						restaurantId: authenticatedRestaurantId,
						createdAt: {
							gte: startDate,
							lte: endDate,
						}
					}
				}),

				// Recent orders (last 10)
				prisma.order.findMany({
					where: { 
						restaurantId: authenticatedRestaurantId,
						createdAt: {
							gte: startDate,
							lte: endDate,
						}
					},
					include: {
						customer: {
							select: { name: true, phone: true }
						},
						table: {
							select: { tableNumber: true }
						},
						orderItems: {
							include: {
								menuItem: {
									select: { name: true, price: true }
								}
							}
						}
					},
					orderBy: { createdAt: 'desc' },
					take: 10,
				}),

				// Order statistics by status
				prisma.order.groupBy({
					by: ['status'],
					where: { 
						restaurantId: authenticatedRestaurantId,
						createdAt: {
							gte: startDate,
							lte: endDate,
						}
					},
					_count: {
						id: true,
					},
				}),

				// Revenue statistics
				prisma.order.aggregate({
					where: { 
						restaurantId: authenticatedRestaurantId,
						status: { not: 'cancelled' },
						createdAt: {
							gte: startDate,
							lte: endDate,
						}
					},
					_sum: {
						totalAmount: true,
					},
					_avg: {
						totalAmount: true,
					},
					_count: {
						id: true,
					},
				}),

				// Customer statistics
				prisma.customer.aggregate({
					where: { 
						restaurantId: authenticatedRestaurantId,
						createdAt: {
							gte: startDate,
							lte: endDate,
						}
					},
					_count: {
						id: true,
					},
				}),

				// Menu item statistics
				prisma.menuItem.aggregate({
					where: { 
						restaurantId: authenticatedRestaurantId 
					},
					_count: {
						id: true,
					},
				}),

				// Category statistics
				prisma.category.aggregate({
					where: { 
						restaurantId: authenticatedRestaurantId 
					},
					_count: {
						id: true,
					},
				}),

				// Table statistics
				prisma.table.groupBy({
					by: ['status'],
					where: { 
						restaurantId: authenticatedRestaurantId 
					},
					_count: {
						id: true,
					},
				}),

				// Reservation statistics
				prisma.reservation.aggregate({
					where: { 
						restaurantId: authenticatedRestaurantId,
						createdAt: {
							gte: startDate,
							lte: endDate,
						}
					},
					_count: {
						id: true,
					},
				}),
			]);

			// Get top selling menu items
			const topMenuItems = await prisma.orderItem.groupBy({
				by: ['menuItemId'],
				where: {
					order: {
						restaurantId: authenticatedRestaurantId,
						status: { not: 'cancelled' },
						createdAt: {
							gte: startDate,
							lte: endDate,
						}
					}
				},
				_sum: {
					quantity: true,
				},
				_count: {
					id: true,
				},
				orderBy: {
					_sum: {
						quantity: 'desc',
					}
				},
				take: 5,
			});

			// Get menu item details for top selling items
			const topMenuItemDetails = await Promise.all(
				topMenuItems.map(async (item) => {
					const menuItem = await prisma.menuItem.findUnique({
						where: { id: item.menuItemId },
						select: { name: true, price: true, category: { select: { name: true } } }
					});
					return {
						...menuItem,
						totalQuantitySold: item._sum.quantity || 0,
						orderCount: item._count.id,
					};
				})
			);

			// Calculate previous period for comparison
			const previousPeriodStart = new Date(startDate.getTime() - (endDate.getTime() - startDate.getTime()));
			const previousPeriodEnd = startDate;

			const [previousOrders, previousRevenue] = await Promise.all([
				prisma.order.count({
					where: { 
						restaurantId: authenticatedRestaurantId,
						createdAt: {
							gte: previousPeriodStart,
							lt: previousPeriodEnd,
						}
					}
				}),
				prisma.order.aggregate({
					where: { 
						restaurantId: authenticatedRestaurantId,
						status: { not: 'cancelled' },
						createdAt: {
							gte: previousPeriodStart,
							lt: previousPeriodEnd,
						}
					},
					_sum: {
						totalAmount: true,
					},
				}),
			]);

			// Calculate growth percentages
			const orderGrowth = previousOrders > 0 
				? ((totalOrders - previousOrders) / previousOrders) * 100 
				: totalOrders > 0 ? 100 : 0;

			const currentRevenue = Number(revenueStats._sum.totalAmount || 0);
			const previousRevenueAmount = Number(previousRevenue._sum.totalAmount || 0);
			const revenueGrowth = previousRevenueAmount > 0 
				? ((currentRevenue - previousRevenueAmount) / previousRevenueAmount) * 100 
				: currentRevenue > 0 ? 100 : 0;

			// Format the response data
			const dashboardData = {
				period: query.period || 'today',
				dateRange: {
					start: startDate.toISOString(),
					end: endDate.toISOString(),
				},
				overview: {
					totalOrders,
					totalRevenue: currentRevenue,
					averageOrderValue: Number(revenueStats._avg.totalAmount || 0),
					totalCustomers: customerStats._count.id,
					totalMenuItems: menuItemStats._count.id,
					totalCategories: categoryStats._count.id,
					totalReservations: reservationStats._count.id,
				},
				growth: {
					orderGrowth: Math.round(orderGrowth * 100) / 100,
					revenueGrowth: Math.round(revenueGrowth * 100) / 100,
				},
				orderStats: {
					byStatus: orderStats.map(stat => ({
						status: stat.status || 'unknown',
						count: stat._count.id,
					})),
					total: totalOrders,
				},
				tableStats: tableStats.map(stat => ({
					status: stat.status,
					count: stat._count.id,
				})),
				topMenuItems: topMenuItemDetails,
				recentOrders: recentOrders.map(order => ({
					id: order.id,
					customerName: order.customerName,
					customerPhone: order.customerPhone,
					totalAmount: Number(order.totalAmount),
					status: order.status,
					orderType: order.orderType,
					tableNumber: order.table?.tableNumber || null,
					itemCount: order.orderItems.length,
					createdAt: order.createdAt.toISOString(),
				})),
			};

			return c.json({
				success: true,
				data: dashboardData,
			});

		} catch (err) {
			console.error("Error fetching dashboard data:", err);

			return c.json(
				{
					success: false,
					error: 'Failed to fetch dashboard data',
					detail: err instanceof Error ? err.message : String(err),
				},
				500
			);
		}
	}
}