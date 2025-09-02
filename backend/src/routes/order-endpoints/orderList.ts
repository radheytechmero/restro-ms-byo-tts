import { Bool, OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { orderSchema } from "../../types";
import { convertDecimals } from "../../services/decimalService";

export class OrderList extends OpenAPIRoute {
	schema = {
		tags: ["Order"],
		summary: "List Orders",
		security: [{ bearerAuth: [] }],
		request: {
			query: z.object({
				restaurantId: z.coerce.number().int().positive().optional(),
				status: z.enum(['pending', 'confirmed', 'preparing', 'ready', 'served', 'completed', 'cancelled']).optional(),
				orderType: z.enum(['dine-in', 'takeaway', 'delivery']).optional(),
				page: z.coerce.number().int().positive().default(1),
				limit: z.coerce.number().int().positive().max(100).default(10),
			}),
		},
		responses: {
			"200": {
				description: "Returns a list of Orders",
				content: {
					"application/json": {
						schema: z.object({
							success: Bool(),
							data: orderSchema.array(),
							pagination: z.object({
								page: z.number(),
								limit: z.number(),
								total: z.number(),
								totalPages: z.number(),
							}),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const { query } = await this.getValidatedData<typeof this.schema>();
		const { restaurantId, status, orderType, page, limit } = query;
		const prisma = c.get('prisma')
		
		try {
			const authenticatedRestaurantId = c.get('authenticatedRestaurantId') as number
			
			// Build where clause - always filter by authenticated restaurant
			const where: any = {
				restaurantId: authenticatedRestaurantId
			};
			
			if (status) {
				where.status = status;
			}
			
			if (orderType) {
				where.orderType = orderType;
			}

			// Calculate pagination
			const skip = (page - 1) * limit;
			
			// Get total count
			const total = await prisma.order.count({ where });
			const totalPages = Math.ceil(total / limit);

			// Get orders with pagination and include order items count
			const orders = await prisma.order.findMany({
				where,
				skip,
				take: limit,
				orderBy: { createdAt: 'desc' },
				include: {
					customer: {
						select: {
							id: true,
							name: true,
							phone: true,
						},
					},
					table: {
						select: {
							id: true,
							tableNumber: true,
						},
					},
					orderItems: {
						select: {
							id: true,
							quantity: true
						},
					},
				},
			});

			// Transform orders to include date and items count
			const transformedOrders = orders.map(order => ({
				...order,
				items: order.orderItems.length,
				quantity: order.orderItems.reduce((acc, cur:any) => acc + cur.quantity, 0),
				createdAt: order.createdAt.toISOString(),
				// orderItems: undefined, // Remove the temporary field
			}));


			return c.json({
				success: true,
				data: convertDecimals(transformedOrders),
				pagination: {
					page,
					limit,
					total,
					totalPages,
				},
			});
		} catch (err) {
			console.error("Error fetching orders:", err)

			return c.json(
				{
					error: 'Failed to fetch orders',
					detail: err instanceof Error ? err.message : String(err),
				},
				500
			)
		}
	}
}
