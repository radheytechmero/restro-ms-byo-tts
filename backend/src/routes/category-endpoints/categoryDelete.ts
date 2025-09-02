import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";

export class CategoryDelete extends OpenAPIRoute {
    schema = {
        tags: ["Category"],
        summary: "Delete Category by ID",
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
                description: "Category not found",
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
            
            const category = await prisma.category.findUnique({
                where: { id },
            });

            if (!category) {
                return c.json(
                    {
                        success: false,
                        message: "Category not found",
                    },
                    404
                );
            }

            // Validate that the category belongs to the authenticated restaurant
            if (category.restaurantId !== authenticatedRestaurantId) {
                return c.json({
                    success: false,
                    message: "Forbidden - You can only delete your own categories",
                }, 403);
            }

            // Check if category has menu items
            const menuItemsCount = await prisma.menuItem.count({
                where: { categoryId: id },
            });

            if (menuItemsCount > 0) {
                return c.json(
                    {
                        success: false,
                        message: "Cannot delete category with existing menu items",
                    },
                    400
                );
            }

            await prisma.category.delete({
                where: { id },
            });

            return c.json({
                success: true,
                message: "Category deleted successfully",
            });
        } catch (error) {
            console.error("Error deleting category:", error);
            return c.json(
                {
                    error: "Failed to delete category",
                    detail: error instanceof Error ? error.message : String(error),
                },
                500
            );
        }
    }
} 