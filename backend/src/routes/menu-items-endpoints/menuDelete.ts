import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";

export class MenuItemDelete extends OpenAPIRoute {
    schema = {
        tags: ["MenuItem"],
        summary: "Delete MenuItem by ID",
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
                description: "MenuItem not found",
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
            
            const menuItem = await prisma.menuItem.findUnique({
                where: { id },
            });

            if (!menuItem) {
                return c.json(
                    {
                        success: false,
                        message: "MenuItem not found",
                    },
                    404
                );
            }

            // Validate that the menu item belongs to the authenticated restaurant
            if (menuItem.restaurantId !== authenticatedRestaurantId) {
                return c.json({
                    success: false,
                    message: "Forbidden - You can only delete your own menu items",
                }, 403);
            }

            // Check if menu item has order items
            const orderItemsCount = await prisma.orderItem.count({
                where: { menuItemId: id },
            });

            if (orderItemsCount > 0) {
                return c.json(
                    {
                        success: false,
                        message: "Cannot delete menu item with existing orders",
                    },
                    400
                );
            }

            await prisma.menuItem.delete({
                where: { id },
            });

            return c.json({
                success: true,
                message: "MenuItem deleted successfully",
            });
        } catch (error) {
            console.error("Error deleting menu item:", error);
            return c.json(
                {
                    error: "Failed to delete menu item",
                    detail: error instanceof Error ? error.message : String(error),
                },
                500
            );
        }
    }
}
