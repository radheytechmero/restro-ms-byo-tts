import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { orderSchema } from "../../types";

export class OrderFetch extends OpenAPIRoute {
    schema = {
        tags: ["Order"],
        summary: "Fetch Order by ID",
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: Num(),
            }),
        },
        responses: {
            "200": {
                description: "Returns the Order with order items",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: Bool(),
                            order: orderSchema.extend({
                                orderItems: z.array(z.object({
                                    id: z.number(),
                                    quantity: z.number(),
                                    price: z.number(),
                                    notes: z.string().optional(),
                                    menuItem: z.object({
                                        id: z.number(),
                                        name: z.string(),
                                        description: z.string().optional(),
                                        price: z.number(),
                                    }),
                                })),
                                customer: z.object({
                                    id: z.number(),
                                    name: z.string(),
                                    email: z.string().optional(),
                                    phone: z.string(),
                                }),
                                table: z.object({
                                    id: z.number(),
                                    tableNumber: z.string(),
                                    capacity: z.number(),
                                }).optional(),
                            }),
                        }),
                    },
                },
            },
            "404": {
                description: "Order not found",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: Bool(),
                            message: z.string(),
                        }),
                    },
                },
            },
        },
    };

    async handle(c: AppContext) {
        const { params } = await this.getValidatedData<typeof this.schema>();
        const { id } = params;

        const prisma = c.get('prisma');
        try {
            const authenticatedRestaurantId = c.get('authenticatedRestaurantId') as number
            
            			const order = await prisma.order.findUnique({
				where: { 
					id,
					restaurantId: authenticatedRestaurantId
				},
				include: {
					orderItems: {
						include: {
							menuItem: {
								select: {
									id: true,
									name: true,
									description: true,
									price: true,
								},
							},
						},
					},
					customer: {
						select: {
							id: true,
							name: true,
							email: true,
							phone: true,
						},
					},
					table: {
						select: {
							id: true,
							tableNumber: true,
							capacity: true,
						},
					},
				},
			});

			if (!order) {
				return c.json({
					success: false,
					message: "Order not found",
				}, 404);
			}

						// Transform order to include date and items count
			const transformedOrder = {
				...order,
				date: order.createdAt,
				items: order.orderItems.length,
			};

			return c.json({
				success: true,
				order: transformedOrder,
			});
        } catch (err) {
            console.error("Error fetching order:", err);

            return c.json(
                {
                    error: 'Failed to fetch order',
                    detail: err instanceof Error ? err.message : String(err),
                },
                500
            );
        }
    }
} 