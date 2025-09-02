import { Bool, Num, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { updateMenuItemSchema } from "../../types";

export class MenuItemUpdate extends OpenAPIRoute {
    schema = {
        tags: ["MenuItem"],
        summary: "Update MenuItem",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: updateMenuItemSchema,
                    },
                },
            },
            params: z.object({
                id: Num(),
            }),
        },
        responses: {
            "200": {
                description: "Returns the updated MenuItem",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: Bool(),
                            menuItem: updateMenuItemSchema,
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

        const { body, params } = await this.getValidatedData<typeof this.schema>();
        const { id } = params;

        const prisma = c.get("prisma");
        try {
            const authenticatedRestaurantId = c.get('authenticatedRestaurantId') as number
            
            // Try to find the menu item first and validate restaurant access
            const menuItem = await prisma.menuItem.findUnique({
                where: { id },
            });

            // If menu item doesn't exist, return an error
            if (!menuItem) {
                return c.json({
                    success: false,
                    message: "MenuItem not found",
                }, 404);
            }

            // Validate that the menu item belongs to the authenticated restaurant
            if (menuItem.restaurantId !== authenticatedRestaurantId) {
                return c.json({
                    success: false,
                    message: "Forbidden - You can only update your own menu items",
                }, 403);
            }

            // Verify category exists and belongs to the authenticated restaurant if categoryId is provided
            if (body.categoryId) {
                const category = await prisma.category.findUnique({
                    where: { 
                        id: body.categoryId,
                        restaurantId: authenticatedRestaurantId
                    },
                    select: { id: true, name: true },
                });

                if (!category) {
                    return c.json({
                        success: false,
                        message: "Category not found or does not belong to your restaurant",
                    }, 404);
                }
            }

            // Update the menu item with the new data
            const updatedMenuItem = await prisma.menuItem.update({
                where: { id },
                data: body,
            });

            // Return the updated menu item
            return c.json({
                success: true,
                menuItem: updatedMenuItem,
            });
        } catch (error) {
            if (
                error &&
                typeof error === 'object' &&
                'code' in error &&
                'meta' in error &&
                error.code === 'P2002'
            ) {
                const prismaError = error as {
                    code: string;
                    meta?: {
                        target?: string[];
                    };
                };

                if (prismaError.meta?.target?.includes('email')) {
                    return c.json(
                        { error: "Menu with this email already exists" },
                        409
                    );
                }
            }

            console.error("Update menu item error:", error);
            return c.json(
                {
                    error: 'Failed to update menu item',
                    detail: error instanceof Error ? error.message : String(error),
                },
                500
            );
        }

    }
}
