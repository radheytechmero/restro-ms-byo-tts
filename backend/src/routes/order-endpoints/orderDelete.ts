import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";

export class OrderDelete extends OpenAPIRoute {
    schema = {
        tags: ["Order"],
        summary: "Delete Order by ID",
        security: [{ bearerAuth: [] }],
        request: {
            params: z.object({
                id: Num(),
            }),
        },
        responses: {
            "200": {
                description: "Successfully deleted",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: Bool(),
                            message: z.string(),
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

        const prisma = c.get("prisma");

        try {
            const authenticatedRestaurantId = c.get('authenticatedRestaurantId') as number
            
            const order = await prisma.order.findUnique({
                where: { id },
            });

            if (!order) {
                return c.json(
                    {
                        success: false,
                        message: "Order not found",
                    },
                    404
                );
            }

            // Validate that the order belongs to the authenticated restaurant
            if (order.restaurantId !== authenticatedRestaurantId) {
                return c.json({
                    success: false,
                    message: "Forbidden - You can only delete your own orders",
                }, 403);
            }

            // Delete order items first (due to foreign key constraint)
            await prisma.orderItem.deleteMany({
                where: { orderId: id },
            });

            // Delete the order
            await prisma.order.delete({
                where: { id },
            });

            return c.json({
                success: true,
                message: "Order deleted successfully",
            });
        } catch (error) {
            console.error("Error deleting order:", error);
            return c.json(
                {
                    error: "Failed to delete order",
                    detail: error instanceof Error ? error.message : String(error),
                },
                500
            );
        }
    }
} 