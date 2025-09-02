import { Bool, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { type AppContext } from "../../middleware/prisma-client";
import { createMenuItemSchema } from "../../types";

export class MenuItemCreate extends OpenAPIRoute {
    schema = {
        tags: ["MenuItem"],
        summary: "Create a new MenuItem",
        security: [{ bearerAuth: [] }],
        request: {
            body: {
                content: {
                    "application/json": {
                        schema: createMenuItemSchema,
                    },
                },
                // required: true,
            },
        },
        responses: {
            "200": {
                description: "Returns the created MenuItem",
                content: {
                    "application/json": {
                        schema: z.object({
                            success: Bool(),
                            menuItem: createMenuItemSchema,
                        }),
                    },
                },
            },
            "404": {
                description: "Restaurant or Category not found",
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
        // Get validated data
        const { body } = await this.getValidatedData<typeof this.schema>();
        // const data = await c.req.json();
        const prisma = c.get('prisma')

        try {
            const authenticatedRestaurantId = c.get('authenticatedRestaurantId') as number
            
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

            // Automatically use the authenticated restaurant ID
            const menuItemData = {
                ...body,
                restaurantId: authenticatedRestaurantId
            };

            const menuItem = await prisma.menuItem.create({
                data: menuItemData
            });

            return c.json({
                success: true,
                menuItem
            });
        } catch (error: unknown) {
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
                        { error: "Restaurant with this email already exists" },
                        409
                    );
                }
            }

            console.error("Create menu item error:", error);
            return c.json({ error: "Internal server error" }, 500);
        }
    }
}
