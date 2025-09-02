import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { updateOrderSchema } from "../../types";

export class OrderUpdate extends OpenAPIRoute {
    schema = {
        tags: ["Order"],
        summary: "Update Order",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: updateOrderSchema,
                    },
                },
            },
            params: z.object({
                id: Num(),
            }),
        },
        responses: {
            "200": {
                description: "Returns the updated Order",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: Bool(),
                            order: updateOrderSchema,
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
        const { body, params } = await this.getValidatedData<typeof this.schema>();
        const { id } = params;

        const prisma = c.get("prisma");
        try {
            const authenticatedRestaurantId = c.get('authenticatedRestaurantId') as number
            
            // Try to find the order first and validate restaurant access
            const order = await prisma.order.findUnique({
                where: { id },
            });

            // If order doesn't exist, return an error
            if (!order) {
                return c.json({
                    success: false,
                    message: "Order not found",
                }, 404);
            }

            // Validate that the order belongs to the authenticated restaurant
            if (order.restaurantId !== authenticatedRestaurantId) {
                return c.json({
                    success: false,
                    message: "Forbidden - You can only update your own orders",
                }, 403);
            }

            			// Update the order with the new data
			const updatedOrder = await prisma.order.update({
				where: { id },
				data: body,
				include: {
					orderItems: {
						select: {
							id: true,
						},
					},
				},
			});

			// Transform order to include date and items count
			const transformedOrder = {
				...updatedOrder,
				date: updatedOrder.createdAt,
				items: updatedOrder.orderItems.length,
				orderItems: undefined, // Remove the temporary field
			};

			// Return the updated order
			return c.json({
				success: true,
				order: transformedOrder,
			});
        } catch (error) {
            console.error("Update order error:", error);
            return c.json(
                {
                    error: 'Failed to update order',
                    detail: error instanceof Error ? error.message : String(error),
                },
                500
            );
        }
    }
} 